<template>
  <v-navigation-drawer 
    v-model="internalModel"
    class="custom-drawer"
    :width="256"
    :rail="false"
    location="left"
    :scrim="false"
  >
    <!-- Inner container to control all content -->
    <div class="drawer-inner-container">
      <!-- Search bar at the top -->
      <div class="pa-3 pt-4">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search lists, topics and repos..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-text-field>
      </div>

      <!-- Lists count badge -->
      <div class="px-3 pb-2">
        <v-chip size="small" color="primary" variant="tonal">
          {{ isSearching ? `${filteredItems.length} lists` : `${filteredItems.length} lists available` }}
        </v-chip>
        <v-chip
          v-if="isSearching && filteredTopics.length"
          size="small"
          color="secondary"
          variant="tonal"
          class="ml-1"
        >
          {{ filteredTopics.length }}{{ topicsTruncated ? '+' : '' }} topics
        </v-chip>
        <v-chip
          v-if="isSearching && filteredRepos.length"
          size="small"
          color="success"
          variant="tonal"
          class="ml-1"
        >
          {{ filteredRepos.length }}{{ reposTruncated ? '+' : '' }} repos
        </v-chip>
      </div>

      <v-divider></v-divider>

      <!-- Navigation items with scroll container -->
      <div class="lists-scroll-container">
        <v-list nav class="py-0">
          <v-tooltip
            v-for="(item, index) in filteredItems"
            :key="index"
            location="right"
            max-width="400"
          >
            <template v-slot:activator="{ props: tooltipProps }">
              <v-list-item
                @click="navigateTo(item)"
                class="list-item-custom"
                :active="isActive(item)"
                v-bind="tooltipProps"
              >
                <template v-slot:prepend>
                  <v-icon size="small" :color="isActive(item) ? 'primary' : 'grey'">
                    {{ item.icon || getCategoryIcon(item.display || item.category_name) }}
                  </v-icon>
                </template>

                <v-list-item-title class="list-item-title">
                  {{ formatDisplayName(item.display) }}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ item.description || item.display || 'Awesome list' }}</span>
          </v-tooltip>
        </v-list>

        <!-- Topics: solo aparecen mientras se busca, nunca en la navegacion normal -->
        <template v-if="isSearching && filteredTopics.length">
          <v-divider class="mt-2"></v-divider>
          <div class="px-4 pt-3 pb-1 topics-section-title">Topics</div>
          <div class="px-2 pb-2 topics-chips">
            <v-chip
              v-for="topic in filteredTopics"
              :key="topic.name"
              size="small"
              variant="outlined"
              color="primary"
              class="topic-chip"
              :class="{ 'topic-chip--active': isTopicActive(topic) }"
              @click="navigateToTopic(topic)"
            >
              <v-icon start size="x-small">mdi-tag</v-icon>
              {{ topic.name }}
              <span class="topic-count">{{ topic.repos }}</span>
            </v-chip>
          </div>
        </template>

        <!-- Repos: un repo puede no ser topic de nada y aun asi tener pagina.
             Buscar "adminer" no daba nada aunque el repo esta en tres listas -->
        <template v-if="isSearching && filteredRepos.length">
          <v-divider class="mt-2"></v-divider>
          <div class="px-4 pt-3 pb-1 topics-section-title">Repositories</div>
          <v-list nav class="py-0">
            <v-list-item
              v-for="repo in filteredRepos"
              :key="repo.n"
              class="list-item-custom"
              @click="navigateToRepo(repo)"
            >
              <template v-slot:prepend>
                <v-icon size="small" color="grey">mdi-source-repository</v-icon>
              </template>
              <v-list-item-title class="repo-title">{{ repo.n }}</v-list-item-title>
              <v-list-item-subtitle v-if="repo.d" class="repo-subtitle">
                {{ repo.d }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <span class="topic-count">{{ formatStars(repo.s) }}</span>
              </template>
            </v-list-item>
          </v-list>
        </template>

        <!-- Empty state -->
        <div
          v-if="filteredItems.length === 0 && filteredTopics.length === 0 && filteredRepos.length === 0"
          class="pa-4 text-center"
        >
          <v-icon size="48" color="grey-lighten-2">mdi-file-search-outline</v-icon>
          <p class="text-caption text-grey mt-2">Nothing found</p>
        </div>
      </div>

      <!-- Collapse button at bottom - fixed position -->
      <div class="collapse-button-container">
        <v-btn
          block
          variant="text"
          class="collapse-btn-bottom"
          @click="$emit('update:model-value', false)"
          prepend-icon="mdi-chevron-left"
        >
          Collapse Sidebar
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { getCategoryIcon, formatCategoryName } from '~/utils/iconMapper'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    // En cliente y no en SSR, a proposito. Renderizar estos 80 elementos en servidor
    // seria mejor para SEO -son el grafo de enlaces internos del sitio- pero rompe la
    // hidratacion: los ids que Vuetify autogenera dejan de coincidir (input-3 contra
    // input-24), el contenedor de overlays de los v-tooltip no cuadra, y Vue pierde el
    // arbol. El sintoma es que la barra deja de navegar: la URL cambia y la pagina no.
    // Volver a intentarlo exige arreglar antes la hidratacion de Vuetify.
    const items = ref([])
    const router = useRouter()
    const route = useRoute()
    const searchQuery = ref('')
    // Indice de topics (public/topics.json). Se carga en diferido: son ~290 KB
    // que solo hacen falta si el usuario llega a escribir en el buscador.
    const topics = ref([])
    const topicsRequested = ref(false)
    // Indice de repos (public/repos.json). Pesa ~1 MB comprimido, bastante mas
    // que el de topics, asi que tambien se carga solo cuando se escribe algo.
    const repos = ref([])
    const reposRequested = ref(false)

    // v-text-field con clearable pone null al limpiar, no ''
    const normalizedQuery = computed(() => (searchQuery.value || '').trim().toLowerCase())
    // Las palabras por separado, para poder exigirlas todas sin exigir que
    // aparezcan juntas y en ese orden. Buscar "kubernetes dashboard" no
    // encontraba nada, porque ningun nombre ni descripcion contiene esa cadena
    // literal aunque haya repos que son las dos cosas.
    const queryWords = computed(() =>
      normalizedQuery.value.split(/\s+/).filter(Boolean)
    )
    const isSearching = computed(() => normalizedQuery.value.length > 0)

    // Cuantos topics como mucho: la barra es para navegar, no para volcar
    // miles de etiquetas.
    const MAX_TOPICS = 30
    // Menos que topics: cada repo ocupa dos lineas, con nombre y descripcion.
    const MAX_REPOS = 12

    // Filter items based on search query
    const filteredItems = computed(() => {
      if (!isSearching.value) {
        return items.value
      }

      const palabras = queryWords.value
      return items.value.filter((item: any) => {
        const texto = [item.display, item.category_name, item.description]
          .filter(Boolean).join(' ').toLowerCase()
        return palabras.every((palabra: string) => texto.includes(palabra))
      })
    })

    const rankTopic = (topic: any, query: string) => {
      if (topic.name === query) return 0
      if (topic.name.startsWith(query)) return 1
      return 2
    }

    // Topics que casan con la busqueda. Sin busqueda no devuelve nada, para que
    // la navegacion por defecto siga siendo solo la de las listas.
    const matchingTopics = computed(() => {
      if (!isSearching.value) {
        return []
      }

      const query = normalizedQuery.value
      return topics.value
        .filter((topic: any) => topic.name.includes(query))
        // topics.json ya viene ordenado por numero de repos; aqui solo se
        // adelantan los que empiezan por lo escrito (buscar "llm" debe sacar
        // "llm" antes que "vllm-inference").
        .sort((a: any, b: any) => rankTopic(a, query) - rankTopic(b, query))
    })

    const filteredTopics = computed(() => matchingTopics.value.slice(0, MAX_TOPICS))
    const topicsTruncated = computed(() => matchingTopics.value.length > MAX_TOPICS)

    // Se busca por el nombre corto ademas de por el completo: quien escribe
    // "adminer" no sabe que el repo es "vrana/adminer", y ese era justo el caso
    // que no encontraba nada.
    const rankRepo = (repo: any, query: string) => {
      const completo = repo.n.toLowerCase()
      const corto = completo.split('/').pop() || ''
      if (corto === query) return 0
      if (corto.startsWith(query)) return 1
      if (completo.includes(query)) return 2
      return 3   // solo aparece en la descripcion
    }

    const matchingRepos = computed(() => {
      if (!isSearching.value) {
        return []
      }
      const query = normalizedQuery.value
      const palabras = queryWords.value
      return repos.value
        .filter((repo: any) => {
          const texto = `${repo.n} ${repo.d || ''}`.toLowerCase()
          return palabras.every((palabra: string) => texto.includes(palabra))
        })
        // repos.json ya viene ordenado por estrellas; aqui solo se adelanta lo
        // que casa por nombre, para que "react" saque facebook/react y no un
        // repo cualquiera que lo mencione de pasada.
        .sort((a: any, b: any) => rankRepo(a, query) - rankRepo(b, query))
    })

    const filteredRepos = computed(() => matchingRepos.value.slice(0, MAX_REPOS))
    const reposTruncated = computed(() => matchingRepos.value.length > MAX_REPOS)

    const formatStars = (estrellas: number) =>
      estrellas >= 1000 ? `${(estrellas / 1000).toFixed(1)}K` : String(estrellas || 0)

    const loadTopics = async () => {
      if (topicsRequested.value) return
      topicsRequested.value = true
      try {
        const response = await axios.get('/topics.json')
        topics.value = response.data
      } catch (error) {
        console.error('Error loading topics:', error)
      }
    }

    const loadRepos = async () => {
      if (reposRequested.value) return
      reposRequested.value = true
      try {
        const response = await axios.get('/repos.json')
        repos.value = response.data
      } catch (error) {
        console.error('Error loading repos:', error)
      }
    }

    watch(isSearching, (searching) => {
      if (searching) {
        loadTopics()
        loadRepos()
      }
    })

    onMounted(async () => {
      // lists_enriched.json trae ya el icono de cada lista, puesto en la fuente
      // de verdad del backend. Se prueba antes el fichero antiguo por si el
      // despliegue va por delante de la primera pasada del cron que lo genera;
      // ese respaldo se puede quitar cuando haya corrido una vez.
      for (const url of ['/lists_enriched.json', '/lists.json']) {
        try {
          const response = await axios.get(url)
          items.value = response.data
          return
        } catch (error) {
          if (url === '/lists.json') console.error('Error loading lists:', error)
        }
      }
    })

    const navigateTo = async (item: any) => {
      if (item) {
        await router.push('/a-awesome/' + item.category_name.replace('/', '@'))
      }
    }

    const formatDisplayName = (display: string) => {
      return formatCategoryName(display)
    }

    const navigateToTopic = async (topic: any) => {
      await router.push('/a-topic/' + encodeURIComponent(topic.name))
    }

    // Un repo se navega a su pagina de parecidos, que es la que existe. Los
    // 168 sin vecinos claros no tienen fichero, y esa pagina ya sabe decir
    // "no similar repositories found" en vez de dar un error.
    const navigateToRepo = async (repo: any) => {
      await router.push('/a-similar/' + repo.n.replace('/', '@'))
    }

    const isActive = (item: any) => {
      const currentPath = route.params.name?.toString().replace('@', '/') || ''
      return currentPath === item.category_name
    }

    const isTopicActive = (topic: any) => {
      return route.params.type === 'topic' && route.params.name?.toString() === topic.name
    }

    const internalModel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:model-value', value)
    })

    return {
      filteredRepos,
      reposTruncated,
      navigateToRepo,
      formatStars,
      items,
      searchQuery,
      isSearching,
      filteredItems,
      filteredTopics,
      topicsTruncated,
      navigateTo,
      navigateToTopic,
      isTopicActive,
      formatDisplayName,
      isActive,
      getCategoryIcon,
      internalModel
    }
  }
})
</script>

<style scoped>
.custom-drawer {
  background-color: #fafafa !important;
  border-right: 1px solid #e0e0e0;
  
  /* Strict positioning - drawer MUST be below navbar */
  height: calc(100vh - 48px) !important;
  top: 48px !important;
  
  /* Z-index: MUST be below navbar (navbar is 1100) */
  z-index: 999 !important;
  
  /* Prevent overflow */
  overflow: hidden !important;
}

/* Force Vuetify drawer content to stay within bounds */
:deep(.v-navigation-drawer__content) {
  height: 100% !important;
  overflow: hidden !important;
}

/* Inner container - strict containment */
.drawer-inner-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Scrollable container for lists */
.lists-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

/* Collapse button at bottom */
.collapse-button-container {
  padding: 8px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
  z-index: 1;
}

.collapse-btn-bottom {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: none;
  transition: all 0.2s ease;
}

.collapse-btn-bottom:hover {
  background-color: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

.list-item-custom {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.list-item-custom:hover {
  background-color: rgba(102, 126, 234, 0.08);
  transform: translateX(4px);
}

.list-item-custom.v-list-item--active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 3px solid #667eea;
}

.topics-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #888;
}

.topics-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.topic-chip {
  cursor: pointer;
  border-radius: 20px;
  font-weight: 500;
  max-width: 100%;
}

.topic-chip--active {
  background: rgba(102, 126, 234, 0.15);
}

.repo-title {
  font-size: 0.8rem;
  font-weight: 500;
}

.repo-subtitle {
  font-size: 0.7rem;
  opacity: 0.7;
}

.topic-count {
  margin-left: 6px;
  font-size: 0.7rem;
  opacity: 0.6;
}

.list-item-title {
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
}

/* Scrollbar styling for lists container */
.lists-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.lists-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.lists-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.lists-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Override Vuetify's default positioning */
:deep(.v-navigation-drawer__scrim) {
  display: none !important;
}

:deep(.v-navigation-drawer__prepend),
:deep(.v-navigation-drawer__append) {
  overflow: hidden !important;
}
</style>
