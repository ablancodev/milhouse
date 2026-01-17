#!/bin/bash

# verify.sh
# Verifica que el plugin Milhouse esté correctamente configurado

echo "=========================================="
echo "  Milhouse Plugin Verification"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Verificar Node.js
echo "1. Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js not found"
    ERRORS=$((ERRORS + 1))
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "   ❌ Node.js version must be >= 18 (found: $(node -v))"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✓ Node.js $(node -v)"
    fi
fi

# Verificar estructura de directorios
echo ""
echo "2. Checking directory structure..."
REQUIRED_DIRS=(".claude-plugin" "commands" "scripts" "templates" "hooks")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "   ❌ Missing directory: $dir"
        ERRORS=$((ERRORS + 1))
    fi
done
echo "   ✓ All required directories present"

# Verificar archivos clave
echo ""
echo "3. Checking required files..."
REQUIRED_FILES=(
    ".claude-plugin/plugin.json"
    "commands/check.md"
    "commands/configure.md"
    "commands/export-figma.md"
    "commands/help.md"
    "scripts/screenshot.js"
    "scripts/compare-vision.js"
    "scripts/figma-export.js"
    "scripts/setup.sh"
    "CLAUDE.md"
    "README.md"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ Missing file: $file"
        ERRORS=$((ERRORS + 1))
    fi
done
echo "   ✓ All required files present"

# Verificar permisos de scripts
echo ""
echo "4. Checking script permissions..."
for script in scripts/*.js scripts/*.sh; do
    if [ ! -x "$script" ]; then
        echo "   ⚠️  Script not executable: $script"
        echo "      Fix with: chmod +x $script"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo "   ✓ Scripts are executable"

# Verificar variables de entorno
echo ""
echo "5. Checking environment variables..."
echo "   ℹ️  No ANTHROPIC_API_KEY needed - Claude Code has built-in vision!"

if [ -z "$FIGMA_ACCESS_TOKEN" ]; then
    echo "   ⚠️  FIGMA_ACCESS_TOKEN not set (optional, for Figma API export)"
    echo "      Set with: export FIGMA_ACCESS_TOKEN=figd_..."
    echo "      Or export frames manually from Figma to .claude/figma-refs/"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ FIGMA_ACCESS_TOKEN is set"
fi

# Verificar dependencias de Node
echo ""
echo "6. Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules not found"
    echo "      Run: npm install"
    WARNINGS=$((WARNINGS + 1))
else
    if [ ! -d "node_modules/puppeteer" ]; then
        echo "   ❌ puppeteer not installed"
        echo "      Run: npm install puppeteer"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✓ puppeteer installed"
    fi

    if [ ! -d "node_modules/sharp" ]; then
        echo "   ⚠️  sharp not installed (optional)"
        echo "      Run: npm install sharp"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✓ sharp installed"
    fi
fi

# Verificar JSON files
echo ""
echo "7. Validating JSON files..."
if command -v node &> /dev/null; then
    for json in .claude-plugin/plugin.json package.json templates/config-template.json; do
        if node -e "JSON.parse(require('fs').readFileSync('$json'))" 2>/dev/null; then
            echo "   ✓ Valid JSON: $json"
        else
            echo "   ❌ Invalid JSON: $json"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi

# Resumen
echo ""
echo "=========================================="
echo "  Verification Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Plugin is ready to use."
    echo ""
    echo "Next steps:"
    echo "1. Configure your project: /milhouse:configure"
    echo "2. Add Figma reference to .claude/figma-refs/"
    echo "3. Run your first check: /milhouse:check"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found (plugin should work)"
    echo ""
    echo "Consider fixing warnings for optimal experience."
    exit 0
else
    echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found"
    echo ""
    echo "Please fix errors before using the plugin."
    exit 1
fi
