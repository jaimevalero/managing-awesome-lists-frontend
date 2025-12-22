<template>
  <v-navigation-drawer 
    v-model="internalModel"
    class="custom-drawer"
    :width="256"
    :rail="false"
    location="left"
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
      return formatCategoryName(display)
    }

    const isActive = (item: any) => {
      const currentPath = route.params.name?.toString().replace('@', '/') || ''
      return currentPath === item.category_name
    }

    const internalModel = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:model-value', value)
    })

    return {
      items,
      searchQuery,
      filteredItems,
      navigateTo,
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
