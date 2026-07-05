---
name: publisher
description: >
  Publisher convierte una app terminada en su paquete de lanzamiento completo:
  ficha de Play Store / App Store (banners 16:9 y 9:16, splitted de 5 piezas,
  textos de tienda), guiones de video/audio publicitario para IAs generativas y
  campañas pagas (Meta/Facebook, Instagram, WhatsApp, TikTok, Snapchat,
  YouTube). Usar cuando el usuario pida "publicar la app", "ficha de la
  tienda", "banners", "screenshots de la Play Store", "splitted", "marketing",
  "video publicitario", "guión para IA", "campaña", "anuncios" o "ads".
---

# Publisher — de app terminada a lanzamiento

## El método (orden invariable)

Toda entrega de este skill —ficha, video o campaña— recorre el mismo ciclo, y
este documento está redactado en ese orden:

1. **Información** — recabar: la aplicación, el objetivo, los canales y el
   público. Del proyecto se lee lo que el código ya sabe; al usuario se le
   pregunta solo lo que el código no puede saber.
2. **Inventario** — conservación de recursos: qué imágenes, videos, audios y
   piezas de marca YA existen. Lo que existe se reutiliza; nada se regenera.
3. **Planificación** — organizar lo que tenemos contra lo que queremos. Aquí
   se redacta el guión o la propuesta, se presenta al usuario y se pule con él.
4. **Producción** — solo con el plan aprobado se compara guión vs inventario y
   se genera únicamente lo faltante (imágenes, clips, voz, música, SFX). La
   generación siempre nace del guión completo, nunca antes.
5. **Ensamblaje y publicación** — unir las piezas (ffmpeg lo ejecuta el agente
   si el proveedor no trae editor; o lo hace el usuario) y publicar.

Cada fase termina con una entrega revisable y una decisión explícita del
usuario antes de avanzar. Nunca se salta una fase.

---

## Fase 1 · Información e inventario

Objetivo: el **brief de publicación** + el **inventario de recursos**. Sin
ambos validados no se diseña nada.

### 1.1 Recabar del proyecto (sin preguntar lo que el código ya sabe)

| Dato | Dónde buscarlo primero |
|---|---|
| Nombre de la app | `pubspec.yaml`, `package.json`, manifest, título del launcher |
| Package name / bundle id | `AndroidManifest.xml` / `build.gradle` (`applicationId`), `Info.plist` |
| Versión y artefactos release | `pubspec.yaml`/gradle; AAB/APK/IPA existentes |
| Logo / marca | `assets/brand/`, `mipmap-*/ic_launcher*`, `*foreground*`. Pedir la variante **sin fondo**; si existe SVG del lettermark, preferirlo: escala sin pérdida y se inlinea en HTML |
| Colores de marca | SVGs de marca, theme/ColorScheme del código, config de Tailwind |
| Funcionalidades | Vistas y features reales del código — leer el proyecto, no inventar |

### 1.2 Preguntar al usuario (AskUserQuestion, no párrafos)

- Objetivo de esta ronda: ¿ficha, video, campaña o el paquete completo?
- Tiendas y canales: Play Store / App Store; redes donde vivirá la publicidad.
- Público objetivo e **idioma de la ficha** (manda sobre capturas y copy, no
  el idioma de la conversación).
- Precio o planes (gratis, IAP, suscripción) — afecta copy y badges.
- Claim de identidad si existe ("private", "offline", "sin cuenta"…).

### 1.3 Inventario — conservación de recursos existentes

Registrar ruta, formato y estado de todo recurso ya disponible:

- **Imágenes**: capturas de la app (¿crudas o ya editadas/anonimizadas?),
  piezas de marketing previas, logo y variantes.
- **Videos**: clips o anuncios anteriores reutilizables.
- **Audios**: voces, músicas o SFX ya generados.

Reglas del inventario: lo que existe **no se regenera**; las capturas
personales del usuario no se leen sin su autorización (se trabaja con rutas y
metadatos); los recursos que falten se anotan como *pendientes* — se decidirá
qué generar recién en Producción, con el plan aprobado.

### 1.4 Entregable

Brief corto en el chat: nombre, package, tiendas/canales, logo (ruta + hex),
paleta, 4–6 features vendibles, público, precio, idioma, e inventario con
pendientes. El usuario lo valida y se avanza.

---

## Fase 2 · Ficha de tienda

### 2.1 Planificar las imágenes de la ficha

Con el inventario a la vista, preguntar SIEMPRE:

1. ¿Se usan las capturas existentes o se generan imágenes 100% IA?
2. Si hay capturas crudas: ¿se editan con IA? (quitar status bar, traducir al
   idioma de la ficha, anonimizar datos). La edición puede ser **general** (un
   prompt maestro para todas) o **particular** (un prompt por imagen con línea
   de contexto).

El agente no edita: **redacta los prompts** (en inglés, donde los modelos de
edición rinden) y el usuario los ejecuta en su IA preferida y devuelve los
resultados a una carpeta acordada. Prompt maestro:

```
Edit this mobile app screenshot. Apply EXACTLY these changes and nothing else:
1. Remove the OS status bar strip and extend the app background upward,
   keeping the exact original dimensions.
2. Translate every visible UI text to <IDIOMA DE LA FICHA>, preserving each
   text's font style, size, weight, color and alignment.
3. Replace personal data with realistic placeholders: names → common neutral
   names, account/card numbers → "•••• 4821", real merchants → generic ones,
   amounts plausible but altered.
4. Change nothing else: identical layout, colors, spacing, icons and theme.
Context for this screenshot: it shows the [<PANTALLA>].
```

> Si el modelo se resiste, correr en dos pasadas: 1+4 primero, 2+3 sobre el
> resultado.

### 2.2 Propuestas efímeras en /tmp

- Carpeta temporal (`mktemp -d /tmp/publisher-XXXX`) con **un HTML de
  propuestas** que el usuario abre en el navegador y recarga en cada
  iteración. Es efímero: al proyecto no entra ningún archivo de marketing.
- Cada pieza se maqueta como **lienzo a tamaño real** (1080×1920 / 1920×1080)
  escalado para preview con `transform: scale(...)`: exportar después es
  capturar el mismo nodo a escala 1, sin re-maquetar.
- Las imágenes se referencian con `file://` a la carpeta del usuario: si él
  reemplaza una captura editada, la propuesta se actualiza al recargar.

### 2.3 Piezas a proponer (3 propuestas de cada una)

1. **Banner 16:9** (1920×1080) — marca general; recortable a 1024×500 para el
   feature graphic de Play.
2. **Banner 9:16** (1080×1920) — vertical.
3. **Splitted ×5** (5 piezas de 1080×1920) — un solo lienzo fragmentado.

Gramática del splitted (validada contra referencias reales):

- Las 5 piezas comparten **un mismo sistema de fondo**: misma base, misma
  textura, mismo motivo de formas cruzando cada corte; solo rota el tinte.
- **Nada se corta entre piezas**: titulares, teléfonos y chips viven completos
  dentro de su pieza; la continuidad la dan fondo, paleta y formas.
- Pieza 1 = manifiesto de marca (logo + claim, sin teléfono) · Piezas 2–4 =
  features (titular arriba, teléfono grande, chips alusivos, mini-cards de UI)
  · Pieza 5 = CTA de cierre.

Reglas de artesanía (los banners simples se rechazan):

- Logo real de la marca, SVG inline sin fondo, variantes clara/oscura.
- Redacción completa: titular a dos tonos, subtítulo, checklist de features
  con iconos, microcopy de cierre. Un banner sin contenido textual está a
  medio hacer.
- Chips con redacción específica del producto ("↑ 50 rows in 3 seconds",
  "Nothing moves without your OK") — nunca genéricos.
- Mini-cards de UI simulada (fila de transacción, badge de logro) dan vida.
- **Z-index por capas, documentado**: fondo 0 · formas/anillos 1 · teléfonos
  2–4 (solape intencional) · textos 5 · mini-UI 6 · chips 7.
- Texturas con CSS (grillas de puntos, mallas de luz, anillos concéntricos vía
  `radial-gradient`). Nada de fondos planos vacíos.
- Sin métricas de reputación inventadas (ratings/reviews falsos): los números
  salen de capacidades reales del producto.

### 2.4 Iteración, export y textos

- El usuario elige propuesta o mezcla; se itera sobre el mismo HTML efímero.
- Aprobado el diseño, exportar con Chrome headless a resolución nativa (una
  página HTML por pieza, mismo markup a escala 1):

```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --force-device-scale-factor=1 \
  --window-size=<W>,<H> --virtual-time-budget=4000 \
  --screenshot=<salida>.png file://<pieza>.html
```

- **Verificar cada PNG visualmente** antes de entregar. Nombres predecibles en
  la carpeta que el usuario indique: `16_9.png`, `9_16.png`,
  `splitted-1..5.png`.
- Completar con textos de tienda: título (≤30), descripción corta (≤80),
  descripción larga con bullets, en el idioma de la ficha.

---

## Fase 3 · Vídeo publicitario

El agente es guionista y director de producción: planifica, redacta el guión,
lo pule con el usuario y solo entonces se produce. No genera el video — entrega
bloques copy-paste por proveedor y ensambla al final.

### 3.1 Recaudo específico de video

Sobre el brief e inventario de la Fase 1, cerrar cuatro ejes con el usuario:

**Formato** — duración objetivo (15/30/60 s), aspecto (9:16 social, 16:9
in-stream), destino (Reels/Shorts/TikTok exigen gancho en los primeros 2 s).

**Voz** — idioma, acento, tono de dirección, velocidad. El diálogo se decide
en planificación, no al final.

**Música** — género acorde, instrumentación, curva de energía y dónde debe
replegarse para dejar hablar a la voz.

**Capacidades del proveedor** — responsabilidad del agente recaudarlas (pedir
captura del panel si hace falta):

- ¿Genera todo en conjunto (video+audio) o por partes (clips separados)?
- ¿Clips con audio propio (**Unmuted**) o mudos (**Muted**)? Un clip Unmuted
  lleva la redacción de su audio dentro del bloque; con clips Muted se avisa
  ANTES de generar que el sonido saldrá aparte.
- Duraciones por clip (suelen ser pasos fijos: 4/6/8 s), modelos disponibles,
  aspectos/resoluciones, límites de caracteres de los prompts.
- ¿Cómo se unen los fragmentos? ¿Editor del proveedor o ffmpeg del agente?

### 3.2 Planificación de escenas — lo que tenemos contra lo que queremos

Cada escena es su propio ecosistema y se decide antes del guión: qué se ve
exactamente, cámara y movimiento, efectos, textos en pantalla, transiciones de
entrada/salida, y qué dice la voz encima. Estructura narrativa por defecto:
gancho-problema → producto en acción → claim de identidad → CTA con logo.

El total se adapta a los pasos de duración reales del proveedor; si crece
(p.ej. 15→16 s), el cierre estático del último clip absorbe el excedente — la
voz nunca se estira.

### 3.3 Redacción del guión — formato estándar

UN guión paso a paso, bloques copy-paste separados por proveedor, sin
explicaciones dirigidas al usuario. Cada bloque declara herramienta y
parámetros entre corchetes:

```
Fotograma 1 [gemini-fast-lite]
Una puerta...

Fotograma 2 [gemini-fast-lite]
...

Clip 1 [Veo 3.1 - 4s - 9:16 - 720p - Unmuted] [Fotograma 1 > Fotograma 2]
Movimiento: cámara, timing interno, qué permanece legible. Al ser Unmuted,
incluye aquí la redacción del audio del clip: diálogo, ambiente, música, SFX.

Música [ElevenLabs V2 - 16s]
Brief con timestamps.

SFX [ElevenLabs V3 - 1s]   (opcional, un efecto por bloque)
...
```

Reglas de redacción:

- Prompts de imagen/video en inglés; diálogos y textos en pantalla en el
  idioma del anuncio.
- **Mismo modelo para todos los clips** — mezclar modelos rompe la coherencia.
- Referencias explícitas por fotograma: qué archivo del inventario adjuntar
  (captura real para pantallas de la app — los modelos inventan UIs; piezas de
  la ficha como referencia de estilo; el CTA del splitted suele servir de
  fotograma final).
- Si el modelo deforma tipografía, generar sin textos y sobreponerlos en el
  editor.

Reglas de voz (no negociables, aprendidas a golpes):

- En anuncios cortos la locución es **UN párrafo continuo**: los bloques se
  locutan como tomas separadas y el pegado se nota. Pausas por comas y puntos
  suspensivos, no por estructura.
- Compatibilidad de etiquetas por modelo: `<break time="0.4s"/>` funciona en
  modelos v2 (Multilingual/Turbo); **Eleven v3 no lo reconoce** (v3 = tags de
  emoción + puntuación). Verificable en el editor del proveedor: los tags
  reconocidos se resaltan. Preguntar el modelo antes de redactar.
- Cero o UN tag de emoción al inicio del párrafo; estabilidad hacia "Robusto";
  pedir 2–3 tomas y elegir a oído.
- Revisar el botón "mejorar" del proveedor contra la intención del anuncio:
  sobreactúa ([surprised] donde va confianza, MAYÚSCULAS que gritan) y los
  [whisper] mueren bajo música en parlante de celular.
- Sincronía: ~150 palabras/minuto; si no cabe, se recorta el copy.

Reglas de música y SFX:

- Brief con timestamps + **variante comprimida ≤450 caracteres** por si el
  proveedor limita el prompt.
- Criterio de toma: el strip-back donde manda la voz es el filtro — si ahí
  sigue sonando lleno, se descarta.
- SFX opcionales, un efecto por bloque, cada uno con timestamp de ensamblaje.

### 3.4 Presentar y pulir

El guión completo se presenta al usuario y se itera con él (titulares, ritmo,
diálogo, orden de escenas) hasta aprobación. Ningún recurso se genera durante
el pulido.

### 3.5 Producción — brechas contra el inventario

Con el guión aprobado, comparar cada bloque contra el inventario:

- Recurso existente → se usa tal cual (no se regenera).
- Recurso faltante → se genera **a partir del guión completo**: imágenes
  primero (acordes a sus bloques), luego clips, voz, música y SFX.
- El usuario genera en sus proveedores; el agente revisa cada resultado y
  corrige prompts puntualmente (qué cambiar del resultado, nunca re-redactar
  desde cero).

### 3.6 Ensamblaje

Clips en orden, cortes al beat, voz encima, música ~−14 dB bajo la voz, SFX en
sus timestamps. Lo ejecuta el agente con **ffmpeg** si el proveedor no trae
editor, o lo hace el usuario directamente en su editor — preguntarle qué
prefiere. Con el video final aprobado se pasa a la Fase 4.

---

## Fase 4 · Publicidad (pauta paga)

El dinero es del usuario: nada se crea, publica ni activa sin su confirmación
explícita de presupuesto y alcance.

### 4.1 Canales e identidad

- Elegir canales (AskUserQuestion, multiselección): Facebook, Instagram,
  WhatsApp, TikTok, Snapchat, YouTube. Cada canal abre su propio bloque; nada
  se asume de un canal por lo respondido en otro.
- Responder proactivamente la duda universal — *"¿saldrá mi perfil personal?"*:
  los anuncios salen siempre a nombre de una **Página/identidad de marca**; el
  perfil personal solo administra tras bambalinas y nunca se muestra. Setup
  mínimo (caso Meta, análogo en otros): Página de la marca (logo + banner de
  la Fase 2) → portafolio empresarial → cuenta publicitaria con método de
  pago. En Instagram se puede anunciar sin cuenta de IG (usa la identidad de
  la Página); crearla es opcional pero recomendable.

### 4.2 ¿Manual o API?

Para la **primera campaña**: manual en el Ads Manager con el agente dictando
campo por campo — obtener tokens de Marketing API es burocracia que solo paga
con escala (muchas campañas, A/B automatizado). Si se va por API, guiar la
obtención de accesos y validar con una llamada de solo-lectura antes de crear:

| Canal | Plataforma | Accesos |
|---|---|---|
| Facebook / Instagram / WhatsApp | Meta Marketing API | Token de usuario del sistema, `act_…`, Page ID; IG vinculada; número WABA |
| TikTok | TikTok Ads API | App id + secret, access token, `advertiser_id` |
| Snapchat | Snap Marketing API | Client id + secret, refresh token, `ad_account_id` |
| YouTube | Google Ads API | Developer token, OAuth + refresh, `customer_id`, video en el canal |

Secretos: los tokens no se pegan en archivos del proyecto ni en memoria
persistente, y no se re-imprimen en el chat.

### 4.3 Verificaciones bloqueantes + brief de campaña

Dos verificaciones antes de todo:

1. **¿La app está publicada y visible en la tienda?** Sin URL pública no hay
   campaña; "en revisión" = dejar todo preparado.
2. **¿Tiene el SDK del canal integrado?** Sin SDK de Meta no se optimiza por
   instalaciones reales. Fallback pragmático: objetivo **Tráfico** hacia la
   ficha, midiendo instalaciones en la consola de la tienda; el SDK se integra
   cuando el creativo demuestre que convierte.

Brief por canal (AskUserQuestion por bloques, con recomendación): objetivo ·
presupuesto (diario o total + tope autorizado) · calendario · geografía
(países/regiones/zonas) · audiencia (edades, géneros, idiomas, intereses,
lookalikes) · placements · creativo (video en el aspecto correcto por canal,
texto principal, titular, descripción, CTA, URL destino, píxel/eventos si
existen). Particularidades: Meta → tipo de campaña y optimización, A/B;
WhatsApp → click-to-WhatsApp con mensaje de bienvenida; TikTok → identidad del
anunciante, Smart Performance; Snapchat → attachment de app; YouTube → formato
(skippable, in-feed, Shorts) y bidding (tCPA/CPV).

### 4.4 Heurísticas para presupuestos chicos (validación)

- $3–5/día bastan para aprender y medir; escalar solo con datos.
- **Sin filtros de interés** con poco presupuesto: amplio es más barato.
- **Placements manuales que calcen con el creativo**: 9:16 → solo Reels,
  Stories y Feeds; fuera Audience Network, Messenger y columna derecha.
- Miniatura del video: el fotograma del producto, no el del gancho caótico.
- Fase de aprendizaje: 2–3 días sin tocar la campaña aunque el costo baile.
- Puertas de decisión desde el día 3: CTR ≥ 1% y CPC a la baja = el creativo
  funciona; la curva de instalaciones en la consola dice si el clic convierte.
  Con eso se decide: escalar, rotar copy, o integrar SDK.
- Copy: texto principal breve con gancho, título ≤ 30 caracteres, descripción
  corta, CTA del canal, 3–4 hashtags (en ads menos es más).

### 4.5 Publicación segura y seguimiento

1. Resumir la campaña por canal (objetivo, presupuesto, targeting, creativo) y
   pedir confirmación final del gasto.
2. Manual: dictar la configuración campo por campo con valores exactos,
   nombres incluidos (`app · objetivo · país · v1`). API: crear campaña, adset
   y anuncio **en estado PAUSED**; el usuario revisa y activa (o autoriza
   explícitamente activar por API).
3. Verificar post-creación que todo quedó como se definió y entregar los ids.
4. Seguimiento: lectura periódica de spend, impresiones, CTR y CPI para
   iterar copy y targeting con datos.

---

## Reglas transversales

- **El método manda**: Información → Inventario → Planificación → Producción →
  Ensamblaje/Publicación. La generación de recursos nunca precede al plan.
- Decisiones de gusto o de gasto → AskUserQuestion con recomendación marcada;
  nunca asumir.
- Lo que existe en el inventario no se regenera; lo que falta se produce desde
  el plan aprobado.
- No leer capturas personales del usuario sin autorización.
- Todo intermedio (HTML de propuestas, páginas de export) vive en /tmp y es
  efímero.
- Verificar cada export (PNG, video, audio) antes de entregarlo.
- El idioma de la ficha definido en Fase 1 gobierna piezas, copy y diálogos.
- Dinero y secretos: ninguna operación con costo sin confirmación explícita
  del monto; campañas nacen en PAUSED; los tokens no se persisten ni se
  re-imprimen.
