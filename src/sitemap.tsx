
// generate-sitemap.ts
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';

// 🔧 Mets ton domaine ici :
const hostname = 'https://www.alfirdaousstore.com';

// 🔗 Liste tes routes publiques à indexer :
const routes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/Home', changefreq: 'monthly', priority: 0.8 },
  { url: '/Shoes', changefreq: 'monthly', priority: 0.6 },
  { url: '/Sandals', changefreq: 'monthly', priority: 0.6 },
  { url: '/Shirts', changefreq: 'monthly', priority: 0.6 },
  { url: '/Pants', changefreq: 'monthly', priority: 0.6 },

];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname });
  const writeStream = createWriteStream(
    path.resolve('../public/sitemap.xml')
  );

  routes.forEach((route) => sitemap.write(route));
  sitemap.end();

  const data = await streamToPromise(sitemap);
  writeStream.write(data);
  writeStream.end();

}

generateSitemap();
