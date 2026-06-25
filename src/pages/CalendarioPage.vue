<template>
  <q-page class="calendario-page">

    <q-pull-to-refresh @refresh="onRefresh" color="primary" bg-color="dark" style="min-height: inherit">

      <div v-if="loading" class="calendario-page__loading">
        <q-spinner-dots color="primary" size="48px" />
        <p class="q-mt-md text-grey-6">Carregando apresentações...</p>
      </div>

      <div v-else-if="error" class="calendario-page__error">
        <q-icon name="cloud_off" size="48px" color="grey-7" />
        <p class="q-mt-sm text-grey-6">{{ error }}</p>
        <q-btn flat color="primary" label="Tentar novamente" no-caps @click="refetch" />
      </div>

      <!-- Layout mobile: mini grid + lista -->
      <template v-else-if="$q.screen.lt.sm">
        <CountdownCard
          :proximo-evento="upcomingEvents[0] ?? null"
          @click="abrirEventoModal"
        />
        <div class="calendario-page__mini-grid">
          <FullCalendar ref="miniCalRef" :options="miniCalOptions" />
        </div>
        <div class="calendario-page__divider">
          <span v-if="diaFiltrado">
            Eventos de {{ diaFiltradoLabel }}
            <q-btn flat dense round icon="close" size="xs" color="grey-5" @click="limparFiltro" />
          </span>
          <span v-else>Todos os eventos do mês</span>
        </div>
        <div class="calendario-page__list">
          <FullCalendar ref="listCalRef" :options="listOptions" />
        </div>
      </template>

      <!-- Layout desktop: dayGridMonth completo -->
      <div v-else class="calendario-page__calendar">
        <CountdownCard
          :proximo-evento="upcomingEvents[0] ?? null"
          @click="abrirEventoModal"
        />
        <FullCalendar ref="calendarRef" :options="desktopOptions" />
        <div class="calendario-page__divider">
          <span>Eventos do mês</span>
        </div>
        <div class="calendario-page__list">
          <FullCalendar ref="desktopListRef" :options="desktopListOptions" />
        </div>
      </div>

    </q-pull-to-refresh>

    <EventoModal v-model="modalOpen" :evento="eventoSelecionado" />

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { CalendarOptions } from '@fullcalendar/core'
import { useQuasar } from 'quasar'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { format, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EventoModal from 'src/components/EventoModal.vue'
import CountdownCard from 'src/components/CountdownCard.vue'
import { useGoogleCalendar, type CalendarEvent } from 'src/composables/useGoogleCalendar'

defineOptions({ name: 'CalendarioPage' })

const $q = useQuasar()
const { calendarEvents, upcomingEvents, loading, error, fetchEvents, refetch } = useGoogleCalendar()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const miniCalRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const listCalRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const desktopListRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const modalOpen = ref(false)
const eventoSelecionado = ref<CalendarEvent | null>(null)
const diaFiltrado = ref<Date | null>(null)

onMounted(() => {
  fetchEvents()
})

// Sincroniza mês entre mini calendário e lista
watch(diaFiltrado, () => {
  const api = listCalRef.value?.getApi()
  if (!api) return
  if (diaFiltrado.value) {
    api.gotoDate(diaFiltrado.value)
  }
})

function limparFiltro() {
  diaFiltrado.value = null
}

const diaFiltradoLabel = computed(() => {
  if (!diaFiltrado.value) return ''
  return format(diaFiltrado.value, "dd 'de' MMMM", { locale: ptBR })
})

// Eventos filtrados por dia (para a lista mobile)
const eventosFiltrados = computed(() => {
  const dia = diaFiltrado.value
  if (!dia) return calendarEvents.value
  return calendarEvents.value.filter((e) => {
    try {
      return isSameDay(parseISO(e.start), dia)
    } catch {
      return false
    }
  })
})

async function onRefresh(done: () => void) {
  refetch()
  await nextTick()
  const stop = watch(loading, (val) => {
    if (!val) { done(); stop() }
  })
}

function abrirEventoModal(evento: CalendarEvent) {
  eventoSelecionado.value = evento
  modalOpen.value = true
}

function eventClassNames(arg: any): string[] {
  if (arg.event.extendedProps?.cancelled) return ['evento-cancelado']
  const end = arg.event.end ?? arg.event.start
  return new Date(end) < new Date() ? ['evento-passado'] : []
}

function handleEventClick(info: any) {
  info.jsEvent.preventDefault()
  const p = info.event.extendedProps
  eventoSelecionado.value = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.startStr,
    end: info.event.endStr,
    description: p.description ?? '',
    location: p.location ?? '',
    allDay: info.event.allDay,
    imageUrl: p.imageUrl ?? '',
    cancelled: p.cancelled ?? false,
    cancelReason: p.cancelReason ?? '',
  }
  modalOpen.value = true
}

// Mini calendário (topo mobile) — grade compacta com dots
const miniCalOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  locale: ptBrLocale,
  height: 'auto',
  events: calendarEvents.value,
  headerToolbar: {
    left: 'prev',
    center: 'title',
    right: 'next',
  },
  eventDisplay: 'dot',
  displayEventTime: false,
  dayMaxEvents: false,
  eventClassNames,
  dateClick: (info: any) => {
    const clicked = info.date
    if (diaFiltrado.value && isSameDay(clicked, diaFiltrado.value)) {
      diaFiltrado.value = null
    } else {
      diaFiltrado.value = clicked
      // Sincroniza mês da lista
      listCalRef.value?.getApi().gotoDate(clicked)
    }
  },
  dayCellClassNames: (arg: any) => {
    if (diaFiltrado.value && isSameDay(arg.date, diaFiltrado.value)) {
      return ['dia-selecionado']
    }
    return []
  },
  datesSet: (info: any) => {
    diaFiltrado.value = null
    listCalRef.value?.getApi()?.gotoDate(info.view.currentStart)
  },
  eventClick: handleEventClick,
}))

// Lista de eventos (parte inferior mobile)
const listOptions = computed<CalendarOptions>(() => ({
  plugins: [listPlugin],
  initialView: 'listMonth',
  locale: ptBrLocale,
  height: 'auto',
  events: eventosFiltrados.value,
  headerToolbar: false as const,
  noEventsText: 'Nenhuma apresentação neste período',
  listDaySideFormat: false as const,
  displayEventTime: false,
  eventClassNames,
  eventClick: handleEventClick,
}))

// Opções desktop — grade completa
const desktopOptions = computed(() => ({
  plugins: [dayGridPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: ptBrLocale,
  height: 'auto',
  events: calendarEvents.value,
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: 'today',
  },
  buttonText: { today: 'Hoje' },
  noEventsText: 'Nenhuma apresentação neste período',
  displayEventTime: false,
  eventClassNames,
  datesSet: (info: any) => {
    desktopListRef.value?.getApi()?.gotoDate(info.view.currentStart)
  },
  eventClick: handleEventClick,
}))

const desktopListOptions = computed<CalendarOptions>(() => ({
  plugins: [listPlugin],
  initialView: 'listMonth',
  locale: ptBrLocale,
  height: 'auto',
  events: calendarEvents.value,
  headerToolbar: false as const,
  noEventsText: 'Nenhuma apresentação neste período',
  listDaySideFormat: false as const,
  displayEventTime: false,
  eventClassNames,
  eventClick: handleEventClick,
}))
</script>

<style lang="scss" scoped>
.calendario-page {
  background-color: #111111;
  min-height: 100vh;
  padding: 0;

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
  }

  &__calendar {
    padding: 0;
  }

  &__mini-grid {
    background-color: #1c1c1c;
    border-bottom: 1px solid #2a2a2a;
  }

  &__divider {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    background-color: #111111;
    border-bottom: 1px solid #1a1a1a;
  }

  &__list {
    background-color: #111111;
  }
}

// ────────────────────────────────────────────────
// Estilos FullCalendar — compartilhados
// ────────────────────────────────────────────────
:deep(.fc) {
  .fc-toolbar {
    padding: 12px 16px 8px;
    background-color: #1c1c1c;
    margin-bottom: 0 !important;
    border-bottom: 1px solid #2a2a2a;
  }

  .fc-toolbar-title {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    text-transform: capitalize;
  }

  .fc-button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: #e1ac26 !important;
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px !important;
    text-transform: none;

    &:hover {
      background: rgba(225, 172, 38, 0.1) !important;
      color: #e1ac26 !important;
    }

    &:active,
    &:focus {
      background: rgba(225, 172, 38, 0.15) !important;
      box-shadow: none !important;
      color: #e1ac26 !important;
    }
  }

  .fc-today-button {
    opacity: 1 !important;
  }

  // Grade mensal
  .fc-daygrid-body {
    background-color: #1c1c1c;
  }

  .fc-scrollgrid {
    border: none !important;
  }

  .fc-scrollgrid-section > td {
    border: none !important;
  }

  .fc-col-header {
    background-color: #161616;
  }

  .fc-col-header-cell-cushion {
    color: #e1ac26;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    text-decoration: none;
    padding: 8px 0;
  }

  .fc-daygrid-day {
    border-color: #222 !important;
  }

  .fc-daygrid-day-number {
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    text-decoration: none;
    padding: 5px 7px;
  }

  .fc-day-today {
    background-color: rgba(225, 172, 38, 0.06) !important;

    .fc-daygrid-day-number {
      background-color: #e1ac26;
      color: #111;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin: 3px;
      padding: 0;
      font-size: 12px;
    }
  }

  // Célula selecionada (mobile)
  .dia-selecionado {
    background-color: rgba(225, 172, 38, 0.15) !important;
  }

  // Dot display (mini calendário mobile)
  .fc-daygrid-event-dot {
    border-color: #e1ac26 !important;
    border-width: 5px;
  }

  .fc-daygrid-dot-event {
    padding: 1px 0;
    cursor: pointer;
  }

  // Evento barra (desktop)
  .fc-daygrid-event {
    border-radius: 4px;
    padding: 2px 5px;
    font-size: 11px;
    font-weight: 500;
    margin: 1px 2px;
  }

  // Lista (mobile inferior)
  .fc-list {
    background-color: #111111;
    border: none;
  }

  .fc-list-day-cushion {
    background-color: #1c1c1c;
    padding: 10px 16px;
  }

  .fc-list-day-text,
  .fc-list-day-side-text {
    color: #e1ac26;
    font-size: 13px;
    font-weight: 600;
    text-transform: capitalize;
    text-decoration: none;
  }

  .fc-list-event {
    cursor: pointer;

    td {
      padding: 14px 16px;
      border-bottom: 1px solid #1a1a1a;
    }
  }

  .fc-list-event-dot {
    border-color: #e1ac26;
    border-width: 6px;
  }

  .fc-list-event-title a {
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
  }

  .fc-list-event-time {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
  }

  .fc-list-empty {
    background-color: #111111;
    color: rgba(255, 255, 255, 0.35);
    padding: 32px 0;
    font-size: 14px;
  }

  // Eventos cancelados — grade mensal
  .fc-daygrid-event.evento-cancelado {
    opacity: 0.6;
    background-color: rgba(239, 83, 80, 0.25) !important;
    border-color: rgba(239, 83, 80, 0.5) !important;
    text-decoration: line-through;
    color: #ef9a9a !important;
  }

  // Eventos cancelados — dot
  .fc-daygrid-dot-event.evento-cancelado {
    opacity: 0.6;
    .fc-daygrid-event-dot { border-color: #ef5350 !important; }
  }

  // Eventos cancelados — lista
  .fc-list-event.evento-cancelado {
    td { background-color: rgba(239, 83, 80, 0.05); }
    .fc-list-event-dot { border-color: #ef5350 !important; }
    .fc-list-event-title a {
      color: #ef9a9a;
      text-decoration: line-through;
    }
  }

  // Eventos encerrados — grade mensal
  .fc-daygrid-event.evento-passado {
    opacity: 0.35;
    filter: grayscale(100%);
    text-decoration: line-through;
  }

  // Eventos encerrados — dot (mini grid mobile)
  .fc-daygrid-dot-event.evento-passado {
    opacity: 0.3;
    filter: grayscale(100%);
  }

  // Eventos encerrados — lista
  .fc-list-event.evento-passado {
    td { opacity: 0.4; }

    .fc-list-event-dot {
      border-color: #666 !important;
    }

    .fc-list-event-title a {
      color: rgba(255, 255, 255, 0.4);
      text-decoration: line-through;
    }
  }
}
</style>
