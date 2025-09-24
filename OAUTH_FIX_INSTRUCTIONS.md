# Instrucțiuni pentru Rezolvarea Erorii 404 la Autentificare

## Problema Identificată
Eroarea 404 la autentificare apare din cauza configurării OAuth în Supabase Dashboard care redirecționează către `autoconta.lovable.app` în loc de `localhost:8080`.

## Soluție - Configurare Supabase Dashboard

### Pasul 1: Accesează Supabase Dashboard
1. Deschide [Supabase Dashboard](https://supabase.com/dashboard)
2. Selectează proiectul `ytjdvoyyiapkyzjrjllp`

### Pasul 2: Configurează URL-urile de Autentificare
1. Mergi la **Authentication** → **URL Configuration**
2. Actualizează următoarele setări:
   - **Site URL**: `http://localhost:8080`
   - **Redirect URLs**: `http://localhost:8080/**`
3. Salvează modificările

### Pasul 3: Configurare Google OAuth (Opțional)
Dacă folosești autentificare Google:
1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Mergi la **APIs & Services** → **Credentials**
3. Editează OAuth 2.0 Client ID
4. Adaugă în **Authorized JavaScript origins**:
   - `http://localhost:8080`
5. Asigură-te că **Authorized redirect URIs** conține:
   - `https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback`

## Modificări de Cod Implementate

Am actualizat următoarele funcții în `src/hooks/useAuth.ts`:

1. **signInWithGoogle()**: Folosește `http://localhost:8080/` pentru dezvoltare locală
2. **signUp()**: Folosește același URL pentru confirmarea email-ului

## Testare

După configurarea Supabase Dashboard:
1. Așteaptă 5-10 minute pentru propagarea modificărilor
2. Reîncarcă aplicația pe `http://localhost:8080`
3. Testează autentificarea cu email/parolă sau Google OAuth

## Revenire la Producție

Când ești gata să revii la producție, actualizează în Supabase Dashboard:
- **Site URL**: `https://autoconta.lovable.app`
- **Redirect URLs**: `https://autoconta.lovable.app/**`

## Note Importante

- Modificările în Supabase Dashboard pot dura până la 10 minute să se propage
- Curăță cache-ul browser-ului după modificări
- Testează în modul incognito pentru a evita cache-ul
- Verifică console-ul browser-ului pentru log-uri de debugging

## Status Implementare

✅ Identificată cauza erorii 404  
✅ Actualizate funcțiile de autentificare în cod  
⏳ Necesită configurare manuală în Supabase Dashboard  
⏳ Testare după configurare