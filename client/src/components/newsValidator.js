export const validateNewsArticle = (article) => {
  const requiredFields = ['title', 'description', 'url'];
  const optionalFields = ['content', 'image', 'publishedAt', 'source'];
  
  // Validate required fields
  if (!requiredFields.every(field => field in article)) {
    console.warn('Invalid article: Missing required fields', article);
    return null;
  }
  
  // Clean data
  return {
    title: String(article.title).trim(),
    description: String(article.description).trim(),
    content: String(article.content || '').trim(),
    url: String(article.url),
    image: article.image || NEWS_API_SETTINGS.fallbackImage,
    publishedAt: article.publishedAt || new Date().toISOString(),
    source: article.source?.name || String(article.source || NEWS_API_SETTINGS.defaultSource)
  };
};