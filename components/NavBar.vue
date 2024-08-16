<template>
  <v-app-bar class="app-bar-color" color="info-darken-1" density="compact" >
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    
    <v-toolbar-title class="mr-auto">
      <a href="/" class="nav-brand">Awesome List Viewer</a>
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <v-row no-gutters>
    </v-row>
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
}
.app-bar-color {
  background-color: 'info-darken-1' !important; /* staticPrimaryColor de tu archivo themes.ts */
  color: 'info-darken-1' !important;
}
</style>