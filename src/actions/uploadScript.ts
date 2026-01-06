'use server'

import { prisma } from "@/lib/prisma"
import { UploadScriptData, UploadScriptDataWithVoice, VoiceSettings } from "@/types";
import { uploadScriptSchema } from "@/utils/schema";
import { generateAudio } from "@/actions/generateAudio";
import { z } from "zod"



export async function uploadScript(formData: UploadScriptDataWithVoice): Promise<{
  success?: boolean;
  error?: string;
  message?: string;
  scriptId?: string;
  data?: any;
}> {
    try {
        const { projectName, language, content, mode, fileName, fileSize, fileType, userId, voiceSettings, generateAudio: shouldGenerateAudio, voiceModelId } = formData

        const validation = uploadScriptSchema.safeParse(formData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!userExists) {
            return { error: "User not found" }
        }

        if (mode === 'upload' && !fileName) {
            return { error: "File name is required for upload mode" }
        }

        const scriptId = `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const script = await prisma.script.create({
            data: {
                id: scriptId,
                projectName: projectName.trim(),
                language: language.toLowerCase(),
                content,
                fileName: fileName || null,
                fileSize: fileSize || null,
                fileType: fileType || null,
                uploadMode: mode,
                userId: userId,
            }
        })

        // Generate audio if requested and voice settings are provided
        let audioData = null;
        if (shouldGenerateAudio && content.trim()) {
            try {
                const audioResult = await generateAudio(content, voiceSettings, scriptId, voiceModelId);
                
                if (audioResult.success) {
                    // Update script with audio information
                    await prisma.script.update({
                        where: { id: scriptId },
                        data: {
                            audioFileName: audioResult.audioFileName,
                            audioFileSize: audioResult.audioFileSize,
                            audioFileUrl: audioResult.audioFileUrl,
                            audioGenerated: true,
                            audioSettings: JSON.stringify(voiceSettings),
                        }
                    });
                    
                    audioData = {
                        audioFileName: audioResult.audioFileName,
                        audioFileSize: audioResult.audioFileSize,
                        audioFileUrl: audioResult.audioFileUrl,
                    };
                } else {
                    console.warn('Audio generation failed:', audioResult.error);
                    // Continue without audio - don't fail the entire upload
                }
            } catch (audioError) {
                console.error('Audio generation error:', audioError);
                // Continue without audio - don't fail the entire upload
            }
        }

        return {
            success: true,
            message: shouldGenerateAudio && audioData ? "Script uploaded and audio generated successfully" : "Script uploaded successfully",
            scriptId: script.id,
            data: {
                id: script.id,
                projectName: script.projectName,
                language: script.language,
                content: script.content,
                fileName: script.fileName,
                fileSize: script.fileSize,
                fileType: script.fileType,
                uploadMode: script.uploadMode,
                createdAt: script.createdAt,
                ...audioData
            }
        }

    } catch (error) {
        console.error('Upload script error:', error)

        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as any

            switch (prismaError.code) {
                case 'P2002':
                    return { error: "Script with this ID already exists" }
                case 'P2025':
                    return { error: "Record not found" }
                default:
                    return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
            }
        }

        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : "An unexpected error occurred during script upload"

        return { error: errorMessage }
    }
}