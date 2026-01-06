'use server'

import { prisma } from "@/lib/prisma"

export interface UpdateScriptParams {
  scriptId: string
  userId: number
  projectName?: string
  content?: string
  language?: string
}

export interface UpdateScriptResponse {
  success?: boolean
  error?: string
  data?: {
    id: string
    projectName: string
    language: string
    content: string
    updatedAt: Date
  }
}

export async function updateScript(params: UpdateScriptParams): Promise<UpdateScriptResponse> {
  try {
    const {
      scriptId,
      userId,
      projectName,
      content,
      language
    } = params

    // Validate required fields
    if (!scriptId || !userId) {
      return { error: 'Script ID and User ID are required' }
    }

    // Check if script exists and belongs to user
    const existingScript = await prisma.script.findFirst({
      where: {
        id: scriptId,
        userId: userId
      }
    })

    if (!existingScript) {
      return { error: 'Script not found or access denied' }
    }

    // Build update data
    const updateData: any = {}

    if (projectName !== undefined) {
      updateData.projectName = projectName.trim()
    }

    if (content !== undefined) {
      updateData.content = content
    }

    if (language !== undefined) {
      updateData.language = language.toLowerCase().trim()
    }

    // Update the script
    const updatedScript = await prisma.script.update({
      where: { id: scriptId },
      data: updateData,
      select: {
        id: true,
        projectName: true,
        language: true,
        content: true,
        updatedAt: true,
      }
    })

    return {
      success: true,
      data: updatedScript
    }

  } catch (error) {
    console.error('Update script error:', error)

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any

      switch (prismaError.code) {
        case 'P2025':
          return { error: 'Script not found' }
        default:
          return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
      }
    }

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while updating script'

    return { error: errorMessage }
  }
}
