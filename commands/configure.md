---
name: configure
description: Configure Milhouse settings
arguments:
  - name: url
    description: Default URL to check
    required: false
  - name: reference
    description: Default reference image path
    required: false
  - name: figma-token
    description: Figma API token (stored securely)
    required: false
  - name: figma-file
    description: Figma file ID
    required: false
---

# Milhouse Configuration

Configura los ajustes por defecto de Milhouse para este proyecto.

## Configuración interactiva

Si no se proporcionan argumentos, crea una configuración por defecto con valores razonables.

## Proceso

```bash
CONFIG_FILE=".claude/milhouse.config.json"

# Crear directorio si no existe
mkdir -p .claude/figma-refs

# Si se proporcionan argumentos, actualizar config
if [ -n "${url}${reference}${figma_token}${figma_file}" ]; then
  # Leer config existente o crear vacía
  if [ -f "$CONFIG_FILE" ]; then
    CONFIG=$(cat "$CONFIG_FILE")
  else
    CONFIG='{}'
  fi

  # Actualizar valores
  [ -n "$url" ] && CONFIG=$(echo "$CONFIG" | jq --arg url "$url" '.url = $url')
  [ -n "$reference" ] && CONFIG=$(echo "$CONFIG" | jq --arg ref "$reference" '.reference = $ref')
  [ -n "$figma_file" ] && CONFIG=$(echo "$CONFIG" | jq --arg file "$figma_file" '.figma.fileId = $file')

  # Guardar
  echo "$CONFIG" | jq '.' > "$CONFIG_FILE"
  echo "✓ Configuration updated: $CONFIG_FILE"
else
  # Crear configuración por defecto
  cat > "$CONFIG_FILE" << 'EOF'
{
  "url": "http://localhost:8000",
  "reference": ".claude/figma-refs/design.png",
  "referenceDir": ".claude/figma-refs",
  "viewports": {
    "desktop": "1920x1080",
    "tablet": "768x1024",
    "mobile": "375x667"
  },
  "tolerance": "normal",
  "waitForSelector": null,
  "waitTime": 2000,
  "figma": {
    "fileId": null,
    "token": null
  }
}
EOF
  echo "✓ Created default configuration: $CONFIG_FILE"
fi

# Mostrar configuración actual
echo ""
echo "Current configuration:"
cat "$CONFIG_FILE" | jq '.'
```

## Archivo de configuración

La configuración se guarda en `.claude/milhouse.config.json`:

```json
{
  "url": "http://localhost:8000",
  "reference": ".claude/figma-refs/design.png",
  "referenceDir": ".claude/figma-refs",
  "viewports": {
    "desktop": "1920x1080",
    "tablet": "768x1024",
    "mobile": "375x667"
  },
  "tolerance": "normal",
  "waitForSelector": null,
  "waitTime": 2000,
  "figma": {
    "fileId": null,
    "token": null
  }
}
```

## Variables de entorno

**No API keys needed for image analysis!** Claude Code has built-in vision capabilities.

For Figma API export (optional):
```bash
export FIGMA_ACCESS_TOKEN=your-token-here
```

Alternatively, export Figma frames manually to `.claude/figma-refs/`
