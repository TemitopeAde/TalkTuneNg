# ElevenLabs Integration Setup Guide

This guide will help you set up ElevenLabs text-to-speech integration in your Talktune application.

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io/)
2. **API Key**: Get your API key from the ElevenLabs dashboard

## Setup Steps

### 1. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your ElevenLabs API key to `.env.local`:
   ```bash
   ELEVENLABS_API_KEY="your-actual-api-key-here"
   ```

### 2. Database Migration

Since we've added new fields to store audio information, you need to run a database migration:

```bash
# Create and apply the migration
npx prisma migrate dev --name "add-audio-fields"

# Or push changes directly (for development)
npx prisma db push
```

### 3. Directory Structure

The setup automatically creates a directory for generated audio files:
- `public/generated-audio/` - Stores generated audio files
- Audio files are gitignored but the directory structure is preserved

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the script upload form
3. Complete the multi-step process:
   - Step 1: Enter project details and script content
   - Step 2: Select voice model (existing step)
   - Step 3: Customize voice settings (gender, age, language, mood)
   - **Step 4: NEW - Audio Preview**
     - Review your script and voice settings
     - Generate a preview of the first 200 characters
     - Listen to how your script will sound
   - Step 5: Final upload with full audio generation

## Features Added

### Audio Preview (Step 4)
- **Script Review**: See your script content and voice settings summary
- **Preview Generation**: Generate a short audio preview (first 200 characters)
- **Audio Player**: Built-in audio player to listen to the preview
- **Settings Validation**: Ensures voice settings are correct before final generation

### Full Audio Generation (Step 5)
- **Complete TTS**: Generates audio for the entire script content
- **Database Storage**: Saves audio file information to the database
- **File Management**: Stores audio files in `public/generated-audio/`

### Voice Mapping
The system intelligently maps your voice customization choices to ElevenLabs voices:

- **Gender**: Male, Female, Kid
- **Age Groups**: Child, Teenager, Young Adult, Elderly (45-65), Old (70+)
- **Languages**: English, French, Hausa
- **Moods**: Angry, Happy, Anxious, Drama, Surprised, Scared, Lax, Sad, Excited, Disappointed, Strict

Each mood is mapped to specific ElevenLabs voice settings (stability, similarity_boost, style).

## API Usage & Costs

- **Character Limit**: ElevenLabs charges per character
- **Model Used**: `eleven_multilingual_v2` for better language support
- **Optimization**: Preview uses only first 200 characters to minimize costs
- **Error Handling**: If audio generation fails, script upload still succeeds

## Database Schema Changes

New fields added to the `Script` model:
```prisma
// Audio generation fields
audioFileName     String?
audioFileSize     Int?
audioFileUrl      String?
audioGenerated    Boolean @default(false)
elevenLabsVoiceId String?
audioSettings     Json? // Store ElevenLabs settings as JSON
```

## Troubleshooting

### Common Issues:

1. **"ELEVENLABS_API_KEY environment variable is not set"**
   - Ensure your API key is properly set in `.env.local`
   - Restart your development server after adding the key

2. **"Failed to fetch voices"**
   - Check your internet connection
   - Verify your API key is valid and has proper permissions
   - Check ElevenLabs service status

3. **"Audio generation failed"**
   - Check your ElevenLabs account balance/quota
   - Ensure the text content is not empty
   - Try with shorter text content first

4. **Audio files not playing**
   - Check if the `public/generated-audio/` directory exists
   - Verify file permissions
   - Check browser console for errors

### File Permissions
If you encounter file writing issues:
```bash
# Ensure the directory is writable
chmod 755 public/generated-audio/
```

## Production Considerations

For production deployment:

1. **Cloud Storage**: Consider using AWS S3 or similar instead of local file storage
2. **CDN**: Use a CDN for audio file delivery
3. **Background Processing**: Consider moving audio generation to a background job queue
4. **Rate Limiting**: Implement rate limiting for audio generation requests
5. **Monitoring**: Monitor ElevenLabs API usage and costs

## Security Notes

- API keys are stored server-side only
- Audio files are served from public directory (consider authentication for sensitive content)
- User inputs are validated before sending to ElevenLabs API

## Integration Overview

The integration adds minimal complexity while providing powerful TTS capabilities:
- Existing upload flow is enhanced, not replaced
- Audio generation is optional and failure-tolerant
- Voice settings are preserved in the database for consistency
- Preview functionality helps users make informed choices

Your Talktune application now supports professional-quality text-to-speech generation powered by ElevenLabs!