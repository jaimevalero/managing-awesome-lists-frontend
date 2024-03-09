<template>
<v-navigation-drawer v-model="drawer" class="custom-drawer" :value="true">
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" @click="navigateTo(item)">
          <v-list-item-title prepend-icon="mdi-view-dashboard" :title="item.description">{{ item.display }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const selected = ref('')
    const items = ref([])
    const router = useRouter()

    onMounted(async () => {
      const response = await axios.get('/lists.json')
      items.value = response.data
    })

    const navigateTo = async (item) => {
      if (item) {
        await router.push('/a-awesome/' + item.category_name.replace('/', '@'))
      }
    }

    const displayItem = (item) => {
      return item.display
    }

    return { selected, items, navigateTo, displayItem }
  }
})
</script>



<style scoped>
.custom-drawer {
  background-color: #FFFFFF !important; /* Reemplaza #FFFFFF con el color que desees */
}
</style>
