<template>
  <q-page class="flex flex-center column" style="background:#111;min-height:100vh;gap:16px">
    <q-icon name="search_off" size="64px" color="grey-8" />
    <p class="text-grey-6" style="font-size:16px;margin:0">Página não encontrada</p>
    <q-btn flat color="primary" label="Voltar ao início" no-caps to="/" />
  </q-page>
</template>

<script setup lang="ts">
defineOptions({ name: 'ErrorNotFound' })
</script>
