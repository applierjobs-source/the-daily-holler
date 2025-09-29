const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DATA_DIR = path.join(__dirname, 'server', 'data');
const CITIES_FILE = path.join(DATA_DIR, 'cities.json');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

// Comprehensive prompt for generating city-specific satirical articles
const ARTICLE_PROMPT = `You are a satirical news writer for a site like *The Onion*. Your job is to create a unique, hilarious fake news article for the city of {{city}}, {{state}}.

### STYLE REQUIREMENTS
- Tone: Deadpan journalistic, as if it were a serious AP newswire article, but absurd.
- Humor: Mix of exaggeration, surrealism, and playful cultural references.
- Headline: Punchy, 8–12 words, must set up the absurd premise.
- Length: 250–400 words.
- Format: [HEADLINE] + [ARTICLE BODY with 3–4 short paragraphs].

### LOCAL CONTEXT
Use accurate local details about {{city}}, {{state}} where possible:
- Landmarks, attractions, or geography
- Popular foods or traditions
- Sports teams or mascots
- Historical quirks or nicknames
- Anything distinctive about the community
(If knowledge is limited, invent plausible but funny local color instead.)

### THEMES (rotate for diversity)
Choose **one theme** for this article. Distribute themes so no single idea feels overused.

#### Themes 1–365 (Already enumerated above.)
#### Themes 366–1,680
Themes continue in the same format. They are grouped into **21 major categories**, each with ~80 sub-variations, producing ~1,680 total.

**Categories include:**
1. Local Government & Politics
2. Food & Drink
3. Sports & Mascots
4. Animals & Nature
5. Weather & Natural Disasters
6. Infrastructure & Transportation
7. Festivals & Holidays
8. Schools & Youth
9. Religion & Traditions
10. Businesses & Shops
11. Crime & Law Enforcement
12. Science & Technology
13. Tourism & Landmarks
14. Neighbor Rivalries
15. Health & Safety
16. Rumors & Superstitions
17. History & Heritage
18. Arts & Entertainment
19. Housing & Neighborhoods
20. Everyday Objects & Trends
21. Miscellaneous Absurdities

**Example extensions:**
- **366. Mayor introduces tax on standing still in public**
- **367. Residents panic when pigeons demand voting rights**
- **368. Local football team forced to practice underwater**
- **369. Town installs escalator to top of small hill**
- **370. Residents feud over ownership of giant rubber duck**
...
- **1679. Residents panic after discovering town anthem is plagiarized from pop song**
- **1680. Local librarian elected mayor after winning karaoke contest**

(The full bank expands these systematically until 1,680 unique story premises exist.)

---

### WRITING REQUIREMENTS
- Include at least one fake quote from a resident, official, or expert.
- Weave in 1–2 real local facts to ground the absurdity.
- Make each city's article feel distinct — no recycled setups.

### OUTPUT
Return only the satirical article in this format:
[HEADLINE]
[ARTICLE BODY]`;

async function generateArticleForCity(cityName, state) {
  try {
    const prompt = ARTICLE_PROMPT.replace('{{city}}', cityName).replace('{{state}}', state);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    });
    
    const content = response.choices[0].message.content.trim();
    
    // Parse headline and body
    const lines = content.split('\n').filter(line => line.trim());
    const headline = lines[0];
    const body = lines.slice(1).join('\n').trim();
    
    return {
      id: `daily_${cityName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      headline: headline,
      body: body,
      author: 'Ron Burgundy',
      city: cityName,
      state: state,
      wordCount: body.split(' ').length,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error generating article for ${cityName}, ${state}:`, error.message);
    return null;
  }
}

async function generateDailyArticles() {
  console.log('🚀 Generating daily articles for all cities...');
  
  // Load cities
  const citiesData = JSON.parse(fs.readFileSync(CITIES_FILE, 'utf8'));
  const cities = citiesData.cities || [];
  
  console.log(`📊 Found ${cities.length} cities to process`);
  
  const articles = [];
  const batchSize = 5; // Process in small batches to avoid rate limits
  
  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    console.log(`📝 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(cities.length/batchSize)} (${batch.length} cities)`);
    
    const batchPromises = batch.map(city => generateArticleForCity(city.name, city.state));
    const batchResults = await Promise.all(batchPromises);
    
    const validArticles = batchResults.filter(article => article !== null);
    articles.push(...validArticles);
    
    console.log(`✅ Generated ${validArticles.length}/${batch.length} articles in this batch`);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < cities.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`🎉 Generated ${articles.length} total articles!`);
  
  // Save articles
  const articlesData = {
    articles: articles,
    generatedAt: new Date().toISOString(),
    totalCount: articles.length
  };
  
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articlesData, null, 2));
  console.log(`💾 Saved articles to ${ARTICLES_FILE}`);
  
  return articles;
}

// Run if called directly
if (require.main === module) {
  generateDailyArticles()
    .then(() => {
      console.log('✅ Daily article generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error generating daily articles:', error);
      process.exit(1);
    });
}

module.exports = {
  generateDailyArticles,
  generateArticleForCity
};
