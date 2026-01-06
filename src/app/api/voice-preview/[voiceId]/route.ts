import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// YarnGPT Voice Models (for case-insensitive lookup)
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

/**
 * Get Voice Preview by Voice ID
 * 
 * @route GET /api/voice-preview/[voiceId]
 * @description Retrieves a saved voice preview for a specific voice
 * 
 * @param {string} voiceId - The voice ID to retrieve preview for
 * @returns {Response} Voice preview data or error message
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { voiceId: string } }
) {
    try {
        const { voiceId } = await params;

        if (!voiceId) {
            return NextResponse.json(
                { success: false, error: 'Voice ID is required' },
                { status: 400 }
            );
        }

        // Get the properly capitalized voice name
        const properVoiceId = getProperVoiceName(voiceId);

        // Find the voice preview in database
        const voicePreview = await prisma.voicePreview.findUnique({
            where: {
                voiceId: properVoiceId
            }
        });

        if (!voicePreview) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Voice preview not found',
                    voiceId: voiceId
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            preview: {
                voiceId: voicePreview.voiceId,
                voiceName: voicePreview.voiceName,
                audioUrl: voicePreview.audioFileUrl,
                fileSize: voicePreview.audioFileSize,
                createdAt: voicePreview.createdAt,
                updatedAt: voicePreview.updatedAt
            }
        });

    } catch (error) {
        const { voiceId } = await params;
        console.error(`Error fetching voice preview for ${voiceId}:`, error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch voice preview',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}