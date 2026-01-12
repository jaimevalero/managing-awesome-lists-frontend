<template>
  <div class="landing-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="hero-title">
              <v-icon size="48" color="primary" class="mr-2">mdi-star-circle</v-icon>
              Awesome List Viewer
            </h1>
            <p class="hero-subtitle">
              Discover and explore curated lists of awesome resources, tools, and projects
            </p>
            <p class="hero-description">
              Browse through hundreds of carefully curated GitHub awesome lists and find the best 
              resources for your next project. Filter by topics, search by keywords, and explore 
              the most starred repositories.
            </p>
            <v-btn
              color="primary"
              size="x-large"
              class="mt-4"
              prepend-icon="mdi-arrow-down-circle"
              @click="scrollToLists"
            >
              Explore Awesome Lists
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="4" md="4" v-for="stat in computedStats" :key="stat.title">
            <v-card class="stat-card" elevation="2">
              <v-card-text class="text-center">
                <v-icon :icon="stat.icon" size="48" :color="stat.color" class="mb-2"></v-icon>
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.title }}</div>
                <div class="stat-description">{{ stat.description }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Featured Categories Section -->
    <section class="featured-section">
      <v-container>
        <h2 class="section-title text-center mb-6">
          {{ showAllLists ? 'All Awesome Lists' : 'Featured Lists' }}
        </h2>

        <!-- Search bar (visible when showing all lists) -->
        <v-row v-if="showAllLists" class="mb-4">
          <v-col cols="12" md="6" class="mx-auto">
            <v-text-field
              v-model="searchAllLists"
              label="Search lists..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row v-if="loading" justify="center">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          </v-col>
        </v-row>

        <!-- Display lists based on state -->
        <v-row v-else-if="displayedLists.length === 0">
          <v-col cols="12">
            <v-alert type="info" variant="tonal">
              No lists found matching "{{ searchAllLists }}"
            </v-alert>
          </v-col>
        </v-row>

        <transition-group v-else name="list-fade" tag="div" class="v-row" appear>
          <v-col 
            cols="12" 
            sm="6" 
            md="4" 
            lg="3"
            v-for="(item, index) in displayedLists" 
            :key="item.category_name || index"
            class="list-item-animated"
          >
            <v-card 
              class="category-card" 
              elevation="2" 
              hover
              @click="navigateTo(item)"
            >
              <v-card-text>
                <div class="category-icon">
                  <v-icon size="40" color="primary">{{ getCategoryIcon(item.category_name) }}</v-icon>
                </div>
                <h3 class="category-title">{{ item.display }}</h3>
                
                <!-- Description with tooltip -->
                <v-tooltip location="bottom" max-width="400">
                  <template v-slot:activator="{ props }">
                    <p class="category-description" v-bind="props">
                      {{ truncateDescription(item.description, showAllLists ? 60 : 100) }}
                    </p>
                  </template>
                  <span>{{ item.description || 'Explore this awesome list' }}</span>
                </v-tooltip>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" variant="text" append-icon="mdi-arrow-right">
                  View List
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </transition-group>

        <!-- Toggle button -->
        <v-row v-if="!loading && allLists.length > 8" class="mt-6">
          <v-col cols="12" class="text-center">
            <v-btn
              v-if="!showAllLists"
              color="primary"
              size="large"
              variant="outlined"
              prepend-icon="mdi-view-grid-plus"
              @click="expandAllLists"
            >
              View All {{ allLists.length }} Lists
            </v-btn>
            <v-btn
              v-else
              color="primary"
              size="large"
              variant="outlined"
              prepend-icon="mdi-chevron-up"
              @click="collapseAllLists"
            >
              Show Less
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <v-container>
        <h2 class="section-title text-center mb-6">Why Use Awesome List Viewer?</h2>
        <v-row>
          <v-col cols="12" md="4" v-for="feature in features" :key="feature.title">
            <v-card class="feature-card" elevation="0" color="transparent">
              <v-card-text class="text-center">
                <v-avatar size="80" :color="feature.color" class="mb-4">
                  <v-icon size="48" color="white">{{ feature.icon }}</v-icon>
                </v-avatar>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="cta-title">Ready to Explore?</h2>
            <p class="cta-description">
              Start browsing through our curated collection of awesome lists
            </p>
            <GitHubStarButton 
              class="mt-4"
              text="Star us on GitHub"
              color="white"
              size="large"
              variant="elevated"
            />
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import GitHubStarButton from '../components/GitHubStarButton.vue'
import { getCategoryIcon } from '~/utils/iconMapper'

export default defineComponent({
  components: {
    GitHubStarButton
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const allLists = ref([])
    const featuredLists = ref([])
    const showAllLists = ref(false)
    const searchAllLists = ref('')

    // Base stats structure
    const features = [
      {
        title: 'Curated Content',
        description: 'Access hand-picked awesome lists from the GitHub community',
        icon: 'mdi-star-check',
        color: 'primary'
      },
      {
        title: 'Advanced Search',
        description: 'Find repositories by name, topics, description, or language',
        icon: 'mdi-magnify',
        color: 'success'
      },
      {
        title: 'Smart Sorting',
        description: 'Sort by stars, update date, creation date, or alphabetically',
        icon: 'mdi-sort',
        color: 'info'
      }
    ]

    // Computed stats based on actual data from your system
    const computedStats = computed(() => {
      // Calculate awesome lists count (items with '/' in category_name)
      const awesomeListsCount = allLists.value.filter((item: any) => 
        item.category_name?.includes('/')
      ).length

      return [
        { 
          title: 'Awesome Lists', 
          value: awesomeListsCount > 0 ? `${awesomeListsCount}` : '-',
          description: 'Curated awesome lists from GitHub',
          icon: 'mdi-format-list-bulleted', 
          color: 'primary' 
        },
        { 
          title: 'Unique Repositories', 
          value: '12K',
          description: 'Unique repos across all lists',
          icon: 'mdi-source-repository', 
          color: 'success' 
        },
        { 
          title: 'Topic Pages', 
          value: '20K',
          description: 'Auto-generated topic pages',
          icon: 'mdi-tag-multiple', 
          color: 'info' 
        }
      ]
    })

    // Compute displayed lists based on state
    const displayedLists = computed(() => {
      if (!showAllLists.value) {
        return featuredLists.value
      }

      // If showing all lists, apply search filter
      if (!searchAllLists.value) {
        return allLists.value
      }

      const searchLower = searchAllLists.value.toLowerCase()
      return allLists.value.filter((item: any) => {
        const matchesDisplay = item.display?.toLowerCase().includes(searchLower)
        const matchesName = item.category_name?.toLowerCase().includes(searchLower)
        const matchesDescription = item.description?.toLowerCase().includes(searchLower)
        return matchesDisplay || matchesName || matchesDescription
      })
    })

    onMounted(async () => {
      try {
        const response = await axios.get('/lists.json')
        allLists.value = response.data
        featuredLists.value = response.data.slice(0, 8)
      } catch (error) {
        console.error('Error loading lists:', error)
      } finally {
        loading.value = false
      }
    })

    const navigateTo = async (item: any) => {
      if (item) {
        await router.push('/a-awesome/' + item.category_name.replace('/', '@'))
      }
    }

    const expandAllLists = () => {
      showAllLists.value = true
      // No scroll - let user see the animation in place
    }

    const collapseAllLists = () => {
      showAllLists.value = false
      searchAllLists.value = ''
      // No scroll - let user stay where they are to see the animation
    }

    const truncateDescription = (description: string, maxLength: number = 60) => {
      if (!description) return 'Explore this awesome list'
      return description.length > maxLength
        ? description.substring(0, maxLength) + '...' 
        : description
    }

    const scrollToLists = () => {
      const section = document.querySelector('.featured-section')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    return {
      computedStats,
      features,
      featuredLists,
      allLists,
      loading,
      showAllLists,
      searchAllLists,
      displayedLists,
      navigateTo,
      expandAllLists,
      collapseAllLists,
      scrollToLists,
      getCategoryIcon,
      truncateDescription
    }
  }
})
</script>

<style scoped>
.landing-container {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

/* Hero Section */
.hero-section {
  padding: 80px 0 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 16px;
  opacity: 0.95;
}

.hero-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Stats Section */
.stats-section {
  padding: 60px 0;
  background: white;
}

.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 8px 0 12px 0; /* Increased bottom margin from 4px to 12px */
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px; /* Increased from 4px to 8px */
}

.stat-description {
  font-size: 0.85rem;
  color: #999;
  font-weight: 400;
  line-height: 1.4;
}

/* Featured Section */
.featured-section {
  padding: 60px 0;
  background: #f8f9fa;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
}

.category-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.category-icon {
  margin-bottom: 16px;
}

.category-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.category-description {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  cursor: help;
  min-height: 3em;
}

/* Features Section */
.features-section {
  padding: 60px 0;
  background: white;
}

.feature-card {
  padding: 20px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.feature-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Dialog Styles */
.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
}

.dialog-search {
  background: #f8f9fa;
}

.lists-grid {
  max-height: 600px;
  overflow-y: auto;
}

.list-item-card {
  height: 100%;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.list-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  border-color: #667eea;
}

.list-item-icon {
  margin-bottom: 12px;
  text-align: center;
}

.list-item-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-description {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  text-align: center;
  margin: 0;
}

/* Scrollbar styling for dialog */
.lists-grid::-webkit-scrollbar {
  width: 8px;
}

.lists-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.lists-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.lists-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* List transition animations */
.list-item-animated {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.list-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.list-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.55, 0.2);
  position: absolute;
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.list-fade-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Responsive */
@media (max-width: 960px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>