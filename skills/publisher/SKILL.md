---
name: publisher
description: >
  Publisher produce publicidad terminada de punta a punta: videos 9:16/16:9
  para reels y ads, imágenes, banners, flyers, fichas de tienda (Play/App
  Store) y campañas pagas. Organiza el trabajo en un pipeline fijo con
  breakpoints de consulta: entender QUÉ se promociona (app, producto, sitio),
  CÓMO (video, imagen, flyer), inventariar recursos, redactar el guión
  exacto, cubrir brechas preguntando qué puede generar el usuario y construir
  el resto con HTML+SVG local, renderizando a archivo final. Usar cuando el
  usuario pida "publicidad", "anuncio", "video para reels", "marketing",
  "banner", "flyer", "ficha de la tienda", "splitted", "campaña", "ads" o
  invoque /publisher con cualquier encargo publicitario.
---

# Publisher — publicidad de punta a punta

Convierte una orden corta en una publicidad terminada. Órdenes que este skill
debe resolver completas, sin importar el modelo del agente:

- `/publisher Crearemos un vídeo 9:16 para reels usando las capturas de /tmp/images/`
- `/publisher Genera un vídeo horizontal y otro vertical para mi app`
- `/publisher Genera un anuncio vertical para Meta Ads que promocione el labial de Ushas a través de mi app`
- `/publisher Necesito un banner y un flyer para el evento del sábado`

## Reglas de oro (aplican a todo)

1. **Pipeline secuencial**: FASE 0 → 8, con los BREAKPOINTS obligatorios.
   Nunca generar recursos antes del guión aprobado (BP-2).
2. **HTML+CSS+SVG es el motor por defecto** para UI, textos, gráficas y
   motion graphics: control absoluto, cero invención. IA generativa SOLO para
   lo que HTML no puede: personas, mundo real, fotografía.
3. Decisiones de gusto, gasto o capacidad → BREAKPOINT (AskUserQuestion) con
   recomendación marcada. Nunca asumir.
4. Intermedios en `/tmp`; entregables donde el usuario diga (`~/Descargas/`
   por defecto).
5. **Verificar cada export mirándolo** (screenshot, grilla de fotogramas,
   medición). Nada se entrega a ciegas.
6. Prompts para IAs del usuario: **textuales, en bloque de código, sin
   explicación alrededor**, con archivo destino exacto.
7. **El entorno se detecta, no se asume**: cada requisito de sistema lleva su
   comando de comprobación y su alternativa.
8. Antes de diseñar vistas, cargar el skill `davinci`.

---

## MAPA DE CASOS — clasifica el encargo ANTES de empezar

Clasifica la orden en UN caso principal (si piden varios, el master es el más
rico y los demás derivan de sus piezas):

| Caso | Qué es | Fases que ejecuta |
|---|---|---|
| **V1** Video con voz | reel/ad narrado | 0,1,2,3,4(completa),5,6,7,8 |
| **V2** Video sin voz | música + textos en pantalla | 0,1,2,3,4(sin 4.V),5,6,7,8 — los eventos se anclan a la música/tiempo, los textos en pantalla cargan el mensaje |
| **I1** Imagen única / banner / flyer | pieza estática | 0,1,2,3,4(guión = composición por pieza),5,6.EST,8 |
| **I2** Ficha de tienda | banners + splitted + textos | como I1 ×N piezas con sistema visual común |
| **C1** Campaña de pauta | ads pagos en canales | 0,1,2 y sección CAMPAÑA (el creativo sale de V*/I* primero) |

SI la orden no encaja en ningún caso → pregunta con las opciones de la tabla.

## BREAKPOINTS DE CONSULTA — puntos donde el agente SE DETIENE

Cada breakpoint define: cuándo dispara, qué se presenta, qué se espera. El
agente NO avanza de fase con un breakpoint pendiente.

| BP | Cuándo | Qué presentar | Qué esperar |
|---|---|---|---|
| **BP-1 Brief** | fin de FASE 1+2 | brief de 6 líneas: qué, mensaje único, público, idioma, formato(s), duración/medidas | ok o correcciones |
| **BP-2 Guión** | fin de FASE 4 | el guión completo escena por escena | ok explícito; iterar hasta tenerlo |
| **BP-3 Capacidades** | inicio de FASE 5 | AskUserQuestion multiSelect: "¿cuáles puedes generar tú?" (voz, música, imagen, video) + alternativas locales para el resto | selección |
| **BP-4 Recursos del usuario** | cada tanda de prompts | bloques copy-paste + archivos destino | los archivos en su ruta |
| **BP-5 Sincronía** (solo V1) | tras transcribir la voz | `/tmp/sub.html` verificador | "sincroniza" u offset en ms |
| **BP-6 Selecciones** | cuando hay variantes | galería de variantes de vistas y/o audición de SFX con ids (`home-A`, `pop-2`) | lista de elegidos |
| **BP-7 Preflight de render** | antes del render final | preview reproducible (el player) o grilla de stills | ok para renderizar |
| **BP-8 Gasto** (solo C1) | antes de crear campaña | resumen de presupuesto/targeting/creativo | confirmación del monto |

---

## FASE 0 — Parsear la orden

0.1. Extrae: (a) QUÉ se promociona, (b) CÓMO/formato, (c) recursos
     mencionados (rutas), (d) canal destino. Clasifica el caso (MAPA).
0.2. SI hay rutas → inventaríalas ya (FASE 3): muchas preguntas se responden
     viendo qué hay.
0.3. Pregunta SOLO lo que la orden no diga. Lo dicho no se re-pregunta.

## FASE 1 — EL QUÉ

1.1. Clasifica: `app` | `producto físico` | `sitio/servicio` | `evento`.
1.2. SI `app` y estás en su repo → recolectar SIN preguntar: nombre/versión
     (pubspec/package.json/manifest), logo **sin fondo** (`*foreground*`,
     SVG de marca; si solo hay con fondo → pedirla), colores del theme,
     features reales leyendo las vistas (jamás inventar capacidades).
1.3. SI `producto físico` → pedir fotos reales, nombre, precio, diferencial,
     dónde se compra. SI `evento` → fecha, lugar, entrada, motivo para ir.
1.4. Determinar siempre: público, **idioma del anuncio** (manda sobre el
     idioma de la conversación), claim de identidad.
1.5. Escribir el **mensaje único** (UNA frase que el espectador debe
     recordar). SI no sale con lo que hay → seguir preguntando.

## FASE 2 — EL CÓMO

2.1. Parámetros por formato:

| Formato | Fijar |
|---|---|
| Video 9:16 | duración (15–30 s ads; gancho legible en 1 s) · 1080×1920 · 30 fps · ¿voz? · ¿subtítulos quemados? (ads: normalmente NO, togglables en el player) |
| Video 16:9 | duración · 1920×1080 · 30 fps · ídem |
| Imagen/banner | medidas del canal · con/sin texto |
| Splitted/carrusel | nº piezas · 1080×1920 c/u |
| Flyer | impresión o digital · medidas |
| Ficha tienda | 16:9 + 9:16 + splitted ×5 + textos (título ≤30 · corta ≤80 · larga) |

2.2. → **BP-1**: presentar el brief y esperar ok.

## FASE 3 — INVENTARIO

3.1. Por cada recurso: `ls -la` + **`file *`** (⚠️ las extensiones mienten:
     un `.svg` puede ser WEBP) + dimensiones/alpha con Pillow.
3.2. Clasificar: captura de app | logo | foto producto | voz | música | SFX |
     fuente | icono de terceros | video.
3.3. ⚠️ Capturas con **datos reales** (nombres, montos, statusbar) nunca se
     publican tal cual: o se editan con IA (prompt maestro en 5.4, datos de
     reemplazo **coherentes ENTRE capturas**) o se recrea la vista en HTML
     (mejor: HD y control total).
3.4. Lo que existe NO se regenera. Lo que falta se anota como pendiente para
     FASE 5 — todavía no se genera nada.
3.5. Normalizar a `/tmp/brand/norm/`: PNG ≥256 px con alpha, nombres kebab
     predecibles; logos anchos recortados a su bbox.

## FASE 4 — GUIÓN (la redacción textual y exacta de lo que se construirá)

4.V. **Solo caso V1 — la voz primero** (es la columna vertebral):
     a. Redactar el texto: ~150 palabras/min (30 s ≈ 70–75 palabras), UN
        párrafo continuo, pausas con comas y puntos suspensivos, CTA al final.
     b. Entregar versiones por modelo de TTS (si es ElevenLabs: v2 admite
        `<break time="0.5s"/>`, v3 NO — usa `[excited] [happy] [confident]
        [curious]` + puntuación; carisma = Stability "Creative" + 3–4 tomas +
        valle de calma antes del cierre; tag que el editor no resalte, se
        borra). Si es otro TTS → preguntar qué markup soporta.
     c. Con el mp3 → **timestamps palabra a palabra** (receta R-1 whisper
        local). Salida: `words.json` = `[{w, s, e}]`.
     d. Generar `/tmp/sub.html`: audio + palabras resaltándose + cronómetro
        ms + click-para-saltar + 0.5× + slider offset ±500 ms.
        → **BP-5**: el usuario valida; si da offset, es constante global.
4.1. Redactar el **guión maestro** en `/tmp/adplan.md`:
     - V1: por escena `[t_ini–t_fin]` anclado a PALABRAS de words.json.
     - V2: por escena `[t_ini–t_fin]` anclado a la curva de la música.
     - I1/I2: por pieza → composición exacta (fondo, z-capas, titulares,
       chips, mini-UI) — es un guión de composición, no de tiempo.
     Por escena/pieza: qué se ve, datos concretos, animación de entrada de
     cada elemento, eventos (`palabra/instante → efecto`), SFX, transición.
4.2. Narrativa por defecto (video): **gancho** (0–3 s, legible en 1 s, nunca
     pantalla plana de color ni títulos PowerPoint) → problema → producto en
     acción (2–4 features) → claim → **CTA** (logo + botón + badge tienda).
     El excedente lo absorbe el cierre estático; la voz no se estira.
4.3. → **BP-2**: presentar el guión completo, iterar hasta ok.

## FASE 5 — BRECHAS (qué falta y quién lo genera)

5.1. Del guión, listar faltantes por tipo: VOZ | MÚSICA | SFX | IMAGEN-IA |
     VIDEO-IA | ICONOS/LOGOS | FUENTE | TRANSCRIPCIÓN.
5.2. → **BP-3**: AskUserQuestion multiSelect "¿cuáles puedes generar tú?"
     listando las herramientas típicas (ElevenLabs, Gemini/Veo, otra).
5.3. Para lo que el usuario NO pueda, alternativa local (proponer; instalar
     solo con aprobación explícita):

| Falta | Alternativa local |
|---|---|
| SFX | Sintetizar con WebAudio (receta R-3) + audición para que el usuario marque (BP-6) |
| Vista de UI / gráfica / texto animado | NUNCA IA → HTML+SVG |
| Iconos/logos de terceros | Tabla exacta de descargas para el usuario: `archivo destino → qué es`; SVG o PNG ≥256 alpha |
| Fuente | `@fontsource` vía jsdelivr (R-4) |
| Transcripción | whisper local en Docker (R-1) |
| Imagen realista/persona | IA del usuario; si no tiene → rediseñar la escena para no necesitarla |
| Video realista | IA del usuario; si no tiene → resolver con motion HTML |
| Modelos por API | Ofrecer OpenRouter / HuggingFace Inference con aprobación y keys del usuario |

5.4. → **BP-4**: por cada pieza que genere el usuario, bloque copy-paste
     EXACTO + destino (`guárdalo como /tmp/brand/x.png`). Redacción:
     - Imagen/video: **en inglés**; textos visibles/diálogos en el idioma del
       anuncio; incluir "render all text EXACTLY as written, crisp, high
       definition".
     - Edición de capturas (prompt maestro): quitar statusbar extendiendo el
       fondo, traducir la UI, reemplazar datos personales por placeholders
       coherentes entre capturas, NO tocar layout/colores. Si el modelo se
       resiste → dos pasadas.
     - Música: brief con timestamps de energía (apertura con golpe si el
       corte es en t=0 — sirve de ancla, ver R-5 —, valle bajo la voz,
       remonte en CTA, botón final) + variante ≤450 caracteres.
5.5. Verificar CADA recurso al recibirlo: `file`, medidas; video IA se revisa
     **fotograma a fotograma** (grilla cada 0.5 s): inventa UI, duplica
     tarjetas, agrega statusbars — recortar la ventana limpia o sustituir por
     HTML.
5.6. Datos en pantalla: verosímiles y coherentes con el resto del anuncio;
     jamás métricas de reputación inventadas.

## FASE 6 — CONSTRUCCIÓN

6.1. Cargar `davinci`. Planificar vistas/componentes/transiciones en
     `/tmp/adplan.md` antes del markup. Contra el "look IA": iconos SVG
     stroke propios o reales (cero emoji), UN acento de marca, datos
     coherentes entre escenas, counts-up `tabular-nums`, fuente propia (sin
     ella los títulos parecen presentación).
6.2. SI hay variantes de vistas que decidir → galería `/tmp/template.html`
     (2–3 variantes por vista, con id visible) → **BP-6**.
6.3. **Video (V1/V2)** → construir el player (receta R-2, adaptando el
     escenario lógico al aspecto: 360×640 para 9:16, 640×360 para 16:9).
     - V2 (sin voz): omitir WORDS/subtítulos/transcript; los eventos se
       anclan a tiempos de la música; los textos en pantalla llevan el
       mensaje único.
6.4. **Estático (I1/I2)** → una página HTML por pieza a tamaño real, reglas
     del splitted (sistema de fondo común, z-capas documentadas, chips
     específicos del producto, mini-cards de UI, nada cortado entre piezas,
     titulares a dos tonos) y exportar:
     ```bash
     google-chrome --headless=new --disable-gpu --hide-scrollbars \
       --force-device-scale-factor=1 --window-size=W,H \
       --virtual-time-budget=4000 --screenshot=salida.png file:///tmp/pieza.html
     ```
     (SI no hay google-chrome → `chromium`/`chromium-browser`; detectar con
     `command -v`.)
6.5. **Verificación obligatoria** (video): stills de `?t=` en 8–14 instantes
     clave → grilla etiquetada con PIL → MIRARLA → corregir → repetir.
     ⚠️ `--virtual-time-budget` NO avanza transiciones CSS: sirve para stills
     asentados, jamás para renderizar animación (por eso el render es captura
     real, FASE 7).
6.6. → **BP-7**: entregar el player/las piezas al usuario como preview
     reproducible y esperar ok para el render final.

## FASE 7 — RENDER a archivo de video (V1/V2)

7.1. **Detección de entorno** (no asumir):
     - `command -v Xvfb` → SI falta → pedir `sudo apt install -y xvfb`.
     - `ffmpeg -formats 2>/dev/null | grep pulse` → SI el ffmpeg no trae
       `pulse` (típico en builds de brew) → capturar audio aparte con
       `parecord`/`pw-record` (pistas separadas están bien: cada una lleva su
       ancla, 7.3).
     - `pactl info` → confirmar PulseAudio/PipeWire; SI no hay → grabar solo
       video y construir la pista de audio por mezcla determinista (voz +
       música + SFX sintetizados en sus tiempos con ffmpeg).
     - `command -v google-chrome chromium` → navegador disponible.
7.2. Pipeline de captura (receta R-5). Claves: pantalla virtual del tamaño
     EXACTO del video; Chrome con `--user-data-dir` propio (sin él se cuelga
     de la sesión real del usuario), `--autoplay-policy=no-user-gesture-required`;
     recorders arrancan ANTES que Chrome; modo `?rec` del player (claqueta).
7.3. **Anclas de t=0**: video → fin del ÚLTIMO tramo negro inicial
     (`blackdetect=d=0.3:pix_th=0.06`, la claqueta); audio → primer onset
     (`silencedetect=n=-45dB:d=0.4`; por eso la música abre con golpe).
     Cortar CADA pista en SU ancla → alineación por construcción.
7.4. Ensamble: `-ss $TV` video, `-ss $TA` audio, `-t DUR`, `yuv420p`,
     `libx264 -crf 18 -preset slow`, `aac 192k`, `+faststart`. SI la cama
     musical queda débil tras la voz (medir, no adivinar) → rampa
     `volume='if(gte(t,X),min(2,1+(t-X)*0.55),1)':eval=frame`. Extraer
     `track.mp3` si el usuario la quiere.
7.5. Verificar SIEMPRE: duración exacta (ffprobe), grilla de fotogramas del
     MP4 final (¿pantalla completa? ¿sin subtítulos si no van? ¿texto
     nítido?), `ebur128` por ventanas (voz −11…−16 LUFS; cierre no más de
     6 LU por debajo).
7.6. NO intentar: animar con virtual-time · grabar pantalla real de aspecto
     contrario al video · upscalar capturas pequeñas (354→1080 = papilla).
7.7. Limpieza total: procesos, sinks, perfiles; imágenes Docker → pedir ok.

## FASE 8 — ENTREGA

8.1. Nombres predecibles en el destino acordado (`X_ad_30s.mp4`, `track.mp3`,
     `16_9.png`, `splitted-1..5.png`).
8.2. SendUserFile + resumen: qué se construyó, dónde está, pendientes.
8.3. Pedir reproducción real (la escucha no es verificable desde aquí) y
     ofrecer ciclo corto de retoques (con el player, recapturar toma ~1 min).

---

## RECETAS PROBADAS (defaults verificados; adaptar si el entorno difiere)

### R-1 · Timestamps palabra a palabra (whisper local, sin tocar el host)
```bash
docker run --rm -v /tmp/whisper-out:/out python:3.11-slim bash -c \
  "pip install -q faster-whisper && python /out/transcribe.py"
# transcribe.py: WhisperModel('small', device='cpu', compute_type='int8')
#   .transcribe(mp3, language=XX, word_timestamps=True,
#               initial_prompt=<texto exacto del guión>)  → /out/words.json
```
CPU basta para <60 s. SI PyPI baja lento (<200 KB/s) avisar ETA (el modelo
viene de HuggingFace, que vuela). Al terminar, ofrecer borrar la imagen.

### R-2 · Player HTML (el corazón del video)
Archivo `/tmp/ads.html`, autocontenido, recursos relativos en /tmp:
- Escenario lógico del aspecto del video (9:16 → 360×640) escalado a la
  ventana; esquinas CUADRADAS; ningún control dentro del stage.
- **Reloj maestro = la música** (`music.currentTime`); la voz se resincroniza
  si deriva >0.12 s; `VOICE_OFFSET` = ajuste validado en BP-5.
- Datos embebidos: `WORDS`, `SCENES [{id, from}]`, `EVENTS [{t, k, fn}]`
  (Set de disparados).
- **Aterrizajes con CSS `transition` (idempotentes), NUNCA `animation`
  one-shot** (se re-disparan tras cada seek); `animation` solo para efectos
  transitorios (anillos, ripples) o giros que toleren replay.
- `seek(t)`: reset TOTAL (clases, contadores, anchos, dashoffsets) + catch-up
  silencioso (`quiet=true` apaga SFX) bajo `.notrans`; **en pausa `.notrans`
  se queda** (stills perfectos); se quita al reanudar.
- Subtítulos kinéticos palabra a palabra (color según escena clara/oscura)
  con toggle CC. Player FUERA del stage: play/pausa, cronómetro, transcript
  clickeable, timeline por capas (escenas/voz/música/SFX) con playhead y
  scrub.
- Modos URL: `?t=SEG` (still exacto sin audio) · `?rec` (claqueta negra
  1.4 s → autoplay con audio, sin CC, stage a pantalla completa) ·
  `?rec&cc=1`.
- ⚠️ En modo rec, el contenedor del stage: `position:fixed; inset:0` (un
  `align-items:center` del layout lo colapsa y el video sale en miniatura).
- ⚠️ CSS de igual especificidad: `.scene.on` va DESPUÉS de las variantes
  `data-fx` o la escena activa hereda el blur de entrada.
- Transiciones de escena variadas (crossfade, zoom, swipe-blur, push,
  zoom-through), solo `transform/opacity/filter`.

### R-3 · SFX sintetizados (WebAudio, cero archivos)
Osciladores con decay exponencial + ruido blanco con bandpass barrido:
`pop` 520→900 Hz · `swipe` ruido 900→300 · `ding` 1318+2637 · `coin` squares
1975/2637 · `unlock` 880→1320 · `whoosh` ruido 150→900 · `slam` ruido
2000→300 + triángulo grave · `suck` · `spin` · `flick` · `stamp` · `sprout` ·
`bounce` · `ripple`. Guardia global `quiet` para el catch-up del seek.
Audición con botones por candidato → el usuario marca (BP-6).

### R-4 · Fuente sin instalar nada
```bash
curl -o /tmp/fonts/outfit-800.woff2 \
  https://cdn.jsdelivr.net/npm/@fontsource/outfit@5.2.5/files/outfit-latin-800-normal.woff2
```
(@font-face con ruta relativa funciona en file://. La API css de Google
Fonts puede fallar según UA; jsdelivr no.)

### R-5 · Captura en pantalla virtual (render final)
```bash
MOD=$(pactl load-module module-null-sink sink_name=adrec)
Xvfb :99 -screen 0 1080x1920x24 & XPID=$!; sleep 1.5
timeout 40 parecord -d adrec.monitor --file-format=wav /tmp/adcap_audio.wav & APID=$!
ffmpeg -y -f x11grab -draw_mouse 0 -framerate 30 -video_size 1080x1920 \
  -i :99 -c:v libx264 -preset ultrafast -qp 0 -t 38 /tmp/adcap_video.mkv & VPID=$!
sleep 0.7
DISPLAY=:99 PULSE_SINK=adrec google-chrome --user-data-dir=/tmp/chrome-rec \
  --no-first-run --kiosk --window-size=1080,1920 \
  --autoplay-policy=no-user-gesture-required "file:///tmp/ads.html?rec=1" & CPID=$!
wait $VPID; kill $APID $CPID; kill $XPID
pactl unload-module $MOD; rm -rf /tmp/chrome-rec
```
Ajustar `-video_size`/`-screen` al aspecto del video. Luego anclas (7.3) y
ensamble (7.4).

---

## CAMPAÑA DE PAUTA (caso C1)

El dinero es del usuario: nada se crea ni activa sin **BP-8**.

C.1. Canales por AskUserQuestion (multiselección): Meta (FB/IG/WhatsApp),
     TikTok, Snapchat, YouTube. Aclarar proactivamente: los anuncios salen a
     nombre de una Página/identidad de marca, nunca del perfil personal.
C.2. Verificaciones bloqueantes: ¿producto/app publicado con URL visible?
     ¿SDK del canal integrado? Sin SDK → objetivo Tráfico midiendo en la
     consola de la tienda.
C.3. Primera campaña: manual en el Ads Manager, dictada campo por campo con
     valores exactos (nombres: `app · objetivo · país · v1`). API solo con
     escala; tokens jamás se persisten ni se re-imprimen.
C.4. Presupuestos chicos: $5/día; sin filtros de interés; placements manuales
     acordes al aspecto (9:16 → Reels/Stories/Feeds); miniatura = fotograma
     del producto; 2–3 días de aprendizaje sin tocar; desde el día 3, decidir
     con CTR ≥1% y CPC a la baja.
C.5. Todo nace en PAUSED → **BP-8** → el usuario activa. Verificar
     post-creación, entregar ids, seguimiento de spend/CTR/CPI.

---

## FALLOS CONOCIDOS (consultar cuando algo no cuadre)

- Las extensiones mienten → `file` siempre.
- Video IA inventa UI pasados 1–2 s (statusbars falsos, tarjetas duplicadas,
  texto corrupto) → grilla cada 0.5 s; recortar o sustituir por HTML.
- `animation` one-shot se re-dispara tras seek → aterrizajes con `transition`.
- `--virtual-time-budget` avanza JS/rAF pero NO transiciones CSS.
- `align-items:center` colapsa el contenedor del stage en captura.
- ffmpeg de brew sin entrada `pulse` → `parecord` + anclas separadas.
- ElevenLabs: v3 no reconoce `<break/>`; v2 no reconoce `[tags]`; el botón
  "mejorar" sobreactúa.
- PyPI puede ir a 160 KB/s con la red sana → medir con curl antes de culpar
  al contenedor; HuggingFace y jsdelivr suelen volar.
- Chrome sin `--user-data-dir` propio abre en la sesión real del usuario.
- Logo del usuario: pedir la variante sin fondo; si es blanca sobre
  transparente, colorearla con `mask-image` o usarla sobre fondos oscuros.
- Grabaciones de pantalla del usuario suelen venir a resolución CSS
  (~360 px): no upscalar; recapturar con R-5.
