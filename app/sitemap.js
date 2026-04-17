export default function sitemap() {
  const baseUrl = 'https://hexadent.com.ec';

  // Define static routes
  const routes = [
    '',
    '/politica-de-privacidad',
    '/terminos-de-servicio',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
