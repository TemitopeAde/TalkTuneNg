'use server'

import { prisma } from "@/lib/prisma"


export async function getBlogBySlug(slug: string) {
  try {
    if (!slug || typeof slug !== 'string') {
      return { error: 'Invalid slug provided' }
    }

    const blog = await prisma.blog.findUnique({
      where: { 
        slug: slug,
        published: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        category: true,
        authorName: true,
        published: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!blog) {
      return { error: 'Blog not found' }
    }

    return {
      success: true,
      data: blog
    }

  } catch (error) {
    console.error('Get blog by slug error:', error)

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any

      switch (prismaError.code) {
        case 'P2025':
          return { error: 'Blog not found' }
        default:
          return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
      }
    }

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while fetching the blog'

    return { error: errorMessage }
  }
}