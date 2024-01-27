<template>
  <div>
    <v-row>
      <v-col cols="8"></v-col>
      <v-col cols="4">
        <v-text-field v-model="search" label="Search" class="mb-2" append-icon="mdi-magnify" />
      </v-col>
    </v-row>
    <v-data-table  density="compact" :headers="headers" :items="reposData" :search="search" class="elevation-1">
      <template v-slot:item.full_name="{ item }">
        <a :href="'https://github.com/' + item.full_name" target="_blank">{{ item.full_name }}</a>
      </template>
      <template v-slot:item.description="{ item }">
        <div class="description">{{ item.description }}</div>
      </template>
      <template v-slot:item.topics="{ item }">
        <div class="topic-container">
          <LabelTopic v-for="(topic, index) in item.topics" :key="index" :topic="topic" />
        </div>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleDateString() }}
      </template>
      <template v-slot:item.pushed_at="{ item }">
        {{ new Date(item.pushed_at).toLocaleDateString() }}
      </template>      
      <!-- Resto de las columnas -->
    </v-data-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import LabelTopic from './LabelTopic.vue'

export default defineComponent({
  components: {
    LabelTopic
  },
  props: {
    reposData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const search = ref('')
    const headers = [
      { title: 'Full Name', value: 'full_name', sortable: true },
      { title: 'Description', value: 'description', sortable: true, },
      { title: 'Topics', value: 'topics', sortable: true },
      { title: 'Creation', value: 'created_at', sortable: true },
      { title: 'Push', value: 'pushed_at', sortable: true },
      { title: 'Stars', value: 'stargazers_count', sortable: true },
      { title: 'Language', value: 'language', sortable: true },
    ]

    return { headers, search }
  }
})
</script>


<style scoped>
.topic-container {
  display: flex;
  flex-wrap: wrap;
}
</style>