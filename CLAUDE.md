# Milhouse Plugin - Instructions for Claude

**"Milhouse validates. Ralph iterates."**

Milhouse is a Visual QA plugin that compares implementation screenshots against Figma designs or previous versions **using Claude Code's built-in vision capabilities**.

## How It Works

1. User runs `/milhouse:check` or `/milhouse:compare`
2. Bash script captures screenshot(s) using Puppeteer
3. **You (Claude Code) read both images directly** using the Read tool
4. **You analyze the images** and identify visual differences
5. **You generate the feedback report** in `.claude/milhouse-feedback.md`

**No external API calls needed** - you have vision capabilities built-in!

## Purpose

Milhouse closes the visual feedback loop in the **Lisa-Ralph-Milhouse trilogy**:

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  LISA   │ ──► │  RALPH  │ ──► │ MILHOUSE │
│ (plan)  │     │ (build) │     │(validate)│
└─────────┘     └─────────┘     └──────────┘
                     ▲                │
                     │                │
                     └── feedback ────┘
```

## Available Commands

### `/milhouse:check`
Executes visual comparison between implementation and Figma reference.

**After screenshot capture, you should:**
1. Read `.claude/milhouse-screenshot.png` (current implementation)
2. Read the reference image path (from command argument)
3. Analyze both images meticulously
4. Generate structured feedback report

### `/milhouse:compare`
Compares two screenshots directly, **no Figma required**.

**After screenshot(s) are ready, you should:**
1. Read both image files
2. Compare for visual differences
3. Generate structured feedback report

## Your Analysis Process

When executing Milhouse commands, you should:

### 1. Read Both Images

Use the Read tool to load:
- Current implementation screenshot
- Reference design/screenshot

### 2. Analyze Meticulously

Compare every visual aspect:
- **Spacing:** margins, paddings, gaps
- **Colors:** background, text, borders (provide hex values)
- **Typography:** font-size, weight, family, line-height, letter-spacing
- **Sizes:** width, height, dimensions (provide px values)
- **Alignment:** text-align, justify-content, align-items
- **Borders:** width, radius, style
- **Shadows:** box-shadow, text-shadow
- **Other:** any other visual differences

Be VERY SPECIFIC:
- Exact pixel values (e.g., "16px" not "small")
- Hex color codes (e.g., "#3B82F6" not "blue")
- Specific CSS properties (e.g., "padding-top" not "spacing")

Ignore:
- Dynamic content (lorem ipsum text, placeholder images, dates, usernames)
- Minor anti-aliasing differences
- Insignificant sub-pixel variations

### 3. Generate Feedback Report

Save to `.claude/milhouse-feedback.md`:

```markdown
# Milhouse Visual QA Report

**Generated:** [current timestamp]
**Status:** APPROVED | DIFFERENCES_FOUND
**Summary:** [one-line summary]

---

[If APPROVED:]
## ✅ APPROVED

The implementation matches the design reference.

### Verified elements:
- ✓ [element 1]
- ✓ [element 2]
...

[If DIFFERENCES_FOUND:]
## ❌ DIFFERENCES FOUND

Found [N] difference(s) requiring correction.

### 🔴 Critical (N)

**1. [Element Name]** (category)
- **Issue:** [clear description]
- **Current:** `[actual value with units]`
- **Expected:** `[expected value with units]`
- **CSS Property:** `[specific property]`
- **Suggested Fix:**
  ```css
  [selector] {
    [property]: [value];
  }
  ```

### 🟠 Major (N)
[same format for major issues]

### 🟡 Minor (N)
[same format for minor issues]

---

## 📋 Summary for Ralph

```
Fix the following visual differences:

- [Element]: [Description]. Change [property] from "[current]" to "[expected]"
...

After corrections, output <promise>VISUAL_FIXED</promise>
```

### ✅ Correct elements:
- [element 1]
- [element 2]
...
```

### 4. Save JSON Data

Also save to `.claude/milhouse-feedback.json`:

```json
{
  "status": "APPROVED" | "DIFFERENCES_FOUND",
  "summary": "...",
  "differences": [
    {
      "element": "...",
      "category": "spacing|color|typography|size|alignment|border|shadow|other",
      "description": "...",
      "current": "...",
      "expected": "...",
      "severity": "critical|major|minor",
      "cssProperty": "...",
      "suggestedFix": "..."
    }
  ],
  "approvedElements": [...]
}
```

### 5. Display Summary

After saving files, display:
- If APPROVED: "🎉 Visual QA PASSED! Implementation matches design."
- If differences: "⚠️ Found [N] differences. Review .claude/milhouse-feedback.md"

## Severity Guidelines

- **Critical:** Obvious, user-facing differences that break design intent
- **Major:** Noticeable differences that affect UX or visual consistency
- **Minor:** Small differences that are barely noticeable

## Integration with Ralph Loop

After you generate feedback, user can run:

```bash
/ralph-loop "Read .claude/milhouse-feedback.md and fix all differences. Output <promise>VISUAL_FIXED</promise>" --max-iterations 10
```

Ralph will read your feedback and make the corrections.

## Example Workflow

1. **User runs:**
   ```bash
   /milhouse:check --reference .claude/figma-refs/landing.png
   ```

2. **Bash script captures screenshot to `.claude/milhouse-screenshot.png`**

3. **You should:**
   - Read `.claude/milhouse-screenshot.png`
   - Read `.claude/figma-refs/landing.png`
   - Analyze differences
   - Write `.claude/milhouse-feedback.md`
   - Write `.claude/milhouse-feedback.json`
   - Display summary

4. **User reviews feedback and may run Ralph to fix**

## Important Notes

- **No API key needed** - you analyze images directly
- **Be specific** - provide exact values (px, hex, CSS properties)
- **Be actionable** - every difference should have a suggested fix
- **Be thorough** - identify ALL differences, not just major ones
- **Ignore dynamic content** - focus on structure and styling

## Full Trilogy Workflow

```bash
# 1. Lisa plans
/lisa "Create landing page"

# 2. Ralph implements
/ralph-loop "Implement per spec" --max-iterations 20

# 3. You (Milhouse/Claude) validate
/milhouse:check --reference .claude/figma-refs/landing.png
# You read both images and generate feedback

# 4. Ralph fixes (if needed)
/ralph-loop "Fix per milhouse feedback" --max-iterations 10

# 5. Iterate until approved
```

---

**Part of the Lisa-Ralph-Milhouse trilogy**

- [Lisa](https://github.com/blencorp/lisa) - Planning
- [Ralph Loop](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) - Implementation
- **Milhouse** - Visual Validation (powered by Claude Vision)
