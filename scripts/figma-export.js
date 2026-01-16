#!/usr/bin/env node

/**
 * figma-export.js
 * Exporta frames de Figma como imágenes PNG
 *
 * Uso: node figma-export.js --file <fileId> --frame <frameName> --output <path>
 */

const fs = require('fs');
const path = require('path');

const FIGMA_API_URL = 'https://api.figma.com/v1';

/**
 * Obtiene los frames de un archivo Figma
 */
async function getFigmaFrames(fileId, token) {
  const response = await fetch(`${FIGMA_API_URL}/files/${fileId}`, {
    headers: {
      'X-Figma-Token': token
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  const data = await response.json();

  // Extraer todos los frames del documento
  const frames = [];

  function extractFrames(node, parentName = '') {
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      frames.push({
        id: node.id,
        name: node.name,
        path: parentName ? `${parentName}/${node.name}` : node.name
      });
    }
    if (node.children) {
      node.children.forEach(child =>
        extractFrames(child, parentName ? `${parentName}/${node.name}` : node.name)
      );
    }
  }

  data.document.children.forEach(page => extractFrames(page));

  return frames;
}

/**
 * Exporta un frame específico como PNG
 */
async function exportFrame(fileId, frameId, token, scale = 2) {
  const response = await fetch(
    `${FIGMA_API_URL}/images/${fileId}?ids=${frameId}&format=png&scale=${scale}`,
    {
      headers: {
        'X-Figma-Token': token
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Figma export error: ${response.status}`);
  }

  const data = await response.json();

  if (data.err) {
    throw new Error(`Figma error: ${data.err}`);
  }

  const imageUrl = data.images[frameId];

  if (!imageUrl) {
    throw new Error(`No image URL returned for frame ${frameId}`);
  }

  // Descargar la imagen
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();

  return Buffer.from(imageBuffer);
}

/**
 * Función principal
 */
async function main(options) {
  const {
    file: fileId,
    frame: frameName,
    output: outputPath,
    scale = '2',
    list = false
  } = options;

  const token = process.env.FIGMA_ACCESS_TOKEN;

  if (!token) {
    throw new Error('FIGMA_ACCESS_TOKEN environment variable not set');
  }

  if (!fileId) {
    throw new Error('Figma file ID required (--file)');
  }

  try {
    // Obtener frames
    console.log('[Milhouse] Fetching Figma frames...');
    const frames = await getFigmaFrames(fileId, token);

    // Si solo queremos listar
    if (list) {
      console.log('\nAvailable frames:');
      frames.forEach(f => console.log(`  - ${f.name} (${f.id})`));
      return;
    }

    // Buscar frame por nombre
    const frame = frames.find(f =>
      f.name.toLowerCase() === frameName.toLowerCase() ||
      f.name.toLowerCase().includes(frameName.toLowerCase())
    );

    if (!frame) {
      console.error(`Frame "${frameName}" not found. Available frames:`);
      frames.forEach(f => console.log(`  - ${f.name}`));
      process.exit(1);
    }

    console.log(`[Milhouse] Exporting frame: ${frame.name} (${frame.id})`);

    // Exportar
    const imageBuffer = await exportFrame(fileId, frame.id, token, parseInt(scale));

    // Guardar
    const finalOutput = outputPath || `.claude/figma-refs/${slugify(frame.name)}.png`;
    const outputDir = path.dirname(finalOutput);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(finalOutput, imageBuffer);
    console.log(`[Milhouse] ✓ Exported to ${finalOutput}`);

  } catch (error) {
    console.error(`[Milhouse] ❌ Error: ${error.message}`);
    process.exit(1);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--list') {
      options.list = true;
    } else if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      options[key] = args[i + 1];
      i++;
    }
  }

  main(options);
}

module.exports = { getFigmaFrames, exportFrame };
