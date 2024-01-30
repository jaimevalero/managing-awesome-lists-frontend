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