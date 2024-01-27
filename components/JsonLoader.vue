<template>
  <div>
    <!-- Aquí puedes usar tus datos JSON -->
    <div v-if="jsonData">
      <div v-for="model in jsonData.repos_data" :key="model.full_name">
        <h2>{{ model.full_name }}</h2>
        <AppAlert><p>{{ model.description }}</p></AppAlert>
        
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'

export default defineComponent({
  data() {
    return {
      jsonData: null,
      category_type: 'topic',
      category_name: '3d'
    }
  },
  async created() {
    const url = `/${this.category_type}/${this.category_name}.json`
    const response = await axios.get(url)
    this.jsonData = response.data
  }
})
</script>