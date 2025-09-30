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
 * @param {string} state - The state abbreviation
 * @returns {string} - URL-friendly city slug
 */
export const generateCitySlug = (cityName, state) => {
  if (!cityName || !state) return '';
  
  return `${cityName.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
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
  if (!article || !article.title || !article.city || !article.state) {
    return `/article/${article?.id || ''}`;
  }
  
  const citySlug = generateCitySlug(article.city, article.state);
  const articleSlug = generateArticleSlug(article.title);
  
  return `/cities/${citySlug}/article/${articleSlug}`;
};

