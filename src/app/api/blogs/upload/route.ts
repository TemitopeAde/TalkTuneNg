import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { authenticateRequest } from '@/lib/auth-middleware';
import { CloudinaryService } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: StatusCodes.BAD_REQUEST });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await CloudinaryService.uploadImage(buffer, file.name, 'blogs');

    return NextResponse.json({ success: true, url: result.url }, { status: StatusCodes.OK });
  } catch (error) {
    console.error('Upload Blog Image API Error:', error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
