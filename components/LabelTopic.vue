<template>
  <div>
    <v-chip  :to="`/a-topic/${topic}`" 
     variant="elevated" 
     class="github-topic" 
     color='perfect-scrollbar-thumb'>{{ topic }}
  </v-chip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    topic: {
      type: String,
      required: false,
      default: 'topic'
    }
  }
})
</script>

<style scoped>
.github-topic {
  margin: 0.3em 0; /* Agrega un margen vertical de 0.5em */
}
</style>