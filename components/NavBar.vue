<template>
  <v-app-bar 
    color="primary" 
    density="compact"
    elevation="2"
  >
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    
    <v-toolbar-title class="mr-auto">
      <a href="/" class="nav-brand">Awesome List Viewer</a>
    </v-toolbar-title>

    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DropdownMenu from '../components/DropdownMenu.vue'

export default defineComponent({
  components: {
    DropdownMenu
  }
})
</script>

<style scoped>
.nav-brand {
  font-weight: bold;
  padding: 2px 0;
  color: white;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.nav-brand:hover {
  opacity: 0.8;
}
</style>