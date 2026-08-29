// Genera public/sitemap.xml a partir de los JSON estaticos en public/awesome y public/topic.
// Se ejecuta antes de cada build (ver package.json) para que el sitemap siempre
// refleje los datos que acaba de copiar start.sh, sin mantenerlo a mano.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')
const SITE_URL = 'https://managing-awesome-lists.vercel.app'

// La mayoria de paginas de topic solo agregan 1-2 repos (mediana: 1 de 26.250).
// Mandar esa cola larga a Google es contenido fino a escala: diluye la
// autoridad del dominio en vez de sumarla. Solo entran las que aportan algo.
const MIN_TOPIC_REPOS = 5

function toUrl(type, name) {
  return `${SITE_URL}/a-${type}/${encodeURIComponent(name).replace(/%40/g, '@')}`
}

function listAwesomeUrls() {
  return readdirSync(join(PUBLIC_DIR, 'awesome'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => toUrl('awesome', f.slice(0, -'.json'.length)))
}

function listTopicUrls() {
  const dir = join(PUBLIC_DIR, 'topic')
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => {
      const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
      return (data.repos_data?.length || 0) >= MIN_TOPIC_REPOS
    })
    .map((f) => toUrl('topic', f.slice(0, -'.json'.length)))
}

const staticUrls = [SITE_URL + '/', SITE_URL + '/about']
const urls = [...staticUrls, ...listAwesomeUrls(), ...listTopicUrls()]

const body = urls
  .map((url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), xml)
console.log(`sitemap.xml generado con ${urls.length} URLs`)
