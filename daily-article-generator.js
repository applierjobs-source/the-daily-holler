const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load cities data
async function loadCities() {
  try {
    const citiesData = await fs.readFile(path.join(__dirname, 'server/data/cities.json'), 'utf8');
    return JSON.parse(citiesData);
  } catch (error) {
    console.error('Error loading cities:', error);
    return [];
  }
}

// Load existing articles
async function loadArticles() {
  try {
    const articlesData = await fs.readFile(path.join(__dirname, 'server/data/articles.json'), 'utf8');
    return JSON.parse(articlesData);
  } catch (error) {
    console.error('Error loading articles:', error);
    return { articles: [] };
  }
}

// Save articles
async function saveArticles(articles) {
  try {
    await fs.writeFile(
      path.join(__dirname, 'server/data/articles.json'),
      JSON.stringify(articles, null, 2)
    );
    console.log('Articles saved successfully');
  } catch (error) {
    console.error('Error saving articles:', error);
  }
}

// Generate article for a city
async function generateArticle(city) {
  const prompt = `You are a satirical news writer for a site like *The Onion*. Your job is to create a unique, hilarious fake news article for the city of ${city.name}, ${city.stateName}.

### STYLE REQUIREMENTS
- Tone: Deadpan journalistic, as if it were a serious AP newswire article, but absurd.
- Humor: Mix of exaggeration, surrealism, and playful cultural references.
- Headline: Punchy, 8–12 words, must set up the absurd premise.
- Length: 250–400 words.
- Format: [HEADLINE] + [ARTICLE BODY with 3–4 short paragraphs].

### LOCAL CONTEXT
Use accurate local details about ${city.name}, ${city.stateName} where possible:
- Landmarks, attractions, or geography
- Popular foods or traditions
- Sports teams or mascots
- Historical quirks or nicknames
- Anything distinctive about the community

### THEMES (choose one randomly)
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

### WRITING REQUIREMENTS
- Include at least one fake quote from a resident, official, or expert.
- Weave in 1–2 real local facts to ground the absurdity.
- Make each city's article feel distinct — no recycled setups.

### OUTPUT
Return only the satirical article in this format:
[HEADLINE]
[ARTICLE BODY]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    });

    const content = response.choices[0].message.content;
    const lines = content.split('\n');
    const headline = lines[0];
    const body = lines.slice(1).join('\n').trim();

    return {
      id: Date.now() + Math.random(),
      headline: headline,
      content: body,
      cityName: city.name,
      cityId: city.id || Math.floor(Math.random() * 1000000),
      state: city.stateName,
      publishedAt: new Date().toISOString(),
      author: "The Daily Holler Staff",
      category: "Local News",
      tags: ["local", "satirical", "news", city.name.toLowerCase()],
      readTime: Math.ceil(body.split(' ').length / 200),
      excerpt: body.substring(0, 150) + '...',
      slug: headline.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 100)
    };
  } catch (error) {
    console.error(`Error generating article for ${city.name}:`, error);
    return null;
  }
}

// Main generation function
async function generateDailyArticles() {
  console.log('🚀 Starting daily article generation...');
  
  const cities = await loadCities();
  const existingArticles = await loadArticles();
  
  console.log(`📊 Found ${cities.length} cities`);
  console.log(`📰 Current articles: ${existingArticles.articles.length}`);
  
  const today = new Date().toISOString().split('T')[0];
  const todayArticles = existingArticles.articles.filter(article => 
    article.publishedAt.startsWith(today)
  );
  
  console.log(`📅 Articles already generated today: ${todayArticles.length}`);
  
  if (todayArticles.length >= cities.length) {
    console.log('✅ All articles for today already generated!');
    return;
  }
  
  // Process all remaining cities for today (up to 1,690 total)
  const remainingCities = cities.length - todayArticles.length;
  const citiesToProcess = cities.slice(todayArticles.length, todayArticles.length + remainingCities);
  console.log(`🔄 Processing ${citiesToProcess.length} cities (all remaining cities)...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < citiesToProcess.length; i++) {
    const city = citiesToProcess[i];
    console.log(`📝 Generating article ${i + 1}/${citiesToProcess.length} for ${city.name}, ${city.stateName}...`);
    
    const article = await generateArticle(city);
    
    if (article) {
      existingArticles.articles.unshift(article); // Add to beginning
      successCount++;
      console.log(`✅ Generated: ${article.headline}`);
    } else {
      errorCount++;
      console.log(`❌ Failed to generate article for ${city.name}`);
    }
    
    // Save every 25 articles to prevent data loss (optimized for large batches)
    if ((i + 1) % 25 === 0) {
      await saveArticles(existingArticles);
      const progress = ((i + 1) / citiesToProcess.length * 100).toFixed(1);
      console.log(`💾 Saved progress: ${i + 1}/${citiesToProcess.length} articles (${progress}%)`);
    }
    
    // Optimized delay to respect OpenAI rate limits (500 RPM = ~8.3 requests per second)
    // Using 150ms delay = ~6.7 requests per second (well within limits)
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Final save
  await saveArticles(existingArticles);
  
  console.log(`\n🎉 Daily article generation complete!`);
  console.log(`✅ Successfully generated: ${successCount} articles`);
  console.log(`❌ Failed: ${errorCount} articles`);
  console.log(`📊 Total articles: ${existingArticles.articles.length}`);
}

// Run if called directly
if (require.main === module) {
  generateDailyArticles().catch(console.error);
}

module.exports = { generateDailyArticles };
