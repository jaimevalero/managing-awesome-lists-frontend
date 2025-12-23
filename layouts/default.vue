<template>
  <v-app>
    <NavBar @toggle-drawer="toggleDrawer" />
    <NavigationMenu v-model="drawer" />
    <v-main :class="{ 'drawer-collapsed': !drawer }">
      <slot />
    </v-main>
    <Footer :drawer-open="drawer" />
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'
import NavigationMenu from '../components/NavigationMenu.vue'

export default defineComponent({
  components: {
    NavBar,
    Footer,
    NavigationMenu
  },
  setup() {
    // Start with default value, will be updated from localStorage on mount
    const drawer = ref(true)

    // Load drawer state from localStorage after component mounts (client-side only)
    onMounted(() => {
      const storedDrawerState = localStorage.getItem('drawer-open')
      if (storedDrawerState !== null) {
        drawer.value = storedDrawerState === 'true'
      }
    })

    const toggleDrawer = () => {
      drawer.value = !drawer.value
      // Persist drawer state to localStorage
      if (process.client) {
        localStorage.setItem('drawer-open', drawer.value.toString())
      }
    }

    return { 
      drawer,
      toggleDrawer
    }
  }
})
</script>

<style scoped>
/* Main content padding */
:deep(.v-main) {
  padding-top: 48px !important;
  padding-right: 24px !important;
  padding-left: 24px !important;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

:deep(.v-main:not(.drawer-collapsed)) {
  margin-left: 256px !important;
}

/* Force proper stacking context */
:deep(.v-app-bar) {
  z-index: 1100 !important;
}

:deep(.v-navigation-drawer) {
  z-index: 999 !important;
}

:deep(.v-main) {
  z-index: 998 !important;
}

@media (max-width: 960px) {
  :deep(.v-main) {
    padding-left: 0 !important;
  }
}
</style>