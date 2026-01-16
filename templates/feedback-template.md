# Milhouse Visual QA Report

**Generated:** {{timestamp}}
**Status:** {{status}}
**URL:** {{url}}
**Reference:** {{reference}}

---

{{#if approved}}
## ✅ APPROVED

La implementación coincide con el diseño de Figma.

### Elementos verificados:
{{#each approvedElements}}
- ✓ {{this}}
{{/each}}
{{else}}
## ❌ DIFFERENCES FOUND

Se encontraron {{differences.length}} diferencia(s) que requieren corrección.

### Diferencias por corregir:

{{#each differences}}
#### {{index}}. {{element}}

- **Categoría:** {{category}}
- **Descripción:** {{description}}
- **Actual:** `{{current}}`
- **Esperado:** `{{expected}}`
- **Severidad:** {{severity}}
- **Propiedad CSS:** `{{cssProperty}}`
- **Fix sugerido:**
  ```css
  {{suggestedFix}}
  ```

{{/each}}

---

## 📋 Resumen para Ralph

Copia este bloque para pasar a Ralph Loop:

```
Corrige las siguientes diferencias visuales respecto al diseño de Figma:

{{#each differences}}
- {{element}}: {{description}}. Cambiar {{cssProperty}} de "{{current}}" a "{{expected}}"
{{/each}}

Después de corregir, el resultado debe coincidir visualmente con el diseño de referencia.
Output <promise>VISUAL_FIXED</promise> cuando todas las correcciones estén aplicadas.
```

{{/if}}

---

### ✅ Elementos correctos:
{{#each approvedElements}}
- {{this}}
{{/each}}
