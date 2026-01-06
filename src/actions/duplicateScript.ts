'use server'

import { prisma } from "@/lib/prisma"

export async function duplicateScript(scriptId: string, userId: number): Promise<{
  success?: boolean;
  error?: string;
  data?: any;
}> {
  try {
    // Find the original script
    const originalScript = await prisma.script.findUnique({
      where: { id: scriptId }
    })

    if (!originalScript) {
      return { error: "Script not found" }
    }

    // Verify user ownership
    if (originalScript.userId !== userId) {
      return { error: "You don't have permission to duplicate this script" }
    }

    // Create a new script ID
    const newScriptId = `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create the duplicate
    const duplicatedScript = await prisma.script.create({
      data: {
        id: newScriptId,
        projectName: `${originalScript.projectName} (Copy)`,
        language: originalScript.language,
        content: originalScript.content,
        fileName: originalScript.fileName,
        fileSize: originalScript.fileSize,
        fileType: originalScript.fileType,
        uploadMode: originalScript.uploadMode,
        audioFileName: originalScript.audioFileName,
        audioFileSize: originalScript.audioFileSize,
        audioFileUrl: originalScript.audioFileUrl,
        audioGenerated: originalScript.audioGenerated,
        audioSettings: originalScript.audioSettings as any,
        userId: userId,
      }
    })

    return {
      success: true,
      data: {
        id: duplicatedScript.id,
        projectName: duplicatedScript.projectName,
        language: duplicatedScript.language,
        content: duplicatedScript.content,
        fileName: duplicatedScript.fileName,
        fileSize: duplicatedScript.fileSize,
        fileType: duplicatedScript.fileType,
        uploadMode: duplicatedScript.uploadMode,
        audioFileName: duplicatedScript.audioFileName,
        audioFileSize: duplicatedScript.audioFileSize,
        audioFileUrl: duplicatedScript.audioFileUrl,
        audioGenerated: duplicatedScript.audioGenerated,
        createdAt: duplicatedScript.createdAt,
        updatedAt: duplicatedScript.updatedAt,
      }
    }

  } catch (error) {
    console.error('Duplicate script error:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : "An unexpected error occurred while duplicating the script"

    return { error: errorMessage }
  }
}
