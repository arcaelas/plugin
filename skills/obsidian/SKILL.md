---
name: obsidian
description: >
  How to consult the user's Obsidian vault (MCP `obsidian-vault`) — the single source
  of truth for every technical decision: coding preferences, design laws, per-stack
  conventions (Flutter, NextJS, Serverless), documentation of every project and own
  library, and solved errors. This skill MUST be consulted before writing code,
  creating files, choosing libraries, or making any technical decision. Use it when
  the user mentions "vault", "obsidian", "preferencias", "convenciones", "memorias",
  or when a task requires knowing how the user does things. Replaces the retired RAG:
  when any other skill says "the RAG wins", read "the vault wins".
---

# Obsidian — el vault como fuente de verdad

El vault (MCP `obsidian-vault`) contiene TODAS las preferencias del usuario, redactadas como instrucciones con ejemplos good/bad comentados. Consultarlo antes de cualquier decisión técnica es innegociable. Este skill enseña dónde y cómo buscar sin divagar.

## Tools

| Tool | Cuándo |
|------|--------|
| `mcp__obsidian-vault__get_vault_file` | SIEMPRE que sepas qué documento aplica (el caso normal: el mapa de abajo te lo dice). |
| `mcp__obsidian-vault__search_vault_smart` | SOLO cuando ningún documento del mapa calza (búsqueda semántica por significado). |
| `mcp__obsidian-vault__search_vault_simple` | Texto exacto (un mensaje de error literal, un nombre). |
| `mcp__obsidian-vault__list_vault_files` | Listar una carpeta (`directory: "preferences"`). |
| `mcp__obsidian-vault__patch_vault_file` / `create_vault_file` | Escribir de vuelta lo aprendido (ver "Escritura"). |

## Mapa de consulta por intención (ir DIRECTO al documento)

| Vas a… | Lee |
|--------|-----|
| Escribir/refactorizar TypeScript | El doc del tema en `preferences/`: `nomenclatura.md`, `flujo-de-control.md`, `datos-y-expresiones.md`, `funciones.md`, `clases.md`, `tipado.md`, `asincronia.md`, `errores-y-jsdoc.md`, `arquitectura-de-archivos.md` |
| Crear un servicio/endpoint | `preferences/backend.md` + `preferences/<stack>/arquitectura.md` |
| Construir/modificar UI | `preferences/diseno-leyes.md` PRIMERO; luego el aspecto: `diseno-visual.md`, `diseno-interaccion.md`, `diseno-datos-y-shell.md`, `diseno-contenido-y-delight.md`; con datos de por medio también `diseno-metodo.md` |
| Proyecto Flutter | `preferences/flutter/arquitectura.md` + `preferences/flutter/flujo-dev.md` |
| Proyecto NextJS | `preferences/nextjs/arquitectura.md` + `preferences/nextjs/stack-serverless-yml.md` |
| Proyecto Serverless Framework | `preferences/serverless/arquitectura.md` |
| Tocar un proyecto existente | `projects/<nombre-real>/index.md` (o README.md) ANTES que su código |
| Usar una librería propia | `projects/@arcaelas/<lib>/index.md` (agent, whatsapp, dynamite, collection, utils, plugin) |
| Git, dependencias, arrancar servidores | `preferences/runtime-y-entorno.md` |
| Un error raro | Buscar el síntoma en `reports/` ANTES de rediagnosticar |
| La tarea no calza en nada de arriba | Leer el `index.md` raíz del vault (tabla completa) o `search_vault_smart` |

## Reglas de consulta

1. **Directo primero**: el mapa elimina la búsqueda en el 90% de los casos; `search_vault_smart` es el fallback, no el default.
2. **Múltiples consultas en tareas transversales**: si el feature toca autenticación y base de datos, leer cada documento aplicable y cruzar antes de actuar.
3. **Batching**: una lectura por TEMA cubre todas las mutaciones de ese tema en el mismo lote — no releer por archivo.
4. **Autoridad**: si el vault tiene una convención, se sigue; si tiene un patrón, se replica; ante conflicto con cualquier skill (clean-code, davinci), **el vault gana**.
5. **Sin respuesta**: decir explícito que el vault no tiene la información y proponer — nunca inferir de otro proyecto ni del training data.
6. **Vault inaccesible** (Obsidian cerrado, MCP caído): NO improvisar; avisar al usuario y detener la decisión técnica hasta recuperar acceso o recibir override explícito.

## Escritura — lo aprendido se escribe de vuelta

- **Corrección o preferencia nueva** → patch del documento de tema correspondiente en `preferences/` (no crear notas paralelas), con el formato instruccional del vault: trigger → reglas → **Por qué** → good/bad comentados.
- **Error no-obvio resuelto** → nota en `reports/` con el formato: síntoma → causa → corrección → cómo reconocerlo la próxima vez.
- **Hallazgo de un proyecto** → `projects/<nombre-real>/`.
- Disparadores: "recuerda…", "desde ahora…", "siempre/nunca…", una corrección del usuario, una decisión arquitectónica explícita.

## Sub-agentes

Los sub-agentes reciben las tools `mcp__obsidian-vault__*` directamente. Todo prompt a un sub-agente que vaya a producir código debe listar los documentos del vault que debe leer antes de actuar; un sub-agente sin esas directivas trabaja en contexto degradado.
