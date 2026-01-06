import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio } from '@/lib/tts';

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
 * YarnGPT Text-to-Speech API Endpoint
 * 
 * @route POST /api/tts
 * @description Converts text to speech using YarnGPT API
 * @body {object} request
 * @body {string} request.text - Text to convert to speech (required)
 * @body {string} [request.voice] - Voice to use (optional)
 * @body {string} [request.response_format] - Audio format: mp3, wav, ogg, aac, flac (optional, defaults to mp3)
 * 
 * @returns {Response} Audio file stream
 * 
 * @example
 * ```javascript
 * const response = await fetch('/api/tts', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     text: "Hello, world!",
 *     voice: "alloy",
 *     response_format: "mp3"
 *   })
 * });
 * 
 * if (response.ok) {
 *   const audioBlob = await response.blob();
 *   // Use the audio blob for playback
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voice, response_format = 'mp3' } = body;

        // Validate required fields
        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate response format
        const validFormats = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
        if (response_format && !validFormats.includes(response_format)) {
            return NextResponse.json(
                {
                    error: 'Invalid response format',
                    details: `Supported formats: ${validFormats.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Ensure proper capitalization for voice name
        const properVoiceName = voice ? getProperVoiceName(voice) : undefined;

        // Generate audio using YarnGPT API
        const audioBuffer = await generateTTSAudio(text, properVoiceName, response_format);

        // Get appropriate MIME type
        const mimeTypes: Record<string, string> = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'aac': 'audio/aac',
            'flac': 'audio/flac'
        };

        const mimeType = mimeTypes[response_format] || 'audio/mpeg';

        // Return audio data
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="audio.${response_format}"`,
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error('TTS API Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            {
                error: 'Failed to generate audio',
                details: errorMessage
            },
            { status: 500 }
        );
    }
}

/**
 * Handle GET requests - return API documentation
 */
export async function GET() {
    return NextResponse.json({
        message: 'YarnGPT Text-to-Speech API',
        description: 'Convert text to speech using YarnGPT API',
        usage: {
            method: 'POST',
            endpoint: '/api/tts',
            body: {
                text: 'string (required) - Text to convert to speech',
                voice: 'string (optional) - Voice to use',
                response_format: 'string (optional) - Audio format: mp3, wav, ogg, aac, flac (defaults to mp3)'
            },
            response: 'Audio file stream'
        },
        example: {
            text: "Hello, world!",
            voice: "alloy",
            response_format: "mp3"
        }
    });
}