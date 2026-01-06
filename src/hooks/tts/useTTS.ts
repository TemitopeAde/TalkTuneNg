import { useMutation } from '@tanstack/react-query';
import { generateTTSAudio, createAudioUrl, getAudioMimeType } from '@/lib/tts';
import { TTSHookResult } from '@/types/tts';

/**
 * React Query hook for YarnGPT TTS API
 * Provides text-to-speech functionality with loading states and error handling
 */
export function useTTS(): TTSHookResult {
    const mutation = useMutation({
        mutationFn: async ({
            text,
            voice,
            format = 'mp3'
        }: {
            text: string;
            voice?: string;
            format?: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac'
        }) => {
            return await generateTTSAudio(text, voice, format);
        },
        onError: (error) => {
            console.error('TTS Generation Error:', error);
        },
        onSuccess: (audioBuffer) => {
            console.log('TTS Generation Successful:', audioBuffer.byteLength, 'bytes');
        }
    });

    const generateAudio = async (
        text: string,
        voice?: string,
        format: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' = 'mp3'
    ): Promise<ArrayBuffer> => {
        return mutation.mutateAsync({ text, voice, format });
    };

    return {
        generateAudio,
        isLoading: mutation.isPending,
        error: mutation.error?.message || null
    };
}

/**
 * React Query hook for TTS with automatic audio URL creation
 * Returns both the audio data and a playable URL
 */
export function useTTSWithUrl() {
    const mutation = useMutation({
        mutationFn: async ({
            text,
            voice,
            format = 'mp3'
        }: {
            text: string;
            voice?: string;
            format?: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac'
        }) => {
            const audioBuffer = await generateTTSAudio(text, voice, format);
            const mimeType = getAudioMimeType(format);
            const audioUrl = createAudioUrl(audioBuffer, mimeType);

            return {
                audioBuffer,
                audioUrl,
                mimeType,
                format
            };
        },
        onError: (error) => {
            console.error('TTS Generation Error:', error);
        },
        onSuccess: (result) => {
            console.log('TTS Generation Successful:', {
                audioSize: result.audioBuffer.byteLength,
                format: result.format,
                mimeType: result.mimeType
            });
        }
    });

    const generateAudioWithUrl = async (
        text: string,
        voice?: string,
        format: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' = 'mp3'
    ) => {
        return mutation.mutateAsync({ text, voice, format });
    };

    return {
        generateAudioWithUrl,
        isLoading: mutation.isPending,
        error: mutation.error?.message || null,
        data: mutation.data
    };
}