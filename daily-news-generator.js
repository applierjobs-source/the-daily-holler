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

// Generate a base article (generic, not city-specific)
async function generateBaseArticle(themeNumber) {
  const prompt = `You are a satirical news writer for a site like *The Onion*. Your job is to create a unique, hilarious fake news article.

### STYLE REQUIREMENTS
- Tone: Deadpan journalistic, as if it were a serious AP newswire article, but absurd.
- Humor: Mix of exaggeration, surrealism, and playful cultural references.
- Headline: Punchy, 8–12 words, must set up the absurd premise.
- Length: 250–400 words.
- Format: [HEADLINE] + [ARTICLE BODY with 3–4 short paragraphs].

### THEMES (rotate for diversity)
Choose **one theme** for this article. Distribute themes so no single idea feels overused.

#### Themes 1–200
1. Local thrift store introduces bizarre membership rules
2. Residents panic when town clock moves ahead one year
3. Local brewery sparks outrage with strange new flavor
4. Entire town takes part in confusing scavenger hunt
5. Residents feud over misplaced statue
6. Local carnival game sparks federal investigation
7. City council debates outlawing squirrels
8. Local marching band sparks international incident
9. Farmers protest by painting absurd slogans on cows
10. Entire town convinced famous celebrity is hiding locally
11. Town builds unnecessary underground tunnel
12. Residents feud over hot dog toppings
13. Local marathon devolves into absurd chaos
14. Public park swings cause surreal controversy
15. Entire town starts speaking in rhymes
16. Residents panic over oddly shaped cloud
17. Local theater troupe sparks nationwide protest
18. Town introduces absurd bedtime curfew for adults
19. Residents forced to adopt ridiculous new handshake
20. Entire town's GPS points to same house
21. Local coin-operated machine becomes source of chaos
22. Residents feud over absurd mural
23. Local mayor hosts bizarre talent show
24. Residents panic after strange sound from water pipes
25. Local barber sparks scandal with eccentric haircut rules
26. Town debates banning plastic flamingos
27. Entire town obsessed with a board game
28. Local teacher introduces surreal grading system
29. Residents panic when elevators stop working mysteriously
30. Town hall roof caves in from bizarre cause
31. Residents feud over absurd dog leash law
32. Local coffee shop sparks moral panic
33. Residents panic after bizarre rainbow appears
34. Local fisherman claims to catch mythical creature
35. Town introduces absurd recycling tokens
36. Local choir sparks global controversy
37. Residents feud over absurd shoe ban
38. Town parade accidentally enters another state
39. Residents panic over giant pothole
40. Local bookstore introduces surreal late fees
41. Town debates banning whistling in public
42. Residents panic after sun sets at wrong time
43. Local mall sparks nationwide scandal
44. Town installs unnecessary lighthouse
45. Residents feud over absurd mascot redesign
46. Local playground sparks surreal conspiracy
47. Town hall flooded with gelatin
48. Residents panic when town fountain runs chocolate
49. Local mayor sparks outrage with karaoke contest
50. Residents feud over absurd fishing rule
51. Local diner serves food in bizarre fashion
52. Town celebrates strange holiday nobody understands
53. Residents panic when statues start talking
54. Local bus stop becomes international tourist attraction
55. Town creates absurd no-laughing ordinance
56. Residents feud over bizarre bell tower ringing
57. Local chef sparks scandal with absurd cooking method
58. Town builds unnecessary suspension bridge
59. Residents panic over fake snowstorm
60. Local zoo sparks chaos with new exhibit
61. Town debates banning flip-flop sandals
62. Residents panic after discovering extra Monday in calendar
63. Local high school holds absurd prom theme
64. Town introduces bizarre left-turn-only law
65. Residents feud over absurd gardening rule
66. Local musician sparks scandal with one-note concert
67. Residents panic after lake disappears overnight
68. Town builds unnecessary Ferris wheel
69. Local mall Santa sparks surreal controversy
70. Residents feud over absurd cat leash law
71. Town introduces bizarre hat tax
72. Local fireworks display sparks alien rumors
73. Residents panic over upside-down street signs
74. Local donut shop sparks health crisis
75. Town builds absurdly small courthouse
76. Residents feud over absurd dance ban
77. Local lifeguard sparks scandal with odd whistle
78. Town introduces bizarre holiday called "Chair Day"
79. Residents panic after night sky turns green
80. Local mayor sparks chaos with interpretive dance speech
81. Residents feud over absurd recycling rules
82. Local church bells spark international incident
83. Town debates banning chewing gum
84. Residents panic when internet only loads cat videos
85. Local parade float sparks absurd scandal
86. Town builds unnecessary second town hall
87. Residents feud over absurd lawn chair rule
88. Local game store sparks nationwide protest
89. Residents panic after squirrels organize protest
90. Local stadium renamed in bizarre sponsorship deal
91. Town introduces confusing three-day weekend schedule
92. Residents feud over absurd hat rule
93. Local mayor sparks outrage with unusual breakfast law
94. Residents panic when river flows backwards
95. Local gas station sparks moral panic
96. Town installs giant unnecessary fountain
97. Residents feud over absurd trash can rule
98. Local bakery sparks scandal with invisible bread
99. Residents panic after birds spell words in sky
100. Local taxi company sparks chaos with new pricing
101. Town debates banning roller skates
102. Residents panic when all clocks stop
103. Local farmers market sells absurd items
104. Residents feud over absurd mailbox rules
105. Local mayor sparks scandal with strange slogan
106. Residents panic over mysterious glowing rock
107. Local fair introduces invisible rides
108. Town builds unnecessary second post office
109. Residents feud over absurd jump rope ban
110. Local art gallery sparks moral panic
111. Residents panic when statues walk around at night
112. Local mechanic sparks chaos with self-driving tractor
113. Town debates banning chewing loudly
114. Residents panic after sky rains spaghetti
115. Local water tower sparks surreal protest
116. Residents feud over absurd license plate rule
117. Local golf course sparks moral panic
118. Residents panic after double sunrise occurs
119. Local book club sparks nationwide scandal
120. Residents feud over absurd sock ban
121. Local mayor sparks chaos with beard law
122. Residents panic over mysterious singing wind
123. Local playground introduces absurd rules
124. Town builds unnecessary rotating restaurant
125. Residents feud over absurd drinking straw law
126. Local grocery store sparks scandal with fake bananas
127. Residents panic when gravity briefly turns off
128. Local ice cream shop sparks moral panic
129. Residents feud over absurd mailbox paint law
130. Local mayor sparks outrage with bedtime law
131. Residents panic when school buses float away
132. Local pet store sparks scandal with cloned animals
133. Residents feud over absurd kite ban
134. Local coffee shop sparks chaos with reverse menu
135. Residents panic after seeing three moons
136. Local town square sparks nationwide conspiracy
137. Residents feud over absurd shoelace law
138. Local mayor sparks scandal with absurd parade costume
139. Residents panic when river turns to Jell-O
140. Local post office sparks moral panic
141. Residents feud over absurd newspaper ban
142. Local park introduces bizarre hopscotch law
143. Residents panic after invisible fog appears
144. Local candy shop sparks scandal with fake chocolate
145. Residents feud over absurd broom ban
146. Local mayor sparks outrage with odd haircut policy
147. Residents panic when dogs start talking
148. Local farmer sparks chaos with rainbow corn
149. Residents feud over absurd pen ban
150. Local amusement park sparks moral panic
151. Residents panic after endless thunderstorm
152. Local library sparks scandal with book-eating robot
153. Residents feud over absurd balloon ban
154. Local mayor sparks outrage with hug tax
155. Residents panic when ground briefly disappears
156. Local fire station sparks chaos with waterless hoses
157. Residents feud over absurd button ban
158. Local movie theater sparks scandal with 1-second films
159. Residents panic after town clock spins wildly
160. Local grocery sparks moral panic with square eggs
161. Residents feud over absurd bicycle horn law
162. Local mayor sparks outrage with pancake speech
163. Residents panic after seeing giant shadow in sky
164. Local bakery sparks scandal with helium-filled bread
165. Residents feud over absurd ban on naps

### WRITING REQUIREMENTS
- Include at least one fake quote from a resident, official, or expert.
- Weave in 1–2 real local facts to ground the absurdity.
- Make each article feel distinct — no recycled setups.

### OUTPUT
Return only the satirical article in this format:
[HEADLINE]
[ARTICLE BODY]

Use theme number ${themeNumber} from the list above.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.9
    });

    const content = response.choices[0].message.content.trim();
    const lines = content.split('\n');
    const headline = lines[0];
    const body = lines.slice(1).join('\n').trim();

    return {
      headline,
      content: body,
      theme: themeNumber
    };
  } catch (error) {
    console.error('Error generating base article:', error);
    return null;
  }
}

// Customize article for specific city
function customizeArticleForCity(baseArticle, city) {
  if (!baseArticle || !city) return null;

  // Create city-specific headline
  const cityHeadline = baseArticle.headline.replace(/Local|Town|City/g, city.city);
  
  // Create city-specific content
  let cityContent = baseArticle.content
    .replace(/Local|Town|City/g, city.city)
    .replace(/residents/gi, `${city.city} residents`)
    .replace(/town/gi, city.city)
    .replace(/city/gi, city.city);

  // Add some local flavor
  if (city.state) {
    cityContent = cityContent.replace(/state/gi, city.state);
  }

  return {
    headline: cityHeadline,
    content: cityContent,
    city: city.city,
    state: city.state,
    slug: `${city.city.toLowerCase().replace(/\s+/g, '-')}-${baseArticle.theme}`,
    theme: baseArticle.theme,
    publishedAt: new Date().toISOString()
  };
}

// Main function to generate daily news
async function generateDailyNews() {
  try {
    console.log('🚀 Starting daily news generation...');
    
    // Load cities
    const cities = await loadCities();
    if (cities.length === 0) {
      console.error('❌ No cities found');
      return { articles: [] };
    }

    // Check if articles already exist for today (simplified check)
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Generating articles for today: ${today}`);

    // Generate 2 unique base articles for testing
    console.log('🎨 Generating 2 unique base articles for testing...');
    const baseArticles = [];
    
    for (let i = 0; i < 2; i++) {
      console.log(`📝 Generating base article ${i + 1}/2...`);
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
    
    // Distribute each base article to first 50 cities for testing
    console.log(`🌍 Distributing articles to first 50 cities for testing...`);
    let totalGenerated = 0;
    const testCities = cities.slice(0, 50);
    const generatedArticles = [];
    
    for (let i = 0; i < baseArticles.length; i++) {
      const baseArticle = baseArticles[i];
      console.log(`📤 Distributing article ${i + 1}/${baseArticles.length} to test cities...`);
      
      for (let j = 0; j < testCities.length; j++) {
        const city = testCities[j];
        const customizedArticle = customizeArticleForCity(baseArticle, city);
        
        if (customizedArticle) {
          generatedArticles.push(customizedArticle);
          totalGenerated++;
          
          // Progress reporting every 25 articles
          if (totalGenerated % 25 === 0) {
            console.log(`📊 Progress: ${totalGenerated} articles generated so far...`);
          }
        }
      }
      
      console.log(`✅ Article ${i + 1} distributed to ${testCities.length} cities`);
    }
    
    console.log(`\n🎉 Daily news generation complete!`);
    console.log(`✅ Generated: ${totalGenerated} total articles`);
    console.log(`📊 Base articles: ${baseArticles.length}`);
    console.log(`🏙️ Cities covered: ${testCities.length}`);
    console.log(`💰 Estimated cost: ~$2-5 (2 base articles + 100 customizations)`);
    
    return { articles: generatedArticles };
    
  } catch (error) {
    console.error('❌ Error in generateDailyNews:', error);
    return { articles: [] };
  }
}

module.exports = { generateDailyNews };