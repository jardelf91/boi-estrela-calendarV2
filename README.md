# 🌟 Boi Estrela — Calendário de Apresentações

Aplicativo web progressivo (PWA) para acompanhar as apresentações do **Boi Estrela**, com integração ao Google Calendar.

## ✨ Funcionalidades

- **Calendário mensal** com visualização de eventos e destaque para o dia atual
- **Próximas apresentações** com countdown em tempo real
- **Histórico** de apresentações realizadas
- **Detalhes do evento** com mapa integrado e opção de adicionar ao Google Calendar
- **Pull to refresh** em todas as telas
- **PWA** — pode ser instalado no celular como aplicativo
- **Design dark** responsivo, mobile-first

## 🛠 Stack

- [Vue 3](https://vuejs.org/) + [Quasar 2](https://quasar.dev/) + TypeScript
- [FullCalendar v6](https://fullcalendar.io/)
- [Google Calendar API](https://developers.google.com/calendar)
- [date-fns](https://date-fns.org/)

## 🚀 Rodando localmente

```bash
npm install
quasar dev
```

## 📦 Build e deploy

```bash
quasar build -m pwa
npx gh-pages -d dist/pwa
```

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_ADMIN_PIN=seu_pin_aqui
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
```

> O `.env.local` **não é commitado** (está no `.gitignore`).

## 📱 Acesso

O app está disponível em: [jardelf91.github.io/boi-estrela-calendarV2](https://jardelf91.github.io/boi-estrela-calendarV2)
