# Webapp Corrector

Esta carpeta es independiente de macOS/Windows.

## Abrir en iPhone y iPad

1. Sube la carpeta `webapp` a un hosting estático (GitHub Pages, Netlify, Vercel, etc.).
2. Abre la URL en Safari.
3. Pulsa compartir -> `Añadir a pantalla de inicio`.
4. Se abrirá como app (modo pantalla completa) con icono propio.

## Abrir en Mac (local)

Desde Terminal en esta carpeta:

```bash
python3 -m http.server 8080
```

Luego abre:

`http://localhost:8080`
