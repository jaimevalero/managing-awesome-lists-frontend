<template>
    <v-chip  :to="`/a-topic/${topic}`" 
      variant="elevated" 
      class="github-topic" 
      color='perfect-scrollbar-thumb'>{{ topic }}
    </v-chip>
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
  transition: background-color 0.2s ease-in-out;

}
</style>