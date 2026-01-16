# Changelog

All notable changes to the Milhouse plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
