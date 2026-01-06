import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsService } from '@/lib/elevenlabs';
import { VoiceSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voiceId, text } = body;

    if (!voiceId || !text) {
      return NextResponse.json(
        { error: 'Voice ID and text are required' },
        { status: 400 }
      );
    }

    const elevenLabsService = getElevenLabsService();

    // Default voice settings for preview
    const defaultSettings: VoiceSettings = {
      gender: 'MALE',
      age: 'YOUNG_ADULT',
      language: 'english',
      mood: 'HAPPY',
    };

    // Generate speech
    const audioBuffer = await elevenLabsService.generateSpeech(
      text,
      defaultSettings,
      voiceId
    );

    // Return audio as response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating voice preview:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate voice preview',
      },
      { status: 500 }
    );
  }
}
