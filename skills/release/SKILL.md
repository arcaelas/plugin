---
name: release
description: Publica una app Flutter en Play Store y App Store con un flujo secuencial de 7 pasos — confirma el tipo de versión (patch/minor/major), incrementa pubspec.yaml, commit único "tipo:X.Y.Z", push del usuario, notas de la versión, .aab en ~/Descargas/{package}/{version}.aab y publicación iOS opcional de punta a punta (build firmado, subida con altool y envío a revisión vía App Store Connect API).
---

# /release — Publicación en ambas tiendas

Flujo SECUENCIAL de siete pasos. Ejecuta un paso, verifica su salida y continúa.
Las interacciones con el usuario ocurren SOLO donde el flujo lo marca con 🙋 (y
siempre con `AskUserQuestion()`); el resto corre sin confirmaciones.

**Regla de oro:** este skill NO contiene valores de ningún entorno ni proyecto.
Cada placeholder se resuelve en el momento según su fuente (ver leyenda). Nada
se asume desde la memoria, sesiones anteriores o este archivo.

## Leyenda de placeholders

| Placeholder | Qué es | Fuente |
|---|---|---|
| `<tipo>` | Tipo de incremento: `patch` \| `minor` \| `major` | 🙋 Usuario (paso 1) |
| `<X.Y.Z>` | Versión visible resultante | Inferido: versión actual del `pubspec.yaml` + `<tipo>` |
| `<B>` | Número de build (siempre el anterior + 1) | Inferido: `pubspec.yaml` |
| `<ruta-del-repo>` | Ruta local del repo | Inferido: `pwd` |
| `<package>` | Application id / bundle id de la app | Proyecto: `android/app/build.gradle*` (`applicationId`) |
| `<whatsNew>` | Texto de novedades para las tiendas | 🙋 Usuario (paso 5; el agente propone las redacciones) |
| `<usuario>` / `<ip>` | Cuenta y dirección SSH del entorno con Xcode | 🙋 Usuario (paso 7; SIEMPRE preguntar, la IP cambia con DHCP/VPN) |
| `<CLAVE>` | Contraseña SSH/llavero de ese entorno | 🙋 Usuario (paso 7; no se imprime ni se guarda) |
| `$HOST` | `<usuario>@<ip>` | Derivado de los dos anteriores |
| `<repo>` | Carpeta del repo dentro del entorno iOS (ej. `~/mi-app`) | 🙋 Usuario (paso 7; confirmarla junto al acceso) |
| `<KEYID>` / `<ISSUER>` | Credenciales de la App Store Connect API | 🙋 Usuario (paso 7; la `.p8` ya debe existir en esa máquina) |
| `releaseType` | `AFTER_APPROVAL` (default) \| `MANUAL` | 🙋 Usuario (paso 7) |

**Marco de seguridad:** solo se automatiza el flujo oficial con herramientas
oficiales (`flutter`, `git`, `xcrun altool`, App Store Connect API). Las
credenciales que el usuario provea se usan únicamente en sus máquinas: la clave
SSH/llavero no se imprime ni se guarda, la key `.p8` jamás sale del entorno iOS
donde ya está instalada. El push a GitHub lo hace el usuario a mano (paso 4).
Ningún paso borra datos ni toca ramas: todo ocurre en `main` local, stashes y
carpetas de build.

---

## Paso 1 — 🙋 Confirmar la nueva versión

Leer la versión vigente (`X.Y.Z+B`: `X.Y.Z` visible, `B` = build que las
tiendas exigen SIEMPRE creciente y jamás se reutiliza):

```bash
grep "^version:" pubspec.yaml
git show HEAD:pubspec.yaml | grep "^version:"
```

Si el working tree ya difiere de HEAD, la versión se subió en esta misma sesión:
saltar al paso 3. Si coinciden, preguntar con `AskUserQuestion()` el tipo de
incremento, mostrando en cada opción el número resultante calculado desde la
versión actual:

- **patch** → `X.Y.(Z+1)` — correcciones sin funcionalidad nueva.
- **minor** → `X.(Y+1).0` — funcionalidades nuevas (recomendado por defecto).
- **major** → `(X+1).0.0` — cambios de fondo o incompatibles.

El build `B` sube +1 sea cual sea el tipo elegido.

## Paso 2 — Aplicar el incremento

Con Edit sobre `pubspec.yaml`, reemplazar `version: <actual>` por
`version: <X.Y.Z>+<B>` y verificar:

```bash
grep "^version:" pubspec.yaml
```

## Paso 3 — Commit único firmado por la versión

TODOS los cambios pendientes van en UN solo commit cuyo mensaje es EXACTAMENTE
`<tipo>:<X.Y.Z>` (ej. `major:3.0.0`, `minor:2.9.0`, `patch:2.0.9`): así la rama
`main` solo contiene commits con el texto de la versión que ocupan. Sin cuerpo,
sin atribuciones a IA. La configuración local del agente no viaja:

```bash
git add -A
git reset -q .claude/settings.local.json 2>/dev/null
git status --porcelain | head -30   # revisar que no entre nada sospechoso
git commit -m "<tipo>:<X.Y.Z>"
git log -1 --oneline
```

## Paso 4 — 🙋 Push del usuario

Resolver la ruta real del repo (`pwd`) y pedirle al usuario, textualmente, que
ejecute en el prompt:

```
!git -C <ruta-del-repo> push origin main
```

(El `!` lo ejecuta en su sesión y la salida queda en la conversación.) Esperar
a ver la salida del push antes de continuar: el paso 7 hace `git pull` en el
entorno iOS y necesita el commit en el remoto.

## Paso 5 — 🙋 Resumen de la actualización

Proponer con `AskUserQuestion()` el texto de novedades que verán las tiendas,
con dos opciones redactadas a partir de lo que entró en el commit:

- **Específica (recomendada):** 1–2 frases con lo más visible de la versión
  para el usuario final (redactarla del diff, no inventar capacidades).
- **Genérica:** "Mejoras de rendimiento y corrección de errores."

El texto elegido se usa como `whatsNew` en App Store (paso 7) y queda en el
reporte final para pegarlo en Play Console.

## Paso 6 — Bundle de Android

El package se obtiene DE LA APP (nunca se asume ni se fija en este skill):

```bash
grep -Rho 'applicationId[ =]*"[^"]*"' android/app/build.gradle* | head -1
```

Verificar toolchain y compilar en PRODUCCIÓN — sin `--dart-define`, así el
binario usa su API de producción por defecto; JAMÁS pasar aquí una IP local:

```bash
command -v flutter
flutter build appbundle --release
mkdir -p ~/Descargas/<package>
cp build/app/outputs/bundle/release/app-release.aab ~/Descargas/<package>/<X.Y.Z+B>.aab
ls -lh ~/Descargas/<package>/<X.Y.Z+B>.aab
```

Avisar al usuario que ese `.aab` es el que sube a Play Console (la publicación
de Play es manual) junto con el texto de novedades del paso 5.

## Paso 7 — 🙋 iOS opcional, de punta a punta

Preguntar con `AskUserQuestion()`, en una sola consulta:

1. **¿Generar también el release de iOS?** Si la respuesta es no → saltar al
   cierre y reportar.
2. **Acceso SSH del entorno con Xcode:** `<usuario>`, `<ip>`, `<CLAVE>` y la
   carpeta `<repo>`. SIEMPRE preguntados en el momento — nunca asumidos de
   memoria ni de sesiones anteriores: la máquina cambia de IP (DHCP/VPN) y un
   intento a ciegas solo quema tiempo en timeouts.
3. **Credenciales de App Store Connect:** `<KEYID>` e `<ISSUER>` (Usuarios y
   acceso → Claves de API). La key `.p8` debe existir YA en esa máquina en
   `~/.appstoreconnect/private_keys/AuthKey_<KEYID>.p8`. Confirmar también si
   la publicación tras aprobación es automática (default, `AFTER_APPROVAL`) o
   manual (`MANUAL`).

Con `$HOST` = `<usuario>@<ip>` y `<CLAVE>` la contraseña dada (solo para el SSH
y el llavero local; no se imprime ni se guarda en ningún archivo):

### 7.1 — Sincronizar el repo al commit pusheado

```bash
sshpass -p '<CLAVE>' ssh -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new $HOST \
  'cd <repo> && git stash push -u -m "wip previo al release" 2>/dev/null; git pull --ff-only && git rev-parse --short HEAD'
```

El hash final debe coincidir con el commit del paso 3. El WIP remoto (si lo
había) queda recuperable en el stash: nunca se descarta con checkout/clean.

### 7.2 — Dependencias

```bash
sshpass -p '<CLAVE>' ssh $HOST 'zsh -lc "cd <repo> && flutter pub get && cd ios && pod install"'
```

### 7.3 — Llavero + build del IPA en la sesión gráfica

`codesign` necesita el llavero desbloqueado Y la sesión Aqua del usuario
(uid 501): por SSH puro fallaría con `errSecInternalComponent`.

```bash
# Desbloquear el llavero para firmar por SSH.
sshpass -p '<CLAVE>' ssh $HOST 'security unlock-keychain -p <CLAVE> ~/Library/Keychains/login.keychain-db &&
  security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k <CLAVE> ~/Library/Keychains/login.keychain-db'

# Script de build y lanzamiento DENTRO de la sesión gráfica.
sshpass -p '<CLAVE>' ssh $HOST 'cat > <repo>/build_ipa.sh <<EOF
#!/bin/zsh -l
cd <repo>
exec flutter build ipa --release > <repo>/build_ipa.log 2>&1
EOF
chmod +x <repo>/build_ipa.sh && rm -f <repo>/build_ipa.log &&
(echo <CLAVE> | sudo -S -k -p "" bash -c "nohup launchctl asuser 501 sudo -u <usuario> -H <repo>/build_ipa.sh >/dev/null 2>&1 &")'

# Vigilar el log hasta el veredicto (éxito = "✓ Built IPA").
sshpass -p '<CLAVE>' ssh $HOST 'for i in $(seq 1 160); do
  grep -qE "Built .*ipa|error:|CodeSign failed" <repo>/build_ipa.log 2>/dev/null && break; sleep 5; done;
  tail -5 <repo>/build_ipa.log'
```

### 7.4 — Subida y envío a revisión

```bash
# Subir el IPA (la .p8 la resuelve altool desde ~/.appstoreconnect/private_keys).
sshpass -p '<CLAVE>' ssh $HOST 'zsh -lc "cd <repo> && xcrun altool --upload-app --type ios \
  -f build/ios/ipa/*.ipa --apiKey <KEYID> --apiIssuer <ISSUER>"'
# Éxito = "No errors uploading archive" / "UPLOAD SUCCEEDED".
```

Apple procesa el build (5–40 min). Luego, crear la versión y enviarla a
revisión con la App Store Connect API desde la propia máquina iOS (no suele
haber Node: usar `python3` stdlib + `openssl` para el JWT ES256 — la key jamás
sale de ahí). El script, con `<package>` (paso 6), `<X.Y.Z>`, `<B>`,
`<whatsNew>` (paso 5) y el `releaseType` acordado, hace en orden:

1. `GET /v1/apps?filter[bundleId]=<package>` → id de la app.
2. `GET /v1/builds?filter[app]=<id>&filter[version]=<B>` en bucle (hasta ~50
   min) hasta que el build exista y su `processingState` sea `VALID`.
3. `POST /v1/appStoreVersions` con `{versionString, platform: IOS,
   releaseType}`; si ya existe una versión editable con ese número, reutilizarla
   con `PATCH`.
4. `PATCH /v1/appStoreVersions/<vid>/relationships/build` → colgar el build.
5. `PATCH` de cada `appStoreVersionLocalizations` con el `whatsNew`.
6. `POST /v1/reviewSubmissions` (+ `reviewSubmissionItems` con la versión) y
   `PATCH {submitted: true}` → **enviada a revisión**.

Para el JWT sin dependencias: header `{alg: ES256, kid: <KEYID>}`, payload
`{iss: <ISSUER>, iat, exp: iat+900, aud: "appstoreconnect-v1"}`, firmado con
`openssl dgst -sha256 -sign AuthKey.p8` y la firma DER convertida a `r||s` de
64 bytes (base64url). Enviarlo con `ssh $HOST 'cat > /tmp/asc.py' < asc.py`,
lanzarlo desacoplado (`nohup python3 /tmp/asc.py > /tmp/asc.log 2>&1 &`) y
vigilar `/tmp/asc.log` hasta el mensaje final de éxito.

## Notas a prueba de fallos (aprendidas en producción)

- **Huella SSH obsoleta** ("REMOTE HOST IDENTIFICATION HAS CHANGED" tras un
  cambio de IP/VPN): `ssh-keygen -R <ip>` y reintentar con
  `StrictHostKeyChecking=accept-new`. Solo cuando el destino lo dio el usuario.
- **Gatekeeper** por `gen_snapshot_arm64`: el usuario pulsa "Abrir" una vez y
  el build continúa.
- **Swift Package Manager**: si Flutter intenta "Adding Swift Package Manager
  integration" y `google_maps_flutter_ios` rompe con `No such module
  'GoogleMaps'`: `flutter config --no-enable-swift-package-manager`, restaurar
  `ios/Runner.xcodeproj` con git y repetir desde 7.2.
- **zsh remoto**: jamás `echo ===` (la expansión `=` de zsh lo rompe); preferir
  `ssh $HOST "cat > destino" < archivo` sobre `scp`.
- **Builds largos**: correr `flutter build`/`altool`/el vigía del log como
  tareas en background y reaccionar a su notificación; nunca bloquear la
  conversación esperando.

## Cierre

Borrar los helpers del entorno iOS (`build_ipa.sh`, `build_ipa.log`,
`/tmp/asc.py`, `/tmp/asc.log`), restaurar `pubspec.lock` remoto si el
`pub get` lo movió (`git checkout -- pubspec.lock`) y reportar:

| Entregable | Dónde queda |
|---|---|
| Commit `<tipo>:<X.Y.Z>` | `main` (pusheado por el usuario en el paso 4) |
| `.aab` de Android | `~/Descargas/<package>/<X.Y.Z+B>.aab` → Play Console (manual, con las novedades del paso 5) |
| `.ipa` de iOS | Subido a App Store Connect |
| Versión App Store | "En espera de revisión"; se publica según el `releaseType` acordado |
