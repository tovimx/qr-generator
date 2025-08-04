import { createClient } from '@/lib/auth/supabase/client'

const LOGO_BUCKET = 'qr-logos'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']

export async function uploadLogo(file: File, userId: string): Promise<string | null> {
  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PNG, JPG, or SVG.')
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 2MB.')
  }

  const supabase = createClient()
  
  // Get the auth user's UID (not the database user ID)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('Auth check:', { user: user?.id, authError })
  
  if (!user || authError) {
    throw new Error(`Not authenticated: ${authError?.message || 'No user found'}`)
  }
  
  // Generate unique filename using auth UID for RLS policy compliance
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`
  
  console.log('Uploading file:', { fileName, fileSize: file.size, fileType: file.type })
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Upload error:', error)
    // If bucket doesn't exist, provide helpful message
    if (error.message?.includes('not found')) {
      throw new Error('Storage not configured. Please create a "qr-logos" bucket in Supabase Storage or visit /api/storage/init')
    }
    throw new Error('Failed to upload logo')
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(LOGO_BUCKET)
    .getPublicUrl(fileName)
  
  return publicUrl
}

export async function deleteLogo(logoUrl: string): Promise<boolean> {
  if (!logoUrl) return true
  
  const supabase = createClient()
  
  // Extract file path from URL
  const urlParts = logoUrl.split('/')
  const bucketIndex = urlParts.indexOf(LOGO_BUCKET)
  if (bucketIndex === -1) return false
  
  const filePath = urlParts.slice(bucketIndex + 1).join('/')
  
  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .remove([filePath])
  
  if (error) {
    console.error('Delete error:', error)
    return false
  }
  
  return true
}

export async function createLogoBucketIfNotExists() {
  const supabase = createClient()
  
  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets()
  
  if (buckets?.some(b => b.name === LOGO_BUCKET)) {
    return true
  }
  
  // Create bucket
  const { error } = await supabase.storage.createBucket(LOGO_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE
  })
  
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating bucket:', error)
    return false
  }
  
  return true
}