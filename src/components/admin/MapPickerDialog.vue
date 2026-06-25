<template>
  <q-dialog v-model="isOpen" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="map-picker">

      <div class="map-picker__header">
        <q-btn flat round dense icon="close" color="grey-5" @click="isOpen = false" />
        <span class="map-picker__title">Selecionar local</span>
      </div>

      <div class="map-picker__hint">
        <q-icon name="touch_app" size="14px" />
        <span>Toque no mapa para marcar o local, arraste o pin para ajustar</span>
      </div>

      <div ref="mapContainer" class="map-picker__map" />

      <div class="map-picker__address">
        <q-spinner v-if="loading" size="16px" color="primary" />
        <q-icon v-else name="place" size="18px" color="primary" />
        <span v-if="address">{{ address }}</span>
        <span v-else class="text-grey-6">Nenhum local selecionado</span>
      </div>

      <q-card-actions class="q-px-lg q-pb-lg" vertical>
        <q-btn
          unelevated
          color="primary"
          text-color="dark"
          label="Confirmar local"
          icon="check"
          class="full-width"
          no-caps
          :disable="!address || loading"
          @click="confirm"
        />
        <q-btn
          flat
          label="Cancelar"
          class="full-width q-mt-sm"
          color="grey-5"
          no-caps
          @click="isOpen = false"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import type { Map, Marker } from 'leaflet'

const isOpen = defineModel<boolean>({ required: true })
const emit = defineEmits<{ selected: [address: string] }>()

const mapContainer = ref<HTMLElement | null>(null)
const address = ref('')
const loading = ref(false)

let map: Map | null = null
let marker: Marker | null = null
let lastCenter: [number, number] | null = null
let lastZoom = 14

watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    await initMap()
  } else {
    destroyMap()
  }
})

async function initMap() {
  if (!mapContainer.value) return

  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  const pinIcon = L.divIcon({
    html: '<div style="width:22px;height:22px;background:#e1ac26;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.6)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    className: '',
  })

  const center = lastCenter ?? [-3.1019, -60.025]

  map = L.map(mapContainer.value, {
    center,
    zoom: lastZoom,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  if (lastCenter) {
    marker = L.marker(lastCenter, { icon: pinIcon, draggable: true }).addTo(map)
    marker.on('dragend', async () => {
      const pos = marker?.getLatLng()
      if (pos) {
        lastCenter = [pos.lat, pos.lng]
        lastZoom = map?.getZoom() ?? 14
        await reverseGeocode(pos.lat, pos.lng)
      }
    })
  }

  map.on('click', async (e) => {
    lastCenter = [e.latlng.lat, e.latlng.lng]
    lastZoom = map?.getZoom() ?? 14

    if (marker) {
      marker.setLatLng(e.latlng)
    } else {
      if (!map) return
      marker = L.marker(e.latlng, { icon: pinIcon, draggable: true }).addTo(map)
      marker.on('dragend', async () => {
        const pos = marker?.getLatLng()
        if (pos) {
          lastCenter = [pos.lat, pos.lng]
          lastZoom = map?.getZoom() ?? 14
          await reverseGeocode(pos.lat, pos.lng)
        }
      })
    }
    await reverseGeocode(e.latlng.lat, e.latlng.lng)
  })
}

async function reverseGeocode(lat: number, lng: number) {
  loading.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    )
    const data = await res.json()
    address.value = data.display_name ?? ''
  } catch {
    address.value = ''
  } finally {
    loading.value = false
  }
}

function confirm() {
  if (address.value) {
    emit('selected', address.value)
    isOpen.value = false
  }
}

function destroyMap() {
  if (map) {
    lastZoom = map.getZoom()
    map.remove()
    map = null
    marker = null
  }
}

onUnmounted(destroyMap)
</script>

<style lang="scss" scoped>
.map-picker {
  background-color: #1c1c1c;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #2a2a2a;
    background-color: #111111;
    flex-shrink: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #e1ac26;
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    background-color: #161616;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
  }

  &__map {
    flex: 1;
    min-height: 0;
  }

  &__address {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 14px 16px;
    border-top: 1px solid #2a2a2a;
    font-size: 13px;
    color: #ddd;
    flex-shrink: 0;
    min-height: 52px;
    line-height: 1.4;
  }
}
</style>
