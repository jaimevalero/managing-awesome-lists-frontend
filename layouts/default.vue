<template>
  <v-app>
    <NavBar @toggle-drawer="toggleDrawer" />
    <NavigationMenu v-model="drawer" @update:model-value="drawer = $event" />
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
/* Main content padding for drawer - with smooth transition */
:deep(.v-main) {
  padding-left: 256px !important;
  padding-bottom: 0 !important;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When drawer is collapsed */
:deep(.v-main.drawer-collapsed) {
  padding-left: 0 !important;
}

/* Remove bottom padding from main content container */
:deep(.v-main__wrap) {
  padding-bottom: 0 !important;
}

/* On mobile, remove the left padding */
@media (max-width: 1280px) {
  :deep(.v-main) {
    padding-left: 0 !important;
  }
}
</style>