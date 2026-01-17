# Changelog

All notable changes to the Milhouse plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-01-17

### 🚀 Major Architecture Change

**Migrated from external Claude Vision API to Claude Code's built-in vision capabilities**

This is a significant architectural change that simplifies setup and removes external dependencies.

### Changed
- **Image analysis now runs directly in Claude Code** using the built-in Read tool
- `/milhouse:check` command now delegates image analysis to Claude Code instead of external API
- `/milhouse:compare` command now delegates image analysis to Claude Code instead of external API
- Bash scripts now simply capture screenshots and prompt Claude Code to analyze
- Removed external API calls from screenshot.js and compare-vision.js

### Removed
- **ANTHROPIC_API_KEY requirement** - No longer needed!
- External API calls to Claude Vision API
- Token-based API authentication
- API cost concerns for image analysis

### Added
- Enhanced CLAUDE.md with detailed instructions for Claude on how to analyze images
- Clear separation of commands: TERMINAL (npm install) vs CLAUDE CODE (all /milhouse:* commands)
- Note in all documentation about Claude Code's built-in vision capabilities

### Documentation
- Updated README.md to remove API key setup instructions
- Updated QUICKSTART.md to simplify installation (just `npm install`)
- Updated CLAUDE.md with comprehensive analysis instructions for Claude
- Updated SCREENSHOT_COMPARISON.md with correct workflow and CI/CD notes
- Updated all command files (check.md, compare.md) with new execution model
- Added clear "Command Locations Overview" in QUICKSTART.md

### Benefits
- **Simpler setup** - Just `npm install`, no API keys needed
- **Better integration** - Analysis happens directly in Claude Code
- **No external API costs** - Uses Claude Code's built-in capabilities
- **Faster feedback loop** - Direct image analysis without external calls
- **More reliable** - No network dependencies for image analysis

## [1.1.0] - 2025-01-16

### Added
- **New command `/milhouse:compare`** for screenshot-to-screenshot comparison without Figma
- Support for regression testing (compare current vs previous version)
- Support for branch comparison (compare different git branches)
- Support for environment comparison (staging vs production)
- Flexible comparison prompt that adapts to comparison type (Figma vs screenshot)
- `--type` parameter in compare-vision.js for comparison context
- Documentation for non-Figma workflows
- Examples for regression testing and branch comparison

### Changed
- Updated `getComparisonPrompt()` to be context-aware (Figma vs generic screenshot)
- Updated `compareWithVision()` to accept `comparisonType` parameter
- Generalized feedback messages to work with any reference type
- Enhanced documentation in README, CLAUDE.md, and help.md

### Documentation
- Added comprehensive `/milhouse:compare` command documentation
- Added regression testing workflow examples
- Added branch comparison workflow examples
- Updated help command with new comparison scenarios

## [1.0.0] - 2025-01-16

### Added
- Initial release of Milhouse plugin
- `/milhouse:check` command for visual comparison
- `/milhouse:configure` command for project configuration
- `/milhouse:export-figma` command for Figma frame export
- `/milhouse:help` command for documentation
- Puppeteer-based screenshot capture
- Claude Vision API integration for image comparison
- Figma API integration for automatic frame export
- Markdown and JSON report generation
- Support for custom viewports (desktop, tablet, mobile)
- Support for CSS selector-based element capture
- Configurable wait times and selectors
- Severity-based difference categorization (critical, major, minor)
- Integration-ready feedback format for Ralph Loop
- Comprehensive documentation (README, CLAUDE.md, QUICKSTART)
- Setup script for dependency installation
- Template files for configuration and feedback

### Documentation
- Complete README with installation and usage instructions
- CLAUDE.md with Claude-specific instructions
- QUICKSTART.md for quick setup
- Inline documentation in all scripts
- Command help in each .md file

### Developer Experience
- Structured project layout
- Error handling and logging with [Milhouse] prefix
- Environment variable validation
- Config file validation
- Clear error messages

## [Unreleased]

### Planned
- Multi-viewport batch comparison
- Multiple page comparison in single command
- Visual diff image generation (highlighted differences)
- CI/CD integration examples
- Figma webhook integration
- Quantitative similarity metrics
- Video/animation support
- Progress indicators for long operations
- Caching for faster repeated comparisons

---

For full documentation, see [README.md](./README.md)
