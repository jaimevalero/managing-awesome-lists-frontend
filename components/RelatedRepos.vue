<template>
  <!-- Solo un icono cuando no se usa: los parecidos son navegacion lateral, y en una
       rejilla de 24 tarjetas una seccion fija seria mas ruido que ayuda -->
  <v-menu
    v-model="isOpen"
    location="bottom end"
    :close-on-content-click="false"
    max-width="360"
  >
    <template v-slot:activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon="mdi-vector-link"
        size="x-small"
        variant="text"
        density="comfortable"
        class="related-btn"
        title="Similar repositories"
        @click="loadRelated"
      ></v-btn>
    </template>

    <v-card class="related-card">
      <div class="related-title">Similar repositories</div>

      <div v-if="loading" class="related-loading">
        <v-progress-circular indeterminate size="18" width="2" color="primary"></v-progress-circular>
      </div>

      <div v-else-if="isEmpty" class="related-empty">No similar repositories found</div>

      <!-- Una linea por repo: si el parecido pesa lo mismo que la tarjeta original,
           has duplicado el peso de la interfaz -->
      <a
        v-for="repo in related"
        :key="repo.full_name"
        :href="'https://github.com/' + repo.full_name"
        target="_blank"
        class="related-row"
        :title="repo.description || repo.full_name"
      >
        <div class="related-row-main">
          <span class="related-name">{{ repo.full_name }}</span>
          <span class="related-stars">
            <v-icon size="x-small" color="warning">mdi-star</v-icon>
            {{ formatStars(repo.stargazers_count) }}
          </span>
        </div>
        <div class="related-row-meta">
          <span v-if="repo.language" class="related-language">{{ repo.language }}</span>
          <!-- El porque del parecido: es lo que hace que la sugerencia se crea -->
          <span v-if="repo.shared_topics.length" class="related-shared">
            {{ repo.shared_topics.slice(0, 3).map(topic => '#' + topic).join(' ') }}
          </span>
        </div>
      </a>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import axios from 'axios'

export default defineComponent({
  props: {
    fullName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const related = ref([])
    const loading = ref(false)
    const requested = ref(false)
    // El backend solo escribe fichero para los repos que tienen parecidos, asi que un
    // 404 significa que no hay nada que ensenar y el boton desaparece
    const notFound = ref(false)

    const isOpen = ref(false)
    const isEmpty = computed(() => requested.value && !loading.value && !related.value.length)

    const loadRelated = async () => {
      if (requested.value) return
      requested.value = true
      loading.value = true
      try {
        const filename = props.fullName.replace('/', '@')
        const response = await axios.get(`/related/${filename}.json`)
        related.value = response.data.related || []
      } catch (error) {
        notFound.value = true
      } finally {
        loading.value = false
      }
    }

    const formatStars = (stars: number) => {
      return stars >= 1000 ? (stars / 1000).toFixed(1) + 'k' : String(stars)
    }

    return { related, loading, isOpen, isEmpty, loadRelated, formatStars }
  }
})
</script>

<style scoped>
.related-btn {
  color: #9e9e9e;
}

.related-btn:hover {
  color: #667eea;
}

.related-card {
  padding: 8px 0;
}

.related-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #888;
  padding: 4px 14px 8px;
}

.related-loading {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.related-empty {
  padding: 4px 14px 8px;
  font-size: 0.8rem;
  color: #999;
}

.related-row {
  display: block;
  padding: 6px 14px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s ease;
}

.related-row:hover {
  background-color: rgba(102, 126, 234, 0.08);
}

.related-row-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.related-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1976d2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-stars {
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
}

.related-row-meta {
  display: flex;
  gap: 8px;
  font-size: 0.7rem;
  color: #999;
}

.related-language {
  font-weight: 500;
}

.related-shared {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
