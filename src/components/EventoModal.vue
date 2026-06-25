<template>
  <q-dialog
    v-model="isOpen"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="evento-modal" :class="{ 'evento-modal--desktop': $q.screen.gt.xs }">
      <!-- Header com gradiente -->
      <div class="evento-modal__header">
        <div class="evento-modal__header-overlay">
          <q-btn
            flat
            round
            dense
            icon="close"
            class="evento-modal__close"
            @click="isOpen = false"
          />
          <div class="evento-modal__estrela">
            <q-icon name="star" size="14px" />
            <span>Boi Estrela</span>
            <q-icon name="star" size="14px" />
          </div>
          <h2 class="evento-modal__title">{{ evento?.title }}</h2>

          <!-- Badge encerrado -->
          <div v-if="isPassado" class="evento-modal__badge-encerrado">
            <q-icon name="check_circle" size="14px" />
            <span>Apresentação realizada</span>
          </div>
        </div>
      </div>

      <!-- Conteúdo -->
      <q-card-section class="evento-modal__body q-pa-lg">
        <!-- Data e Hora -->
        <div class="evento-modal__info-row" v-if="evento?.start">
          <div class="evento-modal__info-icon">
            <q-icon name="calendar_today" size="20px" color="primary" />
          </div>
          <div class="evento-modal__info-content">
            <span class="evento-modal__info-label">Data e Horário</span>
            <span class="evento-modal__info-value">{{ dataFormatada }}</span>
          </div>
        </div>

        <q-separator dark class="q-my-md" />

        <!-- Descrição -->
        <div class="evento-modal__info-row" v-if="evento?.description">
          <div class="evento-modal__info-icon">
            <q-icon name="article" size="20px" color="primary" />
          </div>
          <div class="evento-modal__info-content">
            <span class="evento-modal__info-label">Descrição</span>
            <span class="evento-modal__info-value evento-modal__description">
              {{ evento.description }}
            </span>
          </div>
        </div>

        <q-separator dark class="q-my-md" v-if="evento?.description && evento?.location" />

        <!-- Localização -->
        <div class="evento-modal__info-row" v-if="evento?.location">
          <div class="evento-modal__info-icon">
            <q-icon name="place" size="20px" color="primary" />
          </div>
          <div class="evento-modal__info-content">
            <span class="evento-modal__info-label">Local</span>
            <span class="evento-modal__info-value">{{ locationName }}</span>
            <span class="evento-modal__info-sub" v-if="locationAddress">{{ locationAddress }}</span>
          </div>
        </div>

        <!-- Mapa embutido -->
        <div v-if="evento?.location" class="evento-modal__map">
          <iframe
            :src="mapEmbedUrl"
            width="100%"
            height="180"
            style="border: 0; display: block"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          />
        </div>
      </q-card-section>

      <!-- Ações -->
      <q-card-actions class="evento-modal__actions q-px-lg q-pb-lg" vertical>
        <q-btn
          v-if="evento?.location"
          outline
          color="primary"
          icon="map"
          label="Ver no Google Maps"
          class="full-width q-mt-sm evento-modal__btn-secondary"
          :href="mapsUrl"
          target="_blank"
          no-caps
        />
        <q-btn
          v-if="!isPassado"
          unelevated
          color="primary"
          text-color="dark"
          icon="event_available"
          label="Adicionar ao meu calendário"
          class="full-width evento-modal__btn-maps"
          :href="googleCalendarUrl"
          target="_blank"
          no-caps
        />
        <q-separator v-if="isAdmin" dark class="q-mt-sm" />
        <q-btn
          v-if="isAdmin"
          flat
          color="amber-6"
          icon="edit"
          label="Editar evento"
          class="full-width q-mt-sm"
          no-caps
          @click="editFormOpen = true"
        />
        <q-btn
          flat
          label="Fechar"
          class="full-width q-mt-sm text-white"
          @click="isOpen = false"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <AdminEventForm v-model="editFormOpen" :evento="evento" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { format, parseISO, addHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CalendarEvent } from 'src/composables/useGoogleCalendar'
import { useAdminAuth } from 'src/composables/useAdminAuth'
import AdminEventForm from 'src/components/admin/AdminEventForm.vue'

const $q = useQuasar()
const { isAdmin } = useAdminAuth()
const editFormOpen = ref(false)

const isOpen = defineModel<boolean>({ required: true })

const props = defineProps<{
  evento: CalendarEvent | null
}>()

const dataFormatada = computed(() => {
  if (!props.evento?.start) return ''
  try {
    const start = parseISO(props.evento.start)
    if (props.evento.allDay) {
      return format(start, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
    const startStr = format(start, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    if (props.evento.end) {
      const end = parseISO(props.evento.end)
      return `${startStr} – ${format(end, 'HH:mm')}`
    }
    return startStr
  } catch {
    return props.evento.start
  }
})

const locationName = computed(() => props.evento?.location?.split(',')[0]?.trim() ?? '')
const locationAddress = computed(() => {
  const parts = props.evento?.location?.split(',') ?? []
  return parts.length > 1 ? parts.slice(1).join(',').trim() : ''
})

const isPassado = computed(() => {
  if (!props.evento) return false
  try {
    const ref = props.evento.end || props.evento.start
    return new Date(ref) < new Date()
  } catch {
    return false
  }
})

const googleCalendarUrl = computed(() => {
  if (!props.evento?.start) return ''
  try {
    const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss")
    const start = parseISO(props.evento.start)
    const end = props.evento.end ? parseISO(props.evento.end) : addHours(start, 2)
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: props.evento.title,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: props.evento.description,
      location: props.evento.location,
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  } catch {
    return ''
  }
})

const mapsUrl = computed(() =>
  props.evento?.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.evento.location)}`
    : '',
)

const mapEmbedUrl = computed(() =>
  props.evento?.location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        props.evento.location,
      )}&output=embed&hl=pt-BR&z=15`
    : '',
)
</script>

<style lang="scss" scoped>
.evento-modal {
  background-color: #1c1c1c;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &--desktop {
    min-width: 420px;
    max-width: 520px;
    border-radius: 16px !important;
  }

  &__header {
    background: linear-gradient(160deg, #111111 0%, #2a2a2a 50%, #1a1200 100%);
    border-bottom: 2px solid #e1ac26;
    position: relative;
    overflow: hidden;
    min-height: 160px;

    &::before {
      content: '';
      position: absolute;
      top: -40px;
      right: -40px;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(225, 172, 38, 0.15) 0%, transparent 70%);
    }
  }

  &__header-overlay {
    position: relative;
    padding: 16px 16px 24px;
    display: flex;
    flex-direction: column;
    min-height: 160px;
  }

  &__close {
    align-self: flex-end;
    color: rgba(255, 255, 255, 0.7);

    &:hover {
      color: #fff;
    }
  }

  &__estrela {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #e1ac26;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 8px;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    margin: 10px 0 0;
    color: #fff;
  }

  &__badge-encerrado {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    padding: 4px 10px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.65);
    text-transform: uppercase;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
  }

  &__info-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  &__info-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__info-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  &__info-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #888;
  }

  &__info-value {
    font-size: 15px;
    color: #eee;
    line-height: 1.4;
    text-transform: capitalize;
  }

  &__info-sub {
    font-size: 13px;
    color: #888;
  }

  &__description {
    white-space: pre-wrap;
    text-transform: none;
  }

  &__map {
    margin-top: 16px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #2a2a2a;
  }

  &__actions {
    border-top: 1px solid #2a2a2a;
  }

  &__btn-maps {
    font-weight: 600;
    border-radius: 10px;
    height: 48px;
    font-size: 14px;
  }

  &__btn-secondary {
    border-radius: 10px;
    height: 44px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
