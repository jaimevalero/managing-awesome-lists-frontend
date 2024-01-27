<template>
  <v-app>
    <NavBar />
    <v-main>
      <slot />
    </v-main>
    <Footer />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'

export default defineComponent({
  components: {
    NavBar,
    Footer
  }
})
</script>