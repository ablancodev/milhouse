# Milhouse - Quick Start Guide

Get started with Milhouse in 5 minutes.

## Command Locations Overview

**In TERMINAL (outside Claude Code):**
- Install dependencies: `npm install`
- Set environment variables: `export ANTHROPIC_API_KEY=...`
- View reports: `cat .claude/milhouse-feedback.md`

**In CLAUDE CODE:**
- All `/milhouse:*` commands
- All `/ralph-loop` commands
- Configuration and validation

---

## 1. Quick Install (in TERMINAL, outside Claude Code)

```bash
# Navigate to plugin directory
cd /path/to/milhouse

# Install Node dependencies (Puppeteer + Sharp, ~300MB)
npm install

# Configure API key (add to ~/.zshrc or ~/.bashrc for persistence)
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: For Figma API
export FIGMA_ACCESS_TOKEN=figd_your-token
```

**Note:** This installs Puppeteer locally with Chromium (~300MB download).

## 2. Add Design Reference

**Option A: Manual export (simplest)**
1. Open your design in Figma
2. Select the frame
3. Right-click → Export → PNG @2x
4. Save as `.claude/figma-refs/design.png`

**Option B: Figma API (automated)**
```bash
export FIGMA_ACCESS_TOKEN=figd_your-token
/milhouse:configure --figma-file YOUR_FILE_ID
/milhouse:export-figma --frame "Home Desktop"
```

## 3. Configure Project (in CLAUDE CODE)

```bash
/milhouse:configure --url http://localhost:8000 --reference .claude/figma-refs/design.png
```

## 4. First Validation (in CLAUDE CODE)

```bash
# Make sure your server is running
# Then execute:
/milhouse:check
```

## 5. Review Results (TERMINAL or editor)

```bash
# View the report (in terminal)
cat .claude/milhouse-feedback.md

# Or open in your editor
```

## 6. Fix with Ralph (in CLAUDE CODE)

```bash
# If there are differences, pass to Ralph
/ralph-loop "Read .claude/milhouse-feedback.md and fix differences" --max-iterations 10
```

## Complete Example: Lisa → Ralph → Milhouse

```bash
# 1. LISA: Generate spec
/lisa "Build a landing page with hero, features, and CTA"
# Output: detailed-spec.md

# 2. Setup Milhouse
export ANTHROPIC_API_KEY=sk-ant-...
/milhouse:configure --url http://localhost:3000

# 3. Add Figma reference
# Save design to .claude/figma-refs/landing.png

# 4. RALPH: Implement
/ralph-loop "Implement landing per detailed-spec.md" --max-iterations 20

# 5. MILHOUSE: Validate
/milhouse:check --reference .claude/figma-refs/landing.png

# 6. RALPH: Fix if needed
/ralph-loop "Read .claude/milhouse-feedback.md and fix" --max-iterations 10

# 7. MILHOUSE: Validate again
/milhouse:check --reference .claude/figma-refs/landing.png

# Repeat 6-7 until APPROVED ✅
```

## Regression Testing (No Figma Needed)

```bash
# 1. Capture golden screenshot
npm run dev
/milhouse:check --url http://localhost:8000
mkdir -p .claude/screenshots/golden
cp .claude/milhouse-screenshot.png .claude/screenshots/golden/v1.0.png

# 2. Make changes
# ... edit code ...

# 3. Compare with golden
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden/v1.0.png

# 4. Fix if regression detected
/ralph-loop "Read .claude/milhouse-feedback.md and fix regressions" --max-iterations 5

# 5. Validate fix
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden/v1.0.png
```

## Most Common Commands

```bash
# Basic validation
/milhouse:check

# Mobile viewport
/milhouse:check --viewport 375x667

# Specific component
/milhouse:check --selector ".hero-section"

# Screenshot comparison
/milhouse:compare --current http://localhost:8000 --reference .claude/screenshots/previous.png

# Help
/milhouse:help
```

## Pro Tips

1. **Multiple references:** Create one reference per component/page
2. **Naming:** Use descriptive names: `home-desktop.png`, `hero-mobile.png`
3. **Iterative:** Validate component by component, not everything at once
4. **Ralph integration:** Use short iterations (5-10) for visual fixes
5. **Viewports:** Validate desktop first, then mobile/tablet

## Troubleshooting

**"ANTHROPIC_API_KEY not set"**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**"Screenshot failed"**
- Verify server is running: `curl http://localhost:8000`
- Increase `waitTime` in config if page is slow to load

**"Reference not found"**
```bash
ls -la .claude/figma-refs/  # Verify it exists
```

## Next Steps

- Read [README.md](./README.md) for complete documentation
- Read [CLAUDE.md](./CLAUDE.md) for Claude-specific instructions
- Report bugs at https://github.com/anthropics/claude-code/issues

---

**Part of the Lisa-Ralph-Milhouse trilogy**

[Lisa](https://github.com/blencorp/lisa) · [Ralph Loop](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) · **Milhouse**
