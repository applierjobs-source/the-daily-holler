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
 * Convert state name to abbreviation
 * @param {string} stateName - Full state name
 * @returns {string} - State abbreviation
 */
export const getStateAbbreviationFromName = (stateName) => {
  const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
    'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
    'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west-virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
  };
  
  return stateMap[stateName.toLowerCase()] || stateName.toUpperCase();
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
  
  // Check if the last part is a state abbreviation (2 chars) or state name (longer)
  const lastPart = parts[parts.length - 1];
  
  if (lastPart.length === 2) {
    // State abbreviation
    const state = lastPart.toUpperCase();
    const cityName = parts.slice(0, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    return { cityName, state };
  } else {
    // Full state name - convert to abbreviation
    const state = getStateAbbreviationFromName(lastPart);
    const cityName = parts.slice(0, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    return { cityName, state };
  }
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
    return `/${citySlug}/events/${article.slug}`;
  }
  
  // Otherwise generate the slug in the same format as the server: city-title
  const citySlug = generateCitySlug(article.city, article.state);
  const uniqueSlug = generateUniqueArticleSlug(article.title || article.headline, article.city);
  return `/${citySlug}/events/${uniqueSlug}`;
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

