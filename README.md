# doni-ai-workflow — CLI edition

CLI interaktif untuk memasang workflow reusable Antigravity ke proyek baru maupun ongoing. Membutuhkan Node.js 18+.

> Nama paket `doni-ai-workflow` masih usulan dan perlu dicek ketersediaannya sebelum publish. Paket ini belum diterbitkan di npm.

## Coba dari source bundle ini

```powershell
node .\bin\doni-ai.js --help
node .\bin\doni-ai.js init --target "D:\Project\MyApp" --scope workspace --profile fullstack --dry-run
node .\bin\doni-ai.js init --target "D:\Project\MyApp" --scope workspace --profile fullstack
```

## Setelah dipublikasikan ke npm

```powershell
npm install -g doni-ai-workflow
cd D:\Project\MyApp
doni-ai init
doni-ai init --dry-run
doni-ai update
doni-ai uninstall
```

Dari folder proyek saat ini, target otomatis terdeteksi; tidak perlu mengisi path secara manual. Pilih profil dan scope melalui wizard interaktif.

## Fitur
- Scope workspace atau global.
- Profil `base`, `frontend`, `backend`, `fullstack`.
- Skills Antigravity di `.agents/skills/` untuk workspace, `~/.gemini/config/skills/` untuk global.
- Rules dan template dokumentasi untuk workspace.
- Konflik file selalu ditanyakan; file lama dipertahankan secara default.
- Backup bertimestamp sebelum mengganti file.
- `--dry-run`, `update`, `uninstall`, `doctor`.

## Keamanan
- Installer hanya menyalin workflow files; tidak menjalankan AI, mengedit source code aplikasi, install dependency aplikasi, atau deploy.
- Jalankan `--dry-run` dulu dan review hasilnya.
- Uninstall hanya mempertimbangkan path yang tercatat di manifest dan meminta konfirmasi per file.
- Periksa script sebelum digunakan.

## Publish ke npm
1. Pastikan nama tersedia: `npm view doni-ai-workflow`.
2. Login: `npm login`.
3. Dari folder paket, jalankan `npm publish --access public`.
4. Jangan pernah menerbitkan secrets atau data proyek.

## Status
Source CLI telah dibuat, tetapi belum diuji di Windows/PowerShell pengguna dan belum dipublikasikan ke npm. Uji lokal terlebih dahulu.
