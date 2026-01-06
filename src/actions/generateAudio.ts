'use server'

import { CloudinaryService } from '@/lib/cloudinary';
import { VoiceSettings, AudioGenerationResponse } from '@/types';
import { generateTTSAudio } from '@/lib/tts';

export async function generateAudio(
  text: string,
  voiceSettings: VoiceSettings,
  scriptId: string,
  voiceId?: string
): Promise<AudioGenerationResponse> {
  // Use provided voiceId or default to 'Idera'
  const selectedVoiceId = voiceId || "Idera";

  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: 'Text content is required for audio generation' };
    }

    // Capitalize first letter of voice ID for YarnGPT API
    const properVoiceId = selectedVoiceId.charAt(0).toUpperCase() + selectedVoiceId.slice(1).toLowerCase();

    console.log('Generating audio with:', {
      textLength: text.length,
      voiceId: properVoiceId,
      scriptId
    });

    // Generate speech using YarnGPT API
    const audioBuffer = await generateTTSAudio(
      text,
      properVoiceId,
      'mp3'
    );

    // Generate filename
    const timestamp = Date.now();
    const audioFileName = `audio_${scriptId}_${timestamp}`;

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadAudio(
      Buffer.from(audioBuffer),
      audioFileName
    );

    return {
      success: true,
      audioFileName: `${audioFileName}.mp3`,
      audioFileSize: uploadResult.bytes,
      audioFileUrl: uploadResult.url,
    };
  } catch (error) {
    console.error('Audio generation error:', error);
    console.error('Error details:', {
      text: text?.substring(0, 100),
      voiceId: selectedVoiceId,
      scriptId,
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred during audio generation';

    return {
      success: false,
      error: errorMessage,
    };
  }
}