<template>
  <div>
    <div v-if="jsonData">
      <InfoComponent 
        :categoryName="jsonData.category_name" 
        :frequentTopics="jsonData.frecuent_topics" 
        :categoryType="jsonData.category_type"
        :description="getDescription(jsonData)"
         />

      <TableComponent :reposData="jsonData.repos_data" />
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

import InfoComponent from '../components/InfoComponent.vue'
import TableComponent from '../components/TableComponent.vue'

export default defineComponent({
  components: {
     InfoComponent,
    TableComponent
  },
  setup() {
    const jsonData = ref(null)
    const route = useRoute()

    const fetchData = async () => {
      console.log("1 params: " + route.params)
      

      const url = `/${route.params.type}/${route.params.name}.json`
      // console.log("2 :" + url)
      const response = await axios.get(url)
      // console.log("3 :" + response)
      jsonData.value = response.data
      // console.log("4 :" + JSON.stringify(jsonData, null, 2))   
      // console.log("5 :")
    }
      
    fetchData()

    return {
      jsonData,
      getDescription: (data) => data.repo_meta_data?.description

    }
  }
})
</script>