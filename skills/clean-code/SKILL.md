---
name: clean-code
description: >
  The user's coding LAW — the mandatory baseline for every coding task, written as
  numbered laws in dependency order (each law may rely only on earlier ones). Every law
  is one objective statement plus a `good` and a `bad` code block whose line comments
  justify each part. Covers naming (snake_case), project format, imports, control flow
  (nested affirmative blocks, no early returns, braces by body size), data expressions,
  functions (zero single-use module helpers), compact domain classes, strict typing,
  promise pipelines, errors, structural JSDoc (no inner comments), file architecture
  (folders born from internal dependencies), backend (lib = primitives, service
  orchestrates), React/Next, Flutter (snake_case too), runtime-first and git flow.
  Load it for any task that writes, refactors, or reviews code. When it conflicts with
  the RAG, the RAG wins.
---

# Clean Code — Ley de construcción de código

## Cómo leer esta ley

> Este documento es LEY, no una guía de sugerencias. Cada ley tiene un número, una regla objetiva, un bloque `good` y un bloque `bad`. El código se construye cumpliendo TODAS las leyes a la vez.

- Las leyes están en orden de dependencia: cada ley solo usa conceptos de leyes anteriores. Si una ley menciona `(Ley N)`, esa N ya quedó atrás.
- Los comentarios `//` DENTRO de los bloques `good`/`bad` explican la ley al lector de ESTE documento. La Ley 31 los excluye del código real: no copiar los comentarios al código producido.
- `good` = forma exigida. `bad` = forma prohibida; sus comentarios dicen por qué falla.
- Si el caso no está cubierto por ninguna ley ni por el RAG: proponer y preguntar. Nunca inventar una convención.
- El RAG (preferencias vivas del usuario) está por encima de esta ley cuando se contradicen.
- Al agregar leyes nuevas: la línea de ley instruye lo que SÍ se hace; lo prohibido vive únicamente en el bloque `bad` con su porqué.

---

# PARTE I — Nombres y formato

## Ley 1 — Naming: snake_case como base universal

> Todo identificador propio va en snake_case — variables, parámetros, funciones, métodos, campos, booleans desnudos, archivos, carpetas normales y claves de payloads. PascalCase para clases, tipos, enums, interfaces y carpetas de componente visual. UPPER_SNAKE_CASE para constantes exportadas de módulo y keys de enum. camelCase únicamente donde React lo impone: hooks (`useX`) y setters de useState.

```good
export const MAX_RETRIES = 3            // exportada de módulo: UPPER_SNAKE_CASE
const cache_key = `user:${user_id}`     // local: snake_case, aunque sea constante
const loading = false                   // boolean desnudo: sin prefijo is_/has_/can_

enum TicketStatus {                     // enum: PascalCase
    IN_PROGRESS = "in_progress",        // key: UPPER_SNAKE_CASE
}

interface UserFormProps {               // props de componente: PascalCase + sufijo Props
    initial_name: string                // campo: snake_case
    on_submit: () => void               // callback: on_{accion}
}

interface IAuth {                       // tipo global compartido entre módulos: prefijo I{Dominio}
    user_id: string
}

class UserService {                     // clase: PascalCase
    find_one(id: string) {}             // método: snake_case
    private _normalize_phone(p: string) {}  // privado: _snake_case
}

const [open, setOpen] = useState(false)          // setter camelCase: React lo impone
import useButtonState from "@/components/Button/lib/use_button_state"  // hook: función useX, carpeta/archivo use_x

// components/Button/index.tsx          // carpeta de componente visual: PascalCase
// lib/use_theme/index.ts               // carpeta normal (lib, view, módulo): snake_case
// src/lib/format_date.ts               // archivo: snake_case
res.success({ file_path, total_lines }) // claves de payloads/respuestas: snake_case
```

```bad
const userId = "abc"                    // camelCase en variable: prohibido
function getUser() {}                   // camelCase en función: prohibido
const isLoading = false                 // prefijo is_: prohibido, el boolean va desnudo
const handleClick = () => {}            // handle{Action}: prohibido, es on_click
export const maxRetries = 3             // exportada sin UPPER: prohibido
function calc(weight: number) {
    const BASE_RATE = 5.99              // UPPER en constante local: prohibido (las locales van snake_case)
}
interface Auth {}                       // tipo global sin prefijo I: prohibido (es IAuth)
interface ProductType {}                // sufijo Type: prohibido (es IProduct)
res.json({ filePath, totalLines })      // claves camelCase en payload: prohibido (file_path, total_lines)
```

## Ley 2 — Formato: manda el proyecto; defaults personales en proyectos nuevos

> Comillas, indentación y ancho los define la configuración existente del proyecto (.prettierrc, .editorconfig); en proyectos nuevos se usa: singleQuote true, tabWidth 4, printWidth 200, semi true, trailingComma es5, bracketSameLine true. Números grandes siempre con separador `_`.

```good
const timeout = 30_000                  // separador numérico: 30_000 se lee, 30000 no
const limit = 200_000
// En un repo que ya usa comillas dobles y 2 espacios, se escriben comillas
// dobles y 2 espacios: la consistencia local pesa más que el gusto personal.
```

```bad
const timeout = 30000                   // sin separador: ilegible a partir de 5 cifras
// Cambiar las comillas o la indentación de un repo existente "porque el
// default personal es otro": prohibido — se sigue lo que el repo ya usa.
```

## Ley 3 — Imports: alias sobre relativos, módulo sobre miembros

> Los alias del tsconfig/jsconfig se prefieren SIEMPRE a rutas relativas largas (el relativo queda para lo interno inmediato del propio módulo); se importa el módulo completo (`import path from 'node:path'`) antes que sus miembros sueltos; un módulo que ES la unidad (lib, hook, componente) se exporta e importa por default, y los named quedan para tipos y anexos; la agrupación/orden la resuelven los linters del proyecto.

```good
import path from "node:path"            // módulo completo: path.dirname() documenta su origen en cada uso
import session from "@/lib/session"     // la unidad viaja por default; el alias sobrevive a mover archivos
import type { ISession } from "@/lib/session"   // los named quedan para tipos y anexos
import helper from "./lib/helper"       // relativo solo para lo interno inmediato del propio módulo
```

```bad
import { dirname, join } from "node:path"   // miembros sueltos: dirname() a secas no dice de dónde viene
import { session } from "@/lib/session"     // named para la unidad misma: la unidad viaja por default
import session from "../../lib/session"     // relativo largo: se rompe al mover el archivo; existe el alias
```

---

# PARTE II — Flujo de control

## Ley 4 — Llaves por tamaño del cuerpo

> Un cuerpo de UNA línea va sin llaves; un cuerpo de varias líneas va con llaves. Aplica a if/else/for/while y cada rama decide la suya. Esta ley se usa dentro de todos los ejemplos siguientes.

```good
if (user.name) user.username = rand()   // una línea: sin llaves
else {                                  // esta rama tiene 3 líneas: lleva llaves
    let tmp = rand()
    user.name = tmp.slice(0, 4)
    user.username = tmp.replace(/\W+/gi, "-")
}

for (const sig of ["SIGTERM", "SIGINT"] as const) process.on(sig, () => process.exit(0))  // setup de una línea
```

```bad
if (user.name) {
    user.username = rand()              // una sola línea con llaves: ceremonia innecesaria
}
if (ok)
    save()                              // cuerpo en línea SEPARADA sin llaves: ambiguo al agregar líneas
    notify()                            // ← parece parte del if pero NO lo es: el bug clásico
```

## Ley 5 — Condicionales anidadas en afirmativo

> Toda condición se escribe en afirmativo y anidada una dentro de otra; el camino feliz vive en el bloque más profundo y cada throw/return de error queda como rama final de su nivel, así siempre se sabe qué condición exacta falló. La negación se reserva para la idempotencia (hacer algo una sola vez).

```good
if (email) {
    if (password) {
        return save({ email, password })    // el happy path queda al fondo; si mañana la lógica crece, crece aquí
    } else throw new Error("ERR_PASSWORD")  // rama de una línea: sin llaves (Ley 4); else opcional
} else throw new Error("ERR_EMAIL")         // cada error cierra SU nivel: se sabe exactamente qué faltó

if (!store.has(key)) store.set(key, value)  // negación permitida: garantiza idempotencia (setear una sola vez)
const stored = store.get(key)!
```

```bad
if (!email || !password)
    throw new Error("ERR_FIELDS")       // early-throw como guardia: si mañana llega otro campo, este OR crece
                                        // y ya no distingue QUÉ falló; valida lo que necesito, no lo que "podría fallar"
return save({ email, password })

if (user.type !== "premium") return 0   // early-return con negación: invierte la lectura — el caso real
return amount * 0.15                    // (premium) queda implícito y sin bloque propio
```

## Ley 6 — Dispatch por casos: cadena de returns con default final

> Cuando una función es una tabla de decisión (clasificar, traducir, mapear), se redacta como cadena de `if (cond) return valor` con el default al final: cada return ES el resultado de un caso terminal. Esta forma convive con la Ley 5 porque cada return resuelve un caso completo, en vez de escapar de una validación.

```good
function humanize(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error)
    if (/rate.?limit|429/i.test(msg)) return "Estoy saturado, probá en un ratito."   // cada if ES un caso terminal
    if (/network|timeout/i.test(msg)) return "No pude conectar, probá de nuevo."    // no hay lógica después: solo casos
    return "Algo falló de mi lado, ya quedó registrado."                            // default SIEMPRE al final
}
```

```bad
function humanize(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error)
    if (!msg) return "Error"            // esto NO es un caso: es una guardia de entrada disfrazada (Ley 5)
    let result = ""                     // mezcla dispatch con acumulación: o es tabla o es proceso
    if (/429/.test(msg)) result = "Saturado"
    return result || "Error"
}
```

## Ley 7 — Ternario para asignar valores

> La asignación con dos ramas que resuelven a un valor usa ternario en una expresión; la clasificación por escalones usa ternario encadenado con salto de línea por rama. El if/else se reserva para ramas con lógica (varios statements o efectos).

```good
const role = name === "Admin" ? "admin" : "member"      // dos ramas, un valor: ternario simple

const tier = total >= 150 ? "distribuitor"              // clasificación por escalones: encadenado,
    : total >= 30 ? "plus"                              // una rama por línea, se lee como tabla
    : "basic"
```

```bad
let role                                // let + if/else para asignar: tres líneas para una expresión
if (name === "Admin") role = "admin"
else role = "member"

const x = a ? b : c ? d : e ? f : g     // encadenado SIN estructura de escalones ni saltos: ilegible
```

## Ley 8 — Operaciones atómicas inline

> Incrementos, math simple, accesos y conversiones van inline en su expresión cuando el lector entiende la intención sin línea dedicada; la asignación dentro de una expresión es válida cuando compacta una intención única. Extraer a variable solo si el valor se reusa o el cómputo necesita nombre.

```good
timer = setTimeout(connect, Math.min(retries++ * 3_000, 60_000))  // una intención: "reintentar con backoff acotado"
return (active = candidate)                                       // asignar y retornar: una sola intención
const digits = (process.env.PHONE_NUMBER = value.replace(/\D/g, ""))  // normalizar, publicar y capturar en una expresión
```

```bad
const delay = Math.min(retries * 3_000, 60_000)   // tres líneas para lo que es una sola intención;
retries++                                         // el desglose no agrega claridad ni reuso
timer = setTimeout(connect, delay)
```

---

# PARTE III — Datos y expresiones

## Ley 9 — Objetos declarativos: spread, `??` y propiedades condicionales

> Un objeto se construye completo en UNA declaración: spread del original, `??` para defaults y `...(cond && { clave })` para propiedades condicionales — la forma final del objeto se lee entera en su declaración.

```good
options.where = {
    ...options.where,                                       // spread sobre undefined es vacío: no necesita guarda previa
    expired_at: options.expired_at ?? { [Op.gt]: new Date() },  // override del caller o default, en una expresión
}

const payload = {
    id: instance.id,
    ...(instance.email && { email: instance.email }),       // spread sobre false es no-op: la clave solo entra si hay valor
    ...(from && to && { created_at: { [Op.between]: [from, to] } }),  // varias claves bajo una misma condición
}
```

```bad
const payload: any = { id: instance.id }    // el ": any" lo fuerza la mutación posterior: el tipo delata el diseño roto
if (instance.email) payload.email = instance.email   // la forma final del objeto queda dispersa en ifs
options.where = options.where || {}                  // reasignación intermedia: el spread ya cubre undefined
```

## Ley 10 — Operadores nullish: `?.` `??` `?.()` `??=` `||=` `&&=`

> El acceso, la llamada y el default sobre valores posiblemente nulos se resuelven con los operadores del lenguaje en una sola expresión: `?.` para acceder, `?.()` para llamar, `??`/`??=` para defaults (actúan solo ante null/undefined y respetan 0/""/false), `||`/`||=` para inicializar contenedores (actúan ante cualquier falsy) y `&&=` para transformar solo lo que ya existía.

```good
const port = config?.server?.port ?? 3000   // ?? actúa solo ante null/undefined: respeta 0/""/false como válidos
callback?.(value)                           // "llama si existe": la primitiva del lenguaje
user.preferences ??= defaults               // mutate-or-default en una operación
options.where ||= {}                        // ||= actúa ante TODO falsy: ideal para contenedores no inicializados
flags.dirty &&= validate(state)             // &&= transforma solo si el valor previo era truthy
```

```bad
if (json.user) {
    if (json.user.name) return json.user.name   // cascada de guards: json.user?.name ?? "Unknown" lo cubre
}
const limit = config.limit || 100           // BUG: si limit === 0 devuelve 100; los defaults numéricos usan ??
if (typeof on_change === "function") on_change(value)   // el contrato ya dice que es opcional: on_change?.(value)
user.preferences = user.preferences ?? defaults          // reasignación manual: existe ??=
```

## Ley 11 — Arrays declarativos: `map`/`filter(Boolean)`/`flatMap`

> Las transformaciones de arrays se encadenan declarativamente: 1→1 con `map`, descartar nulos con `.filter(Boolean)`, 1→N con `flatMap` en una sola pasada.

```good
const tokens = sessions.map((s) => s.fcm).filter(Boolean) as string[]  // cast acotado al final para el tipo limpio
const counts = items.map((i) => i.count).filter((x) => x != null)      // 0 es válido aquí: != null descarta SOLO null/undefined
const role_ids = users.flatMap((u) => u.roles.map((r) => r.id))        // 1→N en una pasada
const valid = users.flatMap((u) => u.active ? [u] : [])                // [] filtra: filter+map en una pasada
```

```bad
const tokens: string[] = []
for (const s of sessions) {
    if (s.fcm) tokens.push(s.fcm)       // loop imperativo para lo que es una cadena declarativa
}
const ids = users.map((u) => u.roles.map((r) => r.id)).flat()   // dos pasadas: flatMap lo hace en una
const counts = items.map((i) => i.count).filter(Boolean)        // Boolean también bota 0 y "": aquí 0 era un count válido
```

## Ley 12 — `Map` y `Set` sobre arrays para agrupar y deduplicar

> El lookup por clave repetido se pre-indexa en un `Map` (O(1)); la deduplicación usa `Set`; el diccionario desde un array se construye con `Object.fromEntries(arr.map(...))` si se serializa o `new Map(arr.map(...))` si se consulta.

```good
const by_id = new Map(users.map((u) => [u.id, u]))          // pre-indexar UNA vez…
for (const order of orders) assign(by_id.get(order.user_id))  // …lookup O(1) dentro del loop

const seen = new Set<string>()
for (const row of rows) {
    if (!seen.has(row.token)) {         // negación por idempotencia (Ley 5): contar una sola vez
        seen.add(row.token)
        devices.push(row)
    }
}

const ws_by_role = Object.fromEntries(roles.map((r) => [r.id, r.ws]))  // resultado plano serializable
```

```bad
for (const order of orders) {
    const user = users.find((u) => u.id === order.user_id)  // find dentro de loop: O(n²)
    if (!list.includes(user)) list.push(user)               // includes para deduplicar: existe Set
}
const dict: Record<string, string> = {}
for (const r of roles) dict[r.id] = r.ws                    // acumulador mutable: existe Object.fromEntries
```

## Ley 13 — Destructuring profundo con defaults y rename

> Los valores anidados con defaults se extraen en UNA declaración de destructuring con `=` (default) y `:` (rename); los huecos de tuplas se saltan con comas.

```good
const {
    data: {
        limit = 100,                                    // default si undefined
        user: { name: user_name = "unknown" } = {},     // navegar + rename + default; el ={} evita crash si user falta
    },
} = response

const [, , ...messages] = lines         // hueco de tupla: las dos primeras líneas no interesan

const title = data.title ?? "untitled"  // el default de destructuring ignora null: si la fuente trae null explícito, ?? lo resuelve
```

```bad
const data = response.data
const limit = data.limit !== undefined ? data.limit : 100   // ternario de verificación: es { limit = 100 }
const user_name = data.user && data.user.name ? data.user.name : "unknown"  // cascada manual del mismo patrón
```

---

# PARTE IV — Funciones

## Ley 14 — Parámetros: defaults se destructuran; lo que se transforma viaja entero

> Si la firma declara defaults o usa los valores tal cual, se destructura en la firma. Si lo primero es transformar el valor, el objeto viaja entero (`params`) y el nombre limpio queda para el resultado transformado.

```good
async function read(_: unknown, { pathname, offset = 0, limit = 2000 }: ReadInput) {
    const lines = (await fs.readFile(pathname, "utf8")).split("\n")   // valores usados tal cual: destructurados
}

async function fetch_page(ctx: Context, params: FetchInput) {
    const url = params.url.replace(/^http:\/\//i, "https://")   // el nombre "url" queda para el valor TRANSFORMADO
}
```

```bad
async function fetch_page(ctx: Context, { url: raw_url }: FetchInput) {
    const url = raw_url.replace(/^http:\/\//i, "https://")   // dos nombres para un valor: raw_url solo existe para morir
}
```

## Ley 15 — Lo de un solo uso vive inline

> Todo lo que tiene UN solo llamador vive inline en su punto de uso: expresión directa, IIFE si es un campo calculado, const local dentro del proceso que lo necesita, closure local si es recursivo. Los valores de configuración de un solo uso siguen la misma regla: literal donde actúan (separador `_` si es numérico, Ley 2). El nivel de módulo queda reservado para lo que se reusa o es un contrato (constante UPPER).

```good
const timer = setTimeout(() => ctrl.abort(), 30_000)   // config de un solo uso: el lector ve el valor DONDE actúa
const PHONE_RE = /^\+?\d{10,15}$/       // contrato del módulo usado por varias funciones: constante UPPER

export const POST = http.auth(async (req, res) => {
    // helper DEL proceso: const flecha LOCAL dentro del handler, no de módulo
    const format_number = (n: number) => new Intl.NumberFormat("es-VE").format(n)

    const order = {
        // campo calculado: IIFE in-situ — el parseo vive pegado al campo que llena
        payments: (() => {
            try {
                const raw = JSON.parse(attrs.payments || "[]")
                return Array.isArray(raw) ? raw.filter((p) => p?.type) : []
            } catch { return [] }
        })(),
    }

    // recursión de un solo uso: closure local dentro de su único consumidor
    const walk = (rest: Drop[], path: Drop[], km: number) => {
        if (km >= best_km) return       // poda de recursión: caso terminal que cierra la rama (Ley 6)
        for (let i = 0; i < rest.length; i++) walk(rest.filter((_, j) => j !== i), [...path, rest[i]], km + dist(rest[i]))
    }
    walk(drops, [], 0)
})
```

```bad
const fetch_timeout_ms = 30_000         // constante nombrada con UN solo uso: obliga a saltar
const timer = setTimeout(() => ctrl.abort(), fetch_timeout_ms)   // arriba para saber cuánto es

function sanitize_name(v: string) { return v.trim().slice(0, 60) }   // módulo-level con UN llamador: prohibido,
                                                                     // dispersa la lógica lejos de su único punto de uso
function parse_payments(value?: string) { /* 15 líneas */ }          // ídem: va como IIFE en el campo payments
export const POST = http.auth(async (req, res) => {
    const name = sanitize_name(req.body.name)                        // el lector salta 200 líneas para ver qué hace
})
```

## Ley 16 — Extraer solo con ≥2 usos; las variantes se componen

> Extraer a función, método o privado de clase (`_snake_case`) exige ≥2 llamadores con la misma forma exacta, o estado compartido encapsulado. Una variante (`once` sobre `listen`, `fetch_with_retry` sobre `fetch`) se compone sobre su método base agregando solo su delta de comportamiento.

```good
class ProductService {
    get(id: string): Product {
        const product = db.products.find(id)
        if (product) return product     // afirmativo con throw final (Ley 5)
        throw new Error("ERR_NOT_FOUND")
    }
    update(id: string, data: UpdateInput) {
        this.get(id)                    // ≥2 llamadores reusan la validación de get(): extracción justificada
        return db.products.update(id, data)
    }
    delete(id: string) {
        this.get(id)                    // segundo reuso: get() se ganó existir
        db.products.delete(id)
    }
    private _audit(action: string) {    // privado justificado: lo comparten update() y delete()
        log.write({ action, at: Date.now() })
    }
}

const once = (cb: Listener) => {
    const unsub = listen((event, data) => {   // la variante SE COMPONE sobre listen:
        unsub()                               // solo agrega su delta (desuscribirse al primer disparo)
        cb(event, data)
    })
    return unsub
}
```

```bad
class ProductService {
    get_by_id(id: string): Product { /* ... */ }
    get(id: string) { return this.get_by_id(id) }   // wrapper trivial: dos nombres para lo mismo, ambigüedad gratis
    private _validate_amount(amount: number) {      // privado con UN solo llamador: su lógica va inline
        if (amount > 0) return                      // en el único método que la usa
        throw new Error("ERR_AMOUNT")
    }
}

const once_listeners = new Set<Listener>()          // variante con infraestructura PARALELA a listen:
function dispatch_once(event: string, data: unknown) {  // si listen() cambia (filtro, prioridad),
    for (const fn of once_listeners) fn(event, data)    // once no lo hereda y queda inconsistente
    once_listeners.clear()
}
```

## Ley 17 — IIFE async para definir-y-ejecutar

> La lógica async dentro de un scope síncrono (useEffect, handlers) se define y ejecuta en una sola expresión IIFE `(async () => {...})()`; lleva nombre únicamente cuando se auto-invoca (polling/retry).

```good
useEffect(() => {
    if (token) {
        (async function connect() {     // nombrada SOLO porque se re-invoca a sí misma
            await open_socket()
            timer = setTimeout(connect, delay)
        })()
    }
    return () => { destroyed = true }
}, [])
```

```bad
useEffect(() => {
    async function connect() { await open_socket() }
    connect()                           // dos statements para una sola intención: definir y ejecutar ya
}, [])
```

---

# PARTE V — Clases

## Ley 18 — Dominio con estado: clase compacta, sin degradarla

> Un dominio con estado (cart, session, driver) se modela como clase compacta: cada método es una operación REAL del dominio, los pasos internos van inline (Ley 15) y el naming es snake_case (Ley 1). Al pasar un método como callback se envuelve en arrow para conservar this. Las clases impuestas por framework/ORM (decoradores, herencia, instanceof) se abrazan completas.

```good
export class Cart {
    /** Items del carrito / Cart items */
    private items: { id: string; count: number }[] = []

    constructor(private customer: string) {}

    add(id: string, count = 1) {
        this.items.push({ id, count })      // operación real del dominio: nada que fragmentar
    }
    total() {
        return this.items.reduce((sum, item) => sum + item.count, 0)
    }
    async save() {
        await api.put(`/v1/cart/${this.customer}`, { items: this.items })
    }
}

button.onclick = () => cart.save()      // arrow en el punto de uso: this sobrevive
```

```bad
function buildCartPayload(items) {}     // helper FUERA de la clase con un llamador (Ley 15) + camelCase (Ley 1)
export class Cart {
    private _validate_item(item) {}     // privado con UN llamador: va inline
    private _build_payload() { return buildCartPayload(this.items) }   // wrapper trivial (Ley 16)
    async save() {
        this._validate_item(this.items[0])
        await api.put("/v1/cart", this._build_payload())   // la clase degradada: 3 saltos para leer un método
    }
}
button.onclick = cart.save              // método suelto: this se pierde en runtime → this.customer undefined
```

## Ley 19 — Parameter properties cuando el constructor solo asigna

> Si el constructor solo copia parámetros a campos, se usan parameter properties (`constructor(public readonly id: string)`); si transforma, normaliza o deriva, se usa constructor body con los campos declarados.

```good
class User {
    constructor(
        public readonly id: string,     // solo asigna: parameter property, cero body
        public name: string,
    ) {}
}

class Workspace {
    public name: string
    public config: { theme: string }
    constructor(input: WorkspaceInput) {
        this.name = input.name.trim()               // transforma: body justificado
        this.config = { theme: input.theme ?? "light" }
    }
}
```

```bad
class User {
    public id: string
    public name: string
    constructor(id: string, name: string) {
        this.id = id                    // body que solo copia: es la parameter property con más líneas
        this.name = name
    }
}
```

## Ley 20 — Builders encadenan con `return this`

> En builders/configuradores/DSL, los mutadores retornan `this` (tipo `this`, para que las subclases hereden el chaining) y la construcción completa se encadena en una sola expresión; los métodos que retornan datos conservan su retorno.

```good
const result = new QueryBuilder()
    .where("id", 1)                     // cada mutador retorna this: la construcción es UNA expresión
    .limit(10)
    .execute()

class QueryBuilder {
    where(field: string, value: unknown): this {   // tipo this: las subclases heredan el chaining
        this.conditions.push({ field, value })
        return this
    }
}
```

```bad
const qb = new QueryBuilder()
qb.where("id", 1)                       // mutadores void: cuatro statements para una construcción
qb.limit(10)
const result = qb.execute()
```

---

# PARTE VI — Tipado

## Ley 21 — Tipado estricto: tipos reales; `!` solo demostrable

> Cada parámetro, retorno, propiedad y generic lleva su tipo real; lo desconocido entra como `unknown` y se estrecha con validación. El non-null `!` se usa cuando la no-nulidad es demostrable por una invariante (bounds de loop, chequeo previo, contrato garantizado). La inferencia queda para locales obvias.

```good
export function get_user(id: string): Promise<User | null> {   // API pública: tipos explícitos
    return db.users.find(id)
}
const first = items[0]                  // local con asignación directa: inferencia permitida
if (list.length > 0) use(list.at(-1)!)  // ! demostrable: el length ya se verificó
```

```bad
export function get_user(id: any): any {}   // any: prohibido en ambos lados
const token = session.fcm!              // ! a ciegas: nada demostró que fcm existe
```

## Ley 22 — Narrowing con `as` + validación inline

> Cuando el dato viene de fuente confiable, se castea con `as` y se valida inline en el consumidor. El type guard extraído (`x is User`) solo existe con ≥2 usos (la Ley 16 aplicada a tipos) o cuando el narrowing es complejo.

```good
function process(item: unknown): string {
    const user = item as User           // fuente confiable (parseado antes) + validación inline abajo
    if (typeof user.email === "string") return user.email
    throw new Error("ERR_NOT_USER")     // afirmativo + throw final (Ley 5)
}
```

```bad
function is_user(item: unknown): item is User {   // guard auxiliar con UN uso: fragmentación de tipos (Ley 15)
    return typeof item === "object" && item !== null && "email" in item
}
function process(item: unknown): string {
    if (is_user(item)) return item.email
    throw new Error("ERR_NOT_USER")
}
```

## Ley 23 — `satisfies` para validar sin perder literales

> Para validar el shape de un objeto conservando sus tipos literales se usa `satisfies`; la anotación `: Tipo` ensancha y pierde los literales; `as Tipo` no valida nada.

```good
const STATUS_LABELS = {
    active: "Activo",
    archived: "Archivado",
} satisfies Record<string, string>      // valida el shape Y conserva 'Activo' como literal;
                                        // keyof typeof da 'active' | 'archived' exacto
```

```bad
const STATUS_LABELS: Record<string, string> = {   // anotación: ensancha a string,
    active: "Activo",                             // cualquier clave pasa, se pierde el enum implícito
}
```

## Ley 24 — Tipos derivados con utility types

> Update/Public/Search se DERIVAN del tipo base con Partial/Pick/Omit/Record: un cambio en la base se propaga solo a todos los derivados.

```good
interface UserCreateInput {
    email: string
    name: string
    password: string
}
type UserUpdateInput = Partial<UserCreateInput>         // deriva: un cambio en la base se propaga solo
type UserPublic = Omit<UserCreateInput, "password">     // deriva quitando lo sensible
type UserAuth = Pick<UserCreateInput, "email" | "password">
```

```bad
interface UserUpdateInput {             // copia manual de la base con ?:
    email?: string                      // al agregar un campo a UserCreateInput,
    name?: string                       // nadie recuerda actualizar esta copia
    password?: string
}
```

## Ley 25 — Branded types para strings semánticos

> IDs, emails, tokens y unidades que TypeScript vería como string plano se marcan con brand (`string & { __brand: "X" }`); el cast al brand ocurre SOLO donde se valida el formato, y de ahí viaja sin re-validación.

```good
type Brand<T, B extends string> = T & { __brand: B }
type UserId = Brand<string, "UserId">
type Email = Brand<string, "Email">

function as_email(s: string): Email | null {
    return /.+@.+\..+/.test(s) ? (s as Email) : null   // el cast vive SOLO junto a la validación
}
function send_to(email: Email, msg: string) {}
```

```bad
function get_user(id: string) {}        // string desnudo: get_user(email) compila y explota en runtime
function send_to(email: string) {}
send_to("x" as Email, "hola")           // cast sin validación previa: rompe la garantía del brand
```

## Ley 26 — Inputs excluyentes con DU; resultados con comportamiento como clases

> Una operación con N criterios mutuamente excluyentes recibe una discriminated union con tag (`{ by: "email", value }`): el caller elige exactamente un criterio y el switch interno es exhaustive-checkable. Un resultado que lleva MÉTODOS por variante (`is_ok/unwrap/map`) se modela con clases hermanas que encapsulan el comportamiento.

```good
type UserLookup =
    | { by: "id"; value: string }
    | { by: "email"; value: string }    // el caller DEBE elegir exactamente un criterio: TS no deja mezclar
function get_user(lookup: UserLookup): User | null {}

abstract class Result<T> {
    abstract is_ok(): boolean
    abstract unwrap(): T                // el comportamiento vive en la variante: los callers no repiten checks
}
```

```bad
function get_user_by_id(id: string) {}      // proliferación por sufijo: una DU las unifica
function get_user_by_email(email: string) {}

function find_user(filter: { id?: string; email?: string }) {}   // filter opcional: find_user({}) y find_user({id, email})
                                                                 // compilan — obliga a validar en runtime lo que el tipo debía impedir

type Result<T> = { ok: true; data: T } | { ok: false; error: string }
if (result.ok) use(result.data)         // cada caller reescribe el mismo check+acceso: eso pedía métodos
```

---

# PARTE VII — Asincronía

## Ley 27 — Pipeline de promesas: un `.then` por paso, `.catch` como fallback

> Las TRANSFORMACIONES de datos async se encadenan como tubería: cada `.then` hace un paso, un `.catch` intermedio devuelve el fallback para continuar degradado, el `.catch` final absorbe lo best-effort, y `.finally` pega el ciclo de vida a la promesa. Los EFECTOS con ramas (reintentos, limpieza, contadores) van imperativos con estado local: la tubería no se fuerza.

```good
await Mailer.audience()
    .then((all) => all.filter((contact) => contact.group === group_id))  // un paso: filtrar
    .catch(() => [] as Contact[])                                        // fallo aquí ⇒ tubería sigue, vacía
    .then((contacts) => contacts.length > 0 ? Mailer.send(contacts, message) : null)  // un paso: actuar
    .catch(() => {})                                                     // el envío es best-effort

const res = await fetch(url)
    .finally(() => clearTimeout(timer))     // el ciclo de vida pegado a la promesa, no en try/finally aparte
    .catch(() => { throw new Error("No pudimos abrir la URL") })  // el error técnico muere aquí; hacia afuera viaja el mensaje humano

let sent = 0                                // EFECTO con ramas: imperativo honesto,
for (const chunk of chunks) {               // no se disfraza de tubería pura
    await Promise.all(chunk.map(async (device) => {
        const ok = await push(device).catch(() => false)
        if (ok) sent++
    }))
}
```

```bad
await Mailer.audience()
    .then((all) => {                        // un solo .then con TODO adentro: es un bloque, no una tubería
        const contacts = all.filter((c) => c.group === group_id)
        if (contacts.length > 0) return Mailer.send(contacts, message)
        return null
    })
    .catch(() => {})
```

## Ley 28 — `Promise.all` con ramas condicionales `&&`

> Las promesas paralelas condicionales se cortocircuitan con `&&` dentro del array de `Promise.all` (los valores falsy se ignoran): la promesa solo se crea cuando su condición se cumple.

```good
await Promise.all([
    instance.email && send_code({ email: instance.email }),   // la promesa solo se CREA si hay email
    instance.phone && send_code({ phone: instance.phone }),
])
```

```bad
const tasks = []                        // array mutable + if/push por rama: la lista se arma
if (instance.email) tasks.push(send_code({ email: instance.email }))   // lejos del Promise.all que la consume
if (instance.phone) tasks.push(send_code({ phone: instance.phone }))
await Promise.all(tasks)
```

## Ley 29 — Paralelismo contra APIs externas: chunks por cuota + throttling reactivo

> El paralelismo se dimensiona por la CUOTA REAL del proveedor (chunks con Promise.all) y el throttling se maneja reactivo: un solo reintento ante 429 esperando su Retry-After.

```good
const batch = 50                                // dimensionado por la cuota real del proveedor
for (let i = 0; i < devices.length; i += batch) {
    await Promise.all(devices.slice(i, i + batch).map(async (device) => {
        let res = await fetch(url).catch(() => null)
        if (res?.status === 429) {              // throttling REAL: reaccionar, no prevenir a ciegas
            await new Promise((r) => setTimeout(r, (Number(res.headers.get("retry-after")) || 1) * 1000))
            res = await fetch(url).catch(() => null)   // UN reintento y se acabó
        }
    }))
}
```

```bad
for (const device of devices) {
    await push(device)                          // serial: N round-trips donde caben 50 en paralelo
    await new Promise((r) => setTimeout(r, 200))  // sleep fijo: castiga el 99% de envíos que NO throttlean
}
```

---

# PARTE VIII — Errores y documentación

## Ley 30 — Errores: código técnico adentro, mensaje humano en el borde

> Dentro del sistema los errores viajan como códigos (`throw new Error("ERR_CODIGO")`, el wrapper http los convierte). En el borde con el usuario final, el mensaje es español natural en primera persona del plural, con el detalle técnico entre paréntesis solo si aporta. Cada I/O traduce su error en el punto de la llamada.

```good
if (!data.access_token) throw new Error("ERR_FIREBASE_AUTH")   // interno: código rastreable

await fs.writeFile(file, body)
    .catch(() => { throw new Error("No pudimos guardar la sesión") })  // borde: el técnico muere aquí

throw new Error(`No pudimos abrir la URL (HTTP ${res.status})`)  // detalle técnico solo si aporta
```

```bad
throw new Error("ENOENT: no such file or directory, open '/x'")  // error técnico crudo hacia el usuario
res.error("ERR_NOT_FOUND")              // código pelado como mensaje humano: no comunica nada
```

## Ley 31 — JSDoc estructural; el cuerpo queda limpio

> El JSDoc describe el CONTRATO: propiedades de clase con una línea; métodos y funciones con @param, @returns y @throws. Bilingüe español/inglés en el mismo bloque. Lo que necesite explicación va al JSDoc o a un mejor nombre — el cuerpo de funciones y métodos queda limpio de comentarios.

```good
class Foo {
    /** Nombre del Foo / Foo's name */
    private name: string

    /**
     * @param {string} name - Nombre del foo / Foo's name
     * @returns {string} - Saludo generado / Generated greeting
     * @throws ERR_EMPTY_NAME si el nombre viene vacío / when the name is empty
     */
    bar(name: string) {}
}
```

```bad
/**
 * Este método recibe el nombre, lo valida, lo normaliza y construye
 * el saludo final teniendo en cuenta el idioma configurado…
 */                                     // prosa extendida: el contrato ES la doc, la novela no
bar(name: string) {}

function checkout() {
    // ── Validación del payload ────────    ← separador de sección: prohibido
    // calculamos la diferencia              ← comentario interno: no se lee y no se entiende
    const diff = total - paid
}
```

## Ley 32 — JSDoc de endpoint: método+ruta, ES/EN, @param, @returns, @example

> Todo handler HTTP exportado documenta método y ruta, descripción en español e inglés, cada @param de body/query con "ES / EN", el @returns y un @example request → response. Este es el único JSDoc con descripción, porque la ruta ES el contrato.

```good
/**
 * @description
 * POST /v1/auth/keys - Crea una API Key; la key completa solo se muestra una vez y se persiste su hash SHA-256.
 * POST /v1/auth/keys - Creates an API Key; the full key is shown only once and its SHA-256 hash is persisted.
 *
 * @param {string} body.name - Nombre descriptivo (máx 100 chars) / Descriptive name (100 chars max)
 * @returns {{ id, name, key, created_at }} - Key creada / Created key
 *
 * @example
 * POST /v1/auth/keys { "name": "Producción" }
 * → { "data": { "id": "...", "name": "Producción", "key": "sk-abc...", "created_at": "..." } }
 */
export const POST = http.auth(async (req, res) => {})
```

```bad
// crea una key                         // comentario de línea como doc de endpoint: sin ruta, sin params,
export const POST = http.auth(async (req, res) => {})   // sin ejemplo — el consumidor no sabe qué mandar
```

---

# PARTE IX — Arquitectura de archivos

## Ley 33 — Estructura recursiva universal: components/ y lib/ en cualquier tecnología

> Esta estructura es una ideología, no una convención de un framework: aplica a Next, Angular, Flutter, Node o cualquier proyecto. (1) Un módulo SIN dependencias internas es archivo plano; CON ellas, es carpeta con entrypoint. (2) Cada nivel puede tener sus hijos visuales y su lógica local, recursivamente y a cualquier profundidad. (3) Lo que solo usa X vive DENTRO de X; lo que comparten ≥2 módulos sube al ancestro común (el root es el scope global); si dos hermanos comparten lógica, sube a su padre común. (4) Los imports van solo hacia arriba: lo propio con ruta relativa inmediata y todo lo demás — padre, abuelo, root — por su alias (Ley 3).

```good
// El MISMO patrón en cada dialecto — Next/React: index.tsx + components/ + lib/
// Angular: index.ts+index.html + components/ + services/ · Flutter: main.dart + widget/ + lib/
// Node backend/CLI: <modulo>.ts plano, con lib/ anidada cuando crece

src/components/Icon.tsx                 // sin módulos internos → archivo plano
src/lib/cache.ts                        // wrapper autocontenido → archivo plano

src/components/AnimatedButton/          // tiene hijos propios → carpeta con entrypoint
├── index.tsx
├── components/
│   └── Icon.tsx                        // hijo sin deps propias → archivo plano
└── lib/
    ├── use_click.tsx                   // hook sin deps: los hooks son lógica local y viven aquí (use_ + snake_case)
    └── use_reducer/                    // hook CON deps → carpeta: la recursión es idéntica en cada nivel
        ├── index.ts
        └── lib/redis.ts                // solo lo usa use_reducer: ni hermanos ni el abuelo lo tocan

// La MISMA ley en dialecto Angular (modules/client/live/):
live/
├── index.ts + index.html               // entrypoint del módulo
├── services/camera.ts                  // lógica local del módulo (el "lib/" de Angular)
└── components/chat/
    ├── index.ts + index.html           // en Angular el componente SIEMPRE es carpeta: ts+html ya son deps internas
    ├── services/voice.service.ts       // lógica local DEL chat: solo el chat la ve
    └── components/Message/
        └── components/MessageCamera/   // recursión nivel 4: el patrón no cambia con la profundidad

import useIconSize from "./lib/use_icon_size"    // propio: relativo inmediato (Ley 3)
import useButtonState from "@/components/AnimatedButton/lib/use_button_state"   // del padre: por alias (Ley 3)
import useTheme from "@/lib/use_theme"            // del root: compartido por toda la app
```

```bad
src/components/Card/
└── index.tsx                           // carpeta+index SIN deps internas: era Card.tsx
src/components/Button/
├── helpers.ts                          // suelto en el root del componente: lo interno vive bajo lib/
└── hooks.ts                            // hooks agrupados: cada uno vive con su nombre bajo lib/
import x from "../ButtonSpinner/lib/x"     // hermano: prohibido — esa lógica sube al padre común
import y from "@/components/Form/lib/y"    // rama ajena: prohibido — si lo necesitas, va al root
```

## Ley 34 — Orden de exports en `index.tsx`

> El index de un componente exporta en este orden: enum → type → interface → const → función utilitaria reusada dentro del componente (≥2 usos, Ley 16) → export default del componente al final. Los hooks viven en su lib/ (Ley 33).

```good
export enum ButtonSize { SM = "sm", MD = "md" }
export type ButtonVariant = "primary" | "ghost"
export interface ButtonProps { size?: ButtonSize }
export const DEFAULT_SIZE = ButtonSize.MD

export default function Button({ size = DEFAULT_SIZE }: ButtonProps) {   // el componente cierra el archivo
    return <button />
}
```

```bad
export default function Button() {}     // default primero: el lector busca tipos DESPUÉS del componente
export interface ButtonProps {}         // tipos después del default: orden invertido
export function useButtonState() {}     // hook en el index: va en lib/use_button_state (Ley 33)
```

## Ley 35 — Solo archivos solicitados

> Se crean únicamente los archivos que el feature necesita o que fueron pedidos explícitamente; ante la duda de si un archivo corresponde, se pregunta antes de crearlo.

```good
src/components/Button/
├── index.tsx
└── lib/use_click.tsx                   // solo lo que el feature necesita
```

```bad
src/components/Button/
├── index.tsx
├── Button.css                          // CSS separado: prohibido (estilos = Tailwind/clases nativas)
├── Button.test.tsx                     // test no pedido: prohibido
└── README.md                           // doc no pedida: prohibido
```

---

# PARTE X — Backend

## Ley 36 — Lib = primitivas; el servicio orquesta

> Un lib/ de backend expone SOLO primitivas reutilizables del dominio (send, record, audience, upload, search); la orquestación — buscar destinatarios, decidir el copy, componer el flujo — vive en el endpoint. Dentro del lib rigen las Leyes 16 y 17 (inline lo single-use; privados con ≥2 llamadores o estado compartido como caches).

```good
// lib/mailer.ts — SOLO primitivas
export async function audience(): Promise<Contact[]> {}
export async function send(contacts: Contact[], message: MailPayload) {}

// app/v1/campaigns/[id]/route.ts — el endpoint ORQUESTA con la tubería (Ley 27)
await Mailer.audience()
    .then((all) => all.filter((contact) => contact.group === group_id))
    .catch(() => [] as Contact[])
    .then((contacts) => contacts.length > 0 ? Mailer.send(contacts, message) : null)
    .catch(() => {})
```

```bad
// lib/mailer.ts
export async function notify(group_id: string, message: MailPayload) {   // caso de uso disfrazado de primitiva:
    const contacts = (await audience()).filter((c) => c.group === group_id)  // esta orquestación pertenece al endpoint;
    return send(contacts, message)                                           // el próximo caso de uso pedirá OTRO wrapper
}
```

## Ley 37 — Dos modos de endpoint: proceso inline o CRUD delgado

> Si la lógica se reúsa desde otro endpoint, es una entidad de dominio: vive en la lib y el handler queda delgado (validar mínimo + delegar). Si el endpoint es un proceso único no reutilizable (un checkout, una conciliación), TODA su lógica vive inline en el handler, en el orden real del proceso (validar → cargar → calcular → efectos → responder), con sus helpers como const locales (Ley 15) y el cuerpo limpio de comentarios (Ley 31).

```good
// CRUD delgado: la entidad se reúsa (otros endpoints también tocan Address)
export const PUT = http.auth(csrf("PUT"), async (req, res) => {
    if (req.params.id) {
        const updated = await Address.update(req.auth!.id, req.params.id, req.body.address)
        return res.success(updated)     // afirmativo anidado (Ley 5)
    }
    throw new Error("ERR_MISSING_ID")
})

// Proceso único: todo inline, secuencia = el proceso real, validaciones anidadas (Ley 5)
export const POST = http.auth(csrf("POST"), async (req, res) => {
    const format_number = (n: number) => new Intl.NumberFormat("es-VE").format(n)   // helper LOCAL del proceso
    // …validar → cargar carrito → calcular tier → crear orden → limpiar → responder,
    // redactado de corrido en ese orden, sin fragmentar en funciones de módulo
})
```

```bad
// lib/checkout.ts
export async function do_checkout(customer: string, body: unknown) {}   // proceso único empujado a la lib:
export const POST = http.auth(async (req, res) => {                     // nadie más lo llama — es fragmentación
    res.success(await do_checkout(req.auth!.id, req.body))              // que esconde el proceso a dos archivos de distancia
})
```

## Ley 38 — File-based routing con handlers por método

> La carpeta refleja la URL (`[param]` para dinámicos); cada index.ts/route.ts exporta un handler por método HTTP como constante (GET, POST, PUT, DELETE). En Express: `http(path, function GET() {})` con el método inferido del nombre.

```good
src/auth/keys/[id]/index.ts             // DELETE /v1/auth/keys/{id}: la ruta SE LEE en el árbol

export const GET = http(async (req, res) => res.success(await User.all()))
export const POST = http(async (req, res) => res.success(await User.create(req.body)))
```

```bad
router.get("/auth/keys/:id", handler)   // routing programático: la ruta vive escondida en un registro
export default async (req, res) => {
    switch (req.method) {               // switch por método: un archivo-Dios por recurso
        case "GET": {}
    }
}
```

## Ley 39 — Envelope de respuesta y cliente HTTP único

> Toda API responde `{ success, data }` o `{ success: false, message, cause: { code } }`; las listas paginadas son exactamente `{ rows, count, offset, limit, order }`. Un único cliente HTTP centraliza el token, la extracción de data y el manejo de 401 para todos los consumidores.

```good
res.success({ rows, count: 100, offset: 0, limit: 20, order: "ASC" })   // shape de paginación EXACTO
res.error("Usuario no encontrado", 404, { code: "ERR_NOT_FOUND" })      // humano + código (Ley 30)

const user = await api.get<User>("/v1/users/abc")   // el cliente ya extrajo data: el consumidor recibe el payload
```

```bad
res.json({ users, total })              // shape ad-hoc: cada endpoint inventa su paginación
axios.get(url, { headers: { Authorization: token } })   // token a mano + cliente paralelo: se hace UNA vez en el cliente único
```

## Ley 40 — Proyección explícita en las respuestas

> Toda respuesta proyecta campo por campo lo que expone: la proyección ES el contrato — decide qué sale, protege lo interno y sobrevive a los campos que el modelo agregue mañana.

```good
res.success(keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,                   // el hash NUNCA sale: la proyección es el contrato
    created_at: k.created_at,
})))
```

```bad
res.success(keys)                       // vuelca el modelo entero: hash, uid interno y lo que se agregue mañana
```

---

# PARTE XI — Frontend React/Next

## Ley 41 — SSR: acceso al navegador con guard; `mounted` en afirmativo

> Código que corre en SSR protege todo acceso a window/document/localStorage con `typeof window !== "undefined"`; los componentes que dependen del navegador usan el patrón mounted renderizando en afirmativo (Ley 5).

```good
if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")   // solo el browser tiene localStorage
    if (token) config.headers.Authorization = `Bearer ${token}`
}

const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (mounted) return <ThemeAwareUI />    // afirmativo: el caso real primero
return null                             // rama negativa al final (Ley 5)
```

```bad
const token = localStorage.getItem("auth_token")   // ReferenceError en el server
if (!mounted) return null               // leading-return: prohibido (Ley 5)
```

## Ley 42 — Dos hooks centrales; el resto es API directa

> El frontend se apoya en dos hooks transversales (`useAuth`, `useWorkSpace`) más los globales inevitables (theme/locale); todo lo demás se obtiene con `api.get` desde el componente que lo necesita.

```good
function TicketList() {
    const { workspace, permissions } = useWorkSpace()   // hook central: contexto transversal
    const [tickets, setTickets] = useState([])
    useEffect(() => {
        api.get(`/workspaces/${workspace.id}/tickets`).then(setTickets)   // la entidad se pide directo
    }, [workspace.id])
}
```

```bad
function useTickets() {}                // hook por entidad: envuelve api.get + useState sin aportar nada
function useTicketSort() {}             // cadena de hooks especializados: un sort inline lo resolvía
function useTicketFilters() {}
```

## Ley 43 — Complejidad proporcional al problema

> La implementación replica la complejidad real del problema: si el caso es fetch+render+acciones, la solución es useState+useEffect+render; cada capa adicional existe solo cuando el problema la exige.

```good
function TicketList() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        api.get("/tickets").then(setTickets).finally(() => setLoading(false))   // el problema ES así de simple
    }, [])
    return <Table loading={loading} data={tickets} />
}
```

```bad
function TicketList() {
    const { tickets, loading } = useTickets()           // cinco capas para el MISMO problema:
    const { sorted } = useTicketSort(tickets)           // cada capa existe porque la anterior existe,
    const { filtered } = useTicketFilters(sorted)       // ninguna porque el problema la pida
    const { paginated } = useTicketPagination(filtered)
    return <TicketTable data={paginated} />
}
```

## Ley 44 — Componente solo si encapsula comportamiento

> Extraer un componente exige unidad funcional completa: estado propio, ciclo de vida, side effects u orquestación. El micro-componente que solo mapea props a presentación va inline donde se usa (es la Ley 15 aplicada a JSX).

```good
<WhatsApp phone={phone} on_open={() => {}} />   // encapsula: conexión SSE, registro, PIN, eventos — unidad real

<Chip label={status} color={status === "active" ? "success" : "default"} />   // el mapeo trivial va inline
```

```bad
function StatusChip({ status }: { status: string }) {   // 4 líneas sin estado ni lifecycle:
    const color = status === "active" ? "success" : "default"   // solo re-mapea props a otra forma
    return <Chip label={status} color={color} />
}
```

## Ley 45 — El framework UI se usa directo

> Si el framework de UI ya provee el componente o prop, se usa directo con sus imports tipados; envolver el framework se justifica solo cuando el wrapper agrega comportamiento real (estado, validación, side effects, theming compartido).

```good
import EditIcon from "@mui/icons-material/Edit"
<IconButton onClick={on_edit}><EditIcon /></IconButton>   // el framework ya lo resuelve tipado
```

```bad
function Icon({ name }) {
    const icons = { edit: EditIcon, delete: DeleteIcon }   // lookup por string: pierde tipos y tree-shaking
    const Component = icons[name]
    return <Component />
}
```

## Ley 46 — Convenciones del framework antes que componentes custom

> Cuando el framework tiene convención estructural (parallel routes @drawer/@modal, loading.tsx, error.tsx, not-found.tsx, route groups), se usa la convención. El componente custom solo existe donde el framework no cubre el caso.

```good
app/(dashboard)/@drawer/default.tsx     // el drawer via parallel route: el framework inyecta el slot
app/tickets/loading.tsx                 // loading boundary por convención: cero Providers
```

```bad
<Layout>
    <Sidebar items={[...]} activeItem={x} onNavigate={y} />   // reinventa el slot system a mano:
    <main>{children}</main>                                   // el padre carga con lo que Next ya resolvía
</Layout>
```

## Ley 47 — Vistas equivalentes, composición idéntica

> Vistas que resuelven el mismo problema (listas, formularios CRUD, detalles) usan el mismo componente base y el mismo shape de loading/empty/error: abrir una vista hermana es reconocer la misma estructura.

```good
function TicketList() { return <VirtualList data={tickets} renderItem={(t) => <TicketRow ticket={t} />} /> }
function ClientList() { return <VirtualList data={clients} renderItem={(c) => <ClientRow client={c} />} /> }
// mismas piezas, mismo esqueleto: abrir una es saber usar la otra
```

```bad
function TicketList() { return <div onScroll={on_scroll}>{tickets.map(render)}</div> }   // scroll infinito aquí…
function ClientList() { return <Table pagination={{ page, onChange: setPage }} /> }      // …paginación manual allá:
                                                                                          // mismo problema, dos mundos
```

## Ley 48 — Dashboard: cada card es autónoma

> En dashboards con métricas de dominios distintos, cada card es autónoma: monta, hace su propio fetch, muestra su skeleton del tamaño exacto final y maneja su error localmente — el dashboard renderiza progresivo, card a card.

```good
function TicketCountCard() {
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        api.get("/metrics/tickets/count").then(setCount).finally(() => setLoading(false))
    }, [])
    if (loading) return <Skeleton width={240} height={120} />   // tamaño EXACTO del card final: cero layout shift
    return <MetricCard title="Tickets" value={count} />
}
```

```bad
useEffect(() => { api.get("/dashboard").then(setData) }, [])   // todo-en-uno: si una métrica tarda 3s,
if (!data) return <Loading />                                  // TODA la UI espera 3s; si una falla, ninguna se ve
```

## Ley 49 — Vista cohesiva: un `Promise.all`, un estado

> Cuando la vista es UNA entidad lógica repartida en varios endpoints (un post con comentarios y reacciones), se combinan con Promise.all en un único useState: un loading, un error, un render completo. La prueba: si mostrar una parte sin las otras se ve roto, aplica esta ley; si cada parte es útil por sí sola, aplica la Ley 48.

```good
useEffect(() => {
    Promise.all([
        api.get<Post>(`/posts/${id}`),
        api.get<Comment[]>(`/posts/${id}/comments`),
        api.get<Reaction[]>(`/posts/${id}/reactions`),
    ]).then(([post, comments, reactions]) => setData({ post, comments, reactions }))   // UN estado unificado
}, [id])
if (data) return <article>…</article>   // afirmativo (Ley 5): la vista aparece COMPLETA
return <PostSkeleton />
```

```bad
useEffect(() => { api.get(`/posts/${id}`).then(setPost) }, [id])            // tres estados, tres momentos:
useEffect(() => { api.get(`/posts/${id}/comments`).then(setComments) }, [id])  // el usuario ve la foto sin reacciones,
useEffect(() => { api.get(`/posts/${id}/reactions`).then(setReactions) }, [id])  // luego reacciones sin comentarios
```

## Ley 50 — `memo()` solo con props recalculados

> memo() se usa únicamente cuando el padre pasa objetos/arrays/callbacks recreados por render y el re-render es costoso; se envuelve inline sobre la función, manteniendo el export default al final (Ley 34).

```good
export default memo(function UserCard({ user, on_select }: UserCardProps) {   // on_select se recrea en el padre:
    return <div onClick={() => on_select(user)}>{user.name}</div>             // memo evita re-render real
})
```

```bad
export default memo(function Title({ text }: { text: string }) {   // prop primitivo estable:
    return <h1>{text}</h1>                                          // la comparación del memo cuesta más que el render
})
```

---

# PARTE XII — Flutter

## Ley 51 — Estilos con FlutterWind

> Todo estilo en Flutter se resuelve con `.className('...')` de FlutterWind (clases Tailwind); las propiedades directas quedan para lo que FlutterWind no cubre (callbacks, controllers, child/children) y para el padding de un Container con decoration, que va nativo (conflicto conocido de FlutterWind).

```good
Text("Total").className("text-lg font-bold text-neutral-900")
Container(
    padding: EdgeInsets.all(12),        // Container CON decoration: padding nativo (conflicto conocido de FlutterWind)
    decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.white),
)
```

```bad
Text("Total", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))   // existe .className("text-lg font-bold")
Container(color: Colors.white)          // existe .className("bg-white")
```

## Ley 52 — Flutter: dialecto de la Ley 33 + snake_case total

> En Flutter la Ley 33 se habla así: entrypoint main.dart (model.dart auxiliar solo si es necesario), hijos visuales en widget/, lógica local en lib/, vistas en view/ y carpetas en snake_case. El naming es snake_case también en Dart — variables, métodos y campos (silenciar non_constant_identifier_names); camelCase solo en overrides del SDK. Los providers globales son una clase con estado y sub()/notify.

```good
lib/
├── main.dart
├── lib/cart/main.dart                  // provider global: clase + sub()/notify
├── widget/pressable/main.dart          // widget compartido por ≥2 vistas (Ley 33: sube al scope común)
└── view/cart/
    ├── main.dart
    └── widget/cart_row/main.dart       // carpeta snake_case; exclusivo de la vista: vive con ella

class _CartRowState extends State<CartRow> {
    bool busy = false                   // snake_case desnudo (Ley 1)
    void _sync_qty() {}                 // método snake_case; _ de privado
    @override
    void initState() { super.initState() }   // camelCase SOLO porque el SDK lo impone
}
```

```bad
lib/view/setting/widget/api-key/main.dart   // kebab-case: es api_key
lib/utils/helpers.dart                      // carpeta genérica: rompe la jerarquía recursiva (Ley 33)
mixin PaginatedList {
    bool loadingMore = false            // camelCase propio: prohibido (es loading_more)
}
dependencies:
    flutter_bloc: ^9.0.0                // state management externo: el provider con sub()/notify ya lo resuelve
```

---

# PARTE XIII — Runtime y entorno

## Ley 53 — Primitivas del runtime antes que librerías y reimplementaciones

> Si el runtime ya lo provee (crypto.randomUUID, fetch, Intl, structuredClone, EventTarget, AbortController, URLSearchParams, FormData, Headers), se usa la primitiva nativa; la librería externa se justifica únicamente cuando aporta lo que el runtime no cubre.

```good
const id = crypto.randomUUID()
const clone = structuredClone(obj)
class Bus extends EventTarget {         // pub/sub: se EXTIENDE la primitiva, no se reinventa
    emit<T>(event: string, data: T) { this.dispatchEvent(new CustomEvent(event, { detail: data })) }
}
```

```bad
import { v4 } from "uuid"               // el runtime ya trae crypto.randomUUID()
import moment from "moment"             // el runtime ya trae Intl.DateTimeFormat
const listeners = new Set<Listener>()   // pub/sub a mano: EventTarget existe, con once/capture/errores resueltos
```

## Ley 54 — Simplificar es recortar

> La simplificación real elimina capacidad marginal que nadie usa (features defensivas, soportes hipotéticos, módulos huérfanos). El código muerto que se decide conservar lleva una nota de por qué se conserva y dónde vive.

```good
const lines = (await fs.readFile(pathname, "utf8")).split("\n")   // leer el archivo y listo:
                                                                  // el streaming line-by-line era soporte hipotético
// MCP sin soporte en viber: carga descartada, código conservado en ./mcp
// import { mcp } from "./mcp"          // muerto CON nota: se sabe por qué sigue existiendo
```

```bad
// 170 líneas extra para: notebooks .ipynb, PDF paginado, sonda binaria de 4KB…
// capacidades que ningún flujo del producto usa: se BORRAN, no se mantienen "por si acaso"
```

## Ley 55 — Paquetes: yarn local, npm global, npx one-off, tsx para TS

> Lo local del proyecto va con yarn (deps, scripts, build); npm queda para CLIs globales (`npm i -g`) con aprobación previa; npx -y para herramientas de un solo uso; tsx para ejecutar TypeScript en desarrollo. Toda instalación requiere aprobación explícita.

```good
yarn add axios                          // dependencia local: yarn
npm i -g eslint                         // CLI global: npm (con aprobación previa)
npx -y @arcaelas/mcp --stdio            // un solo uso: npx -y, sin instalar
tsx scripts/migrate.ts                  // TS directo en dev: tsx
```

```bad
npm install axios                       // npm en local: prohibido
yarn global add typescript              // yarn global: prohibido
npx tsc && node dist/server.js          // compilar para dev: tsx lo ejecuta directo
```

## Ley 56 — Git: issue → rama → PR; commits en español con prefijo

> Todo cambio nace de un issue; la rama sale de la rama de trabajo con formato `{prefijo}/{issue-id}` (fix/feat/chore/docs); el PR apunta a la rama de origen (dev si existe, si no main) y todo merge llega por PR. Los commits van en español con prefijo `fix:`/`feat:`/`chore:`/`docs:` y a nombre del autor humano.

```good
git checkout -b feat/54                 // rama con prefijo + id del issue
git commit -m "feat: agregar filtro de búsqueda por categoría"
gh pr create --base dev                 // el cambio llega a la rama de trabajo vía PR
```

```bad
git checkout -b nueva-feature           // sin issue ni prefijo: no se sabe qué resuelve
git commit -m "fix login bug"           // inglés: prohibido
git commit -m "arreglos varios"         // sin prefijo: prohibido
git push origin main                    // push directo a la rama protegida: prohibido
```
