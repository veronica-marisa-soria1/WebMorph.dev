# Web Morph — Portafolio personal

Sitio web personal de Verónica, desarrolladora de software junior bajo la marca **Web Morph**.
Construido con HTML5, CSS3 y JavaScript vanilla — sin frameworks, sin dependencias.

## Demo

🔗 `TODO: agregar link cuando esté publicado en GitHub Pages`

## Stack

- HTML5 semántico y accesible
- CSS3 con variables personalizadas y diseño responsivo
- JavaScript vanilla (sin jQuery ni librerías)
- Tipografías: Inter + JetBrains Mono (Google Fonts)

## Funcionalidades

- Navegación fija con detección de sección activa (IntersectionObserver)
- Menú hamburguesa animado para mobile
- Efecto typewriter en el hero
- Toggle modo oscuro / claro (guarda preferencia en localStorage)
- Animaciones de entrada al hacer scroll (respeta prefers-reduced-motion)
- Filtro de proyectos por tecnología
- Formulario de contacto con validación en tiempo real

## Estructura

```
/
├── index.html
├── robots.txt
├── sitemap.xml
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── assets/
    └── img/
        ├── web-morph-logo.svg
        ├── perfil.jpg
        ├── og-preview.jpg       ← imagen 1200×630 para redes sociales
        ├── favicon-32.png
        ├── favicon-16.png
        └── apple-touch-icon.png
```

## Imágenes pendientes

Antes de publicar, agregar estas imágenes en `assets/img/`:

| Archivo | Tamaño | Uso |
|---|---|---|
| `og-preview.jpg` | 1200×630 px | Preview en LinkedIn / WhatsApp |
| `web-morph-logo.svg` | SVG | Logo y favicon principal |
| `favicon-32.png` | 32×32 px | Favicon PNG opcional |
| `favicon-16.png` | 16×16 px | Favicon PNG opcional pequeño |
| `apple-touch-icon.png` | 180×180 px | Ícono en iOS |

## Deploy en GitHub Pages

```bash
# 1. Inicializar git (si no lo hiciste)
git init
git add .
git commit -m "inicial: portafolio Web Morph"

# 2. Crear repo en GitHub y subir
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main

# 3. Habilitar GitHub Pages
# GitHub → Settings → Pages → Branch: main → / (root) → Save
```

La URL quedará: `https://TU-USUARIO.github.io/TU-REPO`

## Pendientes antes de publicar

- [ ] Reemplazar todos los `TODO-tu-url` en `head`, `robots.txt` y `sitemap.xml`
- [ ] Agregar las imágenes de favicon y og-preview
- [ ] Actualizar links reales de GitHub y LinkedIn en el HTML
- [ ] Actualizar email en el link de contacto
- [ ] Agregar `assets/cv.pdf` con el CV actualizado
- [ ] Actualizar `<lastmod>` en `sitemap.xml` tras cada cambio importante

## Desarrollado por

Verónica · [Web Morph](https://TODO-tu-url.github.io) · Quitilipi-Chaco, Argentina
