<template>
  <div>
    <div v-if="jsonData">
      <InfoComponent
        :categoryName="jsonData.category_name"
        :frequentTopics="jsonData.frecuent_topics"
        :categoryType="jsonData.category_type"
        :description="getDescription(jsonData)"
         />

      <TableComponent :reposData="jsonData.repos_data" />
    </div>
    <div v-else-if="!pending">
      <v-alert v-if="notFound" type="warning" variant="tonal" class="ma-4">
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
import TableComponent from '../../components/TableComponent.vue'

const SITE_URL = 'https://managing-awesome-lists.vercel.app'
// Igual que en scripts/generate-sitemap.mjs: por debajo de esto una pagina de
// topic es solo 1-2 repos sueltos, no aporta nada que indexar.
const MIN_TOPIC_REPOS = 5

export default defineComponent({
  components: {
     InfoComponent,
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
      const title = `${data.category_name} — ${repoCount} recursos`
      const topics = Object.keys(data.frecuent_topics || {}).join(', ')
      const isThinTopic = data.category_type === 'topic' && repoCount < MIN_TOPIC_REPOS

      return {
        title,
        meta: [
          { name: 'description', content: description },
          { name: 'keywords', content: topics },
          { name: 'robots', content: isThinTopic ? 'noindex, follow' : 'index, follow' },
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
        ]
      }
    })

    return {
      jsonData,
      pending,
      notFound,
      getDescription
    }
  }
})
</script>