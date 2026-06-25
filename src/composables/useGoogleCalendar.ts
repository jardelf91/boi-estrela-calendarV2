import { ref, computed } from 'vue'

export const CALENDAR_ID =
  '9b4e280188a68d3b7b1c65e7ab3752e2cc5eadaef2c35c8f9aad5e020401ea3c@group.calendar.google.com'
const API_KEY = 'AIzaSyBAytFO5Lu6oP1UQSSep4B1j-a4cTKnQxE'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  description: string
  location: string
  allDay: boolean
  imageUrl: string
}

// Retorna HH:mm no fuso de São Paulo — independente do fuso do calendário ou do device
export function saoPauloHHMM(isoString: string): string {
  if (!isoString || !isoString.includes('T')) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)
  } catch { return '' }
}

// Retorna YYYY-MM-DD no fuso de São Paulo
export function saoPauloDateStr(isoString: string): string {
  if (!isoString) return ''
  if (!isoString.includes('T')) return isoString.substring(0, 10)
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString.substring(0, 10)
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  } catch { return isoString.substring(0, 10) }
}

// Estado compartilhado entre todas as páginas
const events = ref<CalendarEvent[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let fetched = false

export function useGoogleCalendar() {
  async function fetchEvents() {
    if (fetched) return

    loading.value = true
    error.value = null

    try {
      const timeMin = new Date()
      timeMin.setMonth(timeMin.getMonth() - 3)

      const timeMax = new Date()
      timeMax.setFullYear(timeMax.getFullYear() + 1)

      const params = new URLSearchParams({
        key: API_KEY,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: '200',
        singleEvents: 'true',
        orderBy: 'startTime',
      })
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) throw new Error(`Erro ${res.status}: falha ao buscar eventos`)

      const data = await res.json()

      events.value = (data.items ?? []).map((item: any) => ({
        id: item.id ?? '',
        title: item.summary ?? 'Sem título',
        start: item.start?.dateTime ?? item.start?.date ?? '',
        end: item.end?.dateTime ?? item.end?.date ?? '',
        description: item.description ?? '',
        location: item.location ?? '',
        allDay: !item.start?.dateTime,
        imageUrl: item.extendedProperties?.shared?.imageUrl ?? '',
      }))

      fetched = true
    } catch (e: any) {
      error.value = e.message ?? 'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  function refetch() {
    fetched = false
    fetchEvents()
  }

  const upcomingEvents = computed(() => {
    const now = new Date()
    return events.value
      .filter((e) => new Date(e.end || e.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  })

  const calendarEvents = computed(() =>
    events.value.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      extendedProps: {
        description: e.description,
        location: e.location,
        imageUrl: e.imageUrl,
      },
    })),
  )

  return { events, upcomingEvents, calendarEvents, loading, error, fetchEvents, refetch }
}
