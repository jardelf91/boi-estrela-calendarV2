<template>
  <q-page class="historico-page">
    <q-pull-to-refresh @refresh="onRefresh" color="primary" bg-color="dark" style="min-height: inherit">

      <div v-if="loading" class="historico-page__loading">
        <q-spinner-dots color="primary" size="48px" />
        <p class="q-mt-md text-grey-6">Carregando histórico...</p>
      </div>

      <div v-else-if="error" class="historico-page__error">
        <q-icon name="cloud_off" size="48px" color="grey-7" />
        <p class="q-mt-sm text-grey-6">{{ error }}</p>
        <q-btn flat color="primary" label="Tentar novamente" no-caps @click="refetch" />
      </div>

      <div v-else-if="pastEvents.length === 0" class="historico-page__empty">
        <q-icon name="history" size="56px" color="grey-8" />
        <p class="text-grey-6 q-mt-md">Nenhuma apresentação passada</p>
      </div>

      <div v-else class="historico-page__list">

        <div class="historico-page__header">
          <span class="historico-page__header-count">
            {{ pastEvents.length }} apresentaç{{ pastEvents.length === 1 ? 'ão' : 'ões' }} realizad{{ pastEvents.length === 1 ? 'a' : 'as' }}
          </span>
        </div>

        <div
          v-for="evento in pastEvents"
          :key="evento.id"
          class="historico-card"
          @click="abrirEvento(evento)"
        >
          <div class="historico-card__date">
            <span class="historico-card__date-day">{{ diaNumero(evento.start) }}</span>
            <span class="historico-card__date-month">{{ mesAbrev(evento.start) }}</span>
            <span class="historico-card__date-year">{{ ano(evento.start) }}</span>
          </div>

          <div class="historico-card__divider" />

          <div class="historico-card__content">
            <p class="historico-card__title">{{ evento.title }}</p>

            <div v-if="!evento.allDay" class="historico-card__meta">
              <q-icon name="schedule" size="13px" color="grey-6" />
              <span>{{ horaFormatada(evento.start) }}</span>
            </div>

            <div v-if="evento.location" class="historico-card__meta">
              <q-icon name="place" size="13px" color="grey-6" />
              <span>{{ evento.location.split(',')[0] }}</span>
            </div>
          </div>

          <q-icon name="chevron_right" size="18px" color="grey-8" class="historico-card__arrow" />
        </div>

      </div>

    </q-pull-to-refresh>
    <EventoModal v-model="modalOpen" :evento="eventoSelecionado" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EventoModal from 'src/components/EventoModal.vue'
import { useGoogleCalendar, type CalendarEvent } from 'src/composables/useGoogleCalendar'

defineOptions({ name: 'HistoricoPage' })

const { events, loading, error, fetchEvents, refetch } = useGoogleCalendar()

const modalOpen = ref(false)
const eventoSelecionado = ref<CalendarEvent | null>(null)

onMounted(() => { fetchEvents() })

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

const pastEvents = computed(() => {
  const now = new Date()
  return events.value
    .filter((e) => new Date(e.end || e.start) < now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
})

function diaNumero(dateStr: string): string {
  try { return format(parseISO(dateStr), 'dd', { locale: ptBR }) } catch { return '--' }
}
function mesAbrev(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM', { locale: ptBR }).toUpperCase() } catch { return '--' }
}
function ano(dateStr: string): string {
  try { return format(parseISO(dateStr), 'yyyy') } catch { return '' }
}
function horaFormatada(dateStr: string): string {
  try { return format(parseISO(dateStr), 'HH:mm', { locale: ptBR }) } catch { return '' }
}
</script>

<style lang="scss" scoped>
.historico-page {
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

  &__list { padding-bottom: 24px; }

  &__header {
    padding: 16px 20px 8px;
    border-bottom: 1px solid #1e1e1e;
  }

  &__header-count {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.25);
  }
}

.historico-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  transition: background-color 0.15s;
  opacity: 0.75;

  &:active,
  &:hover { background-color: rgba(255, 255, 255, 0.03); }

  &__date {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 48px;
    flex-shrink: 0;
  }

  &__date-day {
    font-size: 22px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1;
  }

  &__date-month {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  &__date-year {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.2);
    margin-top: 1px;
  }

  &__divider {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent);
    margin: 0 16px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__arrow {
    flex-shrink: 0;
    margin-left: 8px;
    opacity: 0.2;
  }
}
</style>
