# Script pentru sincronizarea cu GitHub (branch main)

# Afișează starea curentă
Write-Host "\n===== Starea Repository-ului Înainte de Sincronizare ====="
git status

# Întreabă utilizatorul dacă dorește să adauge toate modificările sau selectiv
$addOption = Read-Host "\nDorești să adaugi toate modificările? (y/n)"

if ($addOption -eq "y" -or $addOption -eq "Y") {
    # Adaugă toate modificările
    Write-Host "\n===== Adăugare Toate Modificările ====="
    git add .
} else {
    # Adaugă selectiv
    Write-Host "\n===== Adăugare Selectivă ====="
    Write-Host "Introdu fișierele separate prin spații (ex: index.html src/App.tsx)"
    $files = Read-Host "Fișiere"
    git add $files
}

# Verifică starea după adăugare
Write-Host "\n===== Starea După Adăugare ====="
git status

# Creează commit
Write-Host "\n===== Creare Commit ====="
$commitMessage = Read-Host "Mesaj commit"
git commit -m $commitMessage

# Pull din main
Write-Host "\n===== Actualizare din GitHub (Pull) ====="
git pull origin main

# Push în main
Write-Host "\n===== Trimitere Modificări pe GitHub (Push) ====="
git push origin main

# Verifică starea finală
Write-Host "\n===== Starea Finală ====="
git status

Write-Host "\n===== Sincronizare Completă! ====="
Write-Host "Verifică aplicația în mediul de producție: https://autoconta.lovable.app"

# Așteaptă input pentru a închide fereastra
Read-Host "Apasă Enter pentru a închide"