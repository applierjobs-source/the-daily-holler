#!/usr/bin/env node

/**
 * Patois Translation Service
 * 
 * Translates English news articles to Jamaican Patois using OpenAI
 */

const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Translate English text to Jamaican Patois
 */
async function translateToPatois(englishText, context = '') {
  try {
    console.log(`🔄 Translating ${englishText.length} characters to Patois...`);
    
    const prompt = `You are a professional translator specializing in Jamaican Patois (Jamaican Creole). 

TASK: Translate the following English text to authentic Jamaican Patois while maintaining the original meaning and tone.

CONTEXT: ${context}

TRANSLATION GUIDELINES:
- Use authentic Jamaican Patois vocabulary and grammar
- Maintain the original tone (formal, casual, etc.)
- Keep proper nouns (names, places) in English
- Preserve numbers, dates, and technical terms
- Use appropriate Patois expressions and idioms
- Make it sound natural to native Patois speakers
- Keep the same length and structure as the original

ENGLISH TEXT TO TRANSLATE:
${englishText}

Return ONLY the Patois translation, no explanations or additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const patoisText = completion.choices[0].message.content.trim();
    
    console.log(`✅ Translation completed: ${patoisText.length} characters`);
    
    return {
      success: true,
      original: englishText,
      patois: patoisText,
      wordCount: patoisText.split(' ').length
    };
    
  } catch (error) {
    console.error('❌ Error translating to Patois:', error.message);
    return {
      success: false,
      error: error.message,
      original: englishText
    };
  }
}

/**
 * Translate a news article to Patois
 */
async function translateNewsArticle(article) {
  try {
    console.log(`📰 Translating news article: "${article.title}"`);
    
    // Translate title
    const titleTranslation = await translateToPatois(article.title, 'news headline');
    
    if (!titleTranslation.success) {
      throw new Error(`Failed to translate title: ${titleTranslation.error}`);
    }
    
    // Translate content
    const contentTranslation = await translateToPatois(article.content, 'news article content');
    
    if (!contentTranslation.success) {
      throw new Error(`Failed to translate content: ${contentTranslation.error}`);
    }
    
    return {
      success: true,
      original: {
        title: article.title,
        content: article.content,
        source: article.source,
        url: article.url,
        timeAgo: article.timeAgo
      },
      patois: {
        title: titleTranslation.patois,
        content: contentTranslation.patois,
        source: article.source, // Keep source in English
        url: article.url,
        timeAgo: article.timeAgo
      },
      wordCount: {
        original: article.content.split(' ').length,
        patois: contentTranslation.wordCount
      }
    };
    
  } catch (error) {
    console.error('❌ Error translating news article:', error.message);
    return {
      success: false,
      error: error.message,
      article: article
    };
  }
}

/**
 * Create a Patois news article for the database
 */
function createPatoisNewsArticle(translation, cityName, state) {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Generate slug
    const baseSlug = `${cityName.toLowerCase().replace(/\s+/g, '-')}-${translation.patois.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-')}`;
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;
    
    return {
      title: translation.patois.title,
      content: translation.patois.content,
      city: cityName,
      state: state,
      slug: slug,
      author: 'The Daily Holler',
      theme: 'google-news-patois',
      is_today: true,
      published_at: now,
      created_at: now,
      // Store original English for reference
      original_title: translation.original.title,
      original_content: translation.original.content,
      original_source: translation.original.source,
      original_url: translation.original.url,
      word_count: translation.wordCount.patois
    };
    
  } catch (error) {
    console.error('❌ Error creating Patois news article:', error.message);
    throw error;
  }
}

module.exports = {
  translateToPatois,
  translateNewsArticle,
  createPatoisNewsArticle
};
