<template>
  <v-combobox 
    v-model="selected" 
    :items="items" 
    :item-text="displayItem" 
    @update:modelValue="navigateTo">
  </v-combobox>
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
      items.value = response.data.map((item) => {
        const split = item.split('/')
        return split[split.length - 2] + '/' + split[split.length - 1]
      })
    })

    const navigateTo = async (newValue) => {
      selected.value = newValue;
      await router.push('/a-awesome/' + newValue.replace('/', '@'))
    }

    const displayItem = (item) => {
      return item.split('/').pop().replace('awesome', '')
    }

    return { selected, items, navigateTo, displayItem }
  }
})
</script>