# Ghid de Sincronizare cu GitHub

## Starea Actuală a Repository-ului

În prezent, repository-ul are următoarele modificări:

### Fișiere Modificate (neadăugate în staging):
- `index.html`
- `src/App.tsx`
- `src/hooks/useAuth.ts`
- `src/index.css`
- `src/pages/Auth.tsx`
- `src/pages/Setup.tsx`

### Fișiere Noi (neadăugate în staging):
- `OAUTH_SETUP.md`
- `src/utils/`
- `supabase/migrations/20250115000000_create_user_profiles.sql`
- `test-supabase.html`

## Pași pentru Sincronizare cu GitHub (branch main)

### 1. Verifică Starea Repository-ului

```bash
git status
```

### 2. Adaugă Modificările în Staging

Adaugă toate modificările:
```bash
git add .
```

Sau adaugă selectiv anumite fișiere:
```bash
git add index.html src/App.tsx src/hooks/useAuth.ts
```

### 3. Creează un Commit

```bash
git commit -m "Rezolvare problemă OAuth și configurare pentru dezvoltare locală"
```

### 4. Actualizează Repository-ul Local cu Ultimele Modificări din GitHub

```bash
git pull origin main
```

Dacă apar conflicte, rezolvă-le și apoi continuă.

### 5. Trimite Modificările pe GitHub

```bash
git push origin main
```

## Gestionarea Configurărilor pentru Medii Diferite

### Dezvoltare Locală

1. Folosește configurările din `OAUTH_SETUP.md` pentru mediul local
2. Testează funcționalitățile pe `http://localhost:8081`

### Producție

1. Asigură-te că ai făcut push la toate modificările
2. Verifică că Supabase și Google Cloud Console sunt configurate pentru producție:
   - Site URL: `https://autoconta.lovable.app`
   - Redirect URLs: `https://autoconta.lovable.app/**`

## Bune Practici

1. Fă commit-uri mici și frecvente cu mesaje descriptive
2. Verifică întotdeauna starea repository-ului înainte de a face pull sau push
3. Testează aplicația după sincronizare pentru a te asigura că totul funcționează corect
4. Păstrează configurările pentru OAuth actualizate în ambele medii

## Comenzi Utile

- Verifică istoricul commit-urilor: `git log --oneline`
- Verifică diferențele: `git diff`
- Anulează modificările locale: `git checkout -- <file>`
- Verifică branch-ul curent: `git branch`