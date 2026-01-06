/**
 * Voice Preview Generator Utility
 * 
 * This script generates and saves voice previews for all YarnGPT voices
 * Run this to pre-populate the database with voice previews
 * 
 * Usage: Call the /api/voice-preview/generate endpoint
 */

export const generateAllVoicePreviews = async () => {
    try {
        console.log('🎵 Starting voice preview generation...');

        const response = await fetch('/api/voice-preview/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Voice preview generation completed!');
            console.log(`📊 Summary:`, result.summary);
            console.log(`📋 Results:`, result.results);
            return result;
        } else {
            console.error('❌ Voice preview generation failed:', result.error);
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('❌ Error generating voice previews:', error);
        throw error;
    }
};

export const getVoicePreview = async (voiceId: string) => {
    try {
        const response = await fetch(`/api/voice-preview/${voiceId}`);
        const result = await response.json();

        if (result.success) {
            return result.preview;
        } else {
            console.warn(`⚠️ Voice preview not found for ${voiceId}:`, result.error);
            return null;
        }

    } catch (error) {
        console.error(`❌ Error fetching voice preview for ${voiceId}:`, error);
        return null;
    }
};

export const getAllVoicePreviews = async () => {
    try {
        const response = await fetch('/api/voice-preview/generate', {
            method: 'GET'
        });
        const result = await response.json();

        if (result.success) {
            return result.previews;
        } else {
            console.error('❌ Failed to fetch voice previews:', result.error);
            return [];
        }

    } catch (error) {
        console.error('❌ Error fetching voice previews:', error);
        return [];
    }
};

// YarnGPT Voice IDs for reference
export const YARN_GPT_VOICE_IDS = [
    'idera', 'emma', 'zainab', 'osagie', 'wura', 'jude',
    'chinenye', 'tayo', 'regina', 'femi', 'adaora', 'umar',
    'mary', 'nonso', 'remi', 'adam'
];

export const PREVIEW_TEXT = "Culture shapes identity, values, and traditions, connecting generations through language, art, and beliefs while fostering understanding, respect, and unity in an increasingly diverse and interconnected world.";