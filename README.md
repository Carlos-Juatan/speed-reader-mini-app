# Speed Reader Mini App 🚀

Aplicativo móvel de leitura dinâmica desenvolvido com **React Native** e **Expo**, utilizando a técnica **RSVP (Rapid Serial Visual Presentation)** com alinhamento pelo Ponto Ótimo de Reconhecimento (**ORP - Optimal Recognition Point**).

---

## 📋 Sumário
1. [Códigos de Uso e Comandos Gerais](#1-códigos-de-uso-e-comandos-gerais)
2. [Sincronização entre Pastas (Principal e Cópia de Build)](#2-sincronização-entre-pastas-principal-e-cópia-de-build)
3. [Como Rodar no Expo Go](#3-como-rodar-no-expo-go)
4. [Como Criar o APK de Produção (Release)](#4-como-criar-o-apk-de-produção-release)
5. [Onde o APK Fica Salvo](#5-onde-o-apk-fica-salvo)

---

## 1. Códigos de Uso e Comandos Gerais

### Instalação de Dependências
Caso precise restaurar os pacotes do projeto:
```bash
npm install
```

### Iniciar o Servidor de Desenvolvimento (Metro Bundler)
```bash
npm start
```

### Iniciar Limpando o Cache do Metro
Recomendado caso faça alterações e não veja o reflexo imediato:
```bash
npm start -- --clear
```

### Outros Scripts Disponíveis no `package.json`
- **Android:** `npm run android`
- **iOS:** `npm run ios`
- **Web:** `npm run web`

---

## 2. Sincronização entre Pastas (Principal e Cópia de Build)

> **Contexto:**  
> - **Diretório Principal (Dados):** `/mnt/D_DADOS/02_Projetos_Ativos/daily_user/speed-reader-mini-app`  
> - **Cópia de Trabalho/Build:** `/home/carj-home/speed-reader-mini-app`  
>  
> *Por que existe a cópia?* No Linux, compilações nativas do Android (Gradle, NDK, symlinks) e scripts de build possuem melhor desempenho e total compatibilidade de permissões na partição nativa (`ext4` na `home`), evitando limitações de sistemas de arquivos externos/NTFS.

### Sincronizar da Pasta Principal para a Cópia (Recomendado antes de rodar o build)

Execute no terminal:
```bash
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.expo' \
  --exclude='android/build' \
  --exclude='android/app/build' \
  --exclude='android/.gradle' \
  /mnt/D_DADOS/02_Projetos_Ativos/daily_user/speed-reader-mini-app/ \
  /home/carj-home/speed-reader-mini-app/
```

### Atalho Rápido (Sincronizar apenas o código-fonte `src` e `App.tsx`):
```bash
cp -r /mnt/D_DADOS/02_Projetos_Ativos/daily_user/speed-reader-mini-app/src /home/carj-home/speed-reader-mini-app/
cp /mnt/D_DADOS/02_Projetos_Ativos/daily_user/speed-reader-mini-app/App.tsx /home/carj-home/speed-reader-mini-app/
```

### Sincronizar de Volta (Cópia para a Pasta Principal):
Se você alterar código diretamente na pasta `~/speed-reader-mini-app` e quiser trazer para a pasta de dados:
```bash
rsync -av \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.expo' \
  --exclude='android/build' \
  --exclude='android/app/build' \
  --exclude='android/.gradle' \
  /home/carj-home/speed-reader-mini-app/ \
  /mnt/D_DADOS/02_Projetos_Ativos/daily_user/speed-reader-mini-app/
```

---

## 3. Como Rodar no Expo Go

Para testar o aplicativo diretamente no celular via **Expo Go** (sem precisar compilar APK):

1. **Inicie o Expo no terminal:**
   ```bash
   npx expo start
   ```
   *(ou `npx expo start --clear` para limpar o cache)*

2. **Se o computador e o celular estiverem em redes Wi-Fi diferentes ou houver firewall:**
   ```bash
   npx expo start --tunnel
   ```

3. **No seu smartphone:**
   - Abra o app **Expo Go** (Android ou iOS).
   - Aponte a câmera para o QR Code gerado no terminal (ou no Android use a opção *"Scan QR code"* dentro do Expo Go).

---

## 4. Como Criar o APK de Produção (Release)

Este processo cria um instalador `.apk` autônomo (não necessita de computador, cabo ou Metro Bundler ativo após a instalação).

### Passo 1: Gerar a pasta nativa do Android (se necessário)
Caso a pasta `android` ainda não tenha sido gerada pelo Expo:
```bash
cd ~/speed-reader-mini-app
npx expo prebuild --platform android
```

### Passo 2: Compilar o APK com o Gradle
Acesse a pasta `android` na sua cópia de trabalho e execute a compilação informando o caminho do Android SDK:

```bash
cd ~/speed-reader-mini-app/android
ANDROID_HOME=/home/carj-home/Android/Sdk ./gradlew assembleRelease
```

#### Dica para evitar falhas de memória ou travamento do Gradle Daemon:
Caso o processo termine com `Gradle daemon disappeared` ou falta de memória RAM:
```bash
cd ~/speed-reader-mini-app/android
./gradlew --stop
ANDROID_HOME=/home/carj-home/Android/Sdk ./gradlew assembleRelease --no-daemon --max-workers=1
```

---

## 5. Onde o APK Fica Salvo

Após a conclusão bem-sucedida do comando `assembleRelease`, o APK estará disponível em:

- **Caminho Relativo:**  
  `android/app/build/outputs/apk/release/app-release.apk`

- **Caminho Absoluto na Cópia de Build:**  
  `/home/carj-home/speed-reader-mini-app/android/app/build/outputs/apk/release/app-release.apk`

### Como copiar para a sua pasta Downloads (facilitar transferência):
```bash
cp /home/carj-home/speed-reader-mini-app/android/app/build/outputs/apk/release/app-release.apk ~/Downloads/
```

Agora basta enviar o arquivo `app-release.apk` para o celular (via cabo USB, Telegram, WhatsApp Web, Google Drive, etc.) e instalar diretamente no Android.
