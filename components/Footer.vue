<template>
  <v-footer 
    color="primary" 
    class="footer-container"
    :class="{ 'drawer-open': drawerOpen }"
  >
    <v-container fluid class="pa-0">
      <v-row align="center" justify="center" class="ma-0">
        <v-col cols="12" class="text-center pa-4">
          <div class="footer-content">
            <span class="footer-text">
              Made with <v-icon color="red" size="small" class="mx-1">mdi-heart</v-icon> love
            </span>
            <v-divider vertical class="footer-divider mx-4"></v-divider>
            <GitHubStarButton 
              text="Star us on GitHub"
              variant="outlined"
              color="white"
              size="default"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GitHubStarButton from './GitHubStarButton.vue'

export default defineComponent({
  props: {
    drawerOpen: {
      type: Boolean,
      default: true
    }
  },
  components: {
    GitHubStarButton
  }
})
</script>

<style scoped>
.footer-container {
  padding: 0 !important;
  /* Force footer to span full width - override Vuetify defaults */
  width: 100vw !important;
  max-width: none !important;
  left: 0 !important;
  right: 0 !important;
  margin: 0 !important;
  position: relative;
  z-index: 2; /* Above drawer */
  /* Smooth transition when drawer opens/closes */
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When drawer is open */
.footer-container.drawer-open {
  margin-left: -256px !important;
}

/* On mobile, no negative margin */
@media (max-width: 1280px) {
  .footer-container,
  .footer-container.drawer-open {
    margin-left: 0 !important;
  }
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-text {
  color: white;
  font-size: 1rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.footer-divider {
  height: 30px;
  border-color: rgba(255, 255, 255, 0.3);
}

/* Mobile responsive */
@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .footer-divider {
    display: none;
  }
}
</style>