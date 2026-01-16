#!/usr/bin/env node

/**
 * compare-vision.js
 * Compara dos imágenes usando Claude Vision API
 *
 * Uso: node compare-vision.js --screenshot <path> --reference <path> --output <path>
 */

const fs = require('fs');
const path = require('path');
const { captureScreenshot } = require('./screenshot.js');

// Configuración de la API
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Convierte imagen a base64
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Detecta el media type de la imagen
 */
function getMediaType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const types = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return types[ext] || 'image/png';
}

/**
 * Genera el prompt para Claude Vision según el tipo de comparación
 */
function getComparisonPrompt(comparisonType = 'figma') {
  const referenceDescription = comparisonType === 'figma'
    ? 'El diseño de referencia de Figma'
    : 'La versión de referencia (screenshot anterior, mockup, o diseño aprobado)';

  return `Eres un experto en QA visual para desarrollo web.

Estás viendo dos imágenes:
1. PRIMERA IMAGEN (izquierda/arriba): La implementación actual del sitio web
2. SEGUNDA IMAGEN (derecha/abajo): ${referenceDescription}

Tu tarea es comparar ambas imágenes e identificar TODAS las diferencias visuales.

## Instrucciones

1. Compara meticulosamente cada aspecto visual
2. Sé MUY ESPECÍFICO con las diferencias (valores exactos en px, colores en hex)
3. Si no puedes determinar un valor exacto, da tu mejor estimación
4. Ignora diferencias de contenido dinámico (texto lorem ipsum, imágenes placeholder)
5. Enfócate en: espaciados, colores, tipografías, alineaciones, tamaños, bordes, sombras

## Formato de respuesta

Responde ÚNICAMENTE en el siguiente formato JSON:

{
  "status": "APPROVED" | "DIFFERENCES_FOUND",
  "summary": "Breve resumen de 1 línea",
  "differences": [
    {
      "element": "Nombre del elemento (ej: Header, Hero button, Nav link)",
      "category": "spacing" | "color" | "typography" | "size" | "alignment" | "border" | "shadow" | "other",
      "description": "Descripción clara de la diferencia",
      "current": "Valor actual observado",
      "expected": "Valor esperado según Figma",
      "severity": "critical" | "major" | "minor",
      "cssProperty": "Propiedad CSS probable a modificar (ej: padding-top, color, font-size)",
      "suggestedFix": "Código CSS sugerido para corregir"
    }
  ],
  "approvedElements": ["Lista de elementos que coinciden correctamente"]
}

Si las imágenes son idénticas o las diferencias son insignificantes, responde:

{
  "status": "APPROVED",
  "summary": "La implementación coincide con la referencia",
  "differences": [],
  "approvedElements": ["Lista de todos los elementos revisados"]
}

IMPORTANTE:
- Responde SOLO con el JSON, sin texto adicional, sin markdown code blocks
- Sé preciso y accionable en cada diferencia
- El desarrollador usará este feedback para corregir el código`;
}

/**
 * Llama a Claude Vision API para comparar imágenes
 */
async function compareWithVision(screenshotPath, referencePath, comparisonType = 'figma') {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  console.log('[Milhouse] Loading images...');

  const screenshotBase64 = imageToBase64(screenshotPath);
  const referenceBase64 = imageToBase64(referencePath);

  const screenshotMediaType = getMediaType(screenshotPath);
  const referenceMediaType = getMediaType(referencePath);

  console.log('[Milhouse] Sending to Claude Vision API...');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: screenshotMediaType,
                data: screenshotBase64
              }
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: referenceMediaType,
                data: referenceBase64
              }
            },
            {
              type: 'text',
              text: getComparisonPrompt(comparisonType)
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const content = result.content[0].text;

  // Parsear JSON de la respuesta
  try {
    return JSON.parse(content);
  } catch (e) {
    // Si no es JSON válido, intentar extraerlo
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse Vision API response as JSON');
  }
}

/**
 * Genera el reporte de feedback en Markdown
 */
function generateFeedbackReport(comparison, options = {}) {
  const { screenshotPath, referencePath } = options;
  const timestamp = new Date().toISOString();

  let report = `# Milhouse Visual QA Report

**Generated:** ${timestamp}
**Status:** ${comparison.status}
**Summary:** ${comparison.summary}

---

`;

  if (comparison.status === 'APPROVED') {
    report += `## ✅ APPROVED

La implementación coincide con el diseño de Figma.

### Elementos verificados:
${comparison.approvedElements.map(el => `- ✓ ${el}`).join('\n')}
`;
  } else {
    report += `## ❌ DIFFERENCES FOUND

Se encontraron ${comparison.differences.length} diferencia(s) que requieren corrección.

### Diferencias por corregir:

`;

    // Agrupar por severidad
    const critical = comparison.differences.filter(d => d.severity === 'critical');
    const major = comparison.differences.filter(d => d.severity === 'major');
    const minor = comparison.differences.filter(d => d.severity === 'minor');

    if (critical.length > 0) {
      report += `#### 🔴 Críticas (${critical.length})\n\n`;
      critical.forEach((diff, i) => {
        report += formatDifference(diff, i + 1);
      });
    }

    if (major.length > 0) {
      report += `#### 🟠 Importantes (${major.length})\n\n`;
      major.forEach((diff, i) => {
        report += formatDifference(diff, i + 1);
      });
    }

    if (minor.length > 0) {
      report += `#### 🟡 Menores (${minor.length})\n\n`;
      minor.forEach((diff, i) => {
        report += formatDifference(diff, i + 1);
      });
    }

    // Resumen para Ralph
    report += `
---

## 📋 Resumen para Ralph

Copia este bloque para pasar a Ralph Loop:

\`\`\`
Corrige las siguientes diferencias visuales respecto a la referencia:

${comparison.differences.map(d => `- ${d.element}: ${d.description}. Cambiar ${d.cssProperty} de "${d.current}" a "${d.expected}"`).join('\n')}

Después de corregir, el resultado debe coincidir visualmente con la referencia.
Output <promise>VISUAL_FIXED</promise> cuando todas las correcciones estén aplicadas.
\`\`\`
`;
  }

  // Elementos aprobados
  if (comparison.approvedElements && comparison.approvedElements.length > 0) {
    report += `
### ✅ Elementos correctos:
${comparison.approvedElements.map(el => `- ${el}`).join('\n')}
`;
  }

  return report;
}

/**
 * Formatea una diferencia individual
 */
function formatDifference(diff, index) {
  return `**${index}. ${diff.element}** (${diff.category})

- **Problema:** ${diff.description}
- **Actual:** \`${diff.current}\`
- **Esperado:** \`${diff.expected}\`
- **Propiedad CSS:** \`${diff.cssProperty}\`
- **Fix sugerido:**
  \`\`\`css
  ${diff.suggestedFix}
  \`\`\`

`;
}

/**
 * Función principal
 */
async function main(options) {
  const {
    url,
    screenshot: screenshotPath,
    reference: referencePath,
    output: outputPath,
    viewport = '1920x1080',
    selector = null,
    type = 'figma'  // 'figma' o 'screenshot'
  } = options;

  const tempScreenshot = screenshotPath || '.claude/milhouse-screenshot.png';
  const feedbackPath = outputPath || '.claude/milhouse-feedback.md';
  const jsonPath = feedbackPath.replace('.md', '.json');

  try {
    // 1. Capturar screenshot si se proporciona URL
    if (url) {
      console.log('[Milhouse] Step 1: Capturing screenshot...');
      const captureResult = await captureScreenshot({
        url,
        output: tempScreenshot,
        viewport,
        selector
      });

      if (!captureResult.success) {
        throw new Error(`Screenshot failed: ${captureResult.error}`);
      }
    }

    // 2. Verificar que ambas imágenes existen
    const finalScreenshot = url ? tempScreenshot : screenshotPath;

    if (!fs.existsSync(finalScreenshot)) {
      throw new Error(`Screenshot not found: ${finalScreenshot}`);
    }
    if (!fs.existsSync(referencePath)) {
      throw new Error(`Reference image not found: ${referencePath}`);
    }

    // 3. Comparar con Vision
    console.log('[Milhouse] Step 2: Comparing with Claude Vision...');
    const comparison = await compareWithVision(finalScreenshot, referencePath, type);

    // 4. Generar reporte
    console.log('[Milhouse] Step 3: Generating report...');
    const report = generateFeedbackReport(comparison, {
      screenshotPath: finalScreenshot,
      referencePath
    });

    // 5. Guardar resultados
    const outputDir = path.dirname(feedbackPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(feedbackPath, report);
    fs.writeFileSync(jsonPath, JSON.stringify(comparison, null, 2));

    console.log(`[Milhouse] ✓ Report saved to ${feedbackPath}`);
    console.log(`[Milhouse] ✓ JSON saved to ${jsonPath}`);
    console.log(`[Milhouse] Status: ${comparison.status}`);

    if (comparison.status === 'APPROVED') {
      console.log('[Milhouse] 🎉 Visual QA passed!');
    } else {
      console.log(`[Milhouse] ⚠️  Found ${comparison.differences.length} difference(s) to fix`);
    }

    return comparison;

  } catch (error) {
    console.error(`[Milhouse] ❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    options[key] = args[i + 1];
  }

  if (!options.reference) {
    console.error('Usage: node compare-vision.js --url <url> --reference <path> [--output <path>] [--viewport <WxH>]');
    console.error('   or: node compare-vision.js --screenshot <path> --reference <path> [--output <path>]');
    process.exit(1);
  }

  main(options);
}

module.exports = { compareWithVision, generateFeedbackReport };
