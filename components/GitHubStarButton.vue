<template>
  <v-btn
    :color="color"
    :size="size"
    :variant="variant"
    prepend-icon="mdi-github"
    href="https://github.com/jaimevalero/managing-awesome-lists"
    target="_blank"
    class="github-star-btn"
  >
    {{ text }}
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    text: {
      type: String,
      default: 'Star us on GitHub'
    },
    color: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'default'
    },
    variant: {
      type: String,
      default: 'elevated'
    }
  }
})
</script>

<style scoped>
.github-star-btn {
  transition: transform 0.2s ease, background-color 0.2s ease;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

.github-star-btn:hover {
  transform: translateY(-2px);
}

/* Specific styling for outlined variant */
.github-star-btn.v-btn--variant-outlined:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
</style>
