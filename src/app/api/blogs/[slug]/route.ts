import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { getBlogBySlug } from '@/actions/getBlogSlug'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: StatusCodes.BAD_REQUEST }
      )
    }

    const result = await getBlogBySlug(slug)

    if (result.error) {
      const statusCode = result.error === 'Blog not found' 
        ? StatusCodes.NOT_FOUND 
        : StatusCodes.INTERNAL_SERVER_ERROR

      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      {
        success: result.success,
        data: result.data
      },
      { status: StatusCodes.OK }
    )
  } catch (error) {
    console.error('Get Blog by Slug API Route Error:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while fetching the blog'

    return NextResponse.json(
      { error: errorMessage },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    )
  }
}