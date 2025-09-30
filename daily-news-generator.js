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
    const cities = JSON.parse(citiesData);
    console.log(`✅ Loaded ${cities.length} cities`);
    return cities;
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

// Generate a base article (generic, not city-specific)
async function generateBaseArticle(themeNumber) {
  const prompt = `You are a satirical news writer for a site like *The Onion*. Your job is to create a unique, hilarious fake news article.

### STYLE REQUIREMENTS
- Tone: Deadpan journalistic, as if it were a serious AP newswire article, but absurd.
- Humor: Mix of exaggeration, surrealism, and playful cultural references.
- Headline: Punchy, 8–12 words, must set up the absurd premise.
- Length: 250–400 words.
- Format: [HEADLINE] + [ARTICLE BODY with 3–4 short paragraphs].

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
- Make the article feel distinct and absurd.
- Focus on the theme you choose.

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
      headline: headline,
      content: body,
      theme: themeNumber
    };
  } catch (error) {
    console.error(`Error generating base article:`, error);
    return null;
  }
}

// Customize article for a specific city
function customizeArticleForCity(baseArticle, city) {
  if (!baseArticle) return null;

  // Replace generic terms with city-specific ones
  let customizedHeadline = baseArticle.headline
    .replace(/\b(town|city|municipality|community|local|area|region)\b/gi, city.name)
    .replace(/\b(residents|citizens|locals|townspeople|community members)\b/gi, `${city.name} residents`)
    .replace(/\b(mayor|city council|local government)\b/gi, `${city.name} mayor`)
    .replace(/\b(downtown|city center|main street)\b/gi, `${city.name} downtown`);

  let customizedContent = baseArticle.content
    .replace(/\b(town|city|municipality|community|local|area|region)\b/gi, city.name)
    .replace(/\b(residents|citizens|locals|townspeople|community members)\b/gi, `${city.name} residents`)
    .replace(/\b(mayor|city council|local government)\b/gi, `${city.name} mayor`)
    .replace(/\b(downtown|city center|main street)\b/gi, `${city.name} downtown`)
    .replace(/\b(local officials|city officials)\b/gi, `${city.name} officials`);

  // Add some city-specific flavor
  const stateFlavor = getStateFlavor(city.stateName);
  if (stateFlavor) {
    customizedContent = customizedContent.replace(/\b(community|area)\b/gi, `${stateFlavor} community`);
  }

  return {
    id: Date.now() + Math.random(),
    headline: customizedHeadline,
    content: customizedContent,
    cityName: city.name,
    cityId: city.id || Math.floor(Math.random() * 1000000),
    state: city.stateName,
    publishedAt: new Date().toISOString(),
    author: "The Daily Holler Staff",
    category: "Local News",
    tags: ["local", "satirical", "news", city.name.toLowerCase()],
    readTime: Math.ceil(customizedContent.split(' ').length / 200),
    excerpt: customizedContent.substring(0, 150) + '...',
    slug: customizedHeadline.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 100),
    theme: baseArticle.theme
  };
}

// Add some state-specific flavor
function getStateFlavor(stateName) {
  const stateFlavors = {
    'California': 'Golden State',
    'Texas': 'Lone Star State',
    'Florida': 'Sunshine State',
    'New York': 'Empire State',
    'Illinois': 'Prairie State',
    'Pennsylvania': 'Keystone State',
    'Ohio': 'Buckeye State',
    'Georgia': 'Peach State',
    'North Carolina': 'Tar Heel State',
    'Michigan': 'Great Lakes State'
  };
  return stateFlavors[stateName] || null;
}

// Main generation function
async function generateDailyNews() {
  console.log('🚀 Starting cost-effective daily news generation...');
  console.log('📊 Strategy: 10 unique articles × 1,682 cities = 16,820 total articles');
  
  const cities = await loadCities();
  const existingArticles = await loadArticles();
  
  console.log(`📊 Found ${cities.length} cities`);
  console.log(`📰 Current articles: ${existingArticles.articles ? existingArticles.articles.length : 0}`);
  
  const today = new Date().toISOString().split('T')[0];
  const todayArticles = existingArticles.articles ? existingArticles.articles.filter(article => 
    article.publishedAt.startsWith(today)
  ) : [];
  
  console.log(`📅 Articles already generated today: ${todayArticles.length}`);
  
  if (todayArticles.length >= cities.length) {
    console.log('🗑️ Clearing existing articles for today to regenerate...');
    existingArticles.articles = existingArticles.articles.filter(article => 
      !article.publishedAt.startsWith(today)
    );
  }
  
  // Generate 10 unique base articles
  console.log('🎨 Generating 10 unique base articles...');
  const baseArticles = [];
  
  for (let i = 0; i < 10; i++) {
    console.log(`📝 Generating base article ${i + 1}/10...`);
    const baseArticle = await generateBaseArticle(i + 1);
    if (baseArticle) {
      baseArticles.push(baseArticle);
      console.log(`✅ Generated: ${baseArticle.headline}`);
    } else {
      console.log(`❌ Failed to generate base article ${i + 1}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`🎉 Generated ${baseArticles.length} base articles`);
  
  // Distribute each base article to all cities
  console.log(`🌍 Distributing articles to all ${cities.length} cities...`);
  let totalGenerated = 0;
  
  for (let i = 0; i < baseArticles.length; i++) {
    const baseArticle = baseArticles[i];
    console.log(`📤 Distributing article ${i + 1}/${baseArticles.length} to all cities...`);
    
    for (let j = 0; j < cities.length; j++) {
      const city = cities[j];
      const customizedArticle = customizeArticleForCity(baseArticle, city);
      
      if (customizedArticle) {
        existingArticles.articles.unshift(customizedArticle);
        totalGenerated++;
        
        // Progress reporting every 1000 articles
        if (totalGenerated % 1000 === 0) {
          console.log(`📊 Progress: ${totalGenerated} articles generated so far...`);
        }
      }
    }
    
    console.log(`✅ Article ${i + 1} distributed to ${cities.length} cities`);
  }
  
  // Final save
  await saveArticles(existingArticles);
  
  console.log(`\n🎉 Daily news generation complete!`);
  console.log(`✅ Generated: ${totalGenerated} total articles`);
  console.log(`📊 Base articles: ${baseArticles.length}`);
  console.log(`🏙️ Cities covered: ${cities.length}`);
  console.log(`💰 Estimated cost: ~$50-80 (10 base articles + 16,820 customizations)`);
  console.log(`📈 Total articles in database: ${existingArticles.articles.length}`);
  
  return existingArticles;
}

// Run if called directly
if (require.main === module) {
  generateDailyNews().catch(console.error);
}

module.exports = { generateDailyNews };
