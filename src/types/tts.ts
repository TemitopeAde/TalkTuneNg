// YarnGPT TTS API Types

export interface TTSRequest {
    text: string;
    voice?: string;
    response_format?: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac';
}

export interface TTSResponse {
    audio: ArrayBuffer;
    contentType: string;
}

export interface TTSError {
    error: string;
    details?: string;
}

export interface TTSHookResult {
    generateAudio: (text: string, voice?: string, format?: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac') => Promise<ArrayBuffer>;
    isLoading: boolean;
    error: string | null;
}