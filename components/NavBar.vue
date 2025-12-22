<template>
  <v-app-bar 
    color="primary" 
    density="compact"
    elevation="4"
    class="app-navbar"
    fixed
  >
    <v-app-bar-nav-icon 
      @click="$emit('toggle-drawer')"
      title="Toggle sidebar"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>
    
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
  emits: ['toggle-drawer'],
  components: {
    DropdownMenu
  }
})
</script>

<style scoped>
.app-navbar {
  /* Ensure navbar is ALWAYS on top */
  z-index: 1100 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  
  /* Ensure navbar covers everything below */
  isolation: isolate;
}

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