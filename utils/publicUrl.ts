/**
 * URL de un fichero de `public/`, respetando la ruta base del despliegue.
 *
 * En GitHub Pages la web cuelga de /managing-awesome-lists-frontend/, asi que
 * pedir '/topics.json' desde la raiz del dominio daria 404.
 */
export function publicUrl (path: string): string {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return `${base}${path}`
}
