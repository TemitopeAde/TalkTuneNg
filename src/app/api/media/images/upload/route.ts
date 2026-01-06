import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { authenticateRequest } from '@/lib/auth-middleware'
import CloudinaryService from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: StatusCodes.FORBIDDEN })

    const form = await request.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string) || 'blogs'
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: StatusCodes.BAD_REQUEST })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = (form.get('fileName') as string) || file.name?.split('.')?.[0] || `img_${Date.now()}`

    const uploaded = await CloudinaryService.uploadImage(buffer, fileName, folder)
    return NextResponse.json({ success: true, data: uploaded }, { status: StatusCodes.CREATED })
  } catch (error) {
    console.error('Upload image error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json({ error: msg }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
