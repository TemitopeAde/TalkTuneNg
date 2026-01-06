import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsService, ElevenLabsVoice } from '@/lib/elevenlabs';

export async function GET(request: NextRequest) {
  try {
    const elevenLabsService = getElevenLabsService();

    // Fetch all available voices from ElevenLabs API
    const allVoices = await elevenLabsService.getVoices();

    // Generate a placeholder avatar URL based on voice name
    const generateAvatarUrl = (name: string): string => {
      // Use a placeholder image service with the voice name
      const encodedName = encodeURIComponent(name);
      return `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=random&color=fff&bold=true`;
    };

    // Map all voices to the expected format
    const voiceModels = allVoices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'general',
      gender: voice.labels.gender || 'neutral',
      age: voice.labels.age || 'adult',
      accent: voice.labels.accent || 'neutral',
      // Use preview_url from ElevenLabs if available, otherwise generate placeholder
      previewUrl: voice.preview_url || generateAvatarUrl(voice.name),
    }));

    return NextResponse.json({
      success: true,
      data: voiceModels,
    });
  } catch (error) {
    console.error('Error fetching voice models:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch voice models',
      },
      { status: 500 }
    );
  }
}
