<template>
  <q-page class="sobre-page">

    <!-- Hero -->
    <div class="sobre-hero">
      <div class="sobre-hero__glow" />
      <img src="~assets/Logo.png" alt="Boi Estrela" class="sobre-hero__logo" />
      <h1 class="sobre-hero__title">Boi Estrela</h1>
      <p class="sobre-hero__subtitle">Tradição, cultura e alegria</p>
    </div>

    <!-- Conteúdo -->
    <div class="sobre-content">

      <div class="sobre-section">
        <div class="sobre-section__icon">
          <q-icon name="auto_awesome" color="primary" size="22px" />
        </div>
        <div class="sobre-section__body">
          <h3 class="sobre-section__title">Sobre o Grupo</h3>
          <p class="sobre-section__text">
            O Boi Estrela é um grupo de bumba meu boi que carrega a tradição cultural e folclórica
            da nossa região, levando alegria, cor e música para toda a comunidade.
          </p>
        </div>
      </div>

      <div class="sobre-divider" />

      <div class="sobre-section">
        <div class="sobre-section__icon">
          <q-icon name="calendar_month" color="primary" size="22px" />
        </div>
        <div class="sobre-section__body">
          <h3 class="sobre-section__title">Apresentações</h3>
          <p class="sobre-section__text">
            Acompanhe o calendário completo de apresentações e fique por dentro de todos os eventos.
            Confira as próximas datas na aba <strong>Próximas</strong>.
          </p>
        </div>
      </div>

      <div class="sobre-divider" />

      <div class="sobre-section">
        <div class="sobre-section__icon">
          <q-icon name="place" color="primary" size="22px" />
        </div>
        <div class="sobre-section__body">
          <h3 class="sobre-section__title">Localização</h3>
          <p class="sobre-section__text">
            As apresentações acontecem em diferentes locais. O endereço completo de cada evento
            está disponível ao clicar em qualquer apresentação no calendário.
          </p>
        </div>
      </div>

    </div>

    <!-- Redes Sociais -->
    <div class="sobre-social">
      <p class="sobre-social__label">Siga o Boi Estrela</p>
      <div class="sobre-social__links">

        <a
          href="https://www.facebook.com/boiestreladomonte"
          target="_blank"
          class="sobre-social__btn sobre-social__btn--facebook"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </a>

        <a
          href="https://www.instagram.com/boiestreladomonte/"
          target="_blank"
          class="sobre-social__btn sobre-social__btn--instagram"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <span>Instagram</span>
        </a>

      </div>
    </div>

    <!-- Footer info -->
    <div class="sobre-footer">
      <p class="sobre-footer__text">
        Desenvolvido com ❤️ por <a href="https://www.instagram.com/jardel_fernandes98/" target="_blank" class="sobre-footer__link">Jardel Fernandes</a>
      </p>
      <div class="sobre-footer__stars">
        <q-icon name="star" color="primary" size="12px" v-for="i in 5" :key="i" />
      </div>
    </div>

  </q-page>
</template>

<script setup lang="ts">
defineOptions({ name: 'SobrePage' })
</script>

<style lang="scss" scoped>
.sobre-page {
  background-color: #111111;
  min-height: 100vh;
}

.sobre-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 40px;
  overflow: hidden;
  background: linear-gradient(180deg, #1c1c1c 0%, #111111 100%);
  border-bottom: 1px solid #2a2a2a;

  &__glow {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(225, 172, 38, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  &__logo {
    width: 90px;
    height: 90px;
    object-fit: contain;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 20px rgba(225, 172, 38, 0.3));
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
    color: #e1ac26;
    margin: 16px 0 4px;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
  }

  &__subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
  }
}

.sobre-content {
  padding: 8px 0;
}

.sobre-section {
  display: flex;
  gap: 16px;
  padding: 22px 20px;
  align-items: flex-start;

  &__icon {
    flex-shrink: 0;
    margin-top: 2px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(225, 172, 38, 0.1);
    border-radius: 10px;
  }

  &__body {
    flex: 1;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px;
  }

  &__text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.6;
    margin: 0;

    strong {
      color: #e1ac26;
      font-weight: 600;
    }
  }
}

.sobre-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #2a2a2a, transparent);
  margin: 0 20px;
}

.sobre-social {
  padding: 24px 20px;
  border-top: 1px solid #1e1e1e;

  &__label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    margin: 0 0 14px;
    text-align: center;
  }

  &__links {
    display: flex;
    gap: 12px;
  }

  &__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.15s;

    &:active { opacity: 0.75; }

    &--facebook {
      background-color: #1877f2;
      color: #fff;
    }

    &--instagram {
      background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
      color: #fff;
    }
  }
}

.sobre-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 24px 40px;
  border-top: 1px solid #1e1e1e;
  margin-top: 8px;

  &__text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.25);
    margin: 0;
    letter-spacing: 0.3px;
  }

  &__stars {
    display: flex;
    gap: 4px;
  }
}
</style>
