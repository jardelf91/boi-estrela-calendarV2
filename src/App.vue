<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

defineOptions({ name: 'App' })

onMounted(() => {
  if (document.getElementById('gsi-script')) return
  const script = document.createElement('script')
  script.id = 'gsi-script'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  document.head.appendChild(script)
})
</script>
