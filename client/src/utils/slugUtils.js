// Utility functions for generating URL-friendly slugs

/**
 * Generate a URL-friendly slug from a headline
 * @param {string} headline - The article headline
 * @returns {string} - URL-friendly slug
 */
export const generateArticleSlug = (headline) => {
  if (!headline) return '';
  
  return headline
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
};

/**
 * Generate a city slug from city name and state
 * @param {string} cityName - The city name
 * @param {string} state - The state (abbreviation or full name)
 * @returns {string} - URL-friendly city slug
 */
export const generateCitySlug = (cityName, state) => {
  if (!cityName || !state) return '';
  
  // Convert state to abbreviation if it's a full name
  const stateAbbrev = getStateAbbreviation(state);
  
  return `${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateAbbrev.toLowerCase()}`;
};

/**
 * Convert state name to abbreviation
 * @param {string} state - State name or abbreviation
 * @returns {string} - State abbreviation
 */
export const getStateAbbreviation = (state) => {
  const stateMap = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
  };
  
  return stateMap[state] || state;
};

/**
 * Parse a city slug back to city name and state
 * @param {string} slug - The city slug
 * @returns {object} - { cityName, state }
 */
export const parseCitySlug = (slug) => {
  if (!slug) return null;
  
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  
  const state = parts[parts.length - 1].toUpperCase();
  const cityName = parts.slice(0, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return { cityName, state };
};

/**
 * Generate full article URL
 * @param {object} article - The article object
 * @returns {string} - Full article URL
 */
export const generateArticleUrl = (article) => {
  if (!article || !article.id) {
    return '/';
  }
  
  // If article already has a slug, use it
  if (article.slug) {
    const citySlug = generateCitySlug(article.city, article.state);
    return `/${citySlug}/article/${article.slug}`;
  }
  
  // Otherwise generate the slug in the same format as the server: city-title
  const citySlug = generateCitySlug(article.city, article.state);
  const uniqueSlug = generateUniqueArticleSlug(article.title || article.headline, article.city);
  return `/${citySlug}/article/${uniqueSlug}`;
};

/**
 * Generate article slug with city name for uniqueness
 * @param {string} title - The article title
 * @param {string} city - The city name
 * @returns {string} - Unique article slug
 */
export const generateUniqueArticleSlug = (title, city) => {
  if (!title || !city) return '';
  
  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
  
  return `${citySlug}-${titleSlug}`;
};

