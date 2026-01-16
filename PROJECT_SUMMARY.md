# Milhouse Plugin - Project Summary

## Overview

**Milhouse** es un plugin completo de Visual QA para Claude Code que compara screenshots de implementaciones web contra diseños de Figma usando Claude Vision API.

**Filosofía:** "Milhouse validates. Ralph iterates."

## Project Statistics

- **Total Files:** 21
- **Total Lines:** ~2000+ (code + documentation)
- **Scripts:** 4 (3 JavaScript + 1 Bash)
- **Commands:** 4 slash commands
- **Documentation:** 5 comprehensive docs
- **Version:** 1.0.0

## Complete File Structure

```
milhouse/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata and configuration
├── .claude/
│   └── settings.local.json      # Local Claude settings
├── commands/                     # Slash command definitions
│   ├── check.md                 # /milhouse:check - Main comparison command
│   ├── configure.md             # /milhouse:configure - Setup configuration
│   ├── export-figma.md          # /milhouse:export-figma - Figma frame export
│   └── help.md                  # /milhouse:help - Documentation
├── hooks/
│   └── hooks.json               # Empty (Milhouse is passive)
├── scripts/                      # Core functionality
│   ├── screenshot.js            # Puppeteer screenshot capture (95 lines)
│   ├── compare-vision.js        # Claude Vision API integration (366 lines)
│   ├── figma-export.js          # Figma API frame export (156 lines)
│   └── setup.sh                 # Dependency installer (66 lines)
├── templates/
│   ├── config-template.json     # Configuration schema
│   └── feedback-template.md     # Report template (Handlebars-style)
├── Documentation/
│   ├── README.md                # Complete user documentation (500+ lines)
│   ├── CLAUDE.md                # Instructions for Claude (200+ lines)
│   ├── QUICKSTART.md            # 5-minute quick start guide
│   ├── CHANGELOG.md             # Version history
│   └── PROJECT_SUMMARY.md       # This file
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── LICENSE                      # MIT License
└── package.json                 # Node.js dependencies

Generated files (in user projects):
.claude/
├── milhouse.config.json         # Project configuration
├── milhouse-feedback.md         # Latest comparison report
├── milhouse-feedback.json       # Report data (structured)
├── milhouse-screenshot.png      # Latest screenshot
└── figma-refs/                  # Reference images directory
    └── *.png                    # Figma exports
```

## Core Features

### 1. Visual Comparison
- **Claude Vision API** integration for intelligent image comparison
- **Puppeteer-based** screenshot capture with full page support
- **CSS selector** support for component-level comparison
- **Multiple viewports** (desktop, tablet, mobile)

### 2. Figma Integration
- **Automatic frame export** via Figma API
- **Manual export support** for users without API access
- **Frame discovery** and listing

### 3. Feedback Generation
- **Structured reports** in Markdown and JSON
- **Severity categorization** (critical, major, minor)
- **Category grouping** (spacing, color, typography, size, alignment, border, shadow)
- **Actionable fixes** with CSS property suggestions
- **Ralph Loop integration** with formatted summaries

### 4. Configuration
- **Project-level config** in `.claude/milhouse.config.json`
- **Environment variables** for API keys
- **Customizable settings** (viewports, timeouts, selectors)

## Technologies Used

- **Node.js** 18+ (JavaScript runtime)
- **Puppeteer** 22.0+ (headless browser for screenshots)
- **Sharp** 0.33+ (image processing)
- **Claude Vision API** (Sonnet 4 - image comparison)
- **Figma API** (frame export)
- **Bash** (command orchestration)
- **Markdown** (command definitions and reports)

## Slash Commands

| Command | Purpose | Arguments |
|---------|---------|-----------|
| `/milhouse:check` | Compare implementation vs. design | url, reference, viewport, selector, output |
| `/milhouse:configure` | Setup project configuration | url, reference, figma-file, figma-token |
| `/milhouse:export-figma` | Export Figma frames | frame, list, scale |
| `/milhouse:help` | Show documentation | none |

## Integration Flow

```
LISA (spec) → RALPH (code) → MILHOUSE (visual QA)
                  ↑________________↓
                  (feedback if differences found)
```

1. **Ralph implements** code based on spec
2. **Milhouse validates** against Figma design
3. **Feedback generated** if differences exist
4. **Ralph corrects** based on feedback
5. **Repeat 2-4** until APPROVED

## Key Design Decisions

1. **Non-invasive:** Milhouse only generates reports, never modifies code
2. **Passive hooks:** No automatic triggers, user-initiated only
3. **Actionable feedback:** Specific values (px, hex) and CSS properties
4. **Flexible references:** Supports both Figma API and manual exports
5. **Structured output:** Both human-readable (Markdown) and machine-readable (JSON)

## Environment Variables

**Required:**
```bash
ANTHROPIC_API_KEY=sk-ant-...  # For Claude Vision
```

**Optional:**
```bash
FIGMA_ACCESS_TOKEN=figd_...   # For Figma API
```

## Installation

```bash
cd /path/to/milhouse
bash scripts/setup.sh
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage Example

```bash
# Configure
/milhouse:configure --url http://localhost:8000

# Add Figma reference
/milhouse:export-figma --frame "Home Desktop"

# Implement
/ralph-loop "Implement landing page" --max-iterations 20

# Validate
/milhouse:check

# Fix (if needed)
/ralph-loop "Fix per milhouse feedback" --max-iterations 10

# Validate again
/milhouse:check  # → APPROVED ✅
```

## Testing Checklist

- [ ] Install plugin in Claude Code
- [ ] Run `/milhouse:help` - verify command shows
- [ ] Run `bash scripts/setup.sh` - verify dependencies install
- [ ] Set `ANTHROPIC_API_KEY` environment variable
- [ ] Create test project with local server (e.g., http://localhost:8000)
- [ ] Export Figma frame manually to `.claude/figma-refs/test.png`
- [ ] Run `/milhouse:check --url http://localhost:8000 --reference .claude/figma-refs/test.png`
- [ ] Verify `.claude/milhouse-feedback.md` is generated
- [ ] Verify feedback format matches spec
- [ ] Test with Ralph Loop integration

## Future Enhancements

- [ ] Multi-viewport batch comparison
- [ ] Multiple page comparison
- [ ] Visual diff image generation
- [ ] CI/CD integration examples
- [ ] Figma webhook integration
- [ ] Quantitative similarity metrics
- [ ] Video/animation support
- [ ] Progress indicators

## Documentation

| File | Purpose | Lines |
|------|---------|-------|
| README.md | Complete user guide | 500+ |
| CLAUDE.md | Claude-specific instructions | 200+ |
| QUICKSTART.md | 5-minute quick start | 150+ |
| CHANGELOG.md | Version history | 70+ |
| PROJECT_SUMMARY.md | This file | 250+ |

## Dependencies

```json
{
  "puppeteer": "^22.0.0",
  "sharp": "^0.33.0"
}
```

## License

MIT License - See LICENSE file

## Support

- **Documentation:** See README.md and CLAUDE.md
- **Issues:** https://github.com/anthropics/claude-code/issues
- **Questions:** Review QUICKSTART.md for common scenarios

## Credits

Developed for the LISA-RALPH-MILHOUSE ecosystem.
Created: January 16, 2025
Version: 1.0.0

---

**Status:** ✅ Ready for testing and deployment

The plugin is complete with all core features, comprehensive documentation, and error handling implemented according to the specification.
