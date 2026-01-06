import { NextRequest, NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // Map language names to Google Translate language codes
    const languageCodeMap: Record<string, string> = {
      'Yoruba': 'yo',
      'Hausa': 'ha',
      'Igbo': 'ig',
      'English': 'en',
    };

    const targetCode = languageCodeMap[targetLanguage];

    if (!targetCode) {
      return NextResponse.json(
        { error: 'Unsupported target language' },
        { status: 400 }
      );
    }

    // Skip translation if target is English (assuming input is already in English)
    if (targetLanguage === 'English') {
      return NextResponse.json({
        translatedText: text,
        originalText: text,
        targetLanguage
      });
    }

    // Translate the text
    const result = await translate(text, { to: targetCode });

    // Handle the response type
    let translatedText = text;
    let detectedLanguage = 'en';

    if (Array.isArray(result)) {
      // If result is an array, use the first translation
      translatedText = result[0]?.text || text;
      detectedLanguage = result[0]?.from?.language?.iso || 'en';
    } else if (typeof result === 'object' && 'text' in result) {
      // If result is a single TranslationResponse
      translatedText = result.text;
      detectedLanguage = (result as any).from?.language?.iso || 'en';
    }

    return NextResponse.json({
      translatedText,
      originalText: text,
      targetLanguage,
      detectedLanguage,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
