---
name: export-figma
description: Export frames from Figma as reference images
arguments:
  - name: frame
    description: Frame name or ID to export
    required: false
  - name: all
    description: Export all frames defined in config
    required: false
  - name: scale
    description: Export scale (default: 2 for retina)
    required: false
  - name: list
    description: List available frames without exporting
    required: false
---

# Export Figma Frames

Exporta frames de Figma como imágenes de referencia para comparación.

## Requisitos

- Token de Figma API configurado (`FIGMA_ACCESS_TOKEN`)
- File ID de Figma configurado en `.claude/milhouse.config.json`

## Proceso

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE=".claude/milhouse.config.json"

# Verificar token
if [ -z "$FIGMA_ACCESS_TOKEN" ]; then
  echo "❌ FIGMA_ACCESS_TOKEN environment variable not set"
  echo "   Set it with: export FIGMA_ACCESS_TOKEN=your-token"
  exit 1
fi

# Leer file ID de config
if [ -f "$CONFIG_FILE" ]; then
  FIGMA_FILE=$(jq -r '.figma.fileId // empty' "$CONFIG_FILE")
fi

if [ -z "$FIGMA_FILE" ]; then
  echo "❌ Figma file ID not configured"
  echo "   Set it with: /milhouse:configure --figma-file YOUR_FILE_ID"
  exit 1
fi

# Ejecutar script
if [ "$list" = "true" ]; then
  node "$SCRIPT_DIR/scripts/figma-export.js" --file "$FIGMA_FILE" --list
elif [ -n "$frame" ]; then
  node "$SCRIPT_DIR/scripts/figma-export.js" \
    --file "$FIGMA_FILE" \
    --frame "$frame" \
    --scale "${scale:-2}"
elif [ "$all" = "true" ]; then
  echo "Exporting all frames..."
  # TODO: Implementar export de todos los frames definidos
  echo "⚠️  --all flag not yet implemented"
  echo "   Use --frame to export specific frames"
else
  echo "Usage: /milhouse:export-figma --frame \"Frame Name\" [--scale 2]"
  echo "       /milhouse:export-figma --list (list available frames)"
fi
```

## Uso

```bash
# Listar frames disponibles
/milhouse:export-figma --list

# Exportar frame específico
/milhouse:export-figma --frame "Header Desktop"

# Exportar con escala diferente
/milhouse:export-figma --frame "Header Desktop" --scale 1
```

## Nota

Si no tienes acceso a Figma API, puedes exportar manualmente los frames:

1. Abre tu archivo en Figma
2. Selecciona el frame que quieres exportar
3. Click derecho → Export → PNG @2x
4. Guarda en `.claude/figma-refs/nombre-frame.png`
