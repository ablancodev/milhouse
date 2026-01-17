# Milhouse: Screenshot Comparison without Figma

## Summary

Milhouse **CAN compare screenshots directly** without needing Figma designs. This functionality is ideal for:

- **Regression testing** - Detect unintended visual changes
- **Branch comparison** - See differences before merging
- **Environment comparison** - Compare staging vs production
- **Mockup validation** - Validate against static designs

## Main Command

```bash
/milhouse:compare --current <URL or path> --reference <screenshot-path>
```

## Use Cases

### 1. Regression Testing

Maintain "golden" screenshots of approved versions and compare against them:

```bash
# Capture golden from approved version
/milhouse:check --url http://localhost:8000
mkdir -p .claude/screenshots/golden
cp .claude/milhouse-screenshot.png .claude/screenshots/golden/v1.0-home.png

# After making changes, compare
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden/v1.0-home.png
```

**Benefit:** Automatically detects if your changes visually affected other parts of the app.

### 2. Branch Comparison

Compare different branches before merging:

```bash
# On main
git checkout main && npm run dev
/milhouse:check --url http://localhost:3000
cp .claude/milhouse-screenshot.png .claude/screenshots/main.png

# On feature branch
git checkout feature/redesign && npm run dev
/milhouse:compare \
  --current http://localhost:3000 \
  --reference .claude/screenshots/main.png
```

**Benefit:** See exactly what changed visually in your PR.

### 3. Environment Comparison

Verify that staging and production are identical:

```bash
# Capture production
/milhouse:check --url https://myapp.com
cp .claude/milhouse-screenshot.png .claude/screenshots/prod.png

# Compare staging
/milhouse:compare \
  --current https://staging.myapp.com \
  --reference .claude/screenshots/prod.png
```

**Benefit:** Ensures deployment didn't introduce visual differences.

### 4. Validate Static Mockups

If you have designs in PNG/JPG but not in Figma:

```bash
# You have a mockup in design.png
/milhouse:compare \
  --current http://localhost:8000 \
  --reference ./designs/homepage-mockup.png
```

**Benefit:** Can use any image as reference, not just Figma.

## Differences with /milhouse:check

| Aspect | /milhouse:check | /milhouse:compare |
|---------|-----------------|-------------------|
| **Purpose** | Validate against Figma design | Compare screenshots with each other |
| **Reference** | Figma export (original design) | Previous screenshot (implementation) |
| **Prompt** | "Figma design vs implementation" | "Reference vs current" |
| **Typical Use** | Design fidelity | Regression, changes, comparisons |

## Screenshot Organization

Recommended structure:

```
.claude/screenshots/
├── golden/                    # Approved "golden" versions
│   ├── v1.0-home-desktop.png
│   ├── v1.0-home-mobile.png
│   ├── v1.0-dashboard.png
│   └── v1.1-home-desktop.png
├── branches/                  # Branch screenshots
│   ├── main-home.png
│   ├── feature-redesign.png
│   └── hotfix-navbar.png
└── environments/              # Environment screenshots
    ├── production-home.png
    ├── staging-home.png
    └── dev-home.png
```

## Complete Workflow: Regression Testing

```bash
# ==== PHASE 1: ESTABLISH BASELINE ====
# In TERMINAL: Start server
npm run dev

# In CLAUDE CODE: Capture golden screenshot of approved version
/milhouse:check --url http://localhost:8000

# In TERMINAL: Save as golden
mkdir -p .claude/screenshots/golden
cp .claude/milhouse-screenshot.png .claude/screenshots/golden/v1.0-home.png

# ==== PHASE 2: DEVELOPMENT ====
# Make code changes
# ... edit files ...

# ==== PHASE 3: VALIDATION ====
# In CLAUDE CODE: Compare with golden
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden/v1.0-home.png

# Claude Code will analyze both screenshots and generate feedback report

# ==== PHASE 4A: IF UNINTENDED DIFFERENCES ====
# In TERMINAL or editor: Review feedback
cat .claude/milhouse-feedback.md

# In CLAUDE CODE: Fix with Ralph
/ralph-loop "Read .claude/milhouse-feedback.md. There are unintended visual changes. Revert or fix to match reference." --max-iterations 5

# In CLAUDE CODE: Validate fixes
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden/v1.0-home.png

# ==== PHASE 4B: IF CHANGES ARE INTENTIONAL ====
# In TERMINAL: Update golden with new approved version
cp .claude/milhouse-screenshot.png .claude/screenshots/golden/v1.1-home.png
```

## CI/CD Integration

**Note:** CI/CD integration requires Claude Code to be available in your pipeline environment. For traditional CI/CD without Claude Code, consider using pixel-diff tools (pixelmatch, BackstopJS, etc.) instead.

If you have Claude Code in your CI environment:

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression
on: [pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install && cd milhouse && npm install

      - name: Start dev server
        run: npm run dev &

      - name: Compare with main branch
        # This requires Claude Code CLI in CI environment
        run: |
          claude-code /milhouse:compare \
            --current http://localhost:3000 \
            --reference .claude/screenshots/main.png

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: visual-diff-report
          path: .claude/milhouse-feedback.md
```

## Advantages of Screenshot Comparison

1. **No Figma required** - Works with any reference image
2. **Detects regressions** - Automatically sees unintended changes
3. **Compares implementations** - Useful for branches, environments, versions
4. **Flexible** - Use any PNG/JPG as reference
5. **Automatable** - Can integrate into CI/CD

## Limitations

- **Doesn't replace original design:** Screenshots capture implementation, not idealized design
- **Dynamic content:** Changes in dynamic text/images may generate false positives
- **Timestamp-dependent:** If your app shows dates/times, they'll be different
- **Resolution:** Make sure to use same viewport for fair comparisons

## Tips

1. **Golden screenshots per viewport:** Maintain goldens for desktop, tablet, mobile
2. **Clear nomenclature:** `v1.0-page-viewport.png` (e.g., `v1.0-home-desktop.png`)
3. **Version control:** Include goldens in git to share with team
4. **Selectors:** Use `--selector` to compare only specific components
5. **Consistency:** Always capture with same settings (viewport, wait time)

## Frequently Asked Questions

**Q: Can I use designer images (not from Figma)?**
A: Yes, any PNG/JPG works as reference.

**Q: How do I handle dynamic content (current date, username)?**
A: Claude Code is instructed to ignore dynamic content differences.

**Q: Can I compare production vs staging?**
A: Yes, use full URLs in `--current` and capture one as reference.

**Q: Does it work with SPAs that load dynamically?**
A: Yes, use `waitTime` and `waitForSelector` in config to wait for rendering.

**Q: Do I need an API key?**
A: No! Claude Code analyzes images using its built-in vision capabilities.

## Resources

- [Complete documentation](./README.md)
- [Quick guide](./QUICKSTART.md)
- [/milhouse:compare command](./commands/compare.md)
- [Changelog](./CHANGELOG.md)

---

**Version:** 1.2.0
**Last updated:** 2025-01-17

**Part of the Lisa-Ralph-Milhouse trilogy**

[Lisa](https://github.com/blencorp/lisa) · [Ralph Loop](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) · **Milhouse**
