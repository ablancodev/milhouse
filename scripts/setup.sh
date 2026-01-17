#!/bin/bash

# setup.sh
# Instala dependencias de Milhouse

echo "=========================================="
echo "  Milhouse Plugin Setup"
echo "=========================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 18"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18 (found: $(node -v))"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Crear directorio de trabajo
mkdir -p .claude/figma-refs

# Instalar dependencias
echo ""
echo "Installing dependencies..."
npm install puppeteer sharp

# Verificar variables de entorno (optional)
echo ""
echo "Checking optional environment variables..."

if [ -z "$FIGMA_ACCESS_TOKEN" ]; then
    echo "⚠️  FIGMA_ACCESS_TOKEN not set (optional, for Figma API export)"
    echo "   Set it with: export FIGMA_ACCESS_TOKEN=your-token"
    echo "   Or manually export frames from Figma to .claude/figma-refs/"
else
    echo "✓ FIGMA_ACCESS_TOKEN is set"
fi

echo ""
echo "ℹ️  Note: No API keys needed for image analysis!"
echo "   Claude Code analyzes images using its built-in vision capabilities."

# Crear config por defecto si no existe
if [ ! -f ".claude/milhouse.config.json" ]; then
    echo ""
    echo "Creating default configuration..."
    cat > .claude/milhouse.config.json << 'EOF'
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
  "waitTime": 2000
}
EOF
    echo "✓ Created .claude/milhouse.config.json"
fi

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Add Figma reference images to .claude/figma-refs/"
echo "2. Update .claude/milhouse.config.json with your settings"
echo "3. Run: /milhouse:check --url http://localhost:8000 --reference .claude/figma-refs/design.png"
echo ""
