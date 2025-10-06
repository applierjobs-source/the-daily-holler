const OpenAI = require('openai');

/**
 * Patwah Translation Service
 * Translates English text to Jamaican Patois (Patwah) using OpenAI
 */

class PatwahTranslator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Translate English text to Patwah
   * @param {string} text - English text to translate
   * @param {string} context - Context for better translation (optional)
   * @returns {Promise<string>} Translated text in Patwah
   */
  async translateToPatwah(text, context = '') {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text provided for translation');
      }

      console.log(`🔄 Translating to Patwah: "${text.substring(0, 50)}..."`);

      const prompt = `You are a native Jamaican Patois (Patwah) speaker and translator. Translate the following English text to authentic Jamaican Patois.

CONTEXT: ${context}

TRANSLATION REQUIREMENTS:
- Use authentic Jamaican Patois vocabulary and grammar
- Maintain the original meaning and tone
- Use appropriate Patwah expressions and idioms where natural
- Keep proper nouns (names, places) unchanged
- Maintain the structure and flow of the original text
- Use phonetic spelling that reflects how words sound in Patwah
- Don't make it too exaggerated or stereotypical - keep it natural and authentic

ORIGINAL ENGLISH TEXT:
${text}

TRANSLATED PATWAH TEXT:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert translator specializing in English to Jamaican Patois (Patwah). You provide authentic, natural translations that preserve meaning while using proper Patwah vocabulary, grammar, and expressions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const translatedText = completion.choices[0].message.content.trim();
      
      console.log(`✅ Translation complete: "${translatedText.substring(0, 50)}..."`);
      
      return translatedText;

    } catch (error) {
      console.error('❌ Error translating to Patwah:', error.message);
      
      // Fallback: return original text if translation fails
      console.log('⚠️ Translation failed, returning original text');
      return text;
    }
  }

  /**
   * Translate a news article to Patwah
   * @param {Object} article - News article object
   * @returns {Promise<Object>} Translated article
   */
  async translateArticle(article) {
    try {
      console.log(`🔄 Translating news article: "${article.title}"`);

      // Translate title
      const translatedTitle = await this.translateToPatwah(
        article.title,
        `News headline about ${article.cityName}, ${article.state}`
      );

      // Translate content/snippet
      const translatedContent = await this.translateToPatwah(
        article.snippet,
        `News article content about ${article.cityName}, ${article.state} from ${article.source}`
      );

      return {
        ...article,
        title: translatedTitle,
        content: translatedContent,
        originalTitle: article.title,
        originalContent: article.snippet,
        language: 'patwah',
        translatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error translating article:', error.message);
      
      // Return original article with translation flag
      return {
        ...article,
        title: article.title,
        content: article.snippet,
        language: 'english',
        translationError: error.message
      };
    }
  }

  /**
   * Create a news article in Patwah format
   * @param {Object} originalArticle - Original English article
   * @param {string} cityName - City name
   * @param {string} state - State
   * @returns {Promise<Object>} Formatted Patwah article
   */
  async createPatwahNewsArticle(originalArticle, cityName, state) {
    try {
      console.log(`📰 Creating Patwah news article for ${cityName}, ${state}`);

      // Translate the article
      const translatedArticle = await this.translateArticle(originalArticle);

      // Create a formatted article structure
      const patwahArticle = {
        headline: translatedArticle.title,
        content: this.formatPatwahContent(translatedArticle, cityName, state),
        city: cityName,
        state: state,
        source: translatedArticle.source,
        originalUrl: translatedArticle.url,
        language: 'patwah',
        theme: 'local-news',
        publishedAt: new Date().toISOString(),
        translatedAt: translatedArticle.translatedAt,
        originalTitle: translatedArticle.originalTitle,
        originalContent: translatedArticle.originalContent
      };

      return patwahArticle;

    } catch (error) {
      console.error('❌ Error creating Patwah news article:', error.message);
      throw error;
    }
  }

  /**
   * Format content for Patwah news article
   * @param {Object} translatedArticle - Translated article
   * @param {string} cityName - City name
   * @param {string} state - State
   * @returns {string} Formatted content
   */
  formatPatwahContent(translatedArticle, cityName, state) {
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${translatedArticle.content}

Mi a tell yuh bout dis news from ${cityName}, ${state}. Dis story come from ${translatedArticle.source} and mi translate it fi yuh inna real Patwah style.

Source: ${translatedArticle.originalUrl}
Published: ${timestamp}
Language: Jamaican Patois (Patwah)`;
  }

  /**
   * Validate if text is properly translated to Patwah
   * @param {string} text - Text to validate
   * @returns {boolean} Is valid Patwah
   */
  isValidPatwah(text) {
    if (!text || typeof text !== 'string') return false;

    // Check for common Patwah indicators
    const patwahIndicators = [
      'mi', 'yuh', 'dem', 'fi', 'dat', 'dis', 'wah', 'nuh', 'seh', 'bout',
      'ting', 'people', 'man', 'woman', 'pickney', 'yute', 'bwoy', 'gyal'
    ];

    const textLower = text.toLowerCase();
    const hasPatwahWords = patwahIndicators.some(indicator => 
      textLower.includes(indicator)
    );

    return hasPatwahWords;
  }
}

module.exports = PatwahTranslator;
