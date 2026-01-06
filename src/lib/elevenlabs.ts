import { VoiceSettings } from '@/types';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  preview_url?: string;
  labels: {
    accent?: string;
    gender?: string;
    age?: string;
    use_case?: string;
  };
}

export interface ElevenLabsSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Find the best matching voice based on user's voice settings
   */
  async findMatchingVoice(voiceSettings: VoiceSettings): Promise<string> {
    try {
      const voices = await this.getVoices();
      
      // Map your voice settings to ElevenLabs voice characteristics
      const genderMap: { [key: string]: string } = {
        'MALE': 'male',
        'FEMALE': 'female',
        'KID': 'young'
      };

      const ageMap: { [key: string]: string[] } = {
        'CHILD': ['young', 'child'],
        'TEENAGER': ['young', 'teenage'],
        'YOUNG_ADULT': ['young', 'adult'],
        'ELDERLY_45_65': ['middle-aged', 'elderly'],
        'OLD_70_PLUS': ['elderly', 'old']
      };

      // Filter voices based on gender and age preferences
      let filteredVoices = voices.filter(voice => {
        const genderMatch = voice.labels.gender?.toLowerCase() === genderMap[voiceSettings.gender];
        const ageKeywords = ageMap[voiceSettings.age] || [];
        const ageMatch = ageKeywords.some(keyword => 
          voice.labels.age?.toLowerCase().includes(keyword) ||
          voice.name.toLowerCase().includes(keyword)
        );

        return genderMatch || ageMatch;
      });

      // If no filtered voices, fall back to all voices
      if (filteredVoices.length === 0) {
        filteredVoices = voices;
      }

      // Return the first matching voice, or a default one
      const selectedVoice = filteredVoices[0] || voices[0];
      
      if (!selectedVoice) {
        throw new Error('No voices available');
      }

      return selectedVoice.voice_id;
    } catch (error) {
      console.error('Error finding matching voice:', error);
      // Return a default voice ID if something goes wrong
      // You should replace this with an actual voice ID from your ElevenLabs account
      return '21m00Tcm4TlvDq8ikWAM'; // Default voice ID
    }
  }

  /**
   * Map our language codes to ElevenLabs language codes
   */
  getLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      'english': 'en',
      'french': 'fr',
      'spanish': 'es',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'chinese': 'zh',
      'arabic': 'ar',
      'hindi': 'hi',
      'hausa': 'ha',
      'japanese': 'ja',
      'korean': 'ko',
      'russian': 'ru'
    };

    return languageMap[language.toLowerCase()] || 'en'; // Default to English
  }

  /**
   * Generate voice settings based on user preferences
   */
  generateVoiceSettings(voiceSettings: VoiceSettings): ElevenLabsSettings {
    // Map mood to stability and similarity boost
    const moodMap: { [key: string]: { stability: number; similarity_boost: number; style?: number } } = {
      'ANGRY': { stability: 0.3, similarity_boost: 0.9, style: 0.2 },
      'HAPPY': { stability: 0.7, similarity_boost: 0.8, style: 0.8 },
      'ANXIOUS': { stability: 0.2, similarity_boost: 0.7, style: 0.1 },
      'DRAMA': { stability: 0.4, similarity_boost: 0.9, style: 0.9 },
      'SURPRISED': { stability: 0.3, similarity_boost: 0.8, style: 0.7 },
      'SCARED': { stability: 0.2, similarity_boost: 0.6, style: 0.1 },
      'LAX': { stability: 0.8, similarity_boost: 0.7, style: 0.3 },
      'SAD': { stability: 0.6, similarity_boost: 0.8, style: 0.2 },
      'EXCITED': { stability: 0.4, similarity_boost: 0.9, style: 0.9 },
      'DISAPPOINTED': { stability: 0.7, similarity_boost: 0.6, style: 0.1 },
      'STRICT': { stability: 0.9, similarity_boost: 0.8, style: 0.5 }
    };

    const moodSettings = moodMap[voiceSettings.mood] || { stability: 0.5, similarity_boost: 0.75 };

    return {
      stability: moodSettings.stability,
      similarity_boost: moodSettings.similarity_boost,
      style: moodSettings.style,
      use_speaker_boost: true
    };
  }

  /**
   * Generate speech from text using ElevenLabs TTS
   */
  async generateSpeech(
    text: string,
    voiceSettings: VoiceSettings,
    voiceId?: string
  ): Promise<ArrayBuffer> {
    try {
      // Find matching voice if not provided
      const selectedVoiceId = voiceId || await this.findMatchingVoice(voiceSettings);

      // Generate voice settings
      const elevenlabsSettings = this.generateVoiceSettings(voiceSettings);

      // Get language code
      const languageCode = this.getLanguageCode(voiceSettings.language);

      const response = await fetch(`${this.baseUrl}/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Use multilingual model for better language support
          voice_settings: elevenlabsSettings,
          language_code: languageCode, // Add language code for proper language synthesis
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS generation failed: ${response.statusText} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Get user info and API usage
   */
  async getUserInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
}

// Create a singleton instance
let elevenLabsService: ElevenLabsService | null = null;

export const getElevenLabsService = (): ElevenLabsService => {
  if (!elevenLabsService) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }
    elevenLabsService = new ElevenLabsService(apiKey);
  }
  return elevenLabsService;
};

