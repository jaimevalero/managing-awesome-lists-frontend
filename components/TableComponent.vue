<template>
  <div>
    <!-- Search, sort, and results info row -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <div class="results-info">
          Showing {{ paginationInfo }} of {{ filteredRepos.length }} repositories
        </div>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort by"
          prepend-inner-icon="mdi-sort"
          variant="outlined"
          density="comfortable"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Search repositories, topics, or descriptions"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Cards grid with paginated items -->
    <v-row>
      <v-col
        v-for="(repo, index) in paginatedRepos"
        :key="index"
        cols="12"
        sm="6"
        md="6"
        lg="4"
        xl="3"
      >
        <RepoCard :repo="repo" />
      </v-col>
    </v-row>

    <!-- No results message -->
    <v-row v-if="filteredRepos.length === 0" class="mt-4">
      <v-col cols="12">
        <v-alert type="info" variant="tonal">
          No repositories found matching your search criteria.
        </v-alert>
      </v-col>
    </v-row>

    <!-- Pagination controls with items per page selector -->
    <v-row v-if="filteredRepos.length > 0" class="mt-6">
      <v-col cols="12">
        <div class="pagination-container">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            rounded="circle"
            @update:model-value="scrollToTop"
          ></v-pagination>

          <div class="items-per-page-selector">
            <span class="selector-label">Items per page:</span>
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions"
              variant="outlined"
              density="compact"
              hide-details
              class="items-select"
            ></v-select>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import RepoCard from './RepoCard.vue'

export default defineComponent({
  components: {
    RepoCard
  },
  props: {
    reposData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const search = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(24)
    const itemsPerPageOptions = [12, 24, 48, 96]
    const sortBy = ref('stars-desc')

    // Sort options with clear labels
    const sortOptions = [
      { title: '⭐ Stars (High to Low)', value: 'stars-desc' },
      { title: '⭐ Stars (Low to High)', value: 'stars-asc' },
      { title: '🔄 Recently Updated', value: 'updated-desc' },
      { title: '🔄 Least Recently Updated', value: 'updated-asc' },
      { title: '📅 Recently Created', value: 'created-desc' },
      { title: '📅 Oldest First', value: 'created-asc' },
      { title: '🔤 Name (A-Z)', value: 'name-asc' },
      { title: '🔤 Name (Z-A)', value: 'name-desc' }
    ]

    // Filter repos based on search term across multiple fields
    const filteredRepos = computed(() => {
      let filtered = props.reposData

      // Apply search filter
      if (search.value) {
        const searchLower = search.value.toLowerCase()
        filtered = filtered.filter((repo: any) => {
          const matchesName = repo.full_name?.toLowerCase().includes(searchLower)
          const matchesDescription = repo.description?.toLowerCase().includes(searchLower)
          const matchesTopics = repo.topics?.some((topic: string) =>
            topic.toLowerCase().includes(searchLower)
          )
          const matchesLanguage = repo.language?.toLowerCase().includes(searchLower)

          return matchesName || matchesDescription || matchesTopics || matchesLanguage
        })
      }

      // Apply sorting
      return sortRepos(filtered, sortBy.value)
    })

    // Sort repos based on selected criteria
    const sortRepos = (repos: any[], sortOption: string) => {
      const sorted = [...repos]

      switch (sortOption) {
        case 'stars-desc':
          return sorted.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        case 'stars-asc':
          return sorted.sort((a, b) => (a.stargazers_count || 0) - (b.stargazers_count || 0))
        case 'updated-desc':
          return sorted.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        case 'updated-asc':
          return sorted.sort((a, b) => new Date(a.pushed_at).getTime() - new Date(b.pushed_at).getTime())
        case 'created-desc':
          return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        case 'created-asc':
          return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        case 'name-asc':
          return sorted.sort((a, b) => a.full_name.localeCompare(b.full_name))
        case 'name-desc':
          return sorted.sort((a, b) => b.full_name.localeCompare(a.full_name))
        default:
          return sorted
      }
    }

    // Calculate total pages based on filtered results
    const totalPages = computed(() => {
      return Math.ceil(filteredRepos.value.length / itemsPerPage.value)
    })

    // Get paginated subset of filtered repos
    const paginatedRepos = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredRepos.value.slice(start, end)
    })

    // Pagination info text (e.g., "1-24")
    const paginationInfo = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value + 1
      const end = Math.min(start + itemsPerPage.value - 1, filteredRepos.value.length)
      return `${start}-${end}`
    })

    // Reset to page 1 when search changes
    watch(search, () => {
      currentPage.value = 1
    })

    // Reset to page 1 when items per page changes
    watch(itemsPerPage, () => {
      currentPage.value = 1
    })

    // Reset to page 1 when sort changes
    watch(sortBy, () => {
      currentPage.value = 1
    })

    // Scroll to top when page changes for better UX
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return {
      search,
      currentPage,
      itemsPerPage,
      itemsPerPageOptions,
      sortBy,
      sortOptions,
      filteredRepos,
      paginatedRepos,
      totalPages,
      paginationInfo,
      scrollToTop
    }
  }
})
</script>

<style scoped>
.results-info {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

/* Pagination container with flex layout */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

/* Items per page selector styling */
.items-per-page-selector {
  display: flex;
  align-items: center;
  gap: 10px; /* Increased from 8px */
}

.selector-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.items-select {
  min-width: 90px ; /* Changed from width: 80px */
  max-width: 108px ;
}

/* Ensure select dropdown text is fully visible */
:deep(.items-select .v-field__input) {
  padding: 0 12px !important;
}

:deep(.items-select .v-field) {
  min-width: 100px !important;
}

/* Pagination styling */
:deep(.v-pagination) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.v-pagination__item) {
  font-weight: 500;
}

:deep(.v-pagination__item--is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }

  .items-per-page-selector {
    width: 100%;
    justify-content: center;
  }

  .items-select {
    min-width: 120px !important;
    max-width: 150px !important;
  }
}
</style>
