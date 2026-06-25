<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="pin-dialog">

      <div class="pin-dialog__header">
        <q-icon name="lock" size="26px" color="primary" />
        <span>Acesso Restrito</span>
      </div>

      <!-- Face ID disponível e registrado -->
      <div v-if="showBiometric" class="pin-dialog__biometric">
        <div class="pin-dialog__face-icon">
          <q-icon name="face" size="48px" color="primary" />
        </div>
        <p class="pin-dialog__bio-label">Usar Face ID / biometria</p>
        <q-btn
          unelevated
          color="primary"
          text-color="dark"
          icon="fingerprint"
          label="Autenticar"
          no-caps
          class="full-width"
          :loading="bioLoading"
          @click="doBiometric"
        />
        <q-btn flat label="Usar PIN" color="grey-5" no-caps class="q-mt-sm full-width" @click="showPinInput = true" />
      </div>

      <!-- PIN input -->
      <div v-else class="pin-dialog__body">
        <q-input
          ref="pinRef"
          v-model="pin"
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          label="PIN"
          dark
          outlined
          maxlength="20"
          autofocus
          :error="pinError"
          error-message="PIN incorreto"
          @keyup.enter="submit"
        />

        <div v-if="canOfferBiometric && !hasBio" class="pin-dialog__bio-offer q-mt-md">
          <q-toggle
            v-model="wantRegisterBio"
            label="Registrar Face ID após login"
            color="primary"
            dense
          />
        </div>
      </div>

      <q-card-actions v-if="!showBiometric" class="pin-dialog__actions" align="right">
        <q-btn flat label="Cancelar" color="grey-5" @click="cancel" no-caps />
        <q-btn
          unelevated
          label="Entrar"
          color="primary"
          text-color="dark"
          @click="submit"
          no-caps
          :loading="loading"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  useAdminAuth,
  isBiometricAvailable,
  hasBiometricRegistered,
  registerBiometric,
  authenticateWithBiometric,
} from 'src/composables/useAdminAuth'

defineOptions({ name: 'AdminPinDialog' })

const $q = useQuasar()
const isOpen = defineModel<boolean>({ required: true })
const { validatePin } = useAdminAuth()

const pin = ref('')
const pinError = ref(false)
const loading = ref(false)
const bioLoading = ref(false)
const canOfferBiometric = ref(false)
const hasBio = ref(false)
const showPinInput = ref(false)
const wantRegisterBio = ref(true)

onMounted(async () => {
  canOfferBiometric.value = await isBiometricAvailable()
  hasBio.value = hasBiometricRegistered()
})

watch(isOpen, (val) => {
  if (val) {
    pin.value = ''
    pinError.value = false
    showPinInput.value = false
    hasBio.value = hasBiometricRegistered()
  }
})

const showBiometric = computed(() => canOfferBiometric.value && hasBio.value && !showPinInput.value)

async function doBiometric() {
  bioLoading.value = true
  try {
    const ok = await authenticateWithBiometric()
    if (ok) {
      isOpen.value = false
    } else {
      $q.notify({ type: 'negative', message: 'Biometria não reconhecida' })
      showPinInput.value = true
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Falha na autenticação biométrica' })
    showPinInput.value = true
  } finally {
    bioLoading.value = false
  }
}

async function submit() {
  pinError.value = false
  loading.value = true

  await new Promise((r) => setTimeout(r, 300))

  const ok = validatePin(pin.value)
  loading.value = false

  if (!ok) {
    pinError.value = true
    pin.value = ''
    return
  }

  if (wantRegisterBio.value && canOfferBiometric.value && !hasBio.value) {
    try {
      await registerBiometric()
      $q.notify({ type: 'positive', message: 'Face ID registrado com sucesso!' })
      hasBio.value = true
    } catch {
      // silently ignore
    }
  }

  pin.value = ''
  isOpen.value = false
}

function cancel() {
  pin.value = ''
  pinError.value = false
  showPinInput.value = false
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.pin-dialog {
  background-color: #1c1c1c;
  color: #fff;
  min-width: 300px;
  border-radius: 16px !important;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 20px 16px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #2a2a2a;
    background: linear-gradient(135deg, #111111 0%, #1a1500 100%);
  }

  &__biometric {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 24px 20px;
    gap: 12px;
  }

  &__face-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(225, 172, 38, 0.1);
    border: 1px solid rgba(225, 172, 38, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__bio-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    text-align: center;
  }

  &__body {
    padding: 24px 20px 8px;
  }

  &__bio-offer {
    display: flex;
    align-items: center;
  }

  &__actions {
    padding: 8px 16px 16px;
  }
}
</style>
