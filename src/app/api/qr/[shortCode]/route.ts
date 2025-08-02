import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { headers } from 'next/headers'
import { hashIP } from '@/lib/utils/hash'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params
    const headersList = await headers()
    
    // Find QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { 
        shortCode,
        isActive: true 
      }
    })

    if (!qrCode) {
      return NextResponse.redirect(new URL('/404', request.url))
    }

    // Track scan (fire and forget)
    const userAgent = headersList.get('user-agent') || undefined
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
    const referer = headersList.get('referer') || undefined

    prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        userAgent,
        ipHash: ip !== 'unknown' ? hashIP(ip) : undefined,
        referer,
      }
    }).catch(console.error)

    // Redirect to link page
    return NextResponse.redirect(new URL(`/q/${shortCode}`, request.url))
  } catch (error) {
    console.error('Error handling QR redirect:', error)
    return NextResponse.redirect(new URL('/404', request.url))
  }
}