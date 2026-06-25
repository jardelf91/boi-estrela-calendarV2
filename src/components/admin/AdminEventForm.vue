<template>
  <q-dialog
    v-model="isOpen"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="event-form" :class="{ 'event-form--desktop': $q.screen.gt.xs }">

      <div class="event-form__header">
        <q-btn flat round dense icon="close" color="grey-5" @click="isOpen = false" />
        <span class="event-form__title">{{ isEditing ? 'Editar Evento' : 'Novo Evento' }}</span>
      </div>

      <!-- Conectar Google -->
      <div v-if="!isTokenValid" class="event-form__connect">
        <div class="event-form__connect-icon">
          <q-icon name="account_circle" size="44px" color="primary" />
        </div>
        <p>Conecte sua conta Google para gerenciar eventos no calendário</p>
        <q-btn
          unelevated
          color="primary"
          text-color="dark"
          icon="login"
          label="Conectar com Google"
          no-caps
          :loading="connectingGoogle"
          @click="handleConnectGoogle"
        />
      </div>

      <!-- Formulário -->
      <q-card-section v-else class="event-form__body">
        <q-input
          v-model="form.title"
          label="Título *"
          dark
          outlined
          class="q-mb-md"
        />

        <q-toggle
          v-model="form.allDay"
          label="Dia inteiro"
          color="primary"
          class="q-mb-sm"
        />

        <q-input
          v-model="form.date"
          label="Data *"
          dark
          outlined
          type="date"
          class="q-mb-md"
        />

        <div v-if="!form.allDay" class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-input
              v-model="form.startTime"
              label="Início"
              dark
              outlined
              type="time"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.endTime"
              label="Fim"
              dark
              outlined
              type="time"
            />
          </div>
        </div>

        <q-input
          v-model="form.location"
          label="Local"
          dark
          outlined
          class="q-mb-md"
        >
          <template #append>
            <q-btn flat round dense icon="map" color="primary" @click="mapPickerOpen = true">
              <q-tooltip>Selecionar no mapa</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <q-input
          v-model="form.description"
          label="Descrição"
          dark
          outlined
          type="textarea"
          :rows="3"
          autogrow
          class="q-mb-md"
        />

        <q-input
          v-model="form.imageUrl"
          label="URL da foto de capa (opcional)"
          dark
          outlined
          hint="Cole aqui o link direto de uma imagem"
          :rules="[v => !v || v.startsWith('http') || 'Informe uma URL válida']"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-input>

        <div v-if="form.imageUrl" class="event-form__cover-preview q-mt-sm">
          <img :src="form.imageUrl" @error="form.imageUrl = ''" />
        </div>
      </q-card-section>

      <!-- Ações -->
      <q-card-actions v-if="isTokenValid" class="event-form__actions q-px-lg q-pb-lg" vertical>
        <q-btn
          unelevated
          color="primary"
          text-color="dark"
          :label="isEditing ? 'Salvar alterações' : 'Criar evento'"
          icon="save"
          class="full-width"
          no-caps
          :loading="saving"
          @click="save"
        />
        <q-btn
          v-if="isEditing"
          outline
          color="red-5"
          label="Excluir evento"
          icon="delete"
          class="full-width q-mt-sm"
          no-caps
          :loading="deleting"
          @click="confirmDelete"
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

  <MapPickerDialog v-model="mapPickerOpen" @selected="form.location = $event" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import { useAdminAuth } from 'src/composables/useAdminAuth'
import { useGoogleCalendar, CALENDAR_ID, saoPauloHHMM, saoPauloDateStr, type CalendarEvent } from 'src/composables/useGoogleCalendar'
import MapPickerDialog from 'src/components/admin/MapPickerDialog.vue'

defineOptions({ name: 'AdminEventForm' })

const $q = useQuasar()
const isOpen = defineModel<boolean>({ required: true })

const props = defineProps<{
  evento?: CalendarEvent | null
}>()

const emit = defineEmits<{ saved: [] }>()

const { isTokenValid, accessToken, connectGoogle } = useAdminAuth()
const { refetch } = useGoogleCalendar()

const mapPickerOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const connectingGoogle = ref(false)

const isEditing = computed(() => !!props.evento?.id)

interface EventForm {
  title: string
  allDay: boolean
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  imageUrl: string
}

function defaultForm(): EventForm {
  return {
    title: '',
    allDay: false,
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '20:00',
    endTime: '23:00',
    location: '',
    description: '',
    imageUrl: '',
  }
}

function fromEvento(evento: CalendarEvent): EventForm {
  if (evento.allDay) {
    return {
      title: evento.title,
      allDay: true,
      date: evento.start.substring(0, 10),
      startTime: '08:00',
      endTime: '12:00',
      location: evento.location,
      description: evento.description,
      imageUrl: evento.imageUrl ?? '',
    }
  }
  return {
    title: evento.title,
    allDay: false,
    date: saoPauloDateStr(evento.start),
    startTime: saoPauloHHMM(evento.start),
    endTime: saoPauloHHMM(evento.end || evento.start),
    location: evento.location,
    description: evento.description,
    imageUrl: evento.imageUrl ?? '',
  }
}

const form = ref<EventForm>(defaultForm())

watch(
  () => props.evento,
  (evento) => {
    form.value = evento ? fromEvento(evento) : defaultForm()
  },
  { immediate: true },
)

watch(isOpen, (val) => {
  if (val && !props.evento) {
    form.value = defaultForm()
  }
})

async function handleConnectGoogle() {
  connectingGoogle.value = true
  try {
    await connectGoogle()
  } catch {
    $q.notify({ type: 'negative', message: 'Falha ao conectar com Google' })
  } finally {
    connectingGoogle.value = false
  }
}

function buildBody() {
  if (form.value.allDay) {
    const d = new Date(form.value.date + 'T12:00:00')
    const nextDay = new Date(d)
    nextDay.setDate(nextDay.getDate() + 1)
    return {
      summary: form.value.title,
      description: form.value.description,
      location: form.value.location,
      start: { date: form.value.date },
      end: { date: format(nextDay, 'yyyy-MM-dd') },
      extendedProperties: { shared: { imageUrl: form.value.imageUrl } },
    }
  }
  return {
    summary: form.value.title,
    description: form.value.description,
    location: form.value.location,
    start: { dateTime: `${form.value.date}T${form.value.startTime}:00`, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: `${form.value.date}T${form.value.endTime}:00`, timeZone: 'America/Sao_Paulo' },
    extendedProperties: { shared: { imageUrl: form.value.imageUrl } },
  }
}

async function save() {
  if (!form.value.title.trim()) {
    $q.notify({ type: 'warning', message: 'Informe o título do evento' })
    return
  }
  if (!form.value.date) {
    $q.notify({ type: 'warning', message: 'Informe a data do evento' })
    return
  }

  saving.value = true
  try {
    const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`
    const url = isEditing.value ? `${base}/${props.evento?.id}` : base
    const method = isEditing.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildBody()),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).error?.message ?? `Erro ${res.status}`)
    }

    $q.notify({ type: 'positive', message: isEditing.value ? 'Evento atualizado!' : 'Evento criado!' })
    emit('saved')
    refetch()
    isOpen.value = false
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message ?? 'Erro ao salvar evento' })
  } finally {
    saving.value = false
  }
}

function confirmDelete() {
  $q.dialog({
    title: 'Excluir evento',
    message: `Deseja excluir "${props.evento?.title}"?`,
    cancel: { flat: true, label: 'Cancelar', color: 'grey-5' },
    ok: { unelevated: true, label: 'Excluir', color: 'red-5', noCaps: true },
    dark: true,
  }).onOk(deleteEvent)
}

async function deleteEvent() {
  deleting.value = true
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${props.evento?.id}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken.value}` },
    })
    if (!res.ok && res.status !== 204) {
      throw new Error(`Erro ${res.status}`)
    }
    $q.notify({ type: 'positive', message: 'Evento excluído!' })
    emit('saved')
    refetch()
    isOpen.value = false
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message ?? 'Erro ao excluir evento' })
  } finally {
    deleting.value = false
  }
}
</script>

<style lang="scss" scoped>
.event-form {
  background-color: #1c1c1c;
  color: #fff;
  display: flex;
  flex-direction: column;

  &--desktop {
    min-width: 440px;
    max-width: 520px;
    border-radius: 16px !important;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #2a2a2a;
    background-color: #111111;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #e1ac26;
  }

  &__connect {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 40px 28px;
    text-align: center;

    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);
      margin: 0;
      line-height: 1.5;
    }
  }

  &__connect-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(225, 172, 38, 0.08);
    border: 1px solid rgba(225, 172, 38, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px 8px;
  }

  &__actions {
    border-top: 1px solid #2a2a2a;
    padding-top: 16px;
  }

  &__cover-preview {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #2a2a2a;
    max-height: 140px;

    img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      display: block;
    }
  }
}
</style>
