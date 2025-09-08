# Configurare Detaliată OAuth pentru Dezvoltare Locală

## Problema

Aplicația redirecționează către `autoconta.lovable.app` în loc de `localhost:8081` din cauza configurărilor OAuth în Supabase și Google Cloud Console.

## Soluție Completă

### 1. Configurare Supabase Dashboard

1. Accesează [Supabase Dashboard](https://supabase.com/dashboard)
2. Selectează proiectul `ytjdvoyyiapkyzjrjllp`
3. Mergi la **Authentication** > **URL Configuration**
4. Actualizează următoarele setări:
   - **Site URL**: `http://localhost:8081`
   - **Redirect URLs**: `http://localhost:8081/**`
5. Salvează modificările

![Supabase URL Configuration](https://i.imgur.com/example1.png)

### 2. Configurare Google Cloud Console

1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Selectează proiectul tău
3. Mergi la **APIs & Services** > **Credentials**
4. Găsește OAuth 2.0 Client ID-ul folosit pentru aplicație
5. Editează și actualizează:
   - **Authorized JavaScript origins**: 
     - `http://localhost:8081`
     - `https://autoconta.lovable.app` (păstrează această valoare pentru producție)
   - **Authorized redirect URIs**:
     - `https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback`

![Google Cloud OAuth Configuration](https://i.imgur.com/example2.png)

### 3. Verificare Configurare

1. Salvează toate modificările
2. Așteaptă 5-10 minute pentru propagarea modificărilor
3. Testează autentificarea pe `http://localhost:8081`

## Soluții Alternative pentru Dezvoltare

Dacă nu poți configura OAuth imediat, poți folosi aceste metode alternative:

### 1. Autentificare cu Email și Parolă

Poți folosi autentificarea cu email și parolă în loc de Google OAuth:

```
Email: test@autoconta.ro
Parola: test123
```

Sau poți crea un cont nou folosind orice email și parolă.

### 2. Butonul "Test cu utilizator demo"

Aplicația include un buton "Test cu utilizator demo" care va încerca să se autentifice cu contul de test sau să creeze unul dacă nu există.

## Depanare

### Problema: Redirecționare continuă către producție

1. Verifică console-ul browser-ului pentru erori
2. Asigură-te că toate URL-urile sunt configurate corect
3. Curăță cache-ul browser-ului și cookie-urile
4. Testează în modul incognito
5. Verifică dacă modificările în Supabase și Google Cloud s-au propagat (poate dura până la 10 minute)

### Problema: Erori de autentificare

1. Verifică log-urile din consola browser-ului
2. Asigură-te că Supabase API Key-ul este corect
3. Verifică că URL-ul de callback din Google Cloud Console este exact același cu cel din Supabase

## Revenire la Configurarea de Producție

Când ești gata să revii la configurarea de producție:

1. În Supabase Dashboard:
   - **Site URL**: `https://autoconta.lovable.app`
   - **Redirect URLs**: `https://autoconta.lovable.app/**`

2. În Google Cloud Console, asigură-te că ai păstrat:
   - **Authorized JavaScript origins**: `https://autoconta.lovable.app`
   - **Authorized redirect URIs**: `https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback`

## Modificări de Cod Implementate

Am implementat următoarele modificări pentru a gestiona mai bine redirecționările:

1. În `App.tsx`: Detectarea și redirecționarea automată de la producție la localhost
2. În `useAuth.ts`: Utilizarea URL-urilor relative pentru redirecționare

Aceste modificări vor ajuta la dezvoltarea locală, dar configurarea corectă a OAuth rămâne necesară pentru funcționarea completă.