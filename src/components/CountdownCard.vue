<template>
  <div v-if="proximoEvento" class="countdown" @click="emit('click', proximoEvento)">
    <div class="countdown__label">
      <q-icon name="star" size="12px" />
      <span>Próxima Apresentação</span>
      <q-icon name="star" size="12px" />
    </div>

    <p class="countdown__title">{{ proximoEvento.title }}</p>
    <p class="countdown__date">{{ dataFormatada }}</p>

    <div class="countdown__timer" v-if="!passou">
      <div class="countdown__unit">
        <span class="countdown__value">{{ pad(dias) }}</span>
        <span class="countdown__unit-label">dias</span>
      </div>
      <span class="countdown__sep">:</span>
      <div class="countdown__unit">
        <span class="countdown__value">{{ pad(horas) }}</span>
        <span class="countdown__unit-label">horas</span>
      </div>
      <span class="countdown__sep">:</span>
      <div class="countdown__unit">
        <span class="countdown__value">{{ pad(minutos) }}</span>
        <span class="countdown__unit-label">min</span>
      </div>
      <span class="countdown__sep">:</span>
      <div class="countdown__unit">
        <span class="countdown__value">{{ pad(segundos) }}</span>
        <span class="countdown__unit-label">seg</span>
      </div>
    </div>

    <div class="countdown__hoje" v-else>
      <q-icon name="celebration" size="18px" />
      <span>É hoje!</span>
    </div>

    <div class="countdown__hint">
      <q-icon name="touch_app" size="13px" />
      <span>Toque para ver detalhes</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { parseISO, format, differenceInSeconds } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CalendarEvent } from 'src/composables/useGoogleCalendar'

defineOptions({ name: 'CountdownCard' })

const props = defineProps<{
  proximoEvento: CalendarEvent | null
}>()

const emit = defineEmits<{
  click: [evento: CalendarEvent]
}>()

const agora = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    agora.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const dataFormatada = computed(() => {
  if (!props.proximoEvento?.start) return ''
  try {
    const d = parseISO(props.proximoEvento.start)
    if (props.proximoEvento.allDay) {
      return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
    return format(d, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return ''
  }
})

const diffSegundos = computed(() => {
  if (!props.proximoEvento?.start) return 0
  try {
    return differenceInSeconds(parseISO(props.proximoEvento.start), agora.value)
  } catch {
    return 0
  }
})

const passou = computed(() => diffSegundos.value <= 0)

const dias = computed(() => Math.floor(diffSegundos.value / 86400))
const horas = computed(() => Math.floor((diffSegundos.value % 86400) / 3600))
const minutos = computed(() => Math.floor((diffSegundos.value % 3600) / 60))
const segundos = computed(() => diffSegundos.value % 60)

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0')
}
</script>

<style lang="scss" scoped>
.countdown {
  position: relative;
  margin: 12px 16px;
  padding: 18px 20px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e1700 0%, #2a2000 50%, #1c1c1c 100%);
  border: 1px solid rgba(225, 172, 38, 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(225, 172, 38, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  &:active {
    border-color: rgba(225, 172, 38, 0.6);
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #e1ac26;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 4px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 16px;
    text-transform: capitalize;
  }

  &__timer {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(225, 172, 38, 0.1);
    border-radius: 8px;
    padding: 6px 10px;
    min-width: 52px;
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: #e1ac26;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__unit-label {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: 3px;
  }

  &__sep {
    font-size: 20px;
    font-weight: 700;
    color: rgba(225, 172, 38, 0.4);
    margin-bottom: 12px;
  }

  &__hoje {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e1ac26;
    font-size: 18px;
    font-weight: 700;
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.25);
  }
}
</style>
