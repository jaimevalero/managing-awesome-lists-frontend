<template>
  <v-app-bar 
    color="primary" 
    density="compact"
    elevation="4"
    class="app-navbar"
  >
    <v-app-bar-nav-icon 
      @click="$emit('toggle-drawer')"
      title="Toggle sidebar"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>
    
    <v-toolbar-title class="mr-auto">
      <NuxtLink to="/" class="nav-brand">Awesome List Viewer</NuxtLink>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <GitHubStarButton
      text="Star on GitHub"
      color="white"
      variant="outlined"
      size="small"
      class="mr-3"
    />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DropdownMenu from '../components/DropdownMenu.vue'
import GitHubStarButton from '../components/GitHubStarButton.vue'

export default defineComponent({
  emits: ['toggle-drawer'],
  components: {
    DropdownMenu,
    GitHubStarButton
  }
})
</script>

<style scoped>
.app-navbar {
  /* Navbar must be on top of everything */
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