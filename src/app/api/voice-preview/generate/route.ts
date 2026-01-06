import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio } from '@/lib/tts';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';



/**
 * Voice Preview Generation and Management API
 * 
 * @route POST /api/voice-preview/generate
 * @description Generates and saves voice previews for all YarnGPT voices
 * 
 * @returns {Response} Success/error message
 * 
 * @route GET /api/voice-preview/[voiceId]
 * @description Retrieves a saved voice preview
 * 
 * @param {string} voiceId - The voice ID to retrieve preview for
 * @returns {Response} Audio file or error message
 */

// YarnGPT Voice Models with the preview text
const YARN_GPT_VOICES = [
    { id: "Idera", name: "Idera" },
    { id: "Emma", name: "Emma" },
    { id: "Zainab", name: "Zainab" },
    { id: "Osagie", name: "Osagie" },
    { id: "Wura", name: "Wura" },
    { id: "Jude", name: "Jude" },
    { id: "Chinenye", name: "Chinenye" },
    { id: "Tayo", name: "Tayo" },
    { id: "Regina", name: "Regina" },
    { id: "Femi", name: "Femi" },
    { id: "Adaora", name: "Adaora" },
    { id: "Umar", name: "Umar" },
    { id: "Mary", name: "Mary" },
    { id: "Nonso", name: "Nonso" },
    { id: "Remi", name: "Remi" },
    { id: "Adam", name: "Adam" }
];

// Helper function to get proper voice name from voice ID (case-insensitive lookup)
function getProperVoiceName(voiceId: string): string {
    const voice = YARN_GPT_VOICES.find(v => v.id.toLowerCase() === voiceId.toLowerCase());
    return voice ? voice.id : voiceId;
}

const PREVIEW_TEXT = "Culture shapes identity, values, and traditions, connecting generations through language, art, and beliefs while fostering understanding, respect, and unity in an increasingly diverse and interconnected world.";

/**
 * Generate and save voice previews for all voices
 */
export async function POST(request: NextRequest) {
    try {
        const results = [];

        // Create preview directory if it doesn't exist
        const previewDir = path.join(process.cwd(), 'public', 'generated-audio', 'previews');
        await fs.mkdir(previewDir, { recursive: true });

        for (const voice of YARN_GPT_VOICES) {
            try {
                // Check if preview already exists in database
                const existingPreview = await prisma.voicePreview.findUnique({
                    where: { voiceId: voice.id }
                });

                if (existingPreview && existingPreview.audioFileUrl) {
                    results.push({
                        voiceId: voice.id,
                        status: 'exists',
                        message: 'Preview already exists'
                    });
                    continue;
                }

                console.log(`Generating preview for voice: ${voice.name} (${voice.id})`);

                // Ensure proper capitalization for the voice ID
                const properVoiceId = getProperVoiceName(voice.id);

                // Generate audio using YarnGPT TTS API
                const audioBuffer = await generateTTSAudio(PREVIEW_TEXT, properVoiceId, 'mp3');

                // Save audio file
                const fileName = `preview_${voice.id}_${Date.now()}.mp3`;
                const filePath = path.join(previewDir, fileName);
                await fs.writeFile(filePath, Buffer.from(audioBuffer));

                // Create public URL
                const publicUrl = `/generated-audio/previews/${fileName}`;

                // Save or update in database
                const voicePreview = await prisma.voicePreview.upsert({
                    where: { voiceId: voice.id },
                    update: {
                        voiceName: voice.name,
                        previewText: PREVIEW_TEXT,
                        audioFileUrl: publicUrl,
                        audioFileName: fileName,
                        audioFileSize: audioBuffer.byteLength,
                        isGenerated: true,
                        updatedAt: new Date()
                    },
                    create: {
                        voiceId: voice.id,
                        voiceName: voice.name,
                        previewText: PREVIEW_TEXT,
                        audioFileUrl: publicUrl,
                        audioFileName: fileName,
                        audioFileSize: audioBuffer.byteLength,
                        isGenerated: true
                    }
                });

                results.push({
                    voiceId: voice.id,
                    status: 'generated',
                    audioUrl: publicUrl,
                    fileSize: audioBuffer.byteLength
                });

                console.log(`✅ Generated preview for ${voice.name}: ${publicUrl}`);

            } catch (voiceError) {
                console.error(`❌ Error generating preview for ${voice.name}:`, voiceError);
                results.push({
                    voiceId: voice.id,
                    status: 'error',
                    error: voiceError instanceof Error ? voiceError.message : 'Unknown error'
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Voice preview generation completed',
            results: results,
            summary: {
                total: YARN_GPT_VOICES.length,
                generated: results.filter(r => r.status === 'generated').length,
                existing: results.filter(r => r.status === 'exists').length,
                errors: results.filter(r => r.status === 'error').length
            }
        });

    } catch (error) {
        console.error('Voice preview generation error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate voice previews',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * Get all voice previews
 */
export async function GET() {
    try {
        const previews = await prisma.voicePreview.findMany({
            orderBy: { voiceName: 'asc' }
        });

        return NextResponse.json({
            success: true,
            previews: previews.map(preview => ({
                voiceId: preview.voiceId,
                voiceName: preview.voiceName,
                audioUrl: preview.audioFileUrl,
                fileSize: preview.audioFileSize,
                createdAt: preview.createdAt
            }))
        });

    } catch (error) {
        console.error('Error fetching voice previews:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch voice previews',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}