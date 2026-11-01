/**
 * Lee uno de los JSON que genera el backend y se sirven desde `public/`.
 */
export function usePublicJson<T> (
  key: string,
  path: () => string,
  options: { watch?: any[] } = {}
) {
  return useAsyncData<T | null>(
    key,
    () => $fetch<T>(publicUrl(path())),
    options
  )
}
