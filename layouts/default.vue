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
import { defineComponent, ref } from 'vue'
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
    const drawer = ref(true)

    const toggleDrawer = () => {
      drawer.value = !drawer.value
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
  padding-left: 256px !important;
  padding-top: 48px !important;
  transition: padding-left 0.3s ease;
}

:deep(.v-main.drawer-collapsed) {
  padding-left: 0 !important;
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

@media (max-width: 1280px) {
  :deep(.v-main) {
    padding-left: 0 !important;
  }
}
</style>