<template>
  <v-chip
    :href="'/a-topic/' + topic"
    size="small"
    variant="outlined"
    color="primary"
    class="topic-chip"
  >
    <v-icon start size="x-small">mdi-tag</v-icon>
    {{ topic }}
  </v-chip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    topic: {
      type: String,
      required: true
    }
  }
})
</script>

<style scoped>
.topic-chip {
  margin: 2px;
  border-radius: 20px;
  border-width: 1.5px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.topic-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}
</style>