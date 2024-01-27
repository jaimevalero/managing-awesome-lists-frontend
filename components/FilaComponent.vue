<template>
    <td><a :href="'https://github.com/' + model.full_name" target="_blank">{{ model.full_name }}</a></td>
    <td>{{ model.description }}</td>
    <td>
    <LabelTopic
      v-for="(topic, index) in model.topics"
      :key="index"
      :topic="topic"
    />
    </td>
    <td>{{ formatDate(model.created_at) }}</td>
    <td>{{ formatDate(model.pushed_at) }}</td>
    <td><fa icon="star" /> {{ formatNumber(model.stargazers_count) }}</td>
    <td>{{ model.language }}</td>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

  export default defineComponent({
    props: {
      model: {
        type: Object,
        required: true
      }
    },
    components: {
    'fa': FontAwesomeIcon
    },    
    methods: {
      formatDate(dateString) {
        return dateString.slice(0, 10);
      },
      formatNumber(number) {
        return number.toLocaleString();
      }
    }
  })
  </script>