// Genera public/repos.json: el indice que permite encontrar un repo por nombre
// desde la barra lateral.
//
// Hasta ahora la barra solo miraba las 80 listas y los 25.000 topics, asi que
// buscar "adminer" no daba nada: no es un topic, aunque el repo esta en tres
// listas y tiene su propia pagina de parecidos. El repo existia y el buscador
// no sabia llegar.
//
// Se ejecuta antes de cada build, junto al sitemap.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')

// De donde se sacan los repos. Las categorias llevan repos_data; de similar se
// usa repo_meta_data, que es el repo del que va la pagina.
const FUENTES = ['topic', 'awesome', 'similar']

// La descripcion se recorta: es para reconocer el repo en una lista, no para
// leerla. Con el recorte el indice baja de 3 MB a menos de 2.
const MAX_DESC = 90

const repos = new Map()

function considerar(repo) {
  if (!repo?.full_name) return
  const previo = repos.get(repo.full_name)
  const estrellas = repo.stargazers_count || 0
  // Un repo sale en varias categorias; gana la copia con mas estrellas, que es
  // la que se descargo mas tarde.
  if (previo && previo.s >= estrellas) return
  repos.set(repo.full_name, {
    n: repo.full_name,
    d: (repo.description || '').slice(0, MAX_DESC),
    s: estrellas,
    l: repo.language || '',
  })
}

for (const fuente of FUENTES) {
  const dir = join(PUBLIC_DIR, fuente)
  let ficheros
  try {
    ficheros = readdirSync(dir)
  } catch {
    continue
  }
  for (const f of ficheros) {
    if (!f.endsWith('.json')) continue
    let data
    try {
      data = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
    } catch {
      continue
    }
    if (data.repo_meta_data) considerar(data.repo_meta_data)
    for (const repo of data.repos_data || []) considerar(repo)
  }
}

// Ordenado por estrellas: al buscar, los conocidos salen primero sin tener que
// ordenar 23.000 entradas en el navegador.
const salida = [...repos.values()].sort((a, b) => b.s - a.s)
const destino = join(PUBLIC_DIR, 'repos.json')
writeFileSync(destino, JSON.stringify(salida))
const mb = statSync(destino).size / 1e6
console.log(`repos.json generado con ${salida.length} repos (${mb.toFixed(2)} MB)`)
