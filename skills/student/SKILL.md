---
name: student
description: >
  Student mode — lifecycle continuo de captura iterativa de requisitos. Se activa con
  `/student` (slash command explícito o frase indirecta como "planeemos algo", "modo
  estudiante", "captura mis requisitos", "aprende sobre", "vamos a planear"). Entra en
  un loop study → apply → iterate que nunca termina: queda latente cuando no hay input
  del usuario y se reactiva con cualquier mensaje posterior. El brief vive bajo
  `.claude/student/{random}.md` del proyecto. La fase apply se dispara con `/apply`.
---

# Student — captura iterativa de requisitos

El modo estudiante convierte a Claude en un oyente estructurado: en lugar de ejecutar de inmediato, interroga al usuario, captura su intención en un archivo markdown del proyecto, y la ejecuta cuando el usuario lo ordena. El modo es un lifecycle continuo — nunca termina, solo alterna entre estudio y ejecución.

---

## 1. Activación y latencia del modo

**Activación.** El modo se activa explícitamente con el slash command `/student`. Frases indirectas como "planeemos algo", "modo estudiante", "captura mis requisitos", "aprende sobre…", "vamos a planear" también activan el modo — Claude entra automáticamente y lo avisa en la primera línea de su respuesta, sin pedir confirmación.

**Latencia.** El modo no se detiene jamás. Cuando no hay input del usuario, queda **latente**; se reactiva con cualquier mensaje posterior. No existe `/exit`, no existe trigger de apagado.

---

## 2. Ubicación del archivo del brief

El brief vive en `.claude/student/{random}.md` del proyecto que se está trabajando — un archivo por sesión, persistente, project-scoped. La carpeta `.claude/student/` es la convención fija; el nombre del archivo dentro es aleatorio.

Si `.claude/` o `.claude/student/` no existen al activar el modo, Claude los **crea automáticamente** sin preguntar. La primera vez que se crea `.claude/student/`, Claude agrega `.claude/student/` al `.gitignore` del proyecto — los briefs son estado personal del dev, no se versionan ni comparten.

La ruta del archivo se comparte con el usuario **solo al crear el archivo** y **cuando el usuario la pida explícitamente**. No se menciona después de cada actualización.

---

## 3. Primera ronda: tema y tipo de solicitud

**Si hay tema concreto al activar el modo**, la primera ronda pregunta el **tipo de solicitud** (Refactorización / Feature nueva / Investigación / Otro). La respuesta determina el layout del brief (sec 11).

**Si no hay tema concreto** (el usuario solo dijo `/student` sin contexto), la primera ronda es **exploratoria**: preguntas para descubrir qué quiere el usuario antes de crear el archivo. Una vez identificado el tema, se pregunta el tipo de solicitud y se crea el brief.

---

## 4. Lifecycle continuo: study ↔ apply

El modo es un loop continuo:

```
activar → study → apply → study → apply → … (latente cuando no hay input)
```

- **study** — rondas de preguntas que capturan o refinan el brief.
- **apply** — ejecución del brief. Se dispara con `/apply` (sec 12).
- **post-apply** — Claude vuelve **automáticamente** a study y emite la oración anchor para iniciar la siguiente ronda (sin pausa, sin esperar input).

El loop nunca termina; alterna entre study y apply hasta que el usuario deja de interactuar. La latencia natural es la única forma de "pausar".

---

## 5. Oración anchor antes de cada ronda de study

Antes de cada ronda de preguntas en fase `study`, Claude redacta literalmente la siguiente oración como **único output de chat permitido dentro de la ronda**. Solo cambia el número en `Ronda #N`:

> Estoy en modo estudiante — Ronda #N. Reglas obligatorias para esta ronda:
> 1. Cada pregunta debe estar estrictamente relacionada con el brief en construcción.
> 2. Está prohibido emitir resúmenes de los cambios aplicados.
> 3. Está prohibido entregar información no solicitada.
> 4. Está prohibido responder con texto entre tool calls.
> 5. Está prohibido decir cualquier cosa antes de terminar la ronda.
> El único output de chat permitido es esta misma oración, que repito antes de cada ronda.

La oración **no aparece en la fase apply** (silenciosa, ver sec 13).

---

## 6. `AskUserQuestion` siempre, maximizar preguntas

Toda pregunta al usuario en fase `study` pasa por `AskUserQuestion`. No hay prompts de texto libre. Se asume que el usuario solo selecciona opciones o responde brevemente.

Cada ronda emite la **cantidad máxima de preguntas** que `AskUserQuestion` permite por llamada (hasta 4). No preguntar una cosa a la vez si se pueden agrupar varias.

---

## 7. Leer el archivo antes de cada ronda

Antes de formular cualquier ronda de preguntas, Claude ejecuta `Read()` sobre el archivo del brief. Identifica qué secciones ya están cubiertas, qué decisiones ya están registradas y qué gaps quedan. Las preguntas de la siguiente ronda atacan únicamente los gaps — re-preguntar lo ya respondido es un defecto.

Si Claude considera el brief "completo según su intuición", **igualmente** ejecuta `Read()` para verificar formal antes de asumir completitud. La completitud se verifica leyendo, no asumiendo.

---

## 8. Aplicar cambios después de cada ronda: Edit por sección

Después de cada ronda de respuestas, los cambios se escriben **inmediatamente** en el archivo del brief:

- **Write completo** únicamente en la creación inicial.
- **Edit puntual por sección** en cada actualización posterior. Nunca reescribir el archivo entero — eso destruye el historial de decisiones y arriesga perder secciones que no estaban en la ronda actual.

La siguiente ronda de preguntas solo empieza después de que el archivo refleje la ronda anterior.

---

## 9. Manejo de respuestas no estructuradas

Tres casos no triviales que Claude debe manejar:

- **"Other" con texto libre** — el usuario escribió una respuesta personalizada. Antes de aplicarla al archivo, confirmar con una nueva pregunta cerrada que valide la interpretación.
- **Pregunta saltada / sin respuesta** — no asumir, no inventar. Marcar el punto como pendiente y volver a preguntarlo en una ronda posterior con opciones reformuladas.
- **Contradicción con decisión previa** — flagear el conflicto al usuario con una pregunta cerrada: ¿reemplaza la decisión previa, la complementa, o la nueva respuesta debe descartarse?

---

## 10. Estructura del archivo: títulos cortos, voz en primera persona

El archivo usa títulos mínimos — encabezados cortos y declarativos sin adornos. Dentro de cada sección, el desglose es exhaustivo: cada detalle que el usuario mencionó, cada restricción, cada preferencia, redactados de forma coherente. Sin imágenes, sin colores, sin elementos decorativos.

Todas las instrucciones almacenadas se escriben en **primera persona** desde la perspectiva del usuario: "Quiero…", "Estoy…", "Haré…", "Necesito…". El archivo es el brief del usuario para sí mismo, no el reporte de Claude.

---

## 11. Adaptar las secciones al tipo de solicitud

Las secciones del brief dependen del tipo declarado en sec 3:

- **Refactorización** — tres listas: qué se va a **eliminar**, **agregar** y **modificar**. Más subsecciones de **Diseño**, **Experiencia**, **Servidor** y **Servicios** según corresponda.
- **Nueva feature** — secciones para propósito, alcance, diseño, experiencia, datos, servicios.
- **Investigación / discovery** — secciones para hipótesis, fuentes, hallazgos, decisiones.
- **Otro** — Claude propone un layout mínimo (objetivo, decisiones, restricciones) y lo confirma con el usuario en la primera ronda.

---

## 12. Trigger formal de `/apply`

La transición de `study` a `apply` se dispara únicamente con el slash command explícito **`/apply`**. Lenguaje natural ambiguo (ej: "ya está", "hazlo", "vamos") **no** dispara la transición — solo `/apply` la activa.

`/apply` solo es válido cuando el modo `student` está activo y hay brief acumulado. Fuera del modo, `/apply` no hace nada (o redirige al usuario a activar `/student` primero).

---

## 13. Fase apply: silenciosa, alcance amplio, confirmación de destructivas

**Silencio total.** Durante la fase `apply` Claude no emite **ningún** output de chat — los pensamientos quedan en bloques de thinking, los cambios quedan en los tool calls. Sin oración anchor, sin anuncios de inicio o fin, sin resúmenes.

**Alcance amplio.** Claude puede tomar **cualquier acción necesaria** para cumplir el brief: Edit/Write sobre archivos del proyecto, comandos bash, requests externos, instalaciones de dependencias.

**Excepción — acciones destructivas.** Operaciones irreversibles o de alto impacto (`rm`, `force-push`, `drop`, instalaciones masivas, mutaciones a recursos remotos) requieren **confirmación previa rápida** vía `AskUserQuestion` antes de ejecutarse. Edits y comandos seguros se aplican directo.

---

## 14. Manejo de errores durante apply

Si una acción falla durante `apply` (un Edit retorna error, un comando bash retorna código distinto de cero, una request falla), Claude **pausa la fase apply** y emite una `AskUserQuestion` con tres opciones: **reintentar**, **saltar esta acción**, **abortar apply**. La decisión la toma el usuario sobre la marcha.

No hay best-effort silencioso, no hay rollback automático.

---

## 15. Set cerrado de slash commands

El modo `student` define únicamente dos slash commands:

- `/student` — activación o reactivación del modo.
- `/apply` — transición de `study` a `apply`.

No existen `/list`, `/resume`, `/reset`, `/exit` ni equivalentes. El set se mantiene mínimo y suficiente — todo lo demás se gestiona dentro del loop study/apply.
