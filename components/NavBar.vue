<template>
  <v-app-bar class="app-bar-color" color="info-darken-1" density="compact" >
    <v-toolbar-title  class="mr-auto">
      <div class="nav-brand">Awesome List Viewer</div>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-row no-gutters>
      <v-col cols="8"></v-col>
      <v-col cols="4">
        <v-toolbar-items class="hidden-sm-and-down">
          <DropdownMenu />
        </v-toolbar-items>
      </v-col>
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