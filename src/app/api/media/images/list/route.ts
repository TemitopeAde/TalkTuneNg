import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { authenticateRequest } from '@/lib/auth-middleware'
import CloudinaryService from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: StatusCodes.FORBIDDEN })

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'blogs'
    const max = Math.min(parseInt(searchParams.get('max') || '50'), 100)

    const items = await CloudinaryService.listImages(folder, max)
    return NextResponse.json({ success: true, data: items }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('List images error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to list images'
    return NextResponse.json({ error: msg }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
