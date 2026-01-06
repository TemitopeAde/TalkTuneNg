import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { getBlogs } from '@/actions/getBlog'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page number must be greater than 0' },
        { status: StatusCodes.BAD_REQUEST }
      )
    }

    const result = await getBlogs({
      category,
      page,
      limit,
      published: true
    })

    if (result.error) {
      let statusCode = StatusCodes.BAD_REQUEST

      if (result.error.includes('Database error')) {
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR
      }

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
    console.error('Get Blogs API Route Error:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while fetching blogs'

    return NextResponse.json(
      { error: errorMessage },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    )
  }
}

const createBlogSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  coverImage: z.string().url().optional(),
  category: z.string().min(2),
  published: z.boolean().optional()
})

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueSlug(baseTitle: string) {
  const base = slugify(baseTitle)
  let candidate = base
  let suffix = 1
  while (true) {
    const exists = await prisma.blog.findUnique({ where: { slug: candidate } })
    if (!exists) return candidate
    candidate = `${base}-${suffix++}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: StatusCodes.FORBIDDEN })
    }

    const json = await request.json()
    const parsed = createBlogSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: StatusCodes.BAD_REQUEST })
    }

    const data = parsed.data
    const slug = data.slug && data.slug.trim().length > 0
      ? await (async () => {
        const s = slugify(data.slug!)
        const exists = await prisma.blog.findUnique({ where: { slug: s } })
        return exists ? await generateUniqueSlug(data.slug!) : s
      })()
      : await generateUniqueSlug(data.title)

    const created = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || '',
        category: data.category,
        authorName: 'Admin',
        published: data.published ?? false
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        published: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(created, { status: StatusCodes.CREATED })
  } catch (error) {
    console.error('Create Blog API Route Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating blog'
    return NextResponse.json({ error: errorMessage }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}