# Configurare OAuth pentru Dezvoltare Locală

## Problema
Aplicația redirecționează către `autoconta.lovable.app` în loc de `localhost:8080` din cauza configurărilor OAuth.

## Soluție

### 1. Configurare Supabase Dashboard

1. Accesează [Supabase Dashboard](https://supabase.com/dashboard)
2. Selectează proiectul `ytjdvoyyiapkyzjrjllp`
3. Mergi la **Authentication** > **URL Configuration**
4. Actualizează următoarele setări:
   - **Site URL**: `http://localhost:8080`
   - **Redirect URLs**: `http://localhost:8080/**`

### 2. Configurare Google Cloud Console

1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Selectează proiectul tău
3. Mergi la **APIs & Services** > **Credentials**
4. Găsește OAuth 2.0 Client ID-ul folosit pentru aplicație
5. Editează și actualizează:
   - **Authorized JavaScript origins**: 
     - `http://localhost:8080`
     - `https://autoconta.lovable.app` (pentru producție)
   - **Authorized redirect URIs**:
     - `https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback`

### 3. Verificare Configurare

1. Salvează toate modificările
2. Așteaptă 5-10 minute pentru propagarea modificărilor
3. Testează autentificarea pe `http://localhost:8080`

## Note Importante

- Pentru producție, revenește la configurările originale:
  - Site URL: `https://autoconta.lovable.app`
  - Redirect URLs: `https://autoconta.lovable.app/**`

- Aplicația va afișa o alertă dacă detectează redirecționarea către Lovable

## Debugging

Dacă problema persistă:
1. Verifică console-ul browser-ului pentru log-uri
2. Verifică că toate URL-urile sunt configurate corect
3. Curăță cache-ul browser-ului
4. Testează în modul incognito