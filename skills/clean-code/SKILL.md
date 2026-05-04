## Jerarquía de componentes (recursiva)

Estructura cada componente con su propio `components/` y `lib/`. El patrón se repite **idénticamente** en cualquier nivel de profundidad. Un componente solo importa **hacia arriba** (propio `lib/`, padre, abuelo, root). **Nunca** importa de hermanos, descendientes ni ramas no relacionadas.

```
// BIEN — estructura recursiva
src/components/Button/
├── index.tsx
├── lib/
│   └── use_button_state/
│       └── index.ts
└── components/
    └── ButtonIcon/
        ├── index.tsx
        ├── lib/
        │   └── use_icon_size/
        │       └── index.ts
        └── components/
            └── SpinnerDot/
                ├── index.tsx
                └── lib/
                    └── use_dot_pulse/
                        └── index.ts

// MAL — archivos sueltos rompen la jerarquía
src/components/Button/
├── index.tsx
├── useButtonState.ts        // archivo suelto: va en lib/use_button_state/index.ts
├── helpers.ts               // genérico sin carpeta: va en lib/use_*/
└── ButtonIcon.tsx           // hijo aplanado: va en components/ButtonIcon/index.tsx
```

```ts
// BIEN — imports desde ./src/components/Button/components/ButtonIcon/index.tsx
import useIconSize from "./lib/use_icon_size"; // propio
import useButtonState from "../../lib/use_button_state"; // padre
import useTheme from "@/lib/use_theme"; // raíz
import Input from "@/components/Input"; // componente raíz

// MAL
import { x } from "../ButtonSpinner/lib/x"; // hermano: prohibido
import { y } from "@/components/Form/lib/y"; // rama no relacionada: prohibido
```

- **Prohibido**: archivos sueltos en el root del componente (todo helper, hook o constante vive en `lib/use_*` / `lib/{name}`).
- **Prohibido**: componentes hijos como archivos planos (cada hijo tiene su propia carpeta).
- **Prohibido**: importar de hermanos, descendientes o ramas no relacionadas.
- Si dos hermanos requieren la misma lógica, esa lógica sube al `lib/` del padre común.

### Root `src/` como scope global

Los archivos en `src/components/` y `src/lib/` son accesibles desde cualquier componente a cualquier profundidad. **Reservar el root para abstracciones base compartidas**: hooks transversales, cliente HTTP, componentes base reusables.

```
src/
├── lib/
│   ├── use_theme/         // hook global
│   ├── use_auth/          // hook global
│   └── api/               // cliente HTTP único
└── components/
    ├── Button/            // componente base reusable
    ├── Input/
    └── Modal/
```

- **Permitido en root**: lo que usan ≥2 componentes no relacionados.
- **Prohibido en root**: lógica específica de un componente (queda en su `lib/` propio).
- **Prohibido en componente**: utilidad que ya necesitan otros (sube al root).

## Estructura de carpetas

```
// BIEN
src/components/Button/
├── index.tsx                // obligatorio, export default al final
├── types.d.ts               // opcional, solo si exporta tipos externos globales, como api, mutaciones de tipado existente y otros
├── lib/                     // opcional, hooks y lógica pura sin markup
└── components/              // opcional, subcomponentes visuales con markup

// MAL
src/components/Button/
├── Button.tsx               // nombrar al archivo como el componente: usa index.tsx
├── Button.css               // CSS separado: prohibido (usar Tailwind / clases nativas)
├── Button.test.tsx          // test no solicitado
└── README.md                // documentación no solicitada
```

- **Obligatorio**:
  - `index.tsx` con `export default` al final.
  - carpeta `lib/` para los que requieren sub utilidades
  - carpeta `components/` para los que requieren componentes hijos
- **Prohibido** sin solicitud explícita: CSS, tests, stories, READMEs, doc.md, archivos nombrados como el componente.

## Hooks en `lib/`

Cada hook vive en su propia subcarpeta dentro del `lib/` del componente que lo usa. **Un hook pertenece a su componente** — no se comparte con hermanos ni padres.

- Carpeta: `snake_case` con prefijo `use_` → `use_button_state/`.
- Archivo: `index.ts`.
- Función exportada: `camelCase` con `export default` → `export default function useButtonState() {}`.
- Esta es la **única excepción** al `snake_case` general (el camelCase del nombre de la función es por compatibilidad con la convención de React).

```
// BIEN
src/components/Button/lib/
├── use_button_state/
│   ├── index.ts                 // export default function useButtonState() {}
│   └── types.d.ts
└── use_button_animation/
    └── index.ts                 // export default function useButtonAnimation() {}

// MAL
src/components/Button/lib/
├── useButtonState.ts            // archivo suelto sin carpeta: prohibido
├── use_button_state.ts          // archivo suelto sin carpeta: prohibido
└── hooks.ts                     // múltiples hooks agrupados: prohibido
```

- **Prohibido**: archivos sueltos `*.ts` directamente bajo `lib/` (cada hook tiene su carpeta).
- **Prohibido**: agrupar varios hooks en un mismo archivo (`hooks.ts`).
- **Prohibido**: subir un hook al `lib/` del padre/root salvo que se use desde dos hermanos (entonces aplica la regla del padre común).

## Orden de exports en `index.tsx`

El archivo `index.tsx` de cada componente sigue este orden estricto. `export default` del componente **siempre** va al final. Los hooks **nunca** aparecen aquí (viven en `lib/use_*`).

1. `enum`
2. `type`
3. `interface` (Props, Config)
4. `const` (constantes)
5. `function` utilitaria — solo si es compleja; las triviales van inline
6. `export default` del componente

```tsx
// BIEN
export enum ButtonSize { SM = "sm", MD = "md", LG = "lg" }
export type ButtonVariant = "primary" | "secondary" | "ghost"
export interface ButtonProps { size?: ButtonSize; variant?: ButtonVariant }
export const DEFAULT_SIZE = ButtonSize.MD

export default function Button({ size = DEFAULT_SIZE }: ButtonProps) {
    return <button />
}

// MAL
export default function Button() { ... }    // default primero: prohibido
export enum ButtonSize { ... }              // enum después del componente: prohibido
export function useButtonState() { ... }    // hook en index.tsx: prohibido (va en lib/use_*)
```

- **Prohibido**: declarar hooks dentro de `index.tsx`.
- **Prohibido**: poner `export default` antes que enums/types/interfaces/constants.
- **Prohibido**: utility functions triviales — van inline en el call site.


## Naming

| Identificador                          | Convención            | Ejemplo                       |
|----------------------------------------|-----------------------|-------------------------------|
| Variable, parámetro, función           | `snake_case`          | `user_id`, `get_user()`       |
| Método de clase                        | `snake_case`          | `service.find_one()`          |
| Método privado de clase                | `_snake_case`         | `_normalize_phone()`          |
| Boolean                                | `snake_case` desnudo  | `loading`, `disabled`         |
| Constante local                        | `snake_case`          | `const code = '...'`          |
| Constante exportada de módulo          | `UPPER_SNAKE_CASE`    | `MAX_RETRIES`, `API_URL`      |
| Clase                                  | `PascalCase`          | `class UserService { }`       |
| Interface, type, enum                  | `PascalCase`          | `interface UserProps { }`     |
| Interface de props de componente       | `{ComponentName}Props`| `ButtonProps`, `UserFormProps`|
| Campo dentro de interface/type         | `snake_case`          | `initial_name`, `error_message` |
| Tipo global compartido                 | `I{Domain}`           | `IAuth`, `IProduct`           |
| Enum keys                              | `UPPER_SNAKE_CASE`    | `Status.ACTIVE`               |
| Hook (función)                         | `camelCase` con `use` | `useButtonState()`            |
| Carpeta de hook                        | `snake_case` con `use_` | `lib/use_button_state/`     |
| Setter de `useState`                   | `camelCase`           | `[loading, setLoading]`       |
| Carpeta de componente visual           | `PascalCase`          | `components/Button/`          |
| Carpeta normal (lib, view, módulo)     | `snake_case`          | `lib/use_theme/`              |
| Archivo                                | `snake_case`          | `format_date.ts`              |
| Archivo principal de componente        | `index.tsx`           | (no `Button.tsx`)             |
| Callback prop                          | `on_{action}`         | `on_search`, `on_submit`      |

```ts
// BIEN
// Constantes exportadas a nivel módulo
export const MAX_RETRIES = 3
export const API_BASE_URL = "https://api.example.com"
export const DEFAULT_TIMEOUT = 30_000

// Enum: PascalCase + keys UPPER_SNAKE_CASE
enum TicketStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
}
const status = TicketStatus.IN_PROGRESS

// Interface de props: PascalCase + sufijo Props + campos snake_case
interface UserFormProps {
    initial_name: string
    disabled?: boolean
    on_submit: () => void
}

type ButtonVariant = "primary" | "secondary" | "ghost"

// Tipo global compartido (./src/lib/types/global.d.ts): prefijo I{Domain}
interface IAuth {
    user_id: string
    token: string
    expires_at: number
}
const auth: IAuth = await get_session()

// Locales
const user_id = "abc-123"
const loading = false
function get_user(user_id: string) {
    const cache_key = `user:${user_id}`
    return cache.get(cache_key)
}

class UserService {
    find_one(id: string) { ... }
    private _normalize_phone(p: string) { ... }
}

import useButtonState from "./lib/use_button_state"
const [loading, setLoading] = useState(false)

// MAL
const userId = "abc-123"                  // camelCase: prohibido
function getUser(userId: string) { ... }  // camelCase: prohibido
const isLoading = false                   // prefijo is_: prohibido
class userService {                       // clase debe ser PascalCase
    findOne(id: string) { }               // método camelCase: prohibido
}
const handleClick = () => { }             // handle*: usar on_click
export const maxRetries = 3               // camelCase en global exportada: prohibido
export const api_base_url = "..."         // snake_case en global exportada: prohibido
enum ticketStatus {                       // enum debe ser PascalCase
    open = "open",                        // key debe ser UPPER_SNAKE_CASE
    inProgress = "in_progress",           // key camelCase: prohibido
}
interface userFormProps {                 // interface debe ser PascalCase + sufijo Props
    initialName: string                   // campo camelCase: prohibido
    isDisabled?: boolean                  // prefijo is_ + camelCase: doble prohibido
    onSubmit: () => void                  // onSubmit camelCase: usar on_submit
}
interface Auth { }                        // tipo global sin prefijo I: prohibido
interface ProductType { }                 // sufijo Type en vez de prefijo I: prohibido
function calculate(weight: number) {
    const BASE_RATE = 5.99                // UPPER_SNAKE_CASE local: prohibido (usar base_rate)
}
```

- **Prohibido**: `camelCase` en variables, parámetros, funciones, métodos. Las únicas excepciones son hooks y setters de `useState`, ambos impuestos por React.
- **Prohibido**: prefijos `is_`/`has_`/`can_` en booleans.
- **Prohibido**: `handle{Action}` para callbacks (usar `on_{action}`).
- **Prohibido**: `UPPER_SNAKE_CASE` en constantes locales (solo se permite en constantes exportadas a nivel módulo).


## Métodos privados (`_snake_case`) — solo encapsulación

Un método privado se justifica **únicamente** cuando encapsula estado interno compartido por **varios** métodos públicos. **Prohibido** crear privados para fragmentar un método público en helpers que solo se llaman una vez: esa lógica va inline.

```ts
class PaymentService {
    // BIEN — comparte estado/lógica entre múltiples métodos públicos
    private _build_headers(): Record<string, string> {
        return { Authorization: `Bearer ${this._token}` }
    }

    charge(amount: number) {
        if (amount > 0) {
            const headers = this._build_headers()    // encapsulación reutilizable
            return api.post("/charge", { amount }, { headers })
        }
        throw new Error("Invalid")                   // throw como rama negativa al final
    }

    refund(id: string) {
        const headers = this._build_headers()        // mismo helper, justifica el privado
        return api.post(`/refund/${id}`, {}, { headers })
    }

    // MAL — solo lo llama charge(), debería ir inline
    private _validate_amount(amount: number) {
        if (amount > 0) {
            return
        }
        throw new Error("Invalid")
    }
}
```

- **Permitido**: privado con `_snake_case` cuando se llama desde **2 o más** métodos públicos.
- **Prohibido**: privado que solo se llama desde un único método público (va inline).
- **Prohibido**: privados con `_camelCase` (ver tabla de Naming).


## Reutilización vs fragmentación

Preferir código **in-situ** (inline) sobre crear métodos auxiliares para fragmentar lógica que solo se usa en un lugar. **Consolidar y compactar** sobre dispersar.

Solo extraer a método/función reutilizable cuando:
- La misma lógica se usa en **2 o más** lugares con la **misma forma exacta**.
- Encapsula estado interno compartido por varios métodos.

**Caso típico**: en clases CRUD, `get(id)` valida existencia y `update`/`delete` lo reutilizan; `create` delega directo al storage.

```ts
// BIEN — get() es base, update/delete reusan
class ProductService {
    get(id: string): Product {
        const product = db.products.findUnique({ where: { id } })
        if (product) {
            return product
        }
        throw new Error("Not found")
    }

    create(data: CreateInput): Product {
        return db.products.create({ data })
    }

    update(id: string, data: UpdateInput): Product {
        this.get(id)                                 // reusa, no duplica validación
        return db.products.update({ where: { id }, data })
    }

    delete(id: string): void {
        this.get(id)                                 // reusa, no duplica validación
        db.products.delete({ where: { id } })
    }
}

// MAL — wrapper trivial sin valor
class ProductService {
    get_by_id(id: string): Product { ... }
    get(id: string) {
        return this.get_by_id(id)                    // wrapper redundante
    }
    update(id: string) {
        const p = this.get_by_id(id)                 // ¿usar get o get_by_id? ambigüedad innecesaria
    }
}

// MAL — fragmentación prematura
class ProductService {
    private _validate_id(id: string) { /* solo lo llama get */ }
    private _build_query(id: string) { /* solo lo llama get */ }
    get(id: string) {
        this._validate_id(id)
        const q = this._build_query(id)
        // ...
    }
}
```

- **Permitido extraer**: lógica reusada en ≥2 callers con misma forma exacta, o estado interno compartido entre métodos.
- **Prohibido**: helpers/privados que solo se llaman una vez (va inline).
- **Prohibido**: wrappers triviales sobre métodos existentes (`get_by_id` que solo llama a `get`, `format_x(x)` que solo hace `x.toUpperCase()`).
- **Prohibido**: extraer "para tener limpio" sin reuso real ni encapsulación de estado.

### Variantes se componen sobre el método base

Cuando una API tiene métodos relacionados (`listen`/`once`, `subscribe`/`subscribe_until`, `fetch`/`fetch_with_retry`), la variante **se compone** sobre el método base. **Prohibido** mantener infraestructura paralela para variantes del mismo comportamiento.

```ts
// BIEN — once compuesto sobre listen (unsuscribe en el primer disparo)
const once = useCallback((cb: Listener): (() => void) => {
    const unsub = listen((event, data) => {
        unsub()
        cb(event, data)
    })
    return unsub
}, [listen])

// MAL — once con su propia infraestructura paralela (Set, dispatch, cleanup)
const once_listeners = useRef<Set<Listener>>(new Set())

const once = useCallback((cb: Listener): (() => void) => {
    once_listeners.current.add(cb)
    return () => { once_listeners.current.delete(cb) }
}, [])

function dispatch(event: string, data: unknown) {
    for (const fn of listeners.current) fn(event, data)
    const pending = [...once_listeners.current]
    once_listeners.current.clear()
    for (const fn of pending) fn(event, data)
}
// Duplica state, dispatch logic y cleanup. Si listen() cambia (filtro, prioridad,
// namespace), once() no lo hereda y queda inconsistente.
```

- **Permitido**: la variante reusa el método base y solo agrega su delta de comportamiento.
- **Prohibido**: variantes con su propio storage / dispatch / cleanup paralelo al método base.
- **Heurística**: si el cuerpo de tu método "extendido" comparte ≥80% con el base, está mal: refactoriza para componer.


## Flujo de control — bloques afirmativos, sin early returns

**Prohibido absoluto**: early returns como guardia (`if (!x) return`). Toda condición usa bloque afirmativo con llaves. La negación `!x` solo se autoriza para garantizar **idempotencia** (asegurar que algo se hace una sola vez).

```ts
// BIEN — bloque afirmativo
if (store.has(key)) {
    return store.get(key)
}
return null

// BIEN — negación para idempotencia
if (!store.has(key)) {
    store.set(key, value)
}
const stored = store.get(key)!

// MAL — early return como guardia (prohibido absoluto)
if (!store.has(key)) return
return store.get(key)

// MAL — early return con negación temprana
if (user.type !== "premium") return 0
return amount * 0.15
```

- **Prohibido**: leading-return / leading-throw / leading-`||` para bailar de la función al inicio.
- **Permitido**: `!cond` solo cuando garantiza idempotencia (initialize-once, prevent-duplicate, ensure-unique).
- Cada `if` lleva llaves, incluso una sola línea adentro.
- El throw como rama negativa va al **final** de la función (ver patrón "afirmativo + throw fallback" del CRUD).


## Gestor de paquetes

- **Local del proyecto**: usar `yarn`. **Prohibido** `npm` para dependencias o scripts locales.
- **Global (CLIs del sistema)**: usar `npm i -g`. **Prohibido** `yarn global add`.

```bash
# BIEN — yarn para todo lo local
yarn                       # instalar dependencias del proyecto
yarn add axios             # agregar dependencia
yarn add -D typescript     # agregar devDependency
yarn remove axios          # eliminar dependencia
yarn dev                   # ejecutar script
yarn build
yarn test

# BIEN — npm solo para instalaciones globales (CLI del sistema)
npm i -g typescript
npm i -g eslint
npm i -g @arcaelas/mcp

# MAL — npm en operaciones locales
npm install axios          # prohibido
npm run dev                # prohibido
npm run build              # prohibido

# MAL — yarn para instalaciones globales
yarn global add typescript # prohibido (usar npm i -g)
```

- **One-off (uso único)**: usar `npx`/`npx -y` en lugar de instalar globalmente algo que solo se usa una vez.

```bash
# BIEN — npx para uso único
npx prettier --write .
npx create-next-app
npx eslint .
npx -y @arcaelas/mcp --stdio

# MAL — instalar globalmente algo de un solo uso
npm i -g prettier          # prohibido si solo se usa una vez
```

- **TypeScript en desarrollo**: usar `tsx` para ejecutar archivos `.ts` directamente. **Prohibido** compilar (`tsc`) y luego ejecutar el `.js` en el ciclo de desarrollo.

```bash
# BIEN — tsx ejecuta TS sin paso de build
tsx src/server.ts
tsx scripts/migrate.ts
tsx scripts/seed.ts
npx tsx bot.ts

# MAL — compilar y luego ejecutar en desarrollo
npx tsc && node dist/server.js   # prohibido en desarrollo
```


## Flujo Git

Dos tipos de proyectos:
- **Tipo 1**: tiene ramas `dev`, `main`, `prod` → PR target es `dev`. Flujo: issue → dev → main → prod.
- **Tipo 2**: solo tiene `main` → PR target es `main`. Flujo: issue → main.

Pasos comunes para cualquier cambio:

1. Crear issue en el proyecto.
2. Sync con la rama target (`git checkout {target} && git pull origin {target}`).
3. Crear rama desde la target con formato `{prefijo}/{issue-id}` — prefijos válidos: `fix/`, `feat/`, `chore/`, `docs/`. El issue es **obligatorio**.
4. Commits en la rama nueva.
5. Subir la rama al remoto (`-u origin {rama}`) y crear PR (`gh pr create --base {target}`).
6. Tras el merge, limpiar la rama local.

```bash
# Tipo 1 — proyecto con dev/main/prod
git checkout dev
git pull origin dev
git checkout -b feat/54        # prefijo + issue id
# ... commits ...
git push -u origin feat/54
gh pr create --base dev        # PR hacia dev

# Tipo 2 — proyecto solo con main
git checkout main
git pull origin main
git checkout -b fix/54
# ... commits ...
git push -u origin fix/54
gh pr create --base main       # PR hacia main
```

- **Prohibido**: trabajar sin issue (no hay rama sin `{prefijo}/{ID}`).
- **Prohibido**: prefijos distintos a `fix/`, `feat/`, `chore/`, `docs/`.
- **Prohibido**: push directo a `main`, `dev` o `prod` (todo cambio pasa por PR).

Cleanup después del merge:

```bash
git checkout main          # o dev, según el target
git pull origin main
git branch -d feat/54      # eliminar rama local fusionada
```

### Mensajes de commit

Los mensajes se escriben en **español** con prefijo obligatorio. Mismos prefijos que las ramas: `fix:`, `feat:`, `chore:`, `docs:`.

```bash
# BIEN
git commit -m "fix: corregir validación de email en formulario de registro"
git commit -m "feat: agregar filtro de búsqueda por categoría"
git commit -m "chore: actualizar dependencias de desarrollo"
git commit -m "docs: agregar documentación del endpoint de pagos"

# MAL
git commit -m "fix login bug"            # en inglés: prohibido
git commit -m "updated dependencies"     # sin prefijo + inglés: prohibido
git commit -m "corregir bug"             # sin prefijo: prohibido
```


## `memo()` solo cuando hay props recalculados

Usar `memo()` **únicamente** cuando el componente recibe props que se recalculan en cada render del padre (objetos derivados, arrays filtrados, callbacks recreados). **Prohibido** envolver en `memo()` componentes cuyos props son primitivos o referencias estables.

```tsx
// BIEN — props recalculados (callback recreado): memo aporta
// ./src/components/UserCard/index.tsx
export interface UserCardProps {
    user: User
    on_select: (user: User) => void
}

export default memo(function UserCard({ user, on_select }: UserCardProps) {
    return <div onClick={() => on_select(user)}>{user.name}</div>
})

// BIEN — props primitivos / inmutables: sin memo
// ./src/components/StatusBadge/index.tsx
export interface StatusBadgeProps {
    label: string
    color: string
}

export default function StatusBadge({ label, color }: StatusBadgeProps) {
    return <span className={`text-${color}`}>{label}</span>
}

// MAL — memo sin razón (props primitivos estables)
// ./src/components/Title/index.tsx
export interface TitleProps {
    text: string
}

export default memo(function Title({ text }: TitleProps) {
    return <h1>{text}</h1>
})
```

- **Permitido**: `memo()` cuando el padre pasa objetos/arrays/callbacks recreados en cada render y el componente es costoso de re-renderizar.
- **Prohibido**: `memo()` con props solo primitivos (string, number, boolean) — la comparación shallow ya es trivial sin memo.
- **Prohibido**: `memo()` "por las dudas" — agrega comparación sin payback.
- **Prohibido**: declarar `function ComponentName()` y luego `export default memo(ComponentName)` como dos statements; envolver inline con `export default memo(function ComponentName() {...})` para mantener la regla "`export default` al final con el componente directamente".


## JSDoc obligatorio + sin comentarios internos

Toda función, método y clase lleva JSDoc **bilingüe** (español + inglés) en el mismo bloque. Los tags (`@param`, `@returns`, `@type`, `@typedef`) son deseables. **Prohibido** redactar comentarios dentro del cuerpo de la función — si algo necesita explicación, va en el JSDoc.

```ts
// BIEN — JSDoc bilingüe
/**
 * Calcula minutos hábiles entre dos fechas excluyendo fines de semana.
 * Calculates business minutes between two dates excluding weekends.
 *
 * @param start - Fecha de inicio / Start date
 * @param minutes - Minutos a agregar / Minutes to add
 * @returns Fecha resultante / Resulting date
 */
function add_business_minutes(start: Date, minutes: number): Date {
    return ...
}

// MAL — sin JSDoc
function add_business_minutes(start: Date, minutes: number): Date { ... }

// MAL — JSDoc en un solo idioma
/** Calculates business minutes */
function add_business_minutes(start: Date, minutes: number): Date { ... }

// MAL — comentarios dentro del cuerpo
function add_business_minutes(start: Date, minutes: number): Date {
    // calcular diferencia                 ← prohibido (va en el JSDoc o nombre de variable)
    const diff = ...
}
```

- **Obligatorio**: JSDoc en toda función / método / clase.
- **Obligatorio**: bilingüe (español + inglés) en el mismo bloque.
- **Recomendado**: tags `@param`, `@returns`, `@throws`, `@example`.
- **Prohibido**: comentarios dentro del cuerpo de una función (variables y nombres deben cargar el sentido).
- **Prohibido**: JSDoc en un solo idioma.


## APIs nativas sobre librerías externas

Usar APIs nativas del lenguaje/runtime antes de agregar dependencias externas. **Prohibido** instalar paquetes para resolver lo que el runtime ya provee.

```ts
// BIEN — primitivas nativas del runtime
const id = crypto.randomUUID()
const data = await fetch(url).then((r) => r.json())
const hash = crypto.createHash("sha256").update(text)
const formatted = new Intl.DateTimeFormat("es").format(date)
const cloned = structuredClone(obj)

// MAL — librería externa cuando el runtime ya lo cubre
import { v4 } from "uuid"          // usar crypto.randomUUID()
import moment from "moment"        // usar Intl.DateTimeFormat
import _ from "lodash"             // usar Array/Object nativo
import axios from "axios"          // usar fetch (salvo interceptors complejos)
```

- **Prohibido**: dependencia externa que duplica una primitiva del runtime.
- **Excepción**: cuando la librería aporta funcionalidad real que el runtime no cubre (ej. parsers de zona horaria complejos, retry/backoff configurable, semantic versioning, etc.).
- **Justificable solo si**: la primitiva nativa exige >20 líneas de wrapper para cubrir el caso.

### No reimplementar primitivas del runtime

Si el runtime ya ofrece la primitiva, **prohibido** reimplementarla manualmente. Aplica a `EventTarget` (pub/sub), `AbortController` (cancelación), `URLSearchParams` (query strings), `FormData` (multipart), `Headers` (HTTP headers), `Intl.*` (i18n).

```ts
// BIEN — extender EventTarget nativo
class Bus extends EventTarget {
    listen<T>(event: string, fn: (data: T) => void) {
        const handler = (e: Event) => fn((e as CustomEvent<T>).detail)
        this.addEventListener(event, handler)
        return () => this.removeEventListener(event, handler)
    }
    emit<T>(event: string, data: T) {
        this.dispatchEvent(new CustomEvent(event, { detail: data }))
    }
}

// MAL — reimplementar pub/sub con Sets manuales
const listeners = new Set<Listener>()
const once_listeners = new Set<Listener>()

function dispatch(event: string, data: unknown) {
    for (const fn of listeners) fn(event, data)
    const pending = [...once_listeners]
    once_listeners.clear()
    for (const fn of pending) fn(event, data)
}
// Hace lo mismo que EventTarget pero a mano:
//   - Sin once() compuesto sobre listen() (ver patrón "variantes se componen").
//   - Sin manejo seguro de errores en handlers (un throw rompe el loop).
//   - Sin protección contra mutación durante iteración (agregar listener mientras se dispatcha).
//   - Sin priority/bubbling/capture si algún día los necesitas.
```

- **Prohibido**: reimplementar `EventTarget` con `Set<listener>` + dispatch loop manual.
- **Prohibido**: reinventar cancelación con flags `destroyed` cuando `AbortController` resuelve el caso.
- **Prohibido**: parsear/serializar query strings a mano cuando `URLSearchParams` lo hace.
- **Prohibido**: armar headers HTTP como objeto plano cuando `Headers` los normaliza.
- **Variantes** del primitivo (ej. `once()` sobre `listen()`) se componen sobre el método base, no se reimplementan en paralelo (ver "Reutilización vs fragmentación").


## Respuesta API estandarizada

Toda API responde con envelope uniforme. El cliente HTTP extrae `data` automáticamente; los consumidores reciben el payload directo.

| Caso | Forma del envelope |
|---|---|
| Éxito (recurso) | `{ success: true, data: <objeto> }` |
| Éxito (lista paginada) | `{ success: true, data: { rows, count, offset, limit, order } }` |
| Error | `{ success: false, message, cause?: { code } }` |

```ts
// BIEN — handlers usan helpers que arman el envelope
res.success({ id: "abc-123", name: "Miguel" })
// → { "success": true, "data": { "id": "abc-123", "name": "Miguel" } }

res.success({ rows, count: 100, offset: 0, limit: 20, order: "ASC" })
// → { "success": true, "data": { "rows": [...], "count": 100, ... } }

res.error("Usuario no encontrado", 404, { code: "ERR_NOT_FOUND" })
// → { "success": false, "message": "Usuario no encontrado", "cause": { "code": "ERR_NOT_FOUND" } }

// BIEN — el cliente recibe el payload directo (sin destructuring repetido)
const user = await api.get<User>("/v1/users/abc-123")
// user es { id: "abc-123", name: "Miguel" }

// MAL — respuestas crudas sin envelope
res.json({ id: "abc-123" })              // sin wrapper success/data: prohibido
res.status(404).send("Not found")        // sin estructura: prohibido
res.json({ users, total })               // forma ad-hoc, no { rows, count }: prohibido
```

- **Obligatorio**: todos los endpoints retornan `{ success: boolean, data | message }`.
- **Obligatorio**: listas paginadas usan exactamente `{ rows, count, offset, limit, order }` dentro de `data`.
- **Obligatorio**: el cliente HTTP centralizado extrae `data` y lanza el `message` como error cuando `success: false`.
- **Prohibido**: payloads crudos sin envelope.
- **Prohibido**: variantes ad-hoc del shape de paginación (`users/total`, `items/count`, etc.).

### Cliente HTTP con autenticación automática

Cliente HTTP único en `src/lib/api/index.ts`. Centraliza:
- Inyección automática del token desde `localStorage`.
- Redirect a `/login` en `401`.
- Extracción automática de `data` del envelope `{ success, data }`.
- Genéricos TypeScript en cada método.

```ts
// ./src/lib/api/index.ts
import axios from "axios"

const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30_000,
})

client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

client.interceptors.response.use(
    (res) => res.data?.data,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = "/login"
        }
        throw new APIError(error)
    },
)

export const api = {
    get:   <T>(url: string, config?) => client.get<T>(url, config),
    post:  <T>(url: string, body?, config?) => client.post<T>(url, body, config),
    put:   <T>(url: string, body?, config?) => client.put<T>(url, body, config),
    patch: <T>(url: string, body?, config?) => client.patch<T>(url, body, config),
    del:   (url: string, config?) => client.delete(url, config),
}

export default api
```

- **Obligatorio**: un único cliente HTTP en `src/lib/api/index.ts`. No instanciar `axios.create(...)` en otros lugares.
- **Obligatorio**: el interceptor de response devuelve `res.data?.data` (los consumidores reciben el payload, no el envelope).
- **Obligatorio**: el interceptor de error redirige a `/login` en `401` y lanza `APIError` con el `message`/`cause` del envelope.
- **Prohibido**: pasar el token manualmente en cada llamada.
- **Prohibido**: crear instancias paralelas de cliente HTTP en componentes o servicios.


## SSR — guardar acceso a APIs del navegador

En entornos con SSR (Next.js, Remix), el código corre primero en server (sin `window`, `document`, `localStorage`). Toda lógica que dependa de APIs del navegador debe protegerse.

```ts
// BIEN — guard con typeof window
client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

// BIEN — patrón mounted para componentes que dependen del navegador en render
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (mounted) {
    return <ThemeAwareUI />          // bloque afirmativo
}
return null                          // rama negativa al final

// MAL — acceso directo a APIs del navegador en código que corre en SSR
const token = localStorage.getItem("auth_token")     // ReferenceError en server
const w = window.innerWidth                          // ReferenceError en server
```

- **En interceptors / handlers / efectos**: usar `typeof window !== "undefined"` como guard.
- **En render de componentes que dependen de browser**: usar el patrón `mounted` (`useState(false)` + `useEffect(setMounted(true))`). El render se decide con bloque afirmativo `if (mounted) { return <UI /> }` y `return null` como rama negativa al final — sigue la regla "Flujo de control" sin excepción.
- **Prohibido**: acceder a `window`, `document`, `localStorage`, `navigator` sin guard en código que corre en SSR.
- **Prohibido**: `if (!mounted) return null` (es leading-return; usar el bloque afirmativo arriba).


## File-based routing (serverless / Next.js API)

En proyectos serverless (AWS Lambda) o Next.js (`app/api/`), cada carpeta representa un segmento de URL. Parámetros dinámicos van entre corchetes `[param]`. Cada `index.ts` (o `route.ts` en Next.js) exporta los handlers por método HTTP como **constantes nombradas**.

```
src/
├── auth/
│   ├── index.ts                  # POST /v1/auth
│   ├── challenge/
│   │   └── index.ts              # POST /v1/auth/challenge
│   └── keys/
│       ├── index.ts              # GET/POST /v1/auth/keys
│       └── [id]/
│           └── index.ts          # DELETE /v1/auth/keys/{id}
├── chat/
│   └── completions/
│       └── index.ts              # POST /v1/chat/completions
└── models/
    ├── index.ts                  # GET /v1/models
    └── [id]/
        └── index.ts              # GET/DELETE /v1/models/{id}
```

```ts
// ./src/chat/completions/index.ts — un handler por método HTTP exportado como constante
import { http } from "~/app/lib/http"

export const POST = http(async (req, res) => {
    res.success({ choices: [...] })
})
```

- **Obligatorio**: la carpeta refleja el path; los parámetros dinámicos usan `[param]`.
- **Obligatorio**: cada método HTTP se exporta como constante en mayúsculas (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Obligatorio**: alias `~/*` → `./src/*` en `tsconfig.json` para imports absolutos.
- **Prohibido**: routing programático tipo `router.get(...)` / `app.post(...)` dentro de un endpoint serverless o Next.js.
- **Prohibido**: agrupar varios métodos en una misma función con `switch (req.method)`.

### Variantes según runtime

**Serverless / Next.js** — cada archivo exporta constantes por método HTTP:

```ts
// ./src/users/index.ts
export const GET = http(async (req, res) => {
    const users = await User.all()
    res.success(users)
})

export const POST = http(async (req, res) => {
    const user = await User.create(req.body)
    res.success(user)
})
```

**Express** — `http(pathname, handler)` con el método inferido del nombre de la función:

```ts
http("/users", async function GET(req, res, next) {
    const users = await User.all()
    res.success(users)
})

http("/users", async function POST(req, res, next) {
    const user = await User.create(req.body)
    res.success(user)
})
```

- **Prohibido**: usar `router.get(path, fn)` / `router.post(path, fn)` estilo Express clásico (usar `http(path, function GET(){})`).


## No reimplementar lo que el framework ya ofrece

Cuando un framework UI (MUI, Chakra, shadcn, Mantine) ya provee un componente o prop, usarlo directo. **Prohibido** crear wrappers que solo re-exponen capacidades del framework sin agregar comportamiento, estado o lógica propia.

```tsx
// BIEN — usar lo que el framework ya ofrece
import EditIcon from "@mui/icons-material/Edit"
import { IconButton, Button, Chip } from "@mui/material"

<IconButton onClick={on_edit}><EditIcon /></IconButton>
<Button startIcon={<EditIcon />}>Editar</Button>
<Chip label={status} color={status === "active" ? "success" : "default"} />

// MAL — wrapper sin comportamiento nuevo
function Icon({ name, ...props }) {
    const icons = { edit: EditIcon, delete: DeleteIcon }
    const Component = icons[name]
    return <Component {...props} />
}
// agrega una capa de indirección, rompe tree-shaking, fuerza string keys en vez de imports tipados
```

- **Permitido envolver el framework**: cuando el wrapper agrega comportamiento real (estado, validación, side effects, accesibilidad propia, theming compartido).
- **Prohibido**: wrappers que solo cambian props, agregan defaults triviales o re-exportan componentes con otro nombre.
- **Prohibido**: lookup objects (`{ edit: EditIcon, delete: DeleteIcon }`) que sustituyen imports tipados por strings.
- Si la personalización no cubre lo que el framework no ofrece directamente, no es justificada.


## Componentes: abstracción justificada vs microfragmentación

Crear un componente solo se justifica cuando **encapsula una unidad funcional completa**: estado propio, ciclo de vida, side effects, orquestación. **Prohibido** crear micro-componentes que solo mapean props a otra forma de presentación sin agregar comportamiento.

```tsx
// BIEN — abstracción válida: encapsula comportamiento completo
// Internamente: conexión SSE, formulario de registro, PIN de sincronización,
// eventos de conexión/desconexión. Unidad funcional aislada con estado propio.
<WhatsApp
    phone={phone}
    workspace={workspace_id}
    on_open={() => {}}
    on_close={() => {}}
/>

// MAL — micro-componente sin comportamiento (solo presentación)
function StatusChip({ status }: { status: string }) {
    const color = status === "active" ? "success" : "default"
    return <Chip label={status} color={color} />
}
// 4 líneas, sin estado, sin lifecycle, sin lógica.
// Va inline donde se use:
//   <Chip label={status} color={status === "active" ? "success" : "default"} />
```

- **Permitido extraer a componente**: lleva estado propio, hooks propios, side effects, integraciones externas (API, SSE, sockets), orquestación de subcomponentes.
- **Prohibido**: componentes de 2-4 líneas que solo mapean props a otro shape de presentación.
- **Prohibido**: componentes con un solo caller que no encapsulan nada que no se pueda escribir inline.
- Misma regla que aplica a helpers: si no tiene estado, side effects ni reuso real ≥2 lugares, va inline.


## Arquitectura frontend: dos hooks centrales + API

El frontend se apoya sobre **dos hooks fundamentales** y el resto se resuelve vía API:

- `useAuth()` — usuario autenticado, sus datos y permisos.
- `useWorkSpace()` — workspace activo (resuelto por URL o por datos del user) y permisos dentro de ese contexto.

Todo lo demás (tickets, productos, mensajes, etc.) se obtiene con `api.get()` desde el componente que lo necesita. **Prohibido** crear hooks custom que envuelvan llamadas API por entidad: duplican lógica que ya vive en el backend y proliferan sin control.

```tsx
// BIEN — dos hooks centrales, el resto es API directa
function TicketList() {
    const { user } = useAuth()
    const { workspace, permissions } = useWorkSpace()
    const [tickets, setTickets] = useState([])

    useEffect(() => {
        api.get(`/workspaces/${workspace.id}/tickets`).then(setTickets)
    }, [workspace.id])

    return (
        <List>
            {permissions.can_create && (
                <Button onClick={create_ticket}>Nuevo</Button>
            )}
            {tickets.map((t) => <TicketRow key={t.id} ticket={t} />)}
        </List>
    )
}

// MAL — hooks custom por entidad que duplican lógica del backend
function useTickets() { ... }
function useTicketActions() { ... }
function useTicketFilters() { ... }
function useTicketSort() { ... }
// proliferación de hooks que solo envuelven `api.get`/`api.post` con un poco de useState
```

- **Permitido**: `useAuth`, `useWorkSpace` y otros hooks transversales que cruzan toda la app (theme, locale).
- **Prohibido**: hooks custom por entidad (`useTickets`, `useProducts`, `useUsers`) que solo encapsulan `api.get` + `useState`.
- **Prohibido**: cadenas de hooks especializados (`useTickets → useTicketSort → useTicketFilters`) cuando un solo `useEffect` resolvería el caso.
- Los componentes consumen API directamente desde el efecto que las necesita.


## Consistencia entre vistas equivalentes

Vistas que resuelven el **mismo problema** (fetch + lista + acciones, formularios CRUD, dashboards de detalle) siguen el **mismo patrón de composición**. No se trata de forzar un componente global, sino de que al abrir dos vistas hermanas (`TicketList`, `ClientList`) se reconozca la misma estructura, mismas convenciones, mismos componentes base.

```tsx
// BIEN — vistas hermanas con la misma composición
function TicketList() {
    const [items, setItems] = useState([])
    return (
        <VirtualList
            data={items}
            renderItem={(t) => <TicketRow ticket={t} />}
        />
    )
}

function ClientList() {
    const [items, setItems] = useState([])
    return (
        <VirtualList
            data={items}
            renderItem={(c) => <ClientRow client={c} />}
        />
    )
}

// MAL — cada vista inventa su propio approach
function TicketList() {
    return <div onScroll={handle_scroll}>{tickets.map(...)}</div>     // scroll infinito
}
function ClientList() {
    return <Table pagination={{ page, onChange: setPage }}>...</Table> // paginación manual
}
// Mismo problema, dos soluciones inconsistentes.
```

- **Obligatorio**: vistas que resuelven el mismo problema usan el mismo componente base (`VirtualList`, `Table`, `Form`, etc.).
- **Obligatorio**: estructura de loading / empty / error es idéntica en vistas equivalentes.
- **Prohibido**: mezclar paradigmas (scroll infinito en una, paginación manual en otra) sin razón funcional concreta.
- **Prohibido**: que cada vista invente su propio shape de fetch/loading/empty.


## Complejidad proporcional al problema

El código refleja la complejidad real del problema. Si el caso es `fetch + render + acciones básicas`, la implementación debe reducirse a `useState + useEffect + render`. **Prohibido** introducir capas, hooks especializados o componentes intermedios cuando el problema no los exige.

```tsx
// BIEN — complejidad proporcional
function TicketList() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/tickets")
            .then(setTickets)
            .finally(() => setLoading(false))
    }, [])

    return (
        <Table
            loading={loading}
            data={tickets}
            renderItem={(ticket) => <TicketRow ticket={ticket} />}
            actions={(ticket) => [
                { label: "Abrir", on_click: () => navigate(ticket.id) },
                { label: "Eliminar", on_click: () => remove(ticket.id) },
            ]}
        />
    )
}

// MAL — capas innecesarias para un problema simple
function TicketList() {
    const { tickets, loading, filters, actions } = useTickets()
    const { sorted } = useTicketSort(tickets)
    const { filtered } = useTicketFilters(sorted, filters)
    const { paginated } = useTicketPagination(filtered)
    return <TicketTable data={paginated} actions={actions} />
}
// Cinco hooks + un componente extra para resolver lo mismo que el BIEN.
```

- **Regla**: si el problema no supera `useState + useEffect + render`, la implementación tampoco lo supera.
- **Prohibido**: cadenas de hooks `useTickets → useTicketSort → useTicketFilters → useTicketPagination` cuando un solo `useEffect` y un sort/filter inline lo resuelven.
- **Prohibido**: extraer componentes intermedios (`TicketTable`) cuando el componente base (`Table`) ya cubre el caso.
- **Prohibido**: state managers, contexts globales o reducers para datos locales que solo viven en un componente.


## Dashboards: cards independientes con su propio fetch

En dashboards y vistas con **múltiples widgets/métricas no relacionadas**, cada card es una **unidad autónoma** que monta, hace su propio `useEffect + api.get`, muestra su propio skeleton del tamaño final, y renderiza su métrica. Cards distintas no comparten ciclo de vida, no comparten loading y no comparten error.

```tsx
// BIEN — cada card es autónoma
function TicketCountCard() {
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/metrics/tickets/count")
            .then(setCount)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <Skeleton variant="rectangular" width={240} height={120} />
    }
    return <MetricCard title="Tickets abiertos" value={count} />
}

function Dashboard() {
    return (
        <Grid container spacing={2}>
            <Grid item><TicketCountCard /></Grid>
            <Grid item><RevenueCard /></Grid>
            <Grid item><UsersOnlineCard /></Grid>
        </Grid>
    )
}

// MAL — endpoint único que devuelve todos los datos del dashboard
function Dashboard() {
    const [data, setData] = useState(null)
    useEffect(() => { api.get("/dashboard").then(setData) }, [])
    if (data) {
        return (
            <>
                <Card>{data.ticket_count}</Card>
                <Card>{data.revenue}</Card>
            </>
        )
    }
    return <Loading />
}
// Modos de fallo:
//   1. Si /dashboard tarda 3s, toda la UI espera 3s (no progressive rendering).
//   2. Si una sola métrica falla, /dashboard devuelve error y NINGÚN card se muestra.
//   3. Si una métrica es lenta de calcular en backend, contagia su latencia a todas las demás.
//   4. Cualquier card nueva obliga a modificar el endpoint backend + el shape del response.

// MAL — paralelizar en cliente con allSettled tampoco soluciona
function Dashboard() {
    const [data, setData] = useState(null)
    useEffect(() => {
        Promise.allSettled([
            api.get("/metrics/tickets/count"),
            api.get("/metrics/revenue"),
            api.get("/metrics/users-online"),
        ]).then(setData)
    }, [])
    if (!data) return <Loading />
    // Sigue siendo render-after-all: la UI espera al endpoint más lento del array.
}
```

**Reglas:**

- **Obligatorio**: cada card monta y hace su propio `useEffect` + `api.get` independiente, sin compartir state con sus hermanas.
- **Obligatorio**: cada card maneja su `loading` con un `<Skeleton />` del **tamaño exacto del card final** (`width`/`height` fijos). Esto evita layout shift cuando el contenido aparece.
- **Obligatorio**: cada card maneja su `error` localmente (mostrar un estado de error inline en ESA card, no propagarlo al dashboard).
- **Prohibido**: endpoints "todo-en-uno" tipo `/dashboard`, `/home-data`, `/overview` que agregan métricas de dominios distintos.
- **Prohibido**: bloquear el render del dashboard hasta que todas las métricas hayan llegado (incluido `Promise.allSettled` en el cliente — sigue siendo render-after-all).
- **Prohibido**: compartir un `loading` global del dashboard. Cada card decide cuándo está listo.

**Cuándo SÍ se justifica un endpoint agregado:**

- Es el detalle de **una sola entidad** (`GET /tickets/{id}` con sus campos, comentarios, attachments) — todos los datos vienen del mismo dominio y se renderizan juntos lógicamente.
- Es una vista de configuración / settings donde los grupos están realmente acoplados.
- NO es el caso de un dashboard con widgets de dominios distintos (tickets + revenue + users + etc.).


## Cruzar APIs cuando los datos pertenecen a una misma vista

> **Esta regla NO contradice "Dashboards: cards independientes"**. Aquella aplica a widgets de dominios distintos que se pueden fragmentar y mostrar por separado. **Esta** aplica al caso opuesto: una vista cohesiva que **no puede fragmentarse** en micro-componentes autónomos porque sus datos vienen cruzados de varios endpoints y se renderizan juntos como una sola unidad lógica.

Cuando una vista representa **una entidad cohesiva** cuyos datos están repartidos en múltiples endpoints (porque el árbol REST no devuelve todo en una sola llamada), el componente combina los fetch con `Promise.all([...])` y los unifica en **un único `useState`**. Un solo estado, un solo loading, un solo error.

```tsx
// BIEN — vista de UNA publicación: datos repartidos, unificados en cliente
interface PostViewState {
    post: Post
    comments: Comment[]
    reactions: Reaction[]
}

function PostView({ post_id }: { post_id: string }) {
    const [data, setData] = useState<PostViewState | null>(null)

    useEffect(() => {
        Promise.all([
            api.get<Post>(`/posts/${post_id}`),
            api.get<Comment[]>(`/posts/${post_id}/comments`),
            api.get<Reaction[]>(`/posts/${post_id}/reactions`),
        ]).then(([post, comments, reactions]) => {
            setData({ post, comments, reactions })
        })
    }, [post_id])

    if (data) {
        return (
            <article>
                <PostMedia src={data.post.image} />
                <ReactionBar items={data.reactions} />
                <CommentList items={data.comments} />
            </article>
        )
    }
    return <PostSkeleton />
}

// MAL — fragmentar en micro-componentes con fetch propio cuando los datos son una unidad
function PostView({ post_id }: { post_id: string }) {
    return (
        <article>
            <PostMedia post_id={post_id} />        // hace su propio fetch
            <ReactionBar post_id={post_id} />      // hace su propio fetch
            <CommentList post_id={post_id} />      // hace su propio fetch
        </article>
    )
}
// 3 requests en paralelo a 3 montajes que aparecen escalonados,
// el usuario ve la foto sin reacciones, luego reacciones sin comentarios.
// Un post NO es un dashboard: se ve completo o no se ve.

// MAL — tres useState/useEffect separados dentro del mismo componente
function PostView({ post_id }: { post_id: string }) {
    const [post, setPost] = useState(null)
    const [comments, setComments] = useState(null)
    const [reactions, setReactions] = useState(null)

    useEffect(() => { api.get(`/posts/${post_id}`).then(setPost) }, [post_id])
    useEffect(() => { api.get(`/posts/${post_id}/comments`).then(setComments) }, [post_id])
    useEffect(() => { api.get(`/posts/${post_id}/reactions`).then(setReactions) }, [post_id])
    // 3 estados separados → 3 condiciones de loading → render parcial inconsistente.
}
```

**Decisión: ¿esta vista es cohesiva o son cards independientes?**

| Pregunta | Cohesiva (este patrón) | Independiente (Dashboards) |
|---|---|---|
| ¿Los datos representan **una sola entidad** lógica? | Sí (un post, un ticket, un perfil) | No (métricas de dominios distintos) |
| ¿Tiene sentido mostrar una parte sin las otras? | No (post sin comentarios se ve roto) | Sí (revenue puede aparecer sin user-count) |
| ¿Una sección lenta debe bloquear el resto? | Sí (todo o nada) | No (progressive rendering) |
| ¿Un error en una sección invalida la vista? | Sí (no hay post sin contenido) | No (otras métricas siguen útiles) |

**Reglas:**

- **Obligatorio**: para vistas de entidad cohesiva, un solo `useState` con shape unificado + un solo `Promise.all` que lo llena.
- **Obligatorio**: render condicional con bloque afirmativo `if (data) { return <vista /> }` y `<Skeleton />` como rama por defecto al final.
- **Prohibido**: fragmentar una vista cohesiva en micro-componentes con fetch propio (genera render escalonado y vista incompleta).
- **Prohibido**: tres `useState`/`useEffect` paralelos para datos que son partes de la misma entidad.
- **Prohibido**: pedir al backend un endpoint mega-denormalizado cuando el cliente puede componer con `Promise.all` desde endpoints REST limpios.


## Convenciones del framework sobre componentes custom

Los frameworks proveen convenciones estructurales para problemas comunes (drawers, modales, sidebars, layouts, error boundaries, loading states). **Obligatorio** usar la convención del framework cuando existe. **Prohibido** inventar componentes custom que ignoran la arquitectura nativa.

```tsx
// BIEN — Next.js @drawer (parallel route) inyecta el drawer en el layout
// app/(dashboard)/@drawer/default.tsx
export default function DashboardDrawer() {
    const { workspace } = useWorkSpace()
    const pathname = usePathname()

    return (
        <Drawer variant="permanent">
            <List>
                {workspace.menu.map((item) => (
                    <ListItemButton key={item.path} selected={pathname === item.path}>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    )
}

// MAL — Sidebar custom que ignora la convención de parallel routes
import Sidebar from "@/components/Sidebar"
export default function Layout({ children }) {
    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar items={[...]} activeItem={...} onNavigate={...} />
            <Box component="main">{children}</Box>
        </Box>
    )
}
// Reinventa parallel routing manualmente, pierde el slot system de Next.js,
// fuerza al padre a manejar items/active/navigation que el framework ya provee.
```

**Convenciones del framework a usar primero:**

| Necesidad | Convención Next.js |
|---|---|
| Drawer / sidebar contextual | `@drawer/`, `@sidebar/` (parallel routes) |
| Modal contextual | `@modal/` (parallel route) + `intercepting routes` |
| Loading boundary | `loading.tsx` |
| Error boundary | `error.tsx` |
| Not found | `not-found.tsx` |
| Layout compartido | `layout.tsx` por nivel |
| Route group sin URL | `(group_name)/` |
| Param dinámico | `[param]/` o `[...catchall]/` |
| API route | `route.ts` con `GET`/`POST`/etc. exportados |

**Reglas:**

- **Obligatorio**: usar la convención del framework cuando existe (`@slot`, `loading.tsx`, `error.tsx`, etc.).
- **Prohibido**: reinventar drawers/modales/sidebars como componentes custom cuando el framework provee parallel routes / intercepting routes.
- **Prohibido**: manejar loading/error globalmente desde un Provider cuando `loading.tsx`/`error.tsx` cubren el caso por route.
- **Justificable solo si**: el framework no cubre el caso (componente que NO es por-ruta, ni modal, ni drawer, ni sidebar — entonces sí componente custom propio).


## Estructuras de datos: `Map` y `Set` sobre arrays

Usar la estructura adecuada al problema. **`Map`** agrupa por clave sin buscar (O(1) lookup). **`Set`** deduplica sin filtrar. **Prohibido** forzar arrays con `find()` / `includes()` / `reduce()` cuando hay una estructura nativa que lo resuelve mejor. Al final del cómputo, si el consumidor necesita arrays planos, se convierten con `[...map.values()]` / `[...set]`.

```ts
// BIEN — Map agrupa, Set deduplica
const orgs = new Map<string, { name: string; workspaces: Map<string, { permission: Set<string> }> }>()
for (const role of roles) {
    if (!orgs.has(role.org.id)) {
        orgs.set(role.org.id, { ...role.org, workspaces: new Map() })
    }
    const o = orgs.get(role.org.id)!
    if (!o.workspaces.has(role.ws.id)) {
        o.workspaces.set(role.ws.id, { ...role.ws, permission: new Set() })
    }
    o.workspaces.get(role.ws.id)!.permission.add(role.permission.name)
}

// Convertir a plano solo al final, para el consumidor
const result = [...orgs.values()].map((o) => ({
    ...o,
    workspaces: [...o.workspaces.values()].map((w) => ({
        ...w,
        permission: [...w.permission],
    })),
}))

// MAL — arrays + find + includes + reduce para hacer lo mismo
roles.reduce((acc, role) => {
    let org = acc.find((o) => o.id === role.org.id)        // O(n) por iteración → O(n²) total
    if (!org) {
        org = { ...role.org, workspaces: [] }
        acc.push(org)
    }
    let ws = org.workspaces.find((w) => w.id === role.ws.id) // otro O(n)
    if (!ws) {
        ws = { ...role.ws, permission: [] }
        org.workspaces.push(ws)
    }
    if (!ws.permission.includes(role.permission.name)) {     // otro O(n)
        ws.permission.push(role.permission.name)
    }
    return acc
}, [])
```

**Cuándo usar qué:**

| Caso | Estructura |
|---|---|
| Lookup por clave (`x.id === id`) ≥2 veces | `Map<key, value>` |
| Deduplicación (`if (!arr.includes(x)) arr.push(x)`) | `Set<value>` |
| Iterar con efecto (sin acumular) | `for...of` |
| Acumular en estructura compleja | `Map`/`Set` y al final spread a array |
| Transformación 1→1 sin agrupar | `array.map(...)` |
| Filtrar | `array.filter(...)` |
| Agrupar 1→N | `Map<key, T[]>` o `Object.fromEntries(...)` (ver patrón "array a diccionario") |
| Aplanar 1→N items | `array.flatMap(...)` |

**Reglas:**

- **Prohibido**: `arr.find(x => x.id === id)` dentro de loop (es O(n²)). Pre-construir `Map` y usar `.get(id)`.
- **Prohibido**: `if (!arr.includes(x)) arr.push(x)` para deduplicar. Usar `Set`.
- **Prohibido**: `reduce` para construir un objeto agrupado cuando un `Map` + spread final es más legible.
- **Permitido**: convertir `Map`/`Set` a array al final con spread cuando el consumidor (UI, JSON, API) requiere array plano.

### Array → diccionario/objeto indexado

Para construir un diccionario indexado desde un array, usar **`Object.fromEntries(arr.map(...))`** o **`new Map(arr.map(...))`** según uso. **Prohibido** loop con objeto acumulador mutable.

```ts
// BIEN — Object.fromEntries (resultado plano serializable a JSON)
const ws_by_role = Object.fromEntries(
    new_roles.map((r) => [r.id, r.id_workspace]),
)

// BIEN — Map (lookups frecuentes con .get(), mejor performance)
const ws_by_role = new Map(
    new_roles.map((r) => [r.id, r.id_workspace]),
)

// MAL — loop con objeto acumulador mutable
const ws_by_role: Record<string, string> = {}
for (const r of new_roles) {
    ws_by_role[r.id] = r.id_workspace
}
```

- **Usar `Object.fromEntries`** cuando el resultado se va a serializar (JSON.stringify), iterar (`Object.entries`/`Object.keys`), o pasar a una API que espera objeto plano.
- **Usar `new Map`** cuando el principal uso es `.get(key)` repetido (mejor performance, API más rica con `.has()`, `.size`, `.delete()`, iteración ordenada por inserción).
- **Prohibido**: `{}; for (...) obj[k] = v` cuando una de las dos formas declarativas lo cubre.


## IIFE async para "definir y ejecutar ahora"

Cuando una función async se define y se llama inmediatamente en el mismo scope (típicamente dentro de `useEffect`, addEventListener handlers, o cualquier scope síncrono donde necesitas `await`), usar **IIFE async** `(async () => { ... })()`. **Prohibido** declarar una función nombrada solo para llamarla en la línea siguiente.

```ts
// BIEN — IIFE async: una sola expresión, una sola intención
useEffect(() => {
    if (token) {
        (async function connect() {
            // lógica de conexión
            timer = setTimeout(connect, delay)
        })()
    }
    return () => { destroyed = true }
}, [])

// MAL — declarar y luego llamar como dos statements
useEffect(() => {
    if (token) {
        async function connect() {
            // misma lógica
            timer = setTimeout(connect, delay)
        }
        connect()                        // dos statements para una sola intención
    }
    return () => { destroyed = true }
}, [])
```

- **Permitido**: IIFE `(async () => { ... })()` para ejecutar lógica async dentro de un scope síncrono.
- **Permitido**: nombrar la IIFE (`(async function connect() { ... })()`) cuando la función se auto-invoca recursivamente (ej. polling, retry).
- **Prohibido**: declarar una función nombrada y llamarla justo abajo si nunca más se usa.
- **Justificable separar declaración + llamada**: cuando la función se reusa (varias llamadas, se pasa como referencia a cleanup u otro handler).


## Inline operaciones atómicas

Si una operación es atómica y el lector entiende qué pasa sin línea dedicada, va **inline**. Incrementos (`x++`), cálculos simples (`Math.min(...)`), accesos (`obj.field`), conversiones (`Number(x)`) y asignaciones directas no necesitan paso intermedio cuando el contexto los hace obvios.

```ts
// BIEN — operación inline
timer = setTimeout(connect, Math.min(retries++ * 3_000, MAX_DELAY))

// MAL — desglosar lo que se entiende junto
const delay = Math.min(retries * 3_000, MAX_DELAY)
retries++
timer = setTimeout(connect, delay)
// Tres líneas para lo que es una sola intención: "reintentar con backoff acotado".
```

- **Permitido inline**: incrementos, math simple (`Math.min`/`max`/`abs`), accesos directos, ternarios atómicos, llamadas con un solo argumento computado.
- **Justificable extraer a variable**: cuando el resultado se reusa, cuando el cómputo es complejo y necesita nombre semántico, o cuando ayuda al debugging (poder inspeccionar el valor intermedio).
- **Heurística**: si el desglose no agrega claridad ni reuso, va inline.
- **No confundir** con la regla "no helpers triviales" — esa aplica a **funciones**; esta aplica a **statements** dentro de una función.


## Flutter — estilos con FlutterWind

En proyectos Flutter, **obligatorio** usar `.className('...')` de FlutterWind con clases Tailwind para todos los estilos. **Prohibido** usar `TextStyle(...)`, `Container(color: ...)`, `BoxDecoration(...)`, padding/margin/borders manuales cuando existe equivalente en FlutterWind. Antes de escribir cualquier widget, verificar primero si el estilo se resuelve con `.className()`.

```dart
// BIEN — FlutterWind con clases Tailwind
Container().className('bg-blue-500 p-4 rounded-lg shadow-md')
Text('Hola').className('text-white text-lg font-bold')
Column(children: [...]).className('gap-2 items-center')

// MAL — propiedades manuales cuando existe equivalente FlutterWind
Container(
    color: Colors.blue,
    padding: EdgeInsets.all(16),
    decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
)

Text(
    'Hola',
    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
)
```

- **Obligatorio**: `.className('...')` con clases Tailwind para colores, padding, margin, gap, border, radius, shadow, typography, layout.
- **Prohibido**: `TextStyle`, `BoxDecoration`, `EdgeInsets`, `Container(color:)` cuando hay equivalente en FlutterWind.
- **Permitido propiedades directas**: solo cuando NO existe equivalente FlutterWind para el caso (ej. callbacks, controllers, widgets propios del framework como `child:`, `children:`, `onPressed:`).


## Flutter — jerarquía de archivos

Estructura obligatoria para proyectos Flutter. Cada módulo (lib, widget, view) es una carpeta con `main.dart` como entry point. Archivos auxiliares (`model.dart`, etc.) solo cuando son estrictamente necesarios. Patrón **recursivo**: una view puede tener su propio `lib/` y `widget/`, y un widget puede tener los suyos.

```
lib/
├── main.dart                              # entry point de la app
├── assets/                                # iconos, sonidos, estáticos
│   ├── icons/
│   └── sounds/
├── lib/                                   # libs globales (compartidas entre views)
│   └── {modulo}/main.dart
├── widget/                                # widgets globales (compartidos entre views)
│   └── {widget}/main.dart
└── view/                                  # vistas / pantallas
    └── {vista}/
        ├── main.dart                      # entrypoint de la vista
        ├── lib/{modulo}/main.dart         # lib local de esta vista
        └── widget/                        # widgets locales de esta vista
            └── {widget}/
                ├── main.dart              # entrypoint del widget
                ├── lib/{modulo}/main.dart # lib local del widget
                └── widget/{hijo}/main.dart # sub-widget anidado
```

- **Obligatorio**: cada módulo/widget/view es una carpeta con `main.dart` como entrypoint. Sin archivos planos.
- **Obligatorio**: jerarquía recursiva — una view tiene su `lib/` y `widget/`; un widget local también puede tener los suyos.
- **Permitido en root**: `lib/lib/` (libs globales compartidas), `lib/widget/` (widgets globales compartidos), `lib/view/` (pantallas).
- **Prohibido**: carpetas genéricas `models/`, `utils/`, `helpers/`, `constants/`, `providers/` en cualquier nivel. Romperían la jerarquía recursiva.
- **Prohibido**: archivos sueltos en el root del módulo. Todo va en su carpeta con `main.dart`.
- **Permitido auxiliar**: archivos como `model.dart` solo cuando es estrictamente necesario, junto al `main.dart` del módulo.
- **Imports**: solo hacia arriba (igual regla que React) — un widget local solo importa de su lib, su padre, su abuelo o `lib/lib/` global.

**Principio**: encapsulación por contexto. Un widget que solo se usa en una view vive dentro de esa view. Una lib que solo sirve a un widget vive dentro de ese widget. Solo sube a `lib/lib/` o `lib/widget/` lo que se comparte entre **múltiples** views.

**Aplicación**: antes de crear cualquier archivo Flutter, determinar su scope:
- Si lo usan ≥2 views → global (`lib/lib/` o `lib/widget/`).
- Si lo usa solo una view → local (`view/{x}/lib/` o `view/{x}/widget/`).
- Nunca poner widgets locales en la carpeta global ni viceversa.


## Tipado estricto — sin `any`

Todo el código TypeScript usa tipado explícito en parámetros, retornos y estructuras de datos. **Prohibido** `any` y **prohibido** dejar inferencia ambigua en APIs públicas (funciones exportadas, métodos públicos de clase, props de componente, schemas).

```ts
// BIEN — tipado explícito en API pública
export function get_user(id: UserId): Promise<User | null> {
    return db.users.findUnique({ where: { id } })
}

export interface SearchProps {
    query: string
    on_result: (items: SearchResult[]) => void
}

// MAL — any o inferencia ambigua en lo que se exporta
export function get_user(id: any): any {
    return db.users.findUnique({ where: { id } })
}

export function search(query, on_result) { ... }   // sin tipos en params
```

- **Prohibido**: `any` en parámetros, retornos, propiedades, generics. Si el tipo realmente es desconocido, usar `unknown` y narrow con type guard / cast acotado.
- **Prohibido**: omitir tipos de parámetros en funciones exportadas o métodos públicos.
- **Permitido inferencia**: en variables locales con asignación directa (`const x = 1`), en arrow functions inline (`arr.map((x) => x.id)`), donde el tipo es obvio del contexto.
- **Recomendado**: usar branded types (`UserId`, `Email`) para distinguir strings semánticamente diferentes (ver tabla de Naming + sección RAG sobre branded types).


## Construcción declarativa de objetos (spread + `??`)

Construir objetos de opciones (`options.where` en Sequelize, `config`, `headers`, etc.) con **una sola asignación declarativa**: spread del original + nullish coalescing para defaults. **Prohibido** mutaciones imperativas con guardas y early returns para "asegurar que el campo existe".

```ts
// BIEN — una asignación, sin guardas
options.where = {
    ...options.where,
    expired_at: options.expired_at ?? { [Op.gt]: new Date() },
}

// MAL — imperativo con guardas y early return
options.where = options.where || {}
if (options.where.expired_at !== undefined) return
options.where = { ...options.where, expired_at: { [Op.gt]: new Date() } }
```

**Reglas:**

- **Usar `...obj` aunque `obj` pueda ser `undefined`** — spread sobre undefined es vacío, no requiere guarda previa (`obj || {}`).
- **Usar `??` para override-vs-default en una sola expresión** — el caller pasa el flag top-level (`options.expired_at`), el operador resuelve con el default si no viene.
- **Exponer overrides como flags top-level del `options`** (`options.expired_at`, `options.limit`) en vez de meterlos dentro del `where`/`config` general. Hace el override explícito, separable y tipable.
- **Prohibido**: reasignaciones intermedias del mismo objeto (`x = x || {}; x.field = ...`).
- **Prohibido**: condicionales con early return (`if (x.field !== undefined) return`) para validar si el campo ya está seteado.
- **Prohibido**: verificaciones `!== undefined` cuando el ternario / `??` expresa lo mismo en una línea.
- **Aplica a**: cualquier objeto de opciones que pueda recibir overrides del caller (`where`, `include`, `attributes`, `headers`, `query`, `body`).


## `Promise.all` con ramas condicionales (`&&` inline)

Cuando una operación lanza N promesas en paralelo y algunas son condicionales, **inline el cortocircuito `&&`** dentro del array de `Promise.all`. **Prohibido** acumular promesas en un array intermedio con `if/push`.

```ts
// BIEN — cortocircuito && dentro del array
await Promise.all([
    instance.email && VerificationCode.create({
        email: instance.email,
        code: generate_otp(),
        expires_at,
    }, { transaction }),
    instance.phone && VerificationCode.create({
        phone: instance.phone,
        code: generate_otp(),
        expires_at,
    }, { transaction }),
])

// MAL — array intermedio con if/push
const tasks = []
if (instance.email) {
    tasks.push(VerificationCode.create({
        email: instance.email,
        code: generate_otp(),
        expires_at,
    }, { transaction }))
}
if (instance.phone) {
    tasks.push(VerificationCode.create({
        phone: instance.phone,
        code: generate_otp(),
        expires_at,
    }, { transaction }))
}
await Promise.all(tasks)
```

- **`Promise.all` ignora valores falsy** (`false`, `undefined`, `null`, `0`, `""`) en el array — no crea promesa para esa rama.
- **Permitido**: `cond && fn()` para que la promesa solo se cree cuando la condición se cumple.
- **Prohibido**: array `tasks = []` mutable + `if (...) tasks.push(...)` para construir la lista.
- **Prohibido**: ternario que devuelve `undefined` o `Promise.resolve()` como rama negativa (`cond ? fn() : Promise.resolve()`) — el `&&` ya cubre el caso sin valor placeholder.
- **Cuidado con tipos**: TS infiere `Array<false | Promise<T>>`. En contextos estrictos donde necesites tipo limpio, `await Promise.all([...].filter(Boolean))` o cast acotado.


## Optional chaining `?.` + nullish coalescing `??`

Para acceso seguro a propiedades/métodos potencialmente null/undefined con fallback, usar `?.` + `??` en **una sola expresión**. **Prohibido** ifs anidados que verifican cada nivel de la cadena antes de acceder.

```ts
// BIEN — una expresión declarativa
return json.user?.name ?? "Unknown"

const port = config?.server?.port ?? 3000
const first_tag = post?.tags?.[0] ?? "uncategorized"
const result = obj?.method?.(arg) ?? default_value

// MAL — guards anidados
if (json.user) {
    if (json.user.name) {
        return json.user.name
    }
}
return "Unknown"

// MAL — usar `||` en vez de `??` cuando 0/""/false son valores válidos
const limit = config.limit || 100         // si config.limit === 0, retorna 100 (BUG)
const port = config.port ?? 3000          // BIEN: respeta 0 si fuera válido (no aplica a port pero ilustra)
```

- **`?.`** corta la cadena en cualquier null/undefined sin throw. Funciona para propiedades (`a?.b`), índices (`a?.[i]`), llamadas (`a?.()`).
- **`??`** retorna el lado derecho **solo si el izquierdo es nullish** (`null`/`undefined`). Respeta `0`, `""`, `false`, `NaN` como valores válidos.
- **`||`** retorna el lado derecho si el izquierdo es **falsy** (incluyendo `0`, `""`, `false`). **Prohibido** usar `||` para defaults numéricos/string/boolean — hay riesgo de overrides accidentales.
- **Combinar libremente**: `obj?.deep?.nested?.[0]?.fn?.() ?? fallback`.
- **Prohibido**: cascadas de `if (a) if (a.b) if (a.b.c) ...` para acceso seguro.
- **Prohibido**: try/catch para "atrapar acceso a undefined" — usar `?.`.


## Filtrar nulls de un array: `.map().filter(Boolean)`

Para extraer valores no-null/no-undefined de un array, encadenar `.map(...).filter(Boolean)`. **Prohibido** loop con `push` + guarda explícita.

```ts
// BIEN — cadena declarativa
const tokens = sessions.map((s) => s.fcm).filter(Boolean)
const ids = items.map((i) => i.user?.id).filter(Boolean)

// MAL — loop imperativo
const tokens: string[] = []
for (const s of sessions) {
    if (s.fcm) tokens.push(s.fcm)
}
```

**Tipado estricto:** TS infiere `Array<string | null | undefined>` después del `filter(Boolean)`. Si necesitas tipo limpio:

```ts
// Opción A: cast acotado al final
const tokens = sessions.map((s) => s.fcm).filter(Boolean) as string[]

// Opción B: type guard explícito (más estricto, sin cast)
const tokens = sessions.map((s) => s.fcm).filter((x): x is string => Boolean(x))
```

- **Permitido**: `.filter(Boolean)` para descartar `null`/`undefined`/`""`/`0`/`false`.
- **Prohibido**: loop mutable con `push` para hacer lo mismo.
- **Cuidado**: `Boolean` también descarta `0` y `""`. Si esos valores son válidos en tu dominio, usar `.filter((x) => x != null)` para descartar solo `null`/`undefined`.
- **Para tipos estrictos**: type guard `.filter((x): x is T => Boolean(x))` o cast acotado al final.


## Ternario para asignación condicional simple

Para asignar un valor según una condición simple, usar **operador ternario en una sola expresión**. **Prohibido** `let` + `if/else` que solo asigna a la misma variable.

```ts
// BIEN — ternario en una expresión
const role = instance.name === "Admin" ? "admin" : "member"
const max = current > previous ? current : previous
const label = is_active ? "Activo" : "Inactivo"

// MAL — let + if/else solo para asignar
let role
if (instance.name === "Admin") {
    role = "admin"
} else {
    role = "member"
}
```

- **Permitido**: ternario cuando hay **dos ramas** y cada una resuelve a un **valor**.
- **Permitido**: ternarios atómicos en una sola línea.
- **Prohibido**: `let` con asignación posterior cuando un `const` con ternario lo cubre.
- **Prohibido**: ternarios anidados (`a ? b : c ? d : e`) — usar `Record` lookup o `if/else` explícito.
- **Justificable `if/else`**: cuando cada rama tiene **lógica compleja** (varios statements, side effects, llamadas async). El ternario es solo para resolver un **valor**.


## Propiedades condicionales: spread inline `...(cond && { key: value })`

Para incluir una propiedad en un objeto **solo si una condición se cumple**, usar **spread condicional inline**. **Prohibido** construir el objeto base y mutarlo con `if`s posteriores.

```ts
// BIEN — spread condicional dentro de la declaración
const payload = {
    id: instance.id,
    name: instance.name,
    ...(instance.email && { email: instance.email }),
    ...(instance.phone && { phone: instance.phone }),
}

const where = {
    organization_id,
    ...(filter.status && { status: filter.status }),
    ...(filter.from && filter.to && { created_at: { [Op.between]: [filter.from, filter.to] } }),
}

// MAL — construir y mutar después
const payload: any = { id: instance.id, name: instance.name }
if (instance.email) payload.email = instance.email
if (instance.phone) payload.phone = instance.phone
```

- **Mecánica**: spread sobre `false` (o sobre `{}`) es **no-op** — no agrega nada. Solo agrega cuando `cond` es truthy y devuelve el objeto literal.
- **Permitido**: `...(cond && { k: v })` para una propiedad condicional.
- **Permitido**: `...(cond && { k1: v1, k2: v2 })` para múltiples propiedades agrupadas bajo la misma condición.
- **Prohibido**: construir `obj = {...}` y luego `if (cond) obj.field = value` (forza `: any` y dispersa la lógica).
- **Cuidado**: usar `??` en el cond da error de TS (espera boolean). Usar `&&` o convertir explícitamente a boolean (`!!value`).
- **Combinable** con destructuring + defaults: `const { a = "x", b } = props; const out = { a, ...(b && { b }) }`.


## Operadores de asignación compuestos `??=` `||=` `&&=`

Para **"mutate-or-default"** en una sola operación atómica, usar los compound assignment operators. **Prohibido** reasignar manualmente con `x = x || ...` / `x = x ?? ...`.

```ts
// BIEN — compound assignment
options.where ||= {}
options.timeout ||= 5000
user.preferences ??= defaults
flags.dirty &&= validate(state)

// MAL — reasignación manual
options.where = options.where || {}
options.timeout = options.timeout || 5000
user.preferences = user.preferences ?? defaults
if (flags.dirty) flags.dirty = validate(state)
```

**Diferencias entre los tres operadores:**

| Operador | Asigna cuando el valor actual es… | Respeta como válido |
|---|---|---|
| `\|\|=` | falsy (`null`, `undefined`, `0`, `""`, `false`, `NaN`) | nada de lo anterior |
| `??=` | nullish (`null` o `undefined`) | `0`, `""`, `false`, `NaN` |
| `&&=` | truthy (cualquier valor truthy) | el valor previo si era falsy |

- **`??=`** para defaults numéricos, strings, booleans (donde `0`/`""`/`false` son válidos).
- **`||=`** para inicializar contenedores (objetos/arrays) donde falsy = "no inicializado".
- **`&&=`** para "actualizar solo si ya existe" (transformar el valor sin sobrescribir cuando es falsy).
- **Prohibido**: `x = x || default` / `x = x ?? default` cuando el compound operator hace lo mismo en menos código.
- **Prohibido**: `if (x) x = transform(x)` cuando `x &&= transform(x)` lo cubre.


## `flatMap()` para 1→N items

Para transformaciones donde **un item produce N items** (extraer relaciones, expandir listas, aplanar grupos), usar **`Array.prototype.flatMap()`**. **Prohibido** loops manuales con `push` y **prohibido** `map().flat()` (dos pasadas innecesarias).

```ts
// BIEN — flatMap: una sola pasada, intención clara
const role_ids = users.flatMap((u) => u.roles.map((r) => r.id))
const all_tags = posts.flatMap((p) => p.tags)
const valid_emails = users.flatMap((u) => u.emails.filter(is_valid))

// SUBÓPTIMO — map + flat (dos pasadas)
const role_ids = users.map((u) => u.roles.map((r) => r.id)).flat()

// MAL — loop manual con push
const role_ids: string[] = []
for (const user of users) {
    for (const role of user.roles) {
        role_ids.push(role.id)
    }
}
```

- **`flatMap`** aplana **un nivel**. Para más profundidad: `.flat(Infinity)` o `flatMap` recursivo.
- **Permitido**: retornar `[]` desde la callback de `flatMap` para "filtrar" — el resultado se aplana ignorando los vacíos. Equivale a `filter + map` en una sola pasada.
- **Prohibido**: `map().flat()` cuando `flatMap()` lo hace en una pasada.
- **Prohibido**: loop con `push` cuando `flatMap` cubre el caso.
- **Aplica a**: extraer relaciones (roles de usuarios, tags de posts), expandir listas, transformaciones 1→N, generar opciones de selects desde grupos.


## Optional call `?.()` para funciones opcionales

Para llamar a una función que puede ser `undefined`/`null`, usar **optional call `?.()`**. **Prohibido** guards explícitos como `if (fn) fn()` o `typeof fn === "function"`.

```ts
// BIEN — optional call
callback?.(value)
on_change?.(value)
config.logger?.warn("deprecated")
items.find((x) => x.id === id)?.activate()
obj?.method?.(arg)?.then?.(handle_result)

// MAL — guard explícito con if
if (callback) {
    callback(value)
}

// MAL — typeof === "function" (excesivo)
if (typeof on_change === "function") {
    on_change(value)
}

// MAL — extraer a variable solo para verificar
const item = items.find((x) => x.id === id)
if (item) item.activate()
```

- **`?.()`** es la primitiva del lenguaje para "llama si existe". Una sola expresión, sin branching ni reasignaciones intermedias.
- **Encadenable**: `obj?.method?.()`, `arr?.[0]?.()`, `obj?.fn?.(arg)?.then?.(cb)`.
- **Prohibido**: `if (fn) fn()` cuando el contrato declara la función como opcional.
- **Prohibido**: `typeof fn === "function"` — si el contrato es opcional, `?.()` ya cubre `undefined`/`null`. Si el caller pasa algo que no es función, es bug de tipo (lo detecta TS).
- **Prohibido**: extraer a variable temporal solo para verificarla antes de llamar.
- **Aplica a**: callbacks de props, hooks opcionales, eventos opcionales, métodos de objetos posiblemente undefined.


## Destructuring profundo con defaults y rename

Para extraer múltiples valores anidados con defaults, usar **destructuring profundo en una sola declaración** con defaults `=` y rename `:`. **Prohibido** accesos sucesivos con guards y ternarios.

```ts
// BIEN — destructuring profundo, una sola declaración
const {
    data: {
        limit = 100,
        offset = 0,
        user: { name: user_name = "unknown" } = {},
    },
} = response

// BIEN — props con defaults + rename
function Modal({
    open = false,
    title: header = "Untitled",
    on_close,
}: ModalProps) { ... }

// MAL — accesos paso a paso con ternarios
const data = response.data
const limit = data.limit !== undefined ? data.limit : 100
const offset = data.offset !== undefined ? data.offset : 0
const user_name = data.user && data.user.name ? data.user.name : "unknown"
```

**Sintaxis del destructuring:**

| Patrón | Significado |
|---|---|
| `{ key }` | extraer `key` con su nombre |
| `{ key = default }` | aplicar default si `key` es `undefined` (NO si es `null` o falsy) |
| `{ key: alias }` | renombrar `key` como `alias` durante la extracción |
| `{ key: alias = default }` | combinar rename + default |
| `{ nested: { inner } = {} }` | navegar nested; el `= {}` previene crash si `nested` es `undefined` |
| `{ nested: { inner: alias = "x" } = {} }` | combinar todo: navegar + rename + default |

- **Prohibido**: `const x = obj.a.b.c.d` sin guards cuando algún nivel puede ser `undefined`.
- **Prohibido**: cascadas de `obj.a !== undefined ? obj.a : default` cuando `{ a = default } = obj` lo cubre.
- **Cuidado**: el default solo aplica a `undefined`, no a `null`. Si la API puede devolver `null` explícito, usar `??` después o validar Zod antes.
- **Heurística**: si la profundidad supera 3 niveles o hay 4+ defaults, considerar parsear con Zod antes de destructurar.


## Parameter properties en constructores

Para inicializar campos de clase, usar **parameter properties** (modificadores `public`/`private`/`readonly` en parámetros del constructor) cuando el constructor solo asigna primitivos o referencias simples. Usar **constructor body** cuando hay normalización, derivación o construcción de sub-propiedades.

```ts
// BIEN — parameter properties para campos simples
class User {
    constructor(
        public readonly id: string,
        public name: string,
        public email: string | null,
    ) {}
}

// BIEN — constructor body cuando hay transformación
class Workspace {
    public readonly id: string
    public name: string
    public config: { theme: string; lang: string }

    constructor(input: WorkspaceInput) {
        this.id = input.id
        this.name = input.name.trim()
        this.config = {
            theme: input.theme ?? "light",
            lang: input.lang ?? "es",
        }
    }
}

// MAL — declarar y reasignar campos primitivos
class User {
    public id: string
    public name: string
    public email: string | null
    constructor(id: string, name: string, email: string | null) {
        this.id = id
        this.name = name
        this.email = email
    }
}
```

- **Permitido**: parameter properties cuando el constructor solo asigna lo recibido.
- **Permitido**: constructor body cuando hay transformación, normalización, defaults derivados o construcción de sub-propiedades.
- **Prohibido**: declarar campo + reasignar en body cuando el campo es primitivo y la asignación es directa.
- **Heurística**: si el body sería puro `this.x = x; this.y = y; ...`, usar parameter properties; si transforma, usar body.


## Method chaining con `return this`

En clases tipo builder/DSL/configurador, los métodos mutadores retornan `this` (con tipo `this`) para encadenar operaciones en una sola expresión. **Prohibido** mutadores que retornan `void` cuando el caller los usa secuencialmente.

```ts
// BIEN — chaining con tipo `this`
class QueryBuilder {
    where(field: string, value: any): this {
        this.conditions.push({ field, value })
        return this
    }
    limit(n: number): this {
        this.limit_value = n
        return this
    }
    execute() { ... }
}

const result = new QueryBuilder()
    .where("id", 1)
    .where("active", true)
    .limit(10)
    .execute()

// MAL — sin chaining, statements sueltos
const qb = new QueryBuilder()
qb.where("id", 1)
qb.where("active", true)
qb.limit(10)
const result = qb.execute()
```

- **Tipo de retorno `this`** (no la clase concreta): permite que subclases mantengan el chaining con su propio tipo.
- **Solo en mutadores**: getters/queries que retornan un valor crítico no aplican.
- **Aplica a**: builders, configuradores, DSL declarativos, query builders, request chains, validators encadenados.
- **Prohibido**: mutadores con `return void` cuando se usan secuencialmente.
- **Prohibido**: forzar chaining en métodos que retornan datos útiles (no son mutadores).


## Type narrowing: `as` casting con validación inline

Para narrowing de tipos (`unknown` → `T`), usar **`as` casting con validación inline** en la función consumidora cuando el tipo proviene de fuente confiable. **Prohibido** extraer type guards (`is_user(x): x is User`) a funciones auxiliares cuando solo se usan una vez.

```ts
// BIEN — as + validación inline
function process(item: unknown): string {
    const user = item as User
    if (typeof user.email === "string") {
        return user.email
    }
    throw new Error("Not a user")
}

// MAL — type guard auxiliar usado una sola vez
function is_user(item: unknown): item is User {
    return typeof item === "object"
        && item !== null
        && "email" in item
        && typeof (item as any).email === "string"
}

function process(item: unknown): string {
    if (is_user(item)) {
        return item.email
    }
    throw new Error("Not a user")
}
```

- **Permitido `as` cast** cuando: (1) el tipo viene de fuente confiable (parsed por Zod, ORM, JWT validado), y (2) la validación runtime se hace inline en el consumer.
- **Cuándo SÍ extraer type guard a función**: usado en 3+ lugares con misma forma exacta, narrowing complejo (varios checks, recursión), narrowing exhaustivo en switch sobre DU con muchas ramas.
- **Prohibido**: type guards extraídos solo "para tener limpio" cuando se usan una sola vez (ver "Reutilización vs fragmentación").
- **Prohibido**: confiar en `as` sin validación runtime cuando el dato viene de fuente externa no validada.


## `satisfies` operator para tipos literales precisos

Para validar el shape de un objeto sin perder los tipos literales inferidos, usar **`satisfies`** (TS 4.9+). **Prohibido** usar type annotation `: Type` cuando se necesita inferencia precisa.

```ts
// BIEN — satisfies preserva tipos literales
const STATUS_LABELS = {
    active: "Activo",
    pending: "Pendiente",
    archived: "Archivado",
} satisfies Record<string, string>
// STATUS_LABELS.active es 'Activo' (literal, no string)
// keyof typeof STATUS_LABELS es 'active' | 'pending' | 'archived'

// BIEN — combinable con `as const`
const ROUTES = {
    users: "/v1/users",
    auth: { login: "/v1/auth/login", logout: "/v1/auth/logout" },
} as const satisfies Record<string, string | Record<string, string>>

// MAL — type annotation hace widening
const STATUS_LABELS: Record<string, string> = {
    active: "Activo",
    pending: "Pendiente",
    archived: "Archivado",
}
// STATUS_LABELS.active es `string` (perdimos 'Activo')
// Cualquier string es key válida (perdimos enum)
```

- **`satisfies`**: valida shape sin alterar el tipo inferido. Mantiene literales, `as const`, autocompletado preciso.
- **Type annotation `: T`**: hace widening del valor al tipo. Pierde inferencia precisa.
- **Casos donde brilla `satisfies`**:
  - Configuración con `as const satisfies Config`.
  - Routing con paths literales tipados.
  - Object maps que necesitan keys exhaustivas + valores literales.
  - Discriminated unions donde el discriminador debe ser literal.
- **Prohibido**: `: Type` cuando necesitas mantener literales (usar `satisfies`).
- **Prohibido**: `as Type` cuando `satisfies` validaría el shape sin cast peligroso.


## Result type — clases con métodos vs discriminated union

Para modelar resultados de operaciones que pueden fallar (`Result<T>`), usar **clase abstracta con subclases concretas** (`OkResult`/`ErrResult`) cuando el tipo lleva métodos asociados (`is_ok()`, `unwrap()`, `map()`). **Prohibido** discriminated union pura cuando el consumidor termina escribiendo el mismo check + acceso en cada uso.

```ts
// BIEN — clases hermanas con métodos encapsulados
abstract class Result<T> {
    abstract is_ok(): boolean
    abstract unwrap(): T
    abstract map<U>(fn: (value: T) => U): Result<U>
}

class OkResult<T> extends Result<T> {
    constructor(public data: T) { super() }
    is_ok() { return true }
    unwrap() { return this.data }
    map<U>(fn: (value: T) => U): Result<U> {
        return new OkResult(fn(this.data))
    }
}

class ErrResult<T> extends Result<T> {
    constructor(public error: string) { super() }
    is_ok() { return false }
    unwrap(): T { throw new Error(this.error) }
    map<U>(): Result<U> { return this as unknown as Result<U> }
}

// Uso
const result = parse(input)
if (result.is_ok()) {
    use(result.unwrap())
}

// MAL — discriminated union pura cuando hay comportamiento por variante
type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string }

if (result.ok) use(result.data)
else log(result.error)
// El consumidor escribe el check + acceso en cada uso, repetido en cada caller.
```

**Heurística de cuándo usar qué:**

| Caso | Estructura |
|---|---|
| El tipo lleva **métodos por variante** (`is_ok`, `unwrap`, `map`, `or_else`) | Clases hermanas |
| El tipo es solo **shape de datos** que se pasa entre funciones | Discriminated union |
| Salida con **comportamiento operacional** asociado | Clases |
| Inputs/parámetros con N criterios excluyentes | Discriminated union (ver "Search variants con DU") |

- **NOTA importante**: este patrón **contrasta** con la regla "DU para search variants" que aplica a parámetros/inputs. Para outputs/resultados con comportamiento asociado, las clases ganan porque agrupan datos + operaciones.
- **Prohibido**: discriminated union para tipos que requieren los mismos métodos en cada variante (lleva a duplicación en cada caller).


## Tipos derivados con utility types

Derivar tipos relacionados desde un tipo base usando los **utility types de TypeScript** (`Partial`, `Pick`, `Omit`, `Record`, etc.). **Prohibido** definir interfaces paralelas que duplican campos del tipo base.

```ts
// BIEN — utility types derivan automáticamente
interface UserCreateInput {
    email: string
    name: string
    password: string
}

type UserUpdateInput = Partial<UserCreateInput>
type UserPublic     = Omit<UserCreateInput, "password">
type UserAuth       = Pick<UserCreateInput, "email" | "password">
type UserSearch     = Partial<Pick<UserCreateInput, "email" | "name">>

// MAL — duplicación manual
interface UserCreateInput {
    email: string
    name: string
    password: string
}
interface UserUpdateInput {
    email?: string
    name?: string
    password?: string
}
interface UserPublic {
    email: string
    name: string
}
```

**Utility types más usados:**

| Utility | Resultado |
|---|---|
| `Partial<T>` | todos los campos opcionales |
| `Required<T>` | todos los campos requeridos |
| `Readonly<T>` | todos los campos `readonly` |
| `Pick<T, K>` | solo los campos en `K` |
| `Omit<T, K>` | todos los campos menos `K` |
| `Record<K, V>` | objeto con keys `K` y valores `V` |
| `Exclude<T, U>` | quita `U` de `T` (en uniones) |
| `Extract<T, U>` | solo `U` de `T` (en uniones) |
| `ReturnType<F>` | tipo de retorno de la función `F` |
| `Parameters<F>` | tupla de parámetros de `F` |
| `Awaited<T>` | desempaca `Promise<T>` |
| `NonNullable<T>` | quita `null`/`undefined` |

- **Obligatorio**: derivar Update/Patch/Partial desde el Create base con utility types.
- **Obligatorio**: derivar Public/Internal desde el tipo completo con `Omit`/`Pick`.
- **Prohibido**: copiar manualmente campos en tipos relacionados (un cambio en el base se olvida en las copias).
- **Aplica a**: ApiInput/ApiOutput, Create/Update/Patch, Public/Internal, FormData/SubmitData.


## Branded / nominal types

Para diferenciar strings semánticamente distintos (IDs, emails, phones, hashes, tokens) que TypeScript trataría como `string` plano, usar **branded types** `string & { __brand: "X" }`. **Prohibido** strings desnudos en signatures cuando hay riesgo de mezclar valores semánticamente diferentes.

```ts
// BIEN — branded types
type Brand<T, B extends string> = T & { __brand: B }

type UserId       = Brand<string, "UserId">
type WorkspaceId  = Brand<string, "WorkspaceId">
type Email        = Brand<string, "Email">
type Phone        = Brand<string, "Phone">

function get_user(id: UserId): User { ... }
function send_to(email: Email, msg: string) { ... }

const id    = "uuid-123" as UserId
const email = "a@b.com" as Email

get_user(id)             // OK
send_to(email, "hello")  // OK
get_user(email)          // ERROR: Email is not UserId
send_to(id, "hi")        // ERROR: UserId is not Email

// MAL — strings desnudos
function get_user(id: string): User { ... }
function send_to(email: string, msg: string) { ... }

const id    = "uuid-123"
const email = "a@b.com"
get_user(email)          // Compila, bug en runtime
send_to(id, "hi")        // Compila, bug en runtime
```

**Convención de uso:**

- **Constructor del brand**: el cast `as Brand<...>` ocurre **solo en el punto donde se valida el formato** (parser, schema, factory). Después, el branded type viaja por el sistema sin re-validación.
- **Función validadora**: `function as_email(s: string): Email | null { return is_valid_email(s) ? (s as Email) : null }`.
- **Helper genérico**: `type Brand<T, B extends string> = T & { __brand: B }`.

**Aplica a:**

- IDs: `UserId`, `WorkspaceId`, `OrgId`, cualquier UUID/clave foránea.
- Validated formats: `Email`, `Phone`, `URL`, `Hash`, `Slug`.
- Tokens: `JwtToken`, `ApiKey`, `RefreshToken`.
- Unidades: `Usd`, `Eur`, `Meters`, `Feet`.

- **Prohibido**: signature con `string` cuando el dominio distingue entre múltiples tipos de string.
- **Prohibido**: hacer `as Brand<...>` sin validación previa (el brand garantiza que el formato fue validado).
- **Cost-benefit alto**: 5 líneas de tipo nominal eliminan toda una clase de bugs por mezclar identificadores.


## Search variants — DU con tag, no funciones por sufijo ni filter object

Para una operación que admite N criterios mutuamente excluyentes (`get_user_by_id` / `by_email` / `by_phone`), usar **discriminated union explícita** con campo discriminador (`by`) y valor. **Prohibido** funciones separadas con sufijo y **prohibido** filter object con keys opcionales.

```ts
// BIEN — DU con tag explícito
type UserLookup =
    | { by: "id";    value: string }
    | { by: "email"; value: string }
    | { by: "phone"; value: string }

function get_user(lookup: UserLookup): User | null { ... }

get_user({ by: "email", value: "a@b.com" })
get_user({ by: "id",    value: "uuid-123" })

// MAL — funciones separadas con sufijo
function get_user_by_id(id: string) { ... }
function get_user_by_email(email: string) { ... }
function get_user_by_phone(phone: string) { ... }

// MAL — filter object con keys opcionales
function get_user(filter: { id?: string; email?: string; phone?: string }) {
    // No fuerza pasar exactamente uno
    // get_user({}) compila → bug de validación runtime
    // get_user({ id, email }) compila → ambigüedad
}
```

**Razones para DU sobre filter object:**

- Fuerza al caller a especificar **exactamente UN criterio** (TS no permite mezclar variantes).
- Elimina validación runtime de "se pasó al menos uno y no varios".
- El switch interno por `lookup.by` es **exhaustive-checkable**: si agregas `phone_e164`, TS marca el switch.

**Razones para DU sobre funciones separadas:**

- Una sola firma pública, sin proliferación de `get_user_by_*`.
- Composable: `const lookup: UserLookup = req.query.email ? { by: "email", value: req.query.email } : { by: "id", value: req.params.id }`.

- **Aplica a**: repositorios, query handlers, search APIs, lookup services, cualquier operación con N criterios excluyentes.
- **Prohibido**: proliferación de funciones `get_X_by_*` cuando una DU las unifica.
- **Prohibido**: filter object opcional sin validación runtime para "exactamente uno".
