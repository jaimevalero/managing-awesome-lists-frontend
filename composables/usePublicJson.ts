/**
 * Lee uno de los JSON que genera el backend y se sirven desde `public/`.
 *
 * La URL tiene que ser absoluta. En Vercel el SSR corre dentro de una funcion
 * serverless que NO sirve `public/` — de eso se encarga la CDN — asi que un
 * `$fetch` con ruta relativa se resuelve contra la propia funcion, devuelve 404
 * y deja los datos a null: la portada se pintaba vacia y cada pagina de lista
 * salia como "Lista no encontrada" con `noindex` para los crawlers.
 *
 * En local no se notaba porque `node .output/server/index.mjs` sirve los
 * estaticos y el SSR desde el mismo proceso.
 */
export function usePublicJson<T> (
  key: string,
  path: () => string,
  options: { watch?: any[] } = {}
) {
  // En el servidor es el origen de la peticion entrante; en el cliente, el de
  // la ventana. En los dos casos la peticion sale hacia la CDN.
  const requestUrl = useRequestURL()

  return useAsyncData<T | null>(
    key,
    () => $fetch<T>(`${requestUrl.origin}${path()}`),
    options
  )
}
