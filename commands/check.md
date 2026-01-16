---
name: check
description: Compare implementation screenshot against Figma reference
arguments:
  - name: url
    description: URL to screenshot (default: from config)
    required: false
  - name: reference
    description: Path to Figma reference image (default: from config)
    required: false
  - name: viewport
    description: Viewport size (default: 1920x1080)
    required: false
  - name: selector
    description: CSS selector to capture specific element (default: full page)
    required: false
  - name: output
    description: Output format - markdown, json, or both (default: markdown)
    required: false
---

# Milhouse Visual Check

Ejecuta una comparación visual entre la implementación actual y el diseño de Figma.

## Proceso

1. Lee configuración de `.claude/milhouse.config.json` si existe
2. Lanza Puppeteer y navega a la URL especificada
3. Espera a que la página cargue completamente (networkidle0)
4. Captura screenshot (full page o selector específico)
5. Carga la imagen de referencia de Figma
6. Envía ambas imágenes a Claude Vision API con el prompt de comparación
7. Parsea la respuesta y genera el reporte de feedback
8. Guarda el reporte en `.claude/milhouse-feedback.md`

## Ejecución

```bash
# Leer configuración si existe
CONFIG_FILE=".claude/milhouse.config.json"
if [ -f "$CONFIG_FILE" ]; then
  DEFAULT_URL=$(jq -r '.url // "http://localhost:8000"' "$CONFIG_FILE" 2>/dev/null || echo "http://localhost:8000")
  DEFAULT_REF=$(jq -r '.reference // ".claude/figma-refs/design.png"' "$CONFIG_FILE" 2>/dev/null || echo ".claude/figma-refs/design.png")
else
  DEFAULT_URL="http://localhost:8000"
  DEFAULT_REF=".claude/figma-refs/design.png"
fi

# Ejecutar script de comparación
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node "$SCRIPT_DIR/scripts/compare-vision.js" \
  --url "${url:-$DEFAULT_URL}" \
  --reference "${reference:-$DEFAULT_REF}" \
  --viewport "${viewport:-1920x1080}" \
  --selector "${selector:-}" \
  --output "${output:-markdown}"
```

## Output

Después de ejecutar, revisa `.claude/milhouse-feedback.md` para ver las diferencias encontradas.

Si el diseño coincide, el archivo indicará `STATUS: APPROVED`.

Si hay diferencias, contendrá una lista de correcciones necesarias que puedes pasar a Ralph.
