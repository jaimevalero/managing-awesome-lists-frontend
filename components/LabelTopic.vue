<template>
  <div>
    <router-link :to="`/a-topic/${topic}`" class="github-topic">{{ topic }}</router-link>
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
  display: inline-block;
  padding: 0.2em 0.4em;
  font-size: 0.875em;
  color: #24292e;
  background-color: #aec8e3;
  border-radius: 16px;
  text-decoration: none;
  margin: 0.1em 0; /* Agrega un margen vertical de 0.5em */

}
</style>