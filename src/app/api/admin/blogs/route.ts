import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth-middleware'
import type { Prisma } from '@/generated/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: StatusCodes.FORBIDDEN })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 50)
    const search = searchParams.get('search') || ''
    const publishedParam = searchParams.get('published')

    const where: Prisma.BlogWhereInput = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (publishedParam === 'true') where.published = true
    if (publishedParam === 'false') where.published = false

    const skip = (page - 1) * limit

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          content: true,
          published: true,
          updatedAt: true
        }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Admin List Blogs API Error:', error)
    const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred while listing blogs'
    return NextResponse.json({ error: errMsg }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
