<template>
  <v-footer 
    color="primary" 
    class="footer-container"
    app
  >
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
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
  components: {
    GitHubStarButton
  }
})
</script>

<style scoped>
.footer-container {
  padding: 24px 0;
  /* Ensure footer spans full width */
  width: 100% !important;
  left: 0 !important;
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