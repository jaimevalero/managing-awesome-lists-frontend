<template>
  <v-card class="mb-5">
    <v-card-title>
      <h1 v-if="categoryType === 'topic'">
        Topic Category: <LabelTopic :topic="categoryName" color="Primary" />
      </h1>     
   <h1 v-else-if="categoryType === 'awesome'">Awesome List: <a :href="'https://github.com/' + categoryName" target="_blank">{{ categoryName }}</a></h1>
    </v-card-title>
    <v-card-item v-if="description">
      {{ description }}
    </v-card-item> 
    <v-card-item v-if="categoryType === 'topic'">
      Page auto-generated with the repos containing the topic: {{ categoryName }}.
    </v-card-item>    
    <v-card-text>
      
      <div class="topics-container">
        <div class="topics-header">
          Related topics:
        </div>
        <v-chip-group>
        <LabelTopic
          v-for="topic in Object.keys(filteredTopics).slice(0, 5)"
          :key="topic"
          :topic="topic"
        />
        </v-chip-group>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LabelTopic from './LabelTopic.vue'



export default defineComponent({
  components: {
    LabelTopic
  },
  props: {
    categoryName: {
      type: String,
      required: true
    },
    frequentTopics: {
      type: Object,
      required: true
    },
    categoryType: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: undefined
    }
  },
  computed: {
    filteredTopics() {
      const topics = { ...this.frequentTopics };
      delete topics[this.categoryName];
      return topics;
    }
  }
})
</script>

<style scoped>
.topics-container {
  display: flex;
  align-items: center; /* Centra verticalmente los elementos hijos */
  gap: 10px;
  margin-bottom: 5px;
}
.topics-header {
  margin-right: 10px; /* Añade un margen a la derecha del texto */
}

</style>