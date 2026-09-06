// Genera public/sitemap.xml a partir de los JSON estaticos en public/awesome,
// public/topic y public/similar.
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

// Los parecidos entran solo si reunen vecinos suficientes. La mitad se queda
// en 0-4 (la similitud por topics compartidos se agota pronto: mediana 5,
// techo 12) y esas si son contenido fino. El resto son paginas legitimas.
//
// Este umbral es el mismo que decide el noindex en pages/a-[type]/[[name]].vue
// (MIN_SIMILAR_REPOS) y tienen que moverse juntos: anunciar aqui una pagina
// que luego se declara noindex es contradecirse, y Google lo reporta como
// "enviada mediante sitemap pero marcada como noindex".
const MIN_SIMILAR_REPOS = 5

function toUrl(type, name) {
  return `${SITE_URL}/a-${type}/${encodeURIComponent(name).replace(/%40/g, '@')}`
}

// Lee un directorio de JSON y devuelve {url, lastmod} de las paginas que superan
// el umbral de repos. minRepos = 0 las acepta todas.
//
// lastmod es el pushed_at mas reciente de los repos de la pagina: es lo que de
// verdad cambia su contenido. Google lo usa para repartir el rastreo, pero solo
// si se fia, asi que tiene que salir del dato real y no de la fecha del build.
// changefreq y priority no se emiten: Google los ignora desde hace años.
function listUrls(type, minRepos) {
  const dir = join(PUBLIC_DIR, type)
  const entries = []
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json')) continue
    const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
    const repos = data.repos_data || []
    if (minRepos > 0 && repos.length < minRepos) continue
    let lastmod = ''
    for (const repo of repos) {
      const pushed = repo.pushed_at || ''
      if (pushed > lastmod) lastmod = pushed
    }
    entries.push({ url: toUrl(type, f.slice(0, -'.json'.length)), lastmod })
  }
  return entries
}

const staticUrls = [{ url: SITE_URL + '/' }, { url: SITE_URL + '/about' }]
const awesomeUrls = listUrls('awesome', 0)
const topicUrls = listUrls('topic', MIN_TOPIC_REPOS)
const similarUrls = listUrls('similar', MIN_SIMILAR_REPOS)
const urls = [...staticUrls, ...awesomeUrls, ...topicUrls, ...similarUrls]

const body = urls
  .map(({ url, lastmod }) => {
    const loc = `<loc>${url.replace(/&/g, '&amp;')}</loc>`
    // Solo fecha: la hora exacta no aporta nada para decidir un recrawl.
    const mod = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
    return `  <url>${loc}${mod}</url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), xml)
console.log(
  `sitemap.xml generado con ${urls.length} URLs ` +
    `(${awesomeUrls.length} awesome, ${topicUrls.length} topic, ${similarUrls.length} similar)`
)
