<template>
  <v-card class="mb-5">
    <v-card-title>
      <h1 v-if="categoryType === 'topic'">Topic Category: {{ categoryName }}</h1>
      <h1 v-else-if="categoryType === 'awesome'">Awesome List: <a :href="'https://github.com/' + categoryName" target="_blank">{{ categoryName }}</a></h1>
    </v-card-title>
    <v-card-text>
      <p v-if="categoryType === 'topic'">
        Page auto-generated with the topics of the category {{ categoryName }}. <br>
      </p>
      <p v-else-if="categoryType === 'awesome'">
        Repos from the awesome list: <br>
      </p>
      Related topics:
      <div class="topics-container">
        <LabelTopic
          v-for="topic in Object.keys(frequentTopics).slice(0, 5)"
          :key="topic"
          :topic="topic"
        />
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
    }
  }
})
</script>

<style scoped>
.topics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 5px;
}
</style>