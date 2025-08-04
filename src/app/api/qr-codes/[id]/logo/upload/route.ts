import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/db/prisma'

const LOGO_BUCKET = 'qr-logos'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      console.log('Auth error in upload:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    if (qrCode.user.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Delete old logo if exists
    if (qrCode.logoUrl) {
      const urlParts = qrCode.logoUrl.split('/')
      const bucketIndex = urlParts.indexOf(LOGO_BUCKET)
      if (bucketIndex !== -1) {
        const oldFilePath = urlParts.slice(bucketIndex + 1).join('/')
        await supabase.storage.from(LOGO_BUCKET).remove([oldFilePath])
      }
    }

    // Generate filename using auth user ID
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    console.log('Attempting upload:', { fileName, size: file.size, type: file.type, userId: user.id })
    
    // Read file content
    const bytes = await file.arrayBuffer()
    const fileContent = new Blob([bytes], { type: file.type })
    
    // Create service client that bypasses RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Service role key exists:', !!serviceRoleKey)
    
    if (!serviceRoleKey) {
      // Fallback to regular client if no service key
      const { error: uploadError } = await supabase.storage
        .from(LOGO_BUCKET)
        .upload(fileName, fileContent, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ 
          error: 'Failed to upload file',
          details: uploadError.message 
        }, { status: 500 })
      }
    } else {
      // Use service client to bypass RLS
      const serviceClient = createServiceClient(supabaseUrl!, serviceRoleKey)
      
      const { error: uploadError } = await serviceClient.storage
        .from(LOGO_BUCKET)
        .upload(fileName, fileContent, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Storage upload error with service client:', uploadError)
        return NextResponse.json({ 
          error: 'Failed to upload file',
          details: uploadError.message 
        }, { status: 500 })
      }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(LOGO_BUCKET)
      .getPublicUrl(fileName)
    
    // Update QR code with new logo URL
    const updatedQrCode = await prisma.qRCode.update({
      where: { id },
      data: { logoUrl: publicUrl },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { scans: true }
        }
      }
    })
    
    return NextResponse.json({ 
      logoUrl: publicUrl,
      qrCode: updatedQrCode 
    })
    
  } catch (error) {
    console.error('Upload endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}