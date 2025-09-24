# Configurare Autentificare Supabase - Ghid Complet

## 📋 Informații Actuale de Configurare

### Configurația Actuală din Cod:
- **Supabase URL**: `https://ytjdvoyyiapkyzjrjllp.supabase.co`
- **Project ID**: `ytjdvoyyiapkyzjrjllp`
- **Mediu Local**: `http://localhost:8080`
- **Mediu Producție**: `https://autoconta.lovable.app`

## 🔧 Pasul 1: Configurare Supabase Dashboard

### Accesează Supabase Dashboard:
1. Mergi la: `https://supabase.com/dashboard/project/ytjdvoyyiapkyzjrjllp`
2. Navighează la **Authentication > URL Configuration**

### Configurații Necesare:

#### Site URL:
- **Pentru dezvoltare**: `http://localhost:8080`
- **Pentru producție**: `https://autoconta.lovable.app`

#### Redirect URLs (adaugă toate acestea):
```
http://localhost:8080/
https://autoconta.lovable.app/
https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback
```

## 🔧 Pasul 2: Configurare Google OAuth

### Accesează Google Cloud Console:
1. Mergi la: [Google Cloud Console](https://console.cloud.google.com/)
2. Navighează la **APIs & Services > Credentials**
3. Editează OAuth 2.0 Client ID

### Configurații Necesare:

#### Authorized JavaScript Origins:
```
http://localhost:8080
https://autoconta.lovable.app
https://ytjdvoyyiapkyzjrjllp.supabase.co
```

#### Authorized Redirect URIs:
```
https://ytjdvoyyiapkyzjrjllp.supabase.co/auth/v1/callback
```

## 🧪 Pasul 3: Testare și Diagnosticare

### Testare Locală:
1. Rulează aplicația: `npm run dev`
2. Deschide consola browser-ului (F12)
3. Testează autentificarea email și Google
4. Verifică log-urile în consolă pentru mesaje de diagnosticare

### Log-uri de Urmărit:
- `🔐 Auth state change` - schimbări în starea de autentificare
- `🔗 Google OAuth redirect URL` - URL-ul de redirect pentru Google
- `🌐 Environment detection` - detectarea mediului (local/producție)
- `❌ Google OAuth error` - erori specifice OAuth

### Testare în Modul Incognito:
1. Deschide o fereastră incognito
2. Navighează la `http://localhost:8080`
3. Testează autentificarea fără cache

## 🧹 Pasul 4: Curățare Cache

### Curățare Manuală:
1. Deschide Developer Tools (F12)
2. Mergi la **Application > Storage**
3. Șterge toate datele pentru `localhost:8080`
4. Șterge toate cheile care încep cu `sb-` din localStorage

### Curățare Automată:
Aplicația are implementată curățarea automată la sign out care elimină:
- Toate cheile Supabase (`sb-*`)
- Starea aplicației (`autoconta-storage`)

## 🚀 Pasul 5: Verificare Producție

### Deploy și Testare:
1. Deploy aplicația la producție
2. Testează autentificarea pe `https://autoconta.lovable.app`
3. Verifică log-urile în consola browser-ului

## 🔍 Diagnosticare Probleme Comune

### Eroare "Invalid redirect URL":
- Verifică că toate URL-urile sunt adăugate în Supabase Dashboard
- Asigură-te că nu există spații sau caractere suplimentare

### Eroare "OAuth provider not configured":
- Verifică configurația Google OAuth în Google Cloud Console
- Asigură-te că Client ID și Secret sunt setate corect în Supabase

### Eroare "Failed to fetch":
- Verifică conexiunea la internet
- Verifică că Supabase project este activ
- Verifică că API keys sunt corecte

## 📝 Checklist Final

- [ ] Site URL configurat în Supabase Dashboard
- [ ] Redirect URLs adăugate în Supabase Dashboard
- [ ] JavaScript Origins configurate în Google Cloud Console
- [ ] Redirect URIs configurate în Google Cloud Console
- [ ] Testat autentificare email local
- [ ] Testat autentificare Google local
- [ ] Cache curățat și testat în incognito
- [ ] Testat în producție (după deploy)

## 🆘 Suport Suplimentar

Dacă problemele persistă, verifică:
1. Log-urile din consola browser-ului pentru erori specifice
2. Network tab pentru request-uri eșuate
3. Supabase Dashboard pentru log-uri de autentificare
4. Google Cloud Console pentru log-uri OAuth