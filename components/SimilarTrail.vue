<template>
  <!-- Solo tiene sentido a partir del segundo salto: una miga de pan de un elemento
       es la pagina en la que ya estas -->
  <nav v-if="trail.length > 1" class="trail" aria-label="Similar repositories trail">
    <template v-for="(hop, index) in trail" :key="hop.path">
      <span v-if="index" class="trail-arrow">›</span>
      <NuxtLink v-if="index < trail.length - 1" :to="hop.path" class="trail-link">
        {{ hop.label }}
      </NuxtLink>
      <span v-else class="trail-current">{{ hop.label }}</span>
    </template>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

// Perderse saltando de parecido en parecido es la gracia; no poder volver, no. Seis
// saltos entran de sobra en una linea y es mas recorrido del que nadie deshace a mano.
const MAX_HOPS = 6
const STORAGE_KEY = 'similar-trail'

export default defineComponent({
  props: {
    fullName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const trail = ref<{ label: string; path: string }[]>([])

    const read = () => {
      try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
      } catch {
        // Ventana privada, almacenamiento bloqueado: el paseo sigue funcionando sin miga
        return []
      }
    }

    const record = (fullName: string) => {
      const path = `/a-similar/${fullName.replace('/', '@')}`
      const hops = read().filter((hop: any) => hop && hop.path)

      // Volver sobre tus pasos recorta el rastro hasta ahi, no lo alarga: si no, ir
      // atras y adelante dos veces deja la miga llena de la misma pareja de repos
      const seen = hops.findIndex((hop: any) => hop.path === path)
      const walked = seen >= 0 ? hops.slice(0, seen) : hops

      const updated = [...walked, { label: fullName.split('/').pop(), path }].slice(-MAX_HOPS)
      trail.value = updated
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // idem: no poder guardar no puede romper la pagina
      }
    }

    // El rastro vive en sessionStorage, que no existe en el servidor. Por eso el
    // componente se monta dentro de <ClientOnly>: aqui basta con reaccionar al repo.
    watch(() => props.fullName, (fullName) => fullName && record(fullName), { immediate: true })

    return { trail }
  }
})
</script>

<style scoped>
.trail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 0;
  font-size: 0.8rem;
  color: #888;
}

.trail-arrow {
  color: #bbb;
}

.trail-link {
  color: #1976d2;
  text-decoration: none;
}

.trail-link:hover {
  text-decoration: underline;
}

.trail-current {
  color: #555;
  font-weight: 500;
}
</style>
