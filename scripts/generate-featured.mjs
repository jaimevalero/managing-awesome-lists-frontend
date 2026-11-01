// Elige las listas destacadas de la portada a partir de sus estrellas reales.
// lists_enriched.json va en orden alfabetico, y eso ponia 30-seconds-of-css en cabeza.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const FEATURED = 8
// Algunos repos con muchas estrellas apenas enlazan a otros repos: mostrarlos
// llevaria a una pagina casi vacia.
const MIN_REPOS = 50

const lists = JSON.parse(readFileSync('public/lists_enriched.json', 'utf8'))

const ranked = lists
  .map((list) => {
    const path = `public/awesome/${list.category_name.replace('/', '@')}.json`
    if (!existsSync(path)) return null
    const data = JSON.parse(readFileSync(path, 'utf8'))
    return {
      name: list.category_name,
      display: list.display,
      stars: data.repo_meta_data?.stargazers_count || 0,
      repos: data.repos_data?.length || 0
    }
  })
  .filter((list) => list && list.repos >= MIN_REPOS)
  .sort((a, b) => b.stars - a.stars)

// Hay listas que son espejo de otra (Kickball y awesome-selfhosted).
const seen = new Set()
const featured = ranked
  .filter((list) => !seen.has(list.display) && seen.add(list.display))
  .slice(0, FEATURED)
  .map((list) => list.name)

writeFileSync('public/featured.json', JSON.stringify(featured))
console.log(`Featured lists: ${featured.join(', ')}`)
