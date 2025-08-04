import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase/server'

const LOGO_BUCKET = 'qr-logos'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated (optional, remove if you want public access)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets', 
        details: listError.message 
      }, { status: 500 })
    }
    
    // Check if bucket already exists
    const bucketExists = buckets?.some(b => b.name === LOGO_BUCKET)
    
    if (bucketExists) {
      return NextResponse.json({ 
        message: 'Bucket already exists',
        bucket: LOGO_BUCKET 
      })
    }
    
    // Create the bucket
    const { data, error: createError } = await supabase.storage.createBucket(LOGO_BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    })
    
    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create bucket', 
        details: createError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Bucket created successfully',
      bucket: data
    })
    
  } catch (error) {
    console.error('Storage initialization error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}