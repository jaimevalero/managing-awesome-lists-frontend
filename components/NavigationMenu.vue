<template>
  <v-navigation-drawer 
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    class="custom-drawer"
    :width="256"
    :permanent="false"
    :temporary="false"
    :rail="false"
  >
    <!-- Inner container to control all content -->
    <div class="drawer-inner-container">
      <!-- Search bar at the top -->
      <div class="pa-3 pt-4">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search lists..."
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
          {{ filteredItems.length }} lists available
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
                    {{ getCategoryIcon(item.category_name) }}
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

        <!-- Empty state -->
        <div v-if="filteredItems.length === 0" class="pa-4 text-center">
          <v-icon size="48" color="grey-lighten-2">mdi-file-search-outline</v-icon>
          <p class="text-caption text-grey mt-2">No lists found</p>
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
import { defineComponent, ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const items = ref([])
    const router = useRouter()
    const route = useRoute()
    const searchQuery = ref('')

    // Filter items based on search query
    const filteredItems = computed(() => {
      if (!searchQuery.value) {
        return items.value
      }

      const query = searchQuery.value.toLowerCase()
      return items.value.filter((item: any) => {
        const matchesDisplay = item.display?.toLowerCase().includes(query)
        const matchesName = item.category_name?.toLowerCase().includes(query)
        const matchesDescription = item.description?.toLowerCase().includes(query)
        return matchesDisplay || matchesName || matchesDescription
      })
    })

    onMounted(async () => {
      try {
        const response = await axios.get('/lists.json')
        items.value = response.data
      } catch (error) {
        console.error('Error loading lists:', error)
      }
    })

    const navigateTo = async (item: any) => {
      if (item) {
        await router.push('/a-awesome/' + item.category_name.replace('/', '@'))
      }
    }

    const formatDisplayName = (display: string) => {
      // Remove 'awesome-' prefix and clean up the name
      return display.replace('awesome-', '').replace(/-/g, ' ')
    }

    const isActive = (item: any) => {
      const currentPath = route.params.name?.toString().replace('@', '/') || ''
      return currentPath === item.category_name
    }

    const getCategoryIcon = (categoryName: string) => {
      // Map category names to relevant icons
      const iconMap: { [key: string]: string } = {
        'python': 'mdi-language-python',
        'javascript': 'mdi-language-javascript',
        'java': 'mdi-language-java',
        'go': 'mdi-language-go',
        'rust': 'mdi-language-rust',
        'docker': 'mdi-docker',
        'kubernetes': 'mdi-kubernetes',
        'machine-learning': 'mdi-brain',
        'ai': 'mdi-robot',
        'web': 'mdi-web',
        'mobile': 'mdi-cellphone',
        'security': 'mdi-shield-lock',
        'devops': 'mdi-cog',
        'database': 'mdi-database',
        'cloud': 'mdi-cloud',
        'testing': 'mdi-test-tube'
      }

      const lowerName = categoryName.toLowerCase()
      for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) {
          return icon
        }
      }

      return 'mdi-file-document-outline'
    }

    return {
      items,
      searchQuery,
      filteredItems,
      navigateTo,
      formatDisplayName,
      isActive,
      getCategoryIcon
    }
  }
})
</script>

<style scoped>
.custom-drawer {
  background-color: #fafafa !important;
  border-right: 1px solid #e0e0e0;
  
  /* Critical positioning fixes */
  position: fixed !important;
  height: calc(100vh - 48px) !important;
  max-height: calc(100vh - 48px) !important;
  top: 48px !important;
  left: 0 !important;
  bottom: 0 !important;
  
  /* Z-index: must be below navbar */
  z-index: 1005 !important;
  
  /* Prevent ANY overflow - strict containment */
  overflow: hidden !important;
  contain: layout style paint !important;
  
  /* Clip anything that tries to escape */
  clip-path: inset(0) !important;
  
  /* Smooth transition */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* When drawer is closed, move it off-screen */
.custom-drawer:not(.v-navigation-drawer--active) {
  transform: translateX(-100%) !important;
}

/* Inner container - strict height control */
.drawer-inner-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-height: 100%;
  overflow: hidden;
  position: relative;
}

/* Scrollable container for lists */
.lists-scroll-container {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: 100%;
}

/* List styling */
:deep(.v-list) {
  background: transparent;
}

/* Collapse button - must stay inside drawer */
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
