# // 001. INTENCION

> Explica en una frase humana qué problema resuelve esta PR y por qué importa.

Contexto breve. Máximo dos párrafos. Sin tono corporate, sin relleno.

---

## // 002. CAMBIO

### Área principal

- `path/to/file.vue`: cambio concreto y por qué existe.
- `path/to/other.ts`: cambio concreto y límite cubierto.

### Segunda área, si aplica

- Cambio concreto.
- Cambio concreto.

---

## // 003. BLINDAJE

> Qué protege este cambio para no romper comportamiento existente.

- Fallbacks añadidos.
- Riesgos evitados.
- Decisiones defensivas.
- Accesibilidad, performance o SSR si aplica.

---

## // 004. VERIFICACION

| Check | Resultado |
| --- | --- |
| `bun run build` | Passed / skipped con motivo |
| Test manual principal | Resultado concreto |
| Regresión importante | Resultado concreto |

---

## // 005. RIESGOS

> Lo que todavía puede morder.

- Riesgo residual real, o `Ninguno detectado` si no hay uno concreto.

---

## // 006. NOTAS

- PRs en español por defecto.
- Usar Markdown rico: títulos, subtítulos, quotes, tablas y referencias a archivos.
- No usar cuerpos genéricos en inglés salvo que se pida explícitamente.
- No dejar resúmenes automáticos como fuente principal de la descripción.
