<template>
  <v-card class="repo-card" elevation="2" hover>
    <!-- Header with repo name -->
    <v-card-title class="card-title">
      <a :href="'https://github.com/' + repo.full_name" target="_blank" class="repo-link">
        {{ repo.full_name }}
      </a>
    </v-card-title>

    <v-card-text class="card-content">
      <!-- Description with native title tooltip -->
      <p 
        class="description-text" 
        :title="repo.description || 'No description available'"
      >
        {{ repo.description || 'No description available' }}
      </p>

      <!-- Metadata row: Stars, Dates, Language in a single line -->
      <div class="metadata-row">
        <div class="stars-badge">
          <v-icon size="small" color="warning">mdi-star</v-icon>
          {{ formatStars(repo.stargazers_count) }}
        </div>

        <v-chip 
          :color="getDateColor(repo.pushed_at)" 
          size="small" 
          variant="tonal"
          class="date-chip"
          prepend-icon="mdi-update"
        >
          {{ formatDate(repo.pushed_at) }}
        </v-chip>

        <v-chip 
          :color="getDateColor(repo.created_at)" 
          size="small" 
          variant="tonal"
          class="date-chip"
          prepend-icon="mdi-calendar-plus"
        >
          {{ formatDate(repo.created_at) }}
        </v-chip>

        <div class="language-badge" v-if="repo.language">
          {{ repo.language }}
        </div>
      </div>

      <!-- Topics section at the bottom -->
      <div class="topics-section" v-if="repo.topics && repo.topics.length > 0">
        <v-divider class="my-3"></v-divider>
        <v-chip-group column class="topics-group">
          <LabelTopic v-for="(topic, index) in repo.topics" :key="index" :topic="topic" />
        </v-chip-group>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LabelTopic from './LabelTopic.vue'

export default defineComponent({
  components: {
    LabelTopic
  },
  props: {
    repo: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatStars(count: number) {
      if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K'
      }
      return count
    },
    getDateColor(dateStr: string) {
      const days = Math.floor(
        (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (days <= 30) return 'success'
      if (days <= 180) return 'warning'
      return 'grey-lighten-1'
    },
    formatDate(dateStr: string) {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
})
</script>

<style scoped>
.repo-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.repo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 8px;
  line-height: 1.4;
}

.repo-link {
  color: #1976d2;
  text-decoration: none;
  word-break: break-word;
  transition: color 0.2s ease;
}

.repo-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px !important;
}

.description-text {
  color: #555;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: help;
  pointer-events: auto;
}

.metadata-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.stars-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 2px solid #FFC107;
  border-radius: 6px;
  background-color: #FFF8E1;
  color: #F57C00;
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
}

.date-chip {
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.75rem;
  white-space: nowrap;
}

.language-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.topics-section {
  margin-top: auto;
}

.topics-group {
  margin-top: 8px;
}

@media (max-width: 600px) {
  .metadata-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .description-text {
    font-size: 0.85rem;
  }
}
</style>
