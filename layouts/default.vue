<template>
  <v-app>
    <NavBar @toggle-drawer="drawer = !drawer" />
    <NavigationMenu v-model="drawer" />
    <v-main>
      <slot />
    </v-main>
    <Footer />
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

    return { drawer }
  }
})
</script>

<style scoped>
/* Ensure main content has proper padding to accommodate fixed drawer */
:deep(.v-main) {
  padding-left: 256px !important; /* Same width as drawer */
}

/* On mobile, remove the padding */
@media (max-width: 1280px) {
  :deep(.v-main) {
    padding-left: 0 !important;
  }
}
</style>