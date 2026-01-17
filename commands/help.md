---
name: help
description: Show Milhouse documentation
---

# Milhouse Plugin - Help

**"Milhouse validates. Ralph iterates."**

Plugin de Visual QA para Claude Code que compara screenshots de una implementación web contra exports de Figma usando Claude Vision.

## Comandos disponibles

### `/milhouse:check`
Compara la implementación actual contra una imagen de referencia de Figma.

**Uso:**
```bash
/milhouse:check --url http://localhost:8000 --reference .claude/figma-refs/home.png
/milhouse:check --viewport 375x667 --selector ".hero-section"
/milhouse:check  # Usa valores de config por defecto
```

**Argumentos:**
- `--url` - URL a capturar (default: config)
- `--reference` - Ruta a imagen de referencia (default: config)
- `--viewport` - Tamaño viewport WxH (default: 1920x1080)
- `--selector` - Selector CSS para capturar elemento específico
- `--output` - Formato: markdown, json, both (default: markdown)

### `/milhouse:compare`
Compara dos screenshots directamente, sin necesidad de Figma.

**Uso:**
```bash
/milhouse:compare --current http://localhost:8000 --reference .claude/screenshots/previous.png
/milhouse:compare --current .claude/screenshots/branch-a.png --reference .claude/screenshots/branch-b.png
/milhouse:compare --current http://localhost:8000 --reference .claude/screenshots/golden.png --viewport 375x667
```

**Argumentos:**
- `--current` - URL a capturar o path a screenshot actual
- `--reference` - Path a screenshot de referencia
- `--viewport` - Tamaño viewport WxH (default: 1920x1080)
- `--selector` - Selector CSS para capturar elemento específico
- `--output` - Formato: markdown, json, both (default: markdown)

**Casos de uso:**
- Regression testing (comparar con versión anterior)
- Branch comparison (comparar diferentes branches)
- Environment comparison (staging vs production)
- Mockup validation (comparar con diseño estático)

### `/milhouse:configure`
Configura los ajustes por defecto del proyecto.

**Uso:**
```bash
/milhouse:configure  # Crea config por defecto
/milhouse:configure --url http://localhost:3000
/milhouse:configure --reference .claude/figma-refs/design.png
/milhouse:configure --figma-file ABC123
```

**Argumentos:**
- `--url` - URL por defecto
- `--reference` - Imagen de referencia por defecto
- `--figma-file` - ID del archivo Figma
- `--figma-token` - Token de Figma API

### `/milhouse:export-figma`
Exporta frames de Figma como imágenes de referencia.

**Uso:**
```bash
/milhouse:export-figma --list  # Listar frames
/milhouse:export-figma --frame "Home Desktop"
/milhouse:export-figma --frame "Header" --scale 2
```

**Argumentos:**
- `--frame` - Nombre del frame a exportar
- `--list` - Listar frames disponibles
- `--scale` - Escala de export (default: 2)

### `/milhouse:help`
Muestra esta ayuda.

## Flujo de trabajo típico

1. **Setup inicial:**
   ```bash
   # In TERMINAL: Install dependencies
   npm install

   # In CLAUDE CODE: Configure project
   /milhouse:configure
   ```

2. **Preparar referencias:**
   - Opción A: Exportar desde Figma API
     ```bash
     /milhouse:export-figma --frame "Home Desktop"
     ```
   - Opción B: Exportar manualmente y guardar en `.claude/figma-refs/`

3. **Implementación con Ralph:**
   ```bash
   /ralph-loop "Implementa la landing según spec" --max-iterations 20
   ```

4. **Validación con Milhouse:**
   ```bash
   /milhouse:check
   ```

5. **Correcciones si es necesario:**
   ```bash
   # Leer feedback y pasarlo a Ralph
   /ralph-loop "Lee .claude/milhouse-feedback.md y corrige las diferencias" --max-iterations 10
   ```

6. **Repetir 4-5 hasta APPROVED**

## Archivos generados

- `.claude/milhouse-feedback.md` - Reporte de diferencias en Markdown
- `.claude/milhouse-feedback.json` - Datos estructurados JSON
- `.claude/milhouse-screenshot.png` - Último screenshot capturado
- `.claude/milhouse.config.json` - Configuración del proyecto

## Variables de entorno

**No API keys needed for image analysis!** Claude Code has built-in vision capabilities.

```bash
# Optional: Only for Figma API export (/milhouse:export-figma)
export FIGMA_ACCESS_TOKEN=figd_...

# Or export Figma frames manually to .claude/figma-refs/
```

## Integración con Ralph Loop

Milhouse está diseñado para integrarse con Ralph Loop:

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  LISA   │ ──► │  RALPH  │ ──► │ MILHOUSE │
│ (spec)  │     │ (code)  │     │(visual QA)│
└─────────┘     └─────────┘     └──────────┘
                     ▲                │
                     │                │
                     └── feedback ────┘
                     (si hay diffs)
```

Después de que Milhouse genera feedback, puedes ejecutar:

```bash
/ralph-loop "$(cat .claude/milhouse-feedback.md | grep -A 1000 'Resumen para Ralph')" --max-iterations 10
```

## Soporte

Para más información:
- Documentación completa: Ver `CLAUDE.md` en el directorio del plugin
- Reportar issues: https://github.com/anthropics/claude-code/issues
- Specs del plugin: Ver `README.md`

## Dependencias

- Node.js >= 18
- Puppeteer (screenshots)
- Sharp (procesamiento de imágenes)
- jq (manipulación de JSON en bash)

Ejecuta el script de setup para instalar:
```bash
bash scripts/setup.sh
```
