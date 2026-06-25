<template>
  <q-page class="proximas-page">
    <q-pull-to-refresh @refresh="onRefresh" color="primary" bg-color="dark" style="min-height: inherit">

    <!-- Loading -->
    <div v-if="loading" class="proximas-page__loading">
      <q-spinner-dots color="primary" size="48px" />
      <p class="q-mt-md text-grey-6">Carregando apresentações...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="proximas-page__error">
      <q-icon name="cloud_off" size="48px" color="grey-7" />
      <p class="q-mt-sm text-grey-6">{{ error }}</p>
      <q-btn flat color="primary" label="Tentar novamente" no-caps @click="refetch" />
    </div>

    <!-- Sem eventos -->
    <div v-else-if="upcomingEvents.length === 0" class="proximas-page__empty">
      <q-icon name="event_busy" size="56px" color="grey-8" />
      <p class="text-grey-6 q-mt-md">Nenhuma apresentação agendada</p>
    </div>

    <!-- Lista de eventos -->
    <div v-else class="proximas-page__list">

      <div class="proximas-page__header">
        <span class="proximas-page__header-count">
          {{ upcomingEvents.length }} apresentaç{{ upcomingEvents.length === 1 ? 'ão' : 'ões' }} agendada{{ upcomingEvents.length === 1 ? '' : 's' }}
        </span>
      </div>

      <div
        v-for="evento in upcomingEvents"
        :key="evento.id"
        class="proximas-card"
        @click="abrirEvento(evento)"
      >
        <!-- Data lateral -->
        <div class="proximas-card__date">
          <span class="proximas-card__date-day">{{ diaNumero(evento.start) }}</span>
          <span class="proximas-card__date-month">{{ mesAbrev(evento.start) }}</span>
        </div>

        <!-- Divisor -->
        <div class="proximas-card__divider" />

        <!-- Conteúdo -->
        <div class="proximas-card__content">
          <p class="proximas-card__title">{{ evento.title }}</p>

          <div v-if="!evento.allDay" class="proximas-card__meta">
            <q-icon name="schedule" size="14px" color="primary" />
            <span>{{ horaFormatada(evento.start) }}</span>
          </div>

          <div v-if="evento.location" class="proximas-card__meta">
            <q-icon name="place" size="14px" color="primary" />
            <span>{{ evento.location.split(',')[0] }}</span>
          </div>

          <div v-if="evento.description" class="proximas-card__description">
            {{ evento.description }}
          </div>
        </div>

        <!-- Chevron -->
        <q-icon name="chevron_right" size="20px" color="grey-7" class="proximas-card__arrow" />
      </div>

    </div>

    </q-pull-to-refresh>
    <EventoModal v-model="modalOpen" :evento="eventoSelecionado" />

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EventoModal from 'src/components/EventoModal.vue'
import { useGoogleCalendar, saoPauloHHMM, type CalendarEvent } from 'src/composables/useGoogleCalendar'

defineOptions({ name: 'ProximasPage' })

const { upcomingEvents, loading, error, fetchEvents, refetch } = useGoogleCalendar()

const modalOpen = ref(false)
const eventoSelecionado = ref<CalendarEvent | null>(null)

onMounted(() => {
  fetchEvents()
})

async function onRefresh(done: () => void) {
  refetch()
  await nextTick()
  const stop = watch(loading, (val) => {
    if (!val) { done(); stop() }
  })
}

function abrirEvento(evento: CalendarEvent) {
  eventoSelecionado.value = evento
  modalOpen.value = true
}

function diaNumero(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd', { locale: ptBR })
  } catch {
    return '--'
  }
}

function mesAbrev(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM', { locale: ptBR }).toUpperCase()
  } catch {
    return '--'
  }
}

function horaFormatada(dateStr: string): string {
  return saoPauloHHMM(dateStr)
}
</script>

<style lang="scss" scoped>
.proximas-page {
  background-color: #111111;
  min-height: 100vh;

  &__loading,
  &__error,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
  }

  &__list {
    padding-bottom: 24px;
  }

  &__header {
    padding: 16px 20px 8px;
    border-bottom: 1px solid #1e1e1e;
  }

  &__header-count {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
  }
}

.proximas-card {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 18px 16px;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:active,
  &:hover {
    background-color: rgba(225, 172, 38, 0.05);
  }

  &__date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    flex-shrink: 0;
  }

  &__date-day {
    font-size: 26px;
    font-weight: 700;
    color: #e1ac26;
    line-height: 1;
  }

  &__date-month {
    font-size: 10px;
    font-weight: 600;
    color: rgba(225, 172, 38, 0.65);
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  &__divider {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, transparent, #e1ac26, transparent);
    margin: 0 16px;
    flex-shrink: 0;
    opacity: 0.4;
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  &__arrow {
    flex-shrink: 0;
    margin-left: 8px;
    opacity: 0.4;
  }
}
</style>
