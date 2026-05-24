# PRIME Fit — Guia de Deploy para App Store e Google Play

## Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Conta Expo: https://expo.dev
- Conta Apple Developer ($99/ano) para iOS
- Conta Google Play Console ($25 taxa única) para Android

---

## 1. Configuração Inicial

```bash
# Instalar dependências
npm install

# Login na conta Expo
eas login

# Configurar projeto EAS (gera projectId único)
eas init

# Atualizar app.json com seu projectId gerado
```

---

## 2. Assets do App

Substitua os placeholders em `/assets/`:

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `icon.png` | 1024×1024 | App icon iOS/Android |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon |
| `splash.png` | 2048×2048 | Splash screen |
| `notification-icon.png` | 96×96 | Ícone de notificação Android |

**Dica:** Use a ferramenta [Expo App Icon Generator](https://www.appicon.co/) para gerar todos os tamanhos.

---

## 3. Configuração iOS

### Certificados (via EAS — automático)
```bash
# EAS gerencia certificados automaticamente
eas credentials --platform ios
```

### Bundle ID
No `app.json`, altere `ios.bundleIdentifier`:
```json
"bundleIdentifier": "com.suaempresa.primefit"
```

### Build de desenvolvimento (simulador)
```bash
npm run android  # ou
eas build --platform ios --profile development
```

### Build de produção
```bash
eas build --platform ios --profile production
```

---

## 4. Configuração Android

### Keystore (via EAS — automático)
```bash
eas credentials --platform android
```

### Package name
No `app.json`, altere `android.package`:
```json
"package": "com.suaempresa.primefit"
```

### Build APK (teste)
```bash
eas build --platform android --profile preview
```

### Build AAB (produção)
```bash
eas build --platform android --profile production
```

---

## 5. Variáveis de Ambiente

Crie `.env` (não versionar):
```env
APP_ENV=development
```

Para produção, configure em `eas.json` > `build.production.env`.

---

## 6. Submissão para as Lojas

### App Store (iOS)
```bash
# Configurar em eas.json:
# submit.production.ios.appleId, ascAppId, appleTeamId

eas submit --platform ios --profile production
```

**No App Store Connect:**
1. Criar novo app com mesmo Bundle ID
2. Preencher metadados, screenshots, descrição
3. Enviar para revisão

### Google Play (Android)
```bash
# Gerar Service Account Key:
# Google Play Console → Setup → API access → Create service account
# Salvar JSON como google-play-service-account.json

eas submit --platform android --profile production
```

**No Google Play Console:**
1. Criar novo app
2. Preencher ficha da loja
3. Enviar para internal testing → closed testing → production

---

## 7. OTA Updates (sem submissão nova)

Para updates de JS sem precisar resubmeter:
```bash
eas update --branch production --message "Fix: descrição da mudança"
```

---

## 8. Checklist Pré-Lançamento

- [ ] Substituir assets placeholder (icon, splash)
- [ ] Configurar Bundle ID / Package Name únicos
- [ ] Configurar `eas.json` com credenciais reais
- [ ] Adicionar Google Services (`google-services.json` para Android)
- [ ] Testar em device físico iOS e Android
- [ ] Testar notificações push em device físico
- [ ] Revisar permissões no `app.json`
- [ ] Configurar Privacy Policy URL
- [ ] Screenshots para as lojas (6.5" iPhone, iPad, Android)
- [ ] Descrição do app em pt-BR

---

## 9. Desenvolvimento Local

```bash
# Iniciar servidor Expo
npm start

# Escanear QR code com Expo Go (iOS/Android)
# ou pressionar 'i' para simulador iOS
# ou pressionar 'a' para emulador Android
```

---

## 10. Estrutura do Projeto

```
prime/
├── App.tsx                    # Entry point
├── app.json                   # Expo config
├── eas.json                   # EAS Build config
├── package.json
├── assets/                    # App assets
└── src/
    ├── constants/
    │   ├── theme.ts           # Cores, espaçamento
    │   └── splits.ts          # Treinos ABAC
    ├── types/index.ts         # TypeScript types
    ├── store/useAppStore.ts   # Estado global (Zustand)
    ├── utils/
    │   ├── notifications.ts   # Push notifications
    │   └── dateUtils.ts       # Helpers de data
    ├── navigation/
    │   └── TabNavigator.tsx   # Navegação por tabs
    ├── screens/
    │   ├── HojeScreen.tsx     # Dashboard
    │   ├── TreinoScreen.tsx   # Treino ABAC
    │   ├── DietaScreen.tsx    # Nutrição
    │   ├── JejumScreen.tsx    # Jejum intermitente
    │   └── StatsScreen.tsx    # Progresso e fotos
    └── components/
        ├── RingProgress.tsx   # Anel de progresso SVG
        ├── RestTimerModal.tsx # Timer de descanso
        ├── CheckInCard.tsx    # Check-in diário
        └── HeatmapGrid.tsx    # Mapa de consistência
```
