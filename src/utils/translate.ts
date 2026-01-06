/**
 * Translate text to the specified target language using Google Translate API
 * @param text - The text to translate
 * @param targetLanguage - The target language (Yoruba, Hausa, Igbo, English)
 * @returns The translated text
 */
export async function translateText(
  text: string,
  targetLanguage: 'Yoruba' | 'Hausa' | 'Igbo' | 'English'
): Promise<string> {
  try {
    // If target is English, return as-is
    if (targetLanguage === 'English') {
      return text;
    }

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
}
