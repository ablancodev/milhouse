---
name: compare
description: Compare two screenshots (without Figma designs)
arguments:
  - name: current
    description: Path to current screenshot or URL to capture
    required: true
  - name: reference
    description: Path to reference screenshot (previous version, mockup, etc.)
    required: true
  - name: viewport
    description: Viewport size if capturing from URL (default: 1920x1080)
    required: false
  - name: selector
    description: CSS selector to capture specific element (default: full page)
    required: false
  - name: output
    description: Output format - markdown, json, or both (default: markdown)
    required: false
---

# Milhouse Screenshot Comparison

Compara dos screenshots directamente, sin necesidad de tener diseños en Figma.

**Casos de uso:**
- Comparar versión actual vs. versión anterior (regression testing)
- Comparar implementación vs. mockup estático
- Comparar diferentes branches o entornos
- QA visual sin acceso a Figma

## Proceso

1. Lee configuración de `.claude/milhouse.config.json` si existe
2. Si `current` es una URL, captura screenshot con Puppeteer
3. Si `current` es un path, usa la imagen directamente
4. Carga la imagen de referencia desde `reference`
5. Envía ambas imágenes a Claude Vision API con prompt de comparación screenshot-a-screenshot
6. Genera reporte de diferencias en `.claude/milhouse-feedback.md`

## Ejecución

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Determinar si current es URL o archivo
if [[ "$current" =~ ^https?:// ]]; then
  # Es una URL, capturar screenshot
  node "$SCRIPT_DIR/scripts/compare-vision.js" \
    --url "$current" \
    --reference "$reference" \
    --viewport "${viewport:-1920x1080}" \
    --selector "${selector:-}" \
    --type screenshot \
    --output "${output:-markdown}"
else
  # Es un archivo, comparar directamente
  node "$SCRIPT_DIR/scripts/compare-vision.js" \
    --screenshot "$current" \
    --reference "$reference" \
    --type screenshot \
    --output "${output:-markdown}"
fi
```

## Ejemplos de uso

### Comparar URL actual vs screenshot anterior
```bash
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/previous-version.png
```

### Comparar dos screenshots existentes
```bash
/milhouse:compare \
  --current .claude/screenshots/branch-feature.png \
  --reference .claude/screenshots/main-branch.png
```

### Comparar versión mobile
```bash
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/approved-mobile.png \
  --viewport 375x667
```

### Comparar solo un componente
```bash
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/hero-approved.png \
  --selector ".hero-section"
```

## Flujo de trabajo recomendado

### 1. Regression Testing
```bash
# Capturar screenshot "golden" de la versión aprobada
/milhouse:check --url http://localhost:8000
# Guardar como referencia
cp .claude/milhouse-screenshot.png .claude/screenshots/golden-v1.0.png

# Después de hacer cambios, comparar
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden-v1.0.png
```

### 2. Branch Comparison
```bash
# En branch main
git checkout main
npm run dev
# Capturar screenshot
/milhouse:check --url http://localhost:3000
cp .claude/milhouse-screenshot.png .claude/screenshots/main.png

# En branch feature
git checkout feature/new-design
npm run dev
# Comparar
/milhouse:compare \
  --current http://localhost:3000 \
  --reference .claude/screenshots/main.png
```

### 3. Environment Comparison
```bash
# Comparar staging vs production
/milhouse:compare \
  --current https://staging.myapp.com \
  --reference .claude/screenshots/production-baseline.png
```

## Diferencias con /milhouse:check

| Feature | /milhouse:check | /milhouse:compare |
|---------|-----------------|-------------------|
| **Propósito** | Comparar contra diseño de Figma | Comparar screenshots entre sí |
| **Referencia** | Export de Figma (diseño) | Screenshot anterior (implementación) |
| **Prompt** | Enfocado en diseño vs implementación | Enfocado en diferencias visuales genéricas |
| **Uso típico** | Validar fidelidad al diseño | Regression testing, branch comparison |

## Output

Después de ejecutar, revisa `.claude/milhouse-feedback.md` para ver las diferencias encontradas.

Si los screenshots coinciden, el archivo indicará `STATUS: APPROVED`.

Si hay diferencias, contendrá una lista de cambios visuales detectados.

## Tips

1. **Golden screenshots:** Mantén screenshots "dorados" de versiones aprobadas en `.claude/screenshots/golden/`
2. **Nombrado:** Usa nombres descriptivos: `v1.0-home-desktop.png`, `main-branch-hero.png`
3. **Viewports:** Captura y compara cada viewport por separado
4. **Componentes:** Usa `--selector` para comparar componentes específicos
5. **Automatización:** Puedes integrar esto en CI/CD para detectar cambios visuales no intencionales

## Integración con Ralph

```bash
# Si hay diferencias no esperadas
/ralph-loop "Lee .claude/milhouse-feedback.md. Estas son diferencias visuales no intencionales introducidas por el último cambio. Revierte o corrige lo necesario para que la implementación sea idéntica a la referencia." --max-iterations 10
```

## Almacenamiento de referencias

Organiza tus screenshots de referencia:

```
.claude/screenshots/
├── golden/                    # Versiones aprobadas "golden"
│   ├── v1.0-home-desktop.png
│   ├── v1.0-home-mobile.png
│   └── v1.0-dashboard.png
├── branches/                  # Screenshots de branches
│   ├── main-home.png
│   └── feature-new-ui.png
└── environments/              # Screenshots de diferentes entornos
    ├── production-home.png
    └── staging-home.png
```
