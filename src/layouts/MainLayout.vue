<template>
  <q-layout view="lHh lpr lFf" class="layout-dark">

    <q-header class="layout-header" elevated>
      <q-toolbar class="layout-toolbar">
        <img
          src="~assets/Logo.png"
          alt="Boi Estrela"
          class="layout-logo"
          @mousedown="onLogoPress"
          @mouseup="onLogoRelease"
          @mouseleave="onLogoRelease"
          @touchstart.prevent="onLogoPress"
          @touchend="onLogoRelease"
          @touchcancel="onLogoRelease"
        />
        <div class="layout-title">
          <span class="layout-title__main">Boi Estrela</span>
          <span class="layout-title__sub">Calendário de Apresentações</span>
        </div>

        <!-- Indicador admin -->
        <q-btn
          v-if="isAdmin"
          flat
          round
          dense
          icon="admin_panel_settings"
          color="primary"
          size="sm"
          @click="confirmLogout"
        >
          <q-tooltip>Sair do modo admin</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="layout-footer" elevated>
      <q-tabs
        dense
        no-caps
        class="layout-tabs"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-route-tab to="/" exact name="calendario" icon="calendar_month" label="Calendário" class="layout-tab" />
        <q-route-tab to="/proximas" name="proximas" icon="event_available" label="Próximas" class="layout-tab" />
        <q-route-tab to="/historico" name="historico" icon="history" label="Histórico" class="layout-tab" />
        <q-route-tab to="/sobre" name="sobre" icon="info_outline" label="Sobre" class="layout-tab" />
      </q-tabs>
    </q-footer>

    <!-- FAB Admin -->
    <div v-if="isAdmin" class="admin-fab">
      <q-btn
        round
        unelevated
        color="primary"
        text-color="dark"
        icon="add"
        size="lg"
        @click="formOpen = true"
      >
        <q-tooltip anchor="top middle" self="bottom middle">Novo evento</q-tooltip>
      </q-btn>
    </div>

    <AdminPinDialog v-model="pinDialogOpen" />
    <AdminEventForm v-model="formOpen" :evento="null" />

  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminAuth } from 'src/composables/useAdminAuth'
import AdminPinDialog from 'src/components/admin/AdminPinDialog.vue'
import AdminEventForm from 'src/components/admin/AdminEventForm.vue'

defineOptions({ name: 'MainLayout' })

const $q = useQuasar()
const { isAdmin, logout } = useAdminAuth()

function confirmLogout() {
  $q.dialog({
    title: 'Sair do modo admin',
    message: 'Deseja encerrar o acesso administrativo?',
    cancel: { flat: true, label: 'Cancelar', color: 'grey-5' },
    ok: { unelevated: true, label: 'Sair', color: 'red-5', noCaps: true },
    dark: true,
  }).onOk(logout)
}
const pinDialogOpen = ref(false)
const formOpen = ref(false)

let pressTimer: ReturnType<typeof setTimeout> | null = null

function onLogoPress() {
  pressTimer = setTimeout(() => {
    if (!isAdmin.value) {
      pinDialogOpen.value = true
    }
  }, 3000)
}

function onLogoRelease() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}
</script>

<style lang="scss" scoped>
.layout-dark {
  background-color: #111111;
}

.layout-header {
  background-color: #111111;
  border-bottom: 1px solid #2a2a2a;
}

.layout-toolbar {
  padding: 8px 16px;
  min-height: 60px;
  gap: 12px;
}

.layout-logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
  flex-shrink: 0;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.layout-title {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  flex: 1;

  &__main {
    font-size: 17px;
    font-weight: 700;
    color: #e1ac26;
    letter-spacing: 0.3px;
  }

  &__sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 0.2px;
  }
}

.layout-footer {
  background-color: #111111;
  border-top: 1px solid #2a2a2a;
  padding-bottom: env(safe-area-inset-bottom);
}

.layout-tabs {
  height: 58px;
  background-color: #111111;
  color: rgba(255, 255, 255, 0.4);
}

.layout-tab {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.admin-fab {
  position: fixed;
  bottom: calc(76px + env(safe-area-inset-bottom));
  right: 16px;
  z-index: 2000;
}
</style>
