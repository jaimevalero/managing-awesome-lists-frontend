<template>
  <div>
    <div v-if="jsonData">
      <!-- Client-only: el rastro vive en sessionStorage, y estas paginas son noindex
           de todas formas, asi que no hay nada que renderizar en servidor -->
      <ClientOnly>
        <SimilarTrail v-if="jsonData.category_type === 'similar'" :full-name="jsonData.category_name" />
      </ClientOnly>

      <InfoComponent
        :categoryName="jsonData.category_name"
        :frequentTopics="jsonData.frecuent_topics"
        :categoryType="jsonData.category_type"
        :description="getDescription(jsonData)"
         />

      <TableComponent :reposData="jsonData.repos_data" />
    </div>
    <div v-else-if="!pending">
      <!-- El backend no escribe fichero para los repos sin parecidos, asi que aqui un
           404 no es un error: es la respuesta, y son 3.708 repos. Decir "no encontrada"
           haria pensar que la web esta rota -->
      <v-alert v-if="notFound && isSimilarPage" type="info" variant="tonal" class="ma-4">
        No similar repositories found for
        <a :href="'https://github.com/' + originRepo" target="_blank">{{ originRepo }}</a>.
      </v-alert>
      <v-alert v-else-if="notFound" type="warning" variant="tonal" class="ma-4">
        No se ha encontrado esta lista.
      </v-alert>
      <v-alert v-else type="error" variant="tonal" class="ma-4">
        No se han podido cargar los datos de esta lista. Vuelve a intentarlo en un momento.
      </v-alert>
    </div>
  </div>
</template>

<script lang="ts">

import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'

import InfoComponent from '../../components/InfoComponent.vue'
import SimilarTrail from '../../components/SimilarTrail.vue'
import TableComponent from '../../components/TableComponent.vue'

const SITE_URL = 'https://managing-awesome-lists.vercel.app'
// Igual que en scripts/generate-sitemap.mjs: por debajo de esto una pagina de
// topic es solo 1-2 repos sueltos, no aporta nada que indexar.
const MIN_TOPIC_REPOS = 5
// 21.000 paginas de cinco repos son contenido fino a escala, justo lo que se evita
// con MIN_TOPIC_REPOS. Se navegan, no se buscan: fuera del indice y fuera del sitemap
// (generate-sitemap.mjs solo recorre awesome y topic, asi que ya no entran)
const NOINDEX_TYPES = ['similar']
// Cuantos repos se describen en los datos estructurados. La pagina de python
// lista 1.254: serializarlos todos duplicaria el peso del HTML para decirle a
// Google algo que ya deduce del contenido visible. Con una muestra basta para
// que entienda que esto es una lista de proyectos y no un articulo.
const JSONLD_MAX_ITEMS = 25

// Describe la pagina como lo que es: una coleccion de proyectos de software.
// El titulo y la meta description le dicen a Google de que va; esto le dice
// que hay dentro, con nombre, lenguaje, enlace y estrellas de cada repo, que
// son datos que ya tenemos cargados y que hasta ahora no le daban a nadie.
function buildJsonLd(data: any, title: string, description: string, url: string) {
  const repos = (data.repos_data || []).slice(0, JSONLD_MAX_ITEMS)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.repos_data?.length || 0,
      itemListElement: repos.map((repo: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareSourceCode',
          name: repo.full_name,
          description: repo.description || undefined,
          codeRepository: `https://github.com/${repo.full_name}`,
          programmingLanguage: repo.language || undefined,
          keywords: (repo.topics || []).join(', ') || undefined,
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: repo.stargazers_count || 0
          }
        }
      }))
    }
  }
}

export default defineComponent({
  components: {
    InfoComponent,
    SimilarTrail,
    TableComponent
  },
  setup() {
    const route = useRoute()
    const getDescription = (data: any) => data?.repo_meta_data?.description

    // usePublicJson corre tambien en el servidor: es lo que hace que el HTML
    // que ve un crawler (o al compartir el enlace) ya traiga la lista, en vez
    // de la version vacia que dejaba el fetch original hecho solo en el cliente.
    const { data: jsonData, pending, error } = usePublicJson<any>(
      `list-${route.params.type}-${route.params.name}`,
      () => `/${route.params.type}/${route.params.name}.json`,
      { watch: [() => route.fullPath] }
    )

    // Un 404 es "esta lista no existe"; cualquier otra cosa es "no se pudieron
    // cargar los datos". Distinguirlos importa: el segundo caso es un fallo
    // nuestro y hay que verlo, no disimularlo con el mismo mensaje del primero.
    const notFound = computed(() => (error.value as any)?.statusCode === 404)
    const isSimilarPage = computed(() => route.params.type === 'similar')
    const originRepo = computed(() => String(route.params.name || '').replace('@', '/'))

    // useHead con una funcion (en vez de un objeto) es reactivo: unhead vuelve a
    // leerla cuando jsonData cambia, sin depender de que un watch() llegue a
    // flushear a tiempo antes de que el servidor serialice el <head>.
    useHead(() => {
      const data = jsonData.value
      const path = `/a-${route.params.type}/${route.params.name}`

      if (!data) {
        return { title: 'Lista no encontrada', meta: [{ name: 'robots', content: 'noindex' }] }
      }

      const repoCount = data.repos_data?.length || 0
      const description = getDescription(data)
        ? `${getDescription(data)} · ${repoCount} recursos curados.`
        : `Lista curada de ${repoCount} recursos sobre ${data.category_name}.`
      const title = data.category_type === 'similar'
        ? `Similar to ${data.category_name} — ${repoCount} repositories`
        : `${data.category_name} — ${repoCount} recursos`
      const topics = Object.keys(data.frecuent_topics || {}).join(', ')
      const isThinTopic = data.category_type === 'topic' && repoCount < MIN_TOPIC_REPOS
      const isNoIndex = isThinTopic || NOINDEX_TYPES.includes(String(route.params.type))

      return {
        title,
        meta: [
          { name: 'description', content: description },
          { name: 'keywords', content: topics },
          { name: 'robots', content: isNoIndex ? 'noindex, follow' : 'index, follow' },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: SITE_URL + path },
          { name: 'twitter:card', content: 'summary' },
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description }
        ],
        link: [
          { rel: 'canonical', href: SITE_URL + path }
        ],
        // En una pagina noindex no pinta nada: no la va a indexar igualmente.
        // Se escapa "<" porque una descripcion que contenga una etiqueta de
        // cierre de script cortaria el bloque y se llevaria por delante el
        // resto del head.
        script: isNoIndex
          ? []
          : [
              {
                type: 'application/ld+json',
                innerHTML: JSON.stringify(
                  buildJsonLd(data, title, description, SITE_URL + path)
                ).replace(/</g, '\\u003c')
              }
            ]
      }
    })

    return {
      jsonData,
      pending,
      notFound,
      isSimilarPage,
      originRepo,
      getDescription
    }
  }
})
</script>