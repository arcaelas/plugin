---
name: clean-code
description: >
  Convenciones obligatorias de programación del usuario. Aplica a cada línea de código que se
  escriba o revise — son directrices, no sugerencias. Cubre nomenclatura, anatomía de
  componentes (React, Next.js, Flutter), imports y scope, hooks, control de flujo, patrones
  de composición y reuso, tipos de TypeScript, datos y APIs, arquitectura frontend, async y
  lifecycle, performance y re-renders, JSDoc, package management, git workflow, contexto del
  usuario y herramientas. Se activa en cualquier cambio, refactor, revisión u optimización
  de código, y cuando el usuario pregunta por estilo, naming, estructura o mejores prácticas.
---

# Convenciones de código del usuario

Estas son las convenciones establecidas. Aplican a cada línea de código que se escribe o revisa. Las violaciones no son preferencias estéticas — son **defectos**. Las reglas son **órdenes**, no sugerencias. El RAG contiene la versión viva y completa; este skill captura el núcleo estable. Ante cualquier duda, consultar el RAG.

---

## 1. Naming

- **Variables, funciones, parámetros**: siempre `snake_case`. Esta convención reemplaza el `camelCase` habitual de JavaScript/TypeScript.

  ```ts
  // BIEN — snake_case siempre
  const user_id = "abc-123"
  const loading = false
  function get_user(user_id: string) { ... }

  // MAL — camelCase no se usa
  const userId = "abc-123"
  function getUser(userId: string) { ... }
  ```

- **Booleans**: nombres **desnudos** sin prefijo. NO usar `is_`, `has_`, `can_`. El tipo `boolean` ya comunica la semántica; el prefijo agrega ruido cuando el contexto es claro (props, state UI, attrs HTML). Espejea convenciones nativas del DOM (`disabled`, `hidden`, `loading`, `required`).

  ```ts
  // BIEN — desnudos
  interface ButtonProps {
      loading: boolean;
      disabled: boolean;
      error: boolean;
      edit: boolean;
  }

  // MAL — con prefijo
  interface ButtonProps {
      is_loading: boolean;
      is_disabled: boolean;
      has_error: boolean;
      can_edit: boolean;
  }
  ```

- **Constantes locales** (dentro de funciones o scopes limitados): `snake_case` como cualquier otra variable. **Constantes globales exportadas** (módulos, configuración, límites, URLs): `UPPER_SNAKE_CASE`.

  ```ts
  // BIEN
  export const MAX_RETRIES = 3
  export const API_BASE_URL = "https://api.example.com"

  function calculate_shipping(weight: number) {
      const base_rate = 5.99       // local → snake_case
      const weight_factor = 0.5
  }

  // MAL
  function calculate_shipping(weight: number) {
      const BASE_RATE = 5.99       // UPPER en local
  }
  ```

- **Clases**: `PascalCase`. **Métodos**: `snake_case`.

  ```ts
  // BIEN
  class UserController {
      get_by_id(id: string): User { ... }
      get_all(): User[] { ... }
      create(data: CreateInput): User { ... }
  }

  // MAL
  class userController {           // camelCase nombre
      getById(id: string) { ... }  // camelCase método
  }
  ```

- **Interfaces y types**: `PascalCase`. Props de componentes siguen el patrón `{ComponentName}Props`. Campos internos `snake_case`.

  ```ts
  // BIEN
  interface UserFormProps {
      initial_name: string
      disabled?: boolean
      on_submit: () => void
  }

  type ButtonVariant = "primary" | "secondary" | "ghost"

  interface ApiResponse<T> {
      success: boolean
      data: T
      error_message?: string
  }
  ```

- **Tipos globales compartidos**: prefijo `I{Dominio}` (`IAuth`, `IProduct`). Definidos en archivos centralizados (`src/lib/types/`). NO usar sufijo `Type` ni nombres sin prefijo (se confunden con interfaces locales).

  ```ts
  // BIEN
  interface IAuth { user_id: string; token: string; expires_at: number }
  const auth: IAuth = await get_session()

  // MAL
  interface Auth { ... }           // sin prefijo I
  interface ProductType { ... }    // sufijo Type
  ```

- **Enums**: nombre `PascalCase`, keys `UPPER_SNAKE_CASE`. Valores pueden ser strings `snake_case` o números.

  ```ts
  // BIEN
  enum TicketStatus {
      OPEN = "open",
      IN_PROGRESS = "in_progress",
      RESOLVED = "resolved",
  }

  enum Priority { P1 = 1, P2 = 2, P3 = 3 }
  ```

- **Archivos**: siempre `snake_case`. Aplica a servicios, utilidades, configuración, tests. El archivo principal de un componente es siempre `index.tsx`.

  ```
  // BIEN
  ├── lib/
  │   ├── http_client.ts
  │   ├── format_helpers.ts
  │   └── use_theme/index.ts
  ├── services/
  │   ├── user_controller.ts
  │   └── payment_service.ts

  // MAL
  ├── services/
  │   ├── UserController.ts        // PascalCase
  │   ├── paymentService.ts        // camelCase
  ```

- **Carpetas**: siempre `snake_case`, excepto carpetas de componentes visuales, que usan `PascalCase` para coincidir con el componente exportado.

  ```
  // BIEN
  ├── lib/
  │   └── use_theme/               // snake_case — hook
  ├── components/
  │   ├── Button/                  // PascalCase — componente
  │   └── UserCard/                // PascalCase — componente
  ```

- **Props de componentes**: campos en `snake_case`. Callbacks siguen el patrón `on_{action}`. El patrón `handle{Action}` está **prohibido**.

  ```tsx
  // BIEN
  interface SearchBarProps {
      placeholder_text: string
      expanded: boolean
      max_results: number
      on_search: (query: string) => void
      on_clear: () => void
  }

  // MAL
  interface SearchBarProps {
      placeholderText: string        // camelCase
      onSearch: (q: string) => void  // camelCase callback
      handleClear: () => void        // handle pattern
  }
  ```

- **`useState`**: variable `snake_case`, setter `camelCase` con prefijo `set`. Única excepción donde `camelCase` aparece fuera de hooks/componentes — por compatibilidad con la API de React.

  ```ts
  // BIEN
  const [loading, setLoading] = useState(false)
  const [error_message, setErrorMessage] = useState<string | null>(null)
  const [form_data, setFormData] = useState({ email: "", password: "" })

  // MAL
  const [isLoading, setIsLoading] = useState(false)
  const [IS_LOADING, setIsLoading] = useState(false)
  ```

- **Hooks**: convención dual obligatoria. La **carpeta** usa `snake_case` con prefijo `use_` (`use_button_state/`), pero la **función exportada** usa `camelCase` (`useButtonState`).

  ```
  // BIEN
  // ./src/components/Terminal/lib/
  ├── use_terminal/
  │   └── index.ts          // export default function useTerminal() {}
  └── use_terminal_tabs/
      └── index.ts          // export default function useTerminalTabs() {}

  // MAL
  ├── useTerminal/          // carpeta camelCase
  │   └── index.ts
  └── use_terminal/
      └── index.ts          // export function use_terminal() {}  // snake_case función
  ```

---

## 2. Component folder anatomy

- **`components/` vs `lib/` — decisión única**: ¿retorna JSX? **Sí** → `components/`. **No** → `lib/`. Sin excepciones. Esto incluye hooks, constantes, helpers, types, configuraciones — cualquier cosa que no emita JSX va en `lib/`.

  ```tsx
  // BIEN
  const ButtonIcon = () => <svg>...</svg>             // components/ → retorna JSX
  const useButtonState = () => useState(false)        // lib/ → no retorna JSX
  const button_variants = { primary: "bg-blue-500" }  // lib/ → no retorna JSX

  // MAL
  const useButtonState = () => useState(false)        // components/ → no retorna JSX
  const ButtonIcon = () => <svg>...</svg>             // lib/ → retorna JSX
  ```

- **Patrón recursivo**: cada componente en cualquier nivel puede tener su propio `lib/` y `components/`. El patrón se repite hacia adentro sin límite de profundidad. Un subcomponente sigue exactamente la misma anatomía que su padre.

  ```
  ./src/components/Button/
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
  ```

- **Anatomía estándar** de cada carpeta de componente. No agregar archivos extra (CSS, README, tests, stories) salvo que sea estrictamente necesario o explícitamente pedido.

  ```
  ./src/components/Button/
  ├── index.tsx                // obligatorio, export default siempre al final
  ├── types.d.ts               // opcional, solo si exporta tipos externos
  ├── lib/                     // opcional, hooks y lógica pura sin markup
  └── components/              // opcional, subcomponentes visuales con markup
  ```

- **Archivo principal**: siempre `index.tsx`. NO se nombra como el componente (`Button.tsx`) ni en minúsculas (`button.tsx`).

  ```
  // BIEN
  ./src/components/Button/index.tsx
  ./src/components/UserCard/index.tsx

  // MAL
  ./src/components/Button/Button.tsx        // archivo nombrado como componente
  ./src/components/Button/button.tsx        // minúsculas
  ./src/components/Button/component.tsx     // nombre genérico
  ```

- **Jerarquía direccional — solo hacia arriba**: cada nivel solo conoce hacia arriba (padre, abuelo, raíz), nunca hacia hermanos. Archivos sueltos en el root del componente (`useButtonState.ts`, `helpers.ts`, `ButtonIcon.tsx` planos) rompen la jerarquía.

  ```
  // BIEN — cada nivel replica la misma anatomía
  ./src/components/Button/
  ├── index.tsx
  ├── lib/use_button_state/index.ts
  └── components/ButtonIcon/
      ├── index.tsx
      └── lib/use_icon_size/index.ts

  // MAL — archivos sueltos rompen jerarquía
  ./src/components/Button/
  ├── index.tsx
  ├── useButtonState.ts          // archivo suelto, sin carpeta
  ├── helpers.ts                 // archivo genérico fuera de lib/
  └── ButtonIcon.tsx             // componente hijo sin carpeta
  ```

- **Hooks dentro de `lib/`**: cada hook tiene su propia subcarpeta en `snake_case` con prefijo `use_`. La función exportada va con `export default`. Un hook no se comparte con hermanos ni padres — pertenece a su componente. Si dos componentes hermanos lo necesitan, sube al `lib/` del padre común.

  ```
  // BIEN
  ./src/components/Button/lib/
  ├── use_button_state/
  │   ├── index.ts             // export default function useButtonState() {}
  │   └── types.d.ts
  └── use_button_animation/
      └── index.ts

  // MAL
  ./src/components/Button/lib/
  ├── useButtonState.ts        // archivo suelto, sin carpeta
  ├── use_button_state.ts      // archivo suelto
  └── hooks.ts                 // múltiples hooks en un archivo
  ```

- **Componentes y `lib` raíz son globales**: archivos en `src/components/` y `src/lib/` son accesibles desde cualquier profundidad. Reservar para abstracciones base compartidas (theme hook, auth hook, base components, http client). NO poner lógica global dentro del `lib/` de un componente específico.

  ```ts
  // BIEN — importar desde raíz en cualquier nivel
  // ./src/components/Button/components/ButtonIcon/index.tsx
  import useTheme from "@/lib/use_theme"
  import useAuth from "@/lib/use_auth"
  import Input from "@/components/Input"

  // MAL — lógica compartida dentro de un componente
  // ./src/components/Button/lib/use_theme/  // theme es global, no de Button
  ```

- **Scope de imports — solo hacia arriba**. Permitido: propio `lib/`, `lib/` del padre, `lib/` del abuelo, `lib/` raíz, `components/` raíz. Prohibido: hermanos, descendientes, ramas sin relación.

  ```ts
  // ./src/components/Button/components/ButtonIcon/index.tsx

  // BIEN
  import useIconSize from "./lib/use_icon_size"            // propio
  import useButtonState from "../../lib/use_button_state"  // padre
  import useTheme from "@/lib/use_theme"                   // raíz
  import Input from "@/components/Input"                   // componente raíz

  // MAL
  import { x } from "../ButtonSpinner/lib/x"              // hermano
  import { x } from "./components/SpinnerDot/lib/x"       // descendiente
  import { y } from "@/components/Form/lib/y"             // sin relación
  ```

- **`types.d.ts` — local y no recursivo**: cada `types.d.ts` solo afecta a la carpeta donde está. NO se propaga a hermanos, padres ni hijos. Cada carpeta que necesita sus propios tipos tiene su propio `types.d.ts`.

  ```
  // BIEN — cada carpeta con su types.d.ts
  ./src/components/Button/
  ├── index.tsx
  ├── types.d.ts                 // solo tipos de Button
  └── lib/
      └── use_button_state/
          ├── index.ts
          └── types.d.ts         // solo tipos del hook, NO visible en Button/

  // MAL — types.d.ts centralizado
  ./src/components/Button/
  ├── index.tsx
  ├── types.d.ts                 // Button + ButtonIcon + hooks = todo mezclado
  └── components/ButtonIcon/index.tsx  // importa tipos del padre
  ```

- **Orden de exports en `index.tsx`**: el componente (`export default`) siempre es el último. Los hooks NO aparecen aquí — viven en su propio `lib/use_name/`. Orden estricto: 1) Enums → 2) Types → 3) Interfaces (Props, Config) → 4) Constants → 5) Utility functions (solo si son complejas) → 6) `export default Component`.

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
  export default function Button() { ... }    // default primero
  export enum ButtonSize { ... }              // enum después del componente
  export function useButtonState() { ... }    // hook dentro de index.tsx
  ```

---

## 3. Flutter project conventions

```
lib/
├── main.dart
├── assets/                  # iconos, sonidos, recursos estáticos
│   ├── icons/
│   └── sounds/
├── lib/                     # libs globales (compartidos entre views)
│   └── {modulo}/main.dart
├── widget/                  # widgets globales (compartidos entre views)
│   └── {widget}/main.dart
└── view/
    └── {vista}/
        ├── main.dart
        ├── lib/{modulo}/main.dart
        └── widget/{widget}/
            ├── main.dart
            ├── lib/{modulo}/main.dart
            └── widget/{hijo}/main.dart
```

- **Encapsulación por contexto**: lo que se usa dentro de un solo view vive dentro de ese view. Solo lo compartido entre views sube a global. El patrón se repite recursivamente en cada profundidad.
- **Carpetas raíz prohibidas**: `models/`, `utils/`, `helpers/`, `constants/`, `providers/`. Las carpetas dump genéricas fragmentan el contexto — el contenido vive al lado de donde se usa.
- **FlutterWind para estilos**: usar `.className('...')` con clases Tailwind. NO usar `TextStyle(...)`, `BoxDecoration(...)`, `Container(color: ...)` ni propiedades manuales si existe equivalente en FlutterWind. Antes de cualquier widget, verificar si el estilo se resuelve con `.className()`.
- **Naming**: archivos y carpetas `snake_case`; archivo principal de cada módulo/widget/view es siempre `main.dart`; nombres de clase `PascalCase` (convención Dart).
- **Comandos de ejecución**: `flutter run --hot` (sin `&`, sin `nohup`). Hot reload manual: `kill -SIGUSR2 $(pgrep -f "flutter_tools.snapshot run")`.
- **Verificación de procesos**: `pgrep` puede devolver PIDs zombies. Antes de reportar un proceso vivo, confirmar con `ps -p PID -o args=`. Para limpiar, listar con `ps aux | grep ...`, identificar zombies, matar uno por uno con `kill -9 PID`. NUNCA usar `pkill -9` (mata todo lo que matchee, incluidos procesos válidos).
- **Logcat**: solo con `run_in_background: true` del tool Bash. NO usar `&` ni `nohup`. Comando: `adb logcat --pid=$(adb shell pidof -s com.arcaelas.ai)`.
- **Package name** de la app: `com.arcaelas.ai` (no `com.arcaelas.arko`).
- **Copy en UI**: textos, labels y sugerencias deben corresponder a funcionalidades reales del código. NO inventar capacidades. Demos/previews reflejan lo que realmente pasa en producción.

---

## 4. Control flow

- **Early returns son violación absoluta**. NO es preferencia estética — es prohibición dura. Los early returns desperdician el tiempo del usuario y fuerzan correcciones. Cada condición usa llaves. Cada rama es **explícita y afirmativa**. Sin excepciones, sin atajos, sin "una sola línea".

  ```ts
  // BIEN — bloque explícito afirmativo
  if (store.has(key)) {
      return store.get(key)
  }

  // BIEN — negación para idempotencia
  if (!store.has(key)) {
      store.set(key, value)
  }
  const stored = store.get(key)!

  // MAL — early return (violación crítica)
  if (!store.has(key)) return
  return store.get(key)

  // MAL — early return con negación
  if (user.type !== "premium") return 0
  return amount * 0.15
  ```

- **`throw` como fallback, nunca como leading negation**. Los errores se lanzan como **terminal fallback** de la función — después del bloque afirmativo de éxito. Liderar con el camino afirmativo; el throw queda al final como "else implícito". NO liderar una función con `if (!x) throw ...` — eso es early-return disfrazado.

  ```ts
  // BIEN (afirmativo + throw fallback)
  async function get_owner_email(id: string): Promise<string> {
      const user = await User.findByPk(id);
      if (user?.email) {
          return user.email;
      }
      throw new Error('User not found or has no email');
  }

  // MAL (leading negation)
  async function get_owner_email(id: string): Promise<string> {
      const user = await User.findByPk(id);
      if (!user) throw new Error('User not found');
      if (!user.email) throw new Error('User has no email');
      return user.email;
  }
  ```

- **Optional chaining + validación afirmativa explícita**: `?.` permitido para navegar estructuras posiblemente-null. Después de extraer el valor, validar con `if`-block afirmativo y actuar dentro de él. NO atajar silenciosamente.

- **Variantes disfrazadas también prohibidas como leading guards**: `if (!x) return null`, `if (!x) throw ...`, `x || throw ...`, `return !x ? null : x.value`. Las mismas construcciones son **aceptables como terminal fallbacks** al final de la función (ej: `return user?.email ?? DEFAULT`).

- **Negaciones solo para idempotencia**: `!cond` autorizado **únicamente** para garantizar idempotencia (asegurar que algo se hace una sola vez). Fuera de ese caso, preferir condiciones afirmativas.

- **Ternarios — atómicos solamente**: una condición, una línea, trivialmente legible. De lo contrario, usar `if/else` o un object map. NO ternarios anidados.

  ```ts
  // BIEN
  const role = instance.name === 'Admin' ? 'admin' : 'member';

  // MAL — if/else corto que asigna un valor
  let role;
  if (instance.name === 'Admin') {
      role = 'admin';
  } else {
      role = 'member';
  }
  ```

- **Object maps sobre `switch`**: reemplazar `switch` y cadenas largas de `if/else` para dispatch de valores con un `Record`. Usar `Map` cuando las claves son dinámicas. La tabla de mapeo es estructura de datos, no lógica de control.

  ```ts
  // BIEN (Record + ??)
  const ROLE_LABELS: Record<string, string> = {
      Admin: 'Administrador',
      Member: 'Miembro',
      Guest: 'Invitado',
  };
  const role_label = (name: string) => ROLE_LABELS[name] ?? 'Desconocido';

  // BIEN (Map dinámico)
  const role_labels = new Map<string, string>([
      ['Admin', 'Administrador'],
      ['Member', 'Miembro'],
  ]);
  role_labels.get(name) ?? 'Desconocido';

  // MAL (switch)
  function role_label(name: string): string {
      switch (name) {
          case 'Admin': return 'Administrador';
          case 'Member': return 'Miembro';
          case 'Guest': return 'Invitado';
          default: return 'Desconocido';
      }
  }
  ```

  El Record/Map es más fácil de extender, testear, iterar y serializar. El switch tiene boilerplate (`case/return/break`) y dispersa el mapeo. Si cada case requiere lógica compleja (varios statements, llamadas async), `switch` o `if/else` explícito puede justificarse.

---

## 5. Composition and reuse patterns

- **NO extraer operaciones triviales en helpers**. El usuario odia activamente los helpers triviales. Un `replace`, `match`, validación de 2 líneas, `.toLowerCase().trim()`, `string.split(',')`, ternario simple — van **inline en el call site**. Envolverlos en `formatX`, `validateY`, `parseZ` agrega capa sin comportamiento, sin estado, sin reuso — solo indirección.

  Test para "¿este helper se justifica?":
  - ¿La operación es **no-obvia** en el call site?
  - ¿Se usa en **3+ lugares** con la **misma forma exacta**?
  - ¿Encapsula **estado, side effects u orquestación**?

  Si las tres respuestas son "no", la operación va inline. NO inventar helpers preventivamente "por si los necesitamos después".

  ```ts
  // BIEN (inline en call site)
  @BeforeCreate
  static normalize(instance: User) {
      if (instance.phone) {
          instance.phone = instance.phone.replace(/\D/g, '');
      }
  }

  // MAL (helper trivial extraído)
  function sanitize_phone(phone: string): string {
      return phone.replace(/\D/g, '');
  }

  @BeforeCreate
  static normalize(instance: User) {
      if (instance.phone) {
          instance.phone = sanitize_phone(instance.phone);
      }
  }
  ```

  La regla de los 3 usos idénticos es estricta: si en 2 lugares se hace `phone.replace(/\D/g, '')` y en un tercero `phone.replace(/\s/g, '')`, NO son el mismo helper.

- **Las abstracciones se justifican solo si encapsulan comportamiento completo**. Un componente de 4 líneas que mapea status a color es microfragmentación, no abstracción. Un componente que gestiona conexión SSE, formulario, sincronización y eventos sí lo es: aísla una unidad funcional completa con estado y ciclo de vida propios.

  ```tsx
  // BIEN — abstracción válida
  <WhatsApp
      phone={phone}
      workspace={workspace_id}
      onOpen={() => {}}
      onClose={() => {}}
  />
  // internamente: SSE, formulario de registro, pin de sincronización, eventos.

  // MAL — abstracción sin comportamiento
  function StatusChip({ status }: { status: string }) {
      const color = status === 'active' ? 'success' : 'default'
      return <Chip label={status} color={color} />
  }
  // 4 líneas, un solo uso, sin lógica. Va inline donde se necesite.
  ```

- **Componer variantes, no duplicar infraestructura**. Si una funcionalidad se puede construir sobre otra existente, compón. NO mantener infraestructura paralela para variantes del mismo comportamiento. `once()` es `listen()` que se desuscribe después del primer llamado — no necesita su propio `Set`, `ref`, ni lógica de limpieza.

  ```ts
  // BIEN (once compone listen)
  class Bus extends EventTarget {
      listen<T>(event: string, fn: (data: T) => void) {
          const handler = (e: Event) => fn((e as CustomEvent<T>).detail);
          this.addEventListener(event, handler);
          return () => this.removeEventListener(event, handler);
      }
      once<T>(event: string, fn: (data: T) => void) {
          const off = this.listen<T>(event, (data) => {
              off();
              fn(data);
          });
          return off;
      }
  }

  // MAL (once con su propio tracking)
  class Bus extends EventTarget {
      private once_handlers = new Map<string, Set<Function>>();
      once<T>(event: string, fn: (data: T) => void) {
          if (!this.once_handlers.has(event)) this.once_handlers.set(event, new Set());
          this.once_handlers.get(event)!.add(fn);
          // ...handler con remove + delete duplicado
      }
  }
  ```

  Si `listen()` cambia (filtro, prioridad, namespace), `once()` lo hereda gratis. La regla aplica también para `subscribe_with_initial`, `fetch_with_cache`, `query_paginated`: si tu método "extendido" tiene 80% del cuerpo igual al base, está mal.

- **Métodos privados solo para encapsulación, no para fragmentar**. Métodos privados (`_snake_case`) están permitidos solo cuando encapsulan estado interno compartido por múltiples métodos públicos. Están **prohibidos** cuando se usan para fragmentar la lógica de un método público en helpers que solo se llaman una vez. Cada método público debe ser self-contained.

  ```ts
  class PaymentService {
      // BIEN — accede a estado interno compartido
      private _build_headers(): Record<string, string> {
          return { Authorization: `Bearer ${this._token}` }
      }

      // MAL — solo lo llama charge(), debería estar inline
      private _validate_amount(amount: number) {
          if (amount <= 0) throw new Error("Invalid")
      }

      charge(amount: number) {
          if (amount <= 0) throw new Error("Invalid") // inline, self-contained
          const headers = this._build_headers()       // encapsulación reutilizable
      }
  }
  ```

- **Reutilización directa sin wrappers triviales** (CRUD methods reciclan `get`). Un método simple `get(id)` se reusa desde `update`, `delete`. NO crear capas intermedias como `get_by_id` que solo son wrappers de `get` o viceversa.

  ```ts
  // BIEN
  class ProductService {
      get(id: string): Product {
          const product = db.products.findUnique({ where: { id } })
          if (!product) throw new Error("Not found")
          return product
      }
      create(data: CreateInput): Product {
          return db.products.create({ data })
      }
      update(id: string, data: UpdateInput): Product {
          this.get(id)
          return db.products.update({ where: { id }, data })
      }
      delete(id: string): void {
          this.get(id)
          db.products.delete({ where: { id } })
      }
  }

  // MAL — wrapper trivial sobre get_by_id
  function get_by_id(id) { ... }
  function get(id) { return get_by_id(id) }
  function update(id, options) {
      const item = get_by_id(id)
      // ...
  }
  ```

- **Operaciones atómicas inline**. Si una operación es atómica y el lector entiende sin línea dedicada, va inline. Incrementos, cálculos simples, asignaciones directas no se desglosan en pasos separados cuando el contexto los hace obvios.

  ```ts
  // BIEN (inline)
  timer = setTimeout(connect, Math.min(retries++ * 3_000, MAX_DELAY));

  // MAL (desglosar lo que se entiende junto)
  const delay = Math.min(retries * 3_000, MAX_DELAY);
  retries++;
  timer = setTimeout(connect, delay);
  ```

- **Async dentro de scope síncrono → IIFE**. Si defines una función async y la llamas inmediatamente en el mismo scope, una IIFE elimina la separación artificial. Declarar y luego llamar son dos pasos para una sola intención: ejecutar esta lógica ahora.

  ```ts
  // BIEN (IIFE async)
  useEffect(() => {
      (async () => {
          const res = await fetch('/api/users');
          set_users(await res.json());
      })();
  }, []);

  // MAL (función nombrada + llamada inmediata)
  useEffect(() => {
      const load = async () => {
          const res = await fetch('/api/users');
          set_users(await res.json());
      };
      load();
  }, []);
  ```

  Si la función se reusa o se le pasa como referencia (cleanup, otro handler), entonces sí tiene sentido nombrarla.

- **Compound assignment operators** (`??=`, `||=`, `&&=`) sobre reasignación manual.

  ```ts
  // BIEN
  options.where ||= {};
  options.timeout ||= 5000;
  user.preferences ??= defaults;
  flags.dirty &&= validate(state);

  // MAL
  options.where = options.where || {};
  user.preferences = user.preferences ?? defaults;
  if (flags.dirty) flags.dirty = validate(state);
  ```

  - `||=` asigna si el actual es falsy (`null`, `undefined`, `0`, `''`, `false`, `NaN`).
  - `??=` asigna solo si el actual es nullish (`null` o `undefined`). Respeta `0`, `''`, `false`.
  - `&&=` asigna solo si el actual es truthy (útil para "actualizar solo si ya existe").

- **Optional call** `?.()` en lugar de guards explícitos `if (fn) fn()` o `typeof fn === 'function'`.

  ```ts
  // BIEN
  callback?.(value);
  on_change?.(value);
  config.logger?.warn('deprecated');
  items.find((x) => x.id === id)?.activate();

  // MAL
  if (callback) {
      callback(value);
  }
  if (typeof on_change === 'function') {
      on_change(value);
  }
  const item = items.find((x) => x.id === id);
  if (item) item.activate();
  ```

- **Optional chaining + nullish coalescing** en una sola expresión sobre ifs anidados.

  ```ts
  // BIEN
  return json.user?.name ?? 'Unknown';

  // MAL
  if (json.user) {
      if (json.user.name) {
          return json.user.name;
      }
  }
  return 'Unknown';
  ```

- **Spread con default inline** sobre guards imperativos.

  ```ts
  // BIEN
  options.where = {
      ...options.where,
      expired_at: options.expired_at ?? { [Op.gt]: new Date() },
  };

  // MAL
  if (!options.where) {
      options.where = {};
  }
  options.where.expired_at = { [Op.gt]: new Date() };
  ```

  Spread sobre `undefined` es vacío — no requiere guard previo. Mover los flags de override a propiedades top-level del options object (ej. `options.expired_at`) en vez de mezclarlos con el `where` general; el override queda explícito y separable.

- **Spread condicional inline** `...(cond && { key: value })` sobre construir objeto base + mutar con `if`.

  ```ts
  // BIEN
  const payload = {
      id: instance.id,
      name: instance.name,
      ...(instance.email && { email: instance.email }),
      ...(instance.phone && { phone: instance.phone }),
  };

  // MAL
  const payload: any = { id: instance.id, name: instance.name };
  if (instance.email) payload.email = instance.email;
  if (instance.phone) payload.phone = instance.phone;
  ```

- **`flatMap`** para aplanar arrays de arrays (un item produce N items).

  ```ts
  // BIEN
  const role_ids = users.flatMap((u) => u.roles.map((r) => r.id));

  // ACEPTABLE pero subóptimo
  const role_ids = users.map((u) => u.roles.map((r) => r.id)).flat();

  // MAL
  const role_ids: string[] = [];
  for (const user of users) {
      for (const role of user.roles) {
          role_ids.push(role.id);
      }
  }
  ```

  `flatMap` es una sola pasada (vs `map().flat()` que itera dos veces). Aplica para extraer relaciones, expandir listas y cualquier transformación 1→N.

- **`.map().filter(Boolean)`** para recopilar valores no-nulos.

  ```ts
  // BIEN
  const tokens = sessions.map((s) => s.fcm).filter(Boolean);

  // MAL
  const tokens = [];
  for (const s of sessions) {
      if (s.fcm) tokens.push(s.fcm);
  }
  ```

  Si TS marca error por tipos, agregar cast `as string[]` o type guard `.filter((x): x is string => Boolean(x))`.

- **Promise.all con ramas condicionales `&&` inline** sobre acumular tasks con `if`/`push`.

  ```ts
  // BIEN
  await Promise.all([
      instance.email && VerificationCode.create({ email: instance.email, ... }),
      instance.phone && VerificationCode.create({ phone: instance.phone, ... }),
  ]);

  // MAL
  const tasks = [];
  if (instance.email) {
      tasks.push(VerificationCode.create({ email: instance.email, ... }));
  }
  if (instance.phone) {
      tasks.push(VerificationCode.create({ phone: instance.phone, ... }));
  }
  await Promise.all(tasks);
  ```

  `Promise.all` ignora valores falsy. El cortocircuito JS evita la creación de la promesa cuando la condición es falsa.

- **Destructuring profundo con defaults y rename inline**.

  ```ts
  // BIEN
  const {
      data: {
          limit = 100,
          offset = 0,
          user: { name: user_name = 'unknown' } = {},
      },
  } = response;

  // MAL
  const data = response.data;
  const limit = data.limit !== undefined ? data.limit : 100;
  const user_name = data.user && data.user.name ? data.user.name : 'unknown';
  ```

  - `key = default` aplica el default si la propiedad es `undefined`.
  - `key: nuevo_nombre` renombra durante el destructuring.
  - `nested: { ... } = {}` previene crash cuando el objeto intermedio es undefined.

- **Parameter properties** en constructores TypeScript para campos primitivos. Usar **constructor body** cuando se necesita normalizar, derivar o inicializar sub-propiedades.

  ```ts
  // BIEN — parameter properties para campos simples
  class User {
      constructor(
          public readonly id: string,
          public name: string,
          public email: string | null,
      ) {}
  }

  // BIEN — body cuando hay objetos a estructurar
  class Workspace {
      public readonly id: string;
      public name: string;
      public config: { theme: string; lang: string };

      constructor(input: WorkspaceInput) {
          this.id = input.id;
          this.name = input.name.trim();
          this.config = {
              theme: input.theme ?? 'light',
              lang: input.lang ?? 'es',
          };
      }
  }

  // MAL — declarar y reasignar todo aunque sean primitivos
  class User {
      public id: string;
      public name: string;
      constructor(id: string, name: string) {
          this.id = id;
          this.name = name;
      }
  }
  ```

  Regla: si el cuerpo solo asignaría, usa parameter properties; si transforma, usa body.

- **Method chaining (fluent API)** en builders/DSL. Métodos mutadores retornan `this` (con tipo `this`).

  ```ts
  // BIEN
  class QueryBuilder {
      where(field: string, value: any): this {
          this.conditions.push({ field, value });
          return this;
      }
      limit(n: number): this {
          this.limit_value = n;
          return this;
      }
      execute() { ... }
  }

  const result = new QueryBuilder()
      .where('id', 1)
      .where('active', true)
      .limit(10)
      .execute();

  // MAL
  const qb = new QueryBuilder();
  qb.where('id', 1);
  qb.where('active', true);
  qb.limit(10);
  const result = qb.execute();
  ```

  Tipo de retorno `this` (no la clase concreta) para que subclases mantengan chaining con su propio tipo. Solo aplica a mutadores. Útil en builders, configuradores, DSL declarativos, query builders, request chains.

---

## 6. TypeScript types and patterns

- **`satisfies` operator** (TS 4.9+) para validar shape sin perder los tipos literales. NO usar type annotation `: Type` cuando se quiere mantener inferencia precisa.

  ```ts
  // BIEN
  const STATUS_LABELS = {
      active: 'Activo',
      pending: 'Pendiente',
      archived: 'Archivado',
  } satisfies Record<string, string>;
  // STATUS_LABELS.active es 'Activo' (literal, no string)

  // MAL
  const STATUS_LABELS: Record<string, string> = {
      active: 'Activo',
      pending: 'Pendiente',
      archived: 'Archivado',
  };
  // STATUS_LABELS.active es `string` (perdimos 'Activo')
  ```

  Combinación común con `as const`:
  ```ts
  const ROUTES = {
      users: '/v1/users',
      auth: { login: '/v1/auth/login', logout: '/v1/auth/logout' },
  } as const satisfies Record<string, string | Record<string, string>>;
  ```

  Type annotation hace cast hacia el tipo (widening, perdiendo información). `satisfies` valida que el valor cumple el contrato sin alterar el tipo inferido.

- **Narrowing: `as` casting + validación inline** sobre type predicates extraídos en helpers triviales.

  ```ts
  // BIEN — as cast + validación inline
  function process(item: unknown): string {
      const user = item as User;
      if (typeof user.email !== 'string') {
          throw new Error('Not a user');
      }
      return user.email;
  }

  // MAL — type guard auxiliar disperso
  function is_user(item: unknown): item is User {
      return typeof item === 'object'
          && item !== null
          && 'email' in item
          && typeof (item as any).email === 'string';
  }
  function process(item: unknown): string {
      if (is_user(item)) {
          return item.email;
      }
      throw new Error('Not a user');
  }
  ```

  Cuando SÍ extraer type guard:
  - El guard se usa en 3+ lugares con la misma forma exacta.
  - La lógica de narrowing es compleja (varios checks, recursión).
  - Se requiere narrowing en `switch`/discriminated unions con muchas ramas.

- **Branded / nominal types** para diferenciar strings con significado distinto (IDs, emails, phones, hashes, tokens, monedas, unidades).

  ```ts
  // BIEN
  type Brand<T, B> = T & { __brand: B };
  type UserId = Brand<string, 'UserId'>;
  type WorkspaceId = Brand<string, 'WorkspaceId'>;
  type Email = Brand<string, 'Email'>;
  type Phone = Brand<string, 'Phone'>;

  function get_user(id: UserId): User { ... }
  function send_to(email: Email, msg: string) { ... }

  const id = 'uuid-123' as UserId;
  const email = 'a@b.com' as Email;

  get_user(email);    // ERROR: Email is not UserId
  send_to(id, 'hi');  // ERROR: UserId is not Email

  // MAL
  function get_user(id: string): User { ... }
  function send_to(email: string, msg: string) { ... }
  // Compila pero bug runtime
  ```

  El cast `as Brand<...>` ocurre solo en el punto donde se valida el formato (parser, schema, factory). Después de validar, el branded type viaja por el sistema sin re-validación.

- **Variantes de búsqueda con discriminated union explícita**. NO funciones separadas (`get_user_by_email`, `get_user_by_phone`), NO filter object con keys opcionales.

  ```ts
  // BIEN (DU con tag)
  type UserLookup =
      | { by: 'id'; value: string }
      | { by: 'email'; value: string }
      | { by: 'phone'; value: string };

  function get_user(lookup: UserLookup): User | null { ... }

  get_user({ by: 'email', value: 'a@b.com' });
  get_user({ by: 'id', value: 'uuid-123' });

  // MAL (funciones con sufijo)
  function get_user_by_id(id: string) { ... }
  function get_user_by_email(email: string) { ... }
  function get_user_by_phone(phone: string) { ... }

  // MAL (filter object con keys opcionales)
  function get_user(filter: { id?: string; email?: string; phone?: string }) { ... }
  ```

  La DU fuerza al caller a especificar exactamente UN criterio. El switch interno por `lookup.by` se exhaustive-checks: si agregas `phone_e164`, TS marca el switch.

- **Result type con clases** para modelar operaciones que pueden fallar. Clase abstracta con subclases (`OkResult`/`ErrResult`) sobre discriminated union pura — la clase encapsula métodos (`is_ok`, `unwrap`, `map`).

  ```ts
  // BIEN (clases hermanas)
  abstract class Result<T> {
      abstract is_ok(): boolean;
      abstract unwrap(): T;
  }
  class OkResult<T> extends Result<T> {
      constructor(public data: T) { super(); }
      is_ok() { return true; }
      unwrap() { return this.data; }
  }
  class ErrResult<T> extends Result<T> {
      constructor(public error: string) { super(); }
      is_ok() { return false; }
      unwrap(): T { throw new Error(this.error); }
  }

  const result = parse(input);
  if (result.is_ok()) {
      use(result.unwrap());
  }

  // MAL (DU pura sin métodos)
  type Result<T> =
      | { ok: true; data: T }
      | { ok: false; error: string };

  if (result.ok) use(result.data);
  else log(result.error);
  ```

  Heurística general: si el tipo lleva métodos específicos por variante, usa **clases**; si es solo una forma de datos para pasar entre funciones, usa **DU**. La regla "DU sobre herencia" aplica a parámetros/inputs; para outputs/resultados con comportamiento asociado, las clases ganan.

- **Utility types (`Partial`, `Pick`, `Omit`, etc.)** sobre duplicar interfaces. Un cambio en la interface base se propaga automáticamente a los tipos derivados.

  ```ts
  // BIEN
  interface UserCreateInput {
      email: string;
      name: string;
      password: string;
  }

  type UserUpdateInput = Partial<UserCreateInput>;
  type UserPublic = Omit<UserCreateInput, 'password'>;
  type UserAuth = Pick<UserCreateInput, 'email' | 'password'>;
  type UserSearch = Partial<Pick<UserCreateInput, 'email' | 'name'>>;

  // MAL — duplicación
  interface UserUpdateInput {
      email?: string;
      name?: string;
      password?: string;
  }
  interface UserPublic {
      email: string;
      name: string;
  }
  ```

  Utility types comunes:
  - `Partial<T>` — todos los campos opcionales.
  - `Required<T>` — todos los campos requeridos.
  - `Readonly<T>` — todos los campos readonly.
  - `Pick<T, K>` — solo los campos K.
  - `Omit<T, K>` — todos los campos menos K.
  - `Record<K, V>` — objeto con keys K y valores V.
  - `Exclude<T, U>` — quita U de T (en uniones).
  - `Extract<T, U>` — solo U de T (en uniones).
  - `ReturnType<F>` — el tipo de retorno de F.
  - `Parameters<F>` — tupla de parámetros de F.
  - `Awaited<T>` — desempaca `Promise<T>`.

- **Tipado estricto, prohibido `any`**. Siempre tipar parámetros, retornos y estructuras de datos. Anotaciones explícitas en funciones públicas. Evitar inferencia ambigua en APIs públicas.

---

## 7. Data structures

- **Estructura correcta para el problema**. Si necesitas agrupar por ID y deduplicar valores, `Map` y `Set` existen para eso. Forzar arrays con `find()` para buscar, `includes()` para deduplicar y `reduce()` para iterar es la herramienta equivocada. `Map` agrupa por clave sin buscar, `Set` deduplica sin filtrar, `for...of` itera sin acumular. Al final conviertes a plano para el consumidor.

  ```ts
  // BIEN — estructura correcta
  const orgs = new Map();
  for (const role of roles) {
      if (!orgs.has(org.id)) orgs.set(org.id, { ...org, workspaces: new Map() });
      if (!o.workspaces.has(ws.id)) o.workspaces.set(ws.id, { ...ws, permission: new Set() });
      o.workspaces.get(ws.id)!.permission.add(p.name);
  }
  const result = [...orgs.values()].map(o => ({
      ...o,
      workspaces: [...o.workspaces.values()].map(w => ({
          ...w,
          permission: [...w.permission],
      })),
  }));

  // MAL — forzar arrays donde no corresponden
  roles.reduce((acc, role) => {
      let org = acc.find(o => o.id === id);
      ws.permission.push(...perms.filter(n => !ws.permission.includes(n)));
      return acc;
  }, [])
  ```

- **Lookup repetido en array → pre-construir Map** (evitar O(n*m)).

  ```ts
  // BIEN (O(n+m))
  const userByEmail = new Map(users.map((u) => [u.email, u]));
  for (const inv of invitations) {
      const user = userByEmail.get(inv.email);
      // ...
  }

  // MAL (O(n*m))
  for (const inv of invitations) {
      const user = users.find((u) => u.email === inv.email);
      // ...
  }
  ```

  Si la clave es compuesta, usar string key concatenada (`Map<string, T>` con `${a}|${b}`).

- **Convertir array a diccionario/objeto indexado** con `Object.fromEntries(arr.map(item => [key, value]))`. Si los lookups son frecuentes con `.get()`, usar `new Map(arr.map(...))` directamente.

  ```ts
  // BIEN (objeto plano)
  const wsByRole = Object.fromEntries(
      newRoles.map((r) => [r.id, r.id_workspace]),
  );

  // BIEN (Map para lookups frecuentes)
  const wsByRole = new Map(
      newRoles.map((r) => [r.id, r.id_workspace]),
  );

  // MAL (imperativo)
  const wsByRole: Record<string, string> = {};
  for (const r of newRoles) {
      wsByRole[r.id] = r.id_workspace;
  }
  ```

  `Map` cuando hay `.get()` repetido (mejor performance, mejor API). `Object.fromEntries` cuando el resultado se serializa a JSON o se itera con `Object.entries/keys`.

---

## 8. Native APIs over external libraries

- **APIs nativas se prefieren sobre dependencias externas**. Menos dependencias = menos mantenimiento, menos auditoría, menos superficie de ataque.

  ```ts
  // BIEN — APIs nativas
  const id = crypto.randomUUID()
  const data = await fetch(url).then(r => r.json())
  const hash = crypto.createHash("sha256").update(text)
  const formatted = new Intl.DateTimeFormat("es").format(date)

  // MAL — librería innecesaria
  import { v4 } from "uuid"          // crypto.randomUUID() existe
  import moment from "moment"        // Intl.DateTimeFormat existe
  import _ from "lodash"             // Array/Object methods existen
  ```

- **UUIDs**: `crypto.randomUUID()` (de `node:crypto` en Node, global en browsers modernos) sobre `uuid`.

  ```ts
  // BIEN
  import { randomUUID } from 'node:crypto';
  const id = randomUUID();

  // MAL
  import { v4 as uuidv4 } from 'uuid';
  const id = uuidv4();
  ```

  Solo justificar `uuid` si necesitas v1 (timestamp-based) o v3/v5 (namespace-based) — `randomUUID` es solo v4.

- **NO reimplementar primitivas del runtime**. Si necesitas pub/sub en el browser, `EventTarget` ya existe. NO crear `Set`s manuales con funciones dispatch que iteran y limpian. Menos código, menos bugs, y el runtime lo optimiza mejor.

  ```ts
  // BIEN — extender primitiva nativa
  class Bus extends EventTarget {
      on<T>(event: string, fn: (data: T) => void) {
          const handler = (e: Event) => fn((e as CustomEvent<T>).detail);
          this.addEventListener(event, handler);
          return () => this.removeEventListener(event, handler);
      }
      emit<T>(event: string, data: T) {
          this.dispatchEvent(new CustomEvent(event, { detail: data }));
      }
  }

  // MAL — manual Set + dispatch
  class Bus {
      private listeners = new Set<(data: any) => void>();
      on(fn: (data: any) => void) {
          this.listeners.add(fn);
          return () => this.listeners.delete(fn);
      }
      emit(data: any) {
          for (const fn of this.listeners) fn(data);
      }
  }
  ```

  El runtime ya optimiza `EventTarget`. Reimplementarlo significa: gestionar Set propio, manejar errores en handlers, evitar mutación durante iteración, perder soporte nativo de typing por evento, perder bubbling/capture.

---

## 9. Frontend architecture

- **Hooks fundacionales: `useAuth` + `useWorkSpace`**. La arquitectura frontend se sostiene sobre pocos hooks fundamentales. `useAuth` determina el usuario autenticado, sus datos y permisos. `useWorkSpace` determina el workspace activo (por URL o info del usuario) y define los permisos en ese contexto. Todo lo demás se resuelve vía API. El frontend NO duplica lógica que ya vive en el backend.

  ```tsx
  // BIEN — dos hooks centrales, el resto es API
  function TicketList() {
      const { user } = useAuth()
      const { workspace, permissions } = useWorkSpace()
      const [tickets, set_tickets] = useState([])

      useEffect(() => {
          api.get(`/workspaces/${workspace.id}/tickets`).then(set_tickets)
      }, [workspace.id])

      return (
          <List>
              {permissions.can_create && <Button onClick={create_ticket}>Nuevo</Button>}
              {tickets.map((t) => <TicketRow key={t.id} ticket={t} />)}
          </List>
      )
  }

  // MAL — hook custom para cada entidad que duplica lógica del backend
  function useTickets() { ... }
  function useTicketActions() { ... }
  function useTicketFilters() { ... }
  ```

- **Si el framework lo resuelve, NO se reimplementa**. MUI provee `IconButton`, `startIcon`, `endIcon`, sistema de spacing, paleta y tipografía. Crear wrappers que solo reexponen lo que MUI ya ofrece añade capa sin comportamiento nuevo. La personalización solo se justifica cuando hay razón funcional concreta que MUI no cubre.

  ```tsx
  // BIEN
  import EditIcon from '@mui/icons-material/Edit'
  import { IconButton, Button, Chip } from '@mui/material'

  <IconButton onClick={on_edit}><EditIcon /></IconButton>
  <Button startIcon={<EditIcon />}>Editar</Button>
  <Chip label={status} color={status === 'active' ? 'success' : 'default'} />

  // MAL — wrappers sin comportamiento nuevo
  function Icon({ name, ...props }) {
      const icons = { edit: EditIcon, delete: DeleteIcon }
      const Component = icons[name]
      return <Component {...props} />
  }
  ```

- **Convenciones del framework antes de inventar**. Los frameworks tienen convenciones estructurales que resuelven problemas comunes. En Next.js, los archivos con `@` (como `@drawer`) permiten inyectar componentes paralelos en el layout. Si el framework ofrece patrón para drawers, modals o sidebars contextuales, se usa esa convención.

  ```tsx
  // BIEN — usar @drawer de Next.js
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

  // MAL — Sidebar custom ignorando la convención
  import Sidebar from '@/components/Sidebar'
  export default function Layout({ children }) {
      return (
          <Box sx={{ display: 'flex' }}>
              <Sidebar items={[...]} activeItem={...} onNavigate={...} />
              <Box component="main">{children}</Box>
          </Box>
      )
  }
  ```

- **Complejidad proporcional al problema**. Si el problema real es fetch + render + acciones básicas, el código debe reflejar esa simplicidad. Un listado con filtros y acciones no necesita múltiples capas, hooks custom, ni funciones dispersas. Cuando la lógica no supera `useState + useEffect + render`, la implementación tampoco debe superarlo.

  ```tsx
  // BIEN
  function TicketList() {
      const [tickets, set_tickets] = useState([])
      const [loading, set_loading] = useState(true)

      useEffect(() => {
          api.get('/tickets').then(set_tickets).finally(() => set_loading(false))
      }, [])

      return (
          <Table
              loading={loading}
              data={tickets}
              renderItem={(t) => <TicketRow ticket={t} />}
              actions={(t) => [
                  { label: 'Abrir', onClick: () => navigate(t.id) },
                  { label: 'Eliminar', onClick: () => remove(t.id) },
              ]}
          />
      )
  }

  // MAL — capas innecesarias
  function TicketList() {
      const { tickets, loading, filters, actions } = useTickets()
      const { sorted } = useTicketSort(tickets)
      const { filtered } = useTicketFilters(sorted, filters)
      const { paginated } = useTicketPagination(filtered)
      return <TicketTable data={paginated} actions={actions} />
  }
  ```

- **Consistencia entre vistas equivalentes**. Vistas que resuelven el mismo problema (fetch + lista + acciones) siguen el mismo patrón de composición. NO mezclar infinite scroll en una pantalla y paginación manual en otra. NO usar custom `useTickets()` en una pantalla y `fetch` directo en otra. Loading, empty y error estructuras son idénticas en toda la familia.

  ```tsx
  // BIEN — Ticket y Client siguen el mismo patrón
  function TicketList() {
      const [items, set_items] = useState([])
      return <VirtualList data={items} renderItem={(t) => <TicketRow ticket={t} />} />
  }
  function ClientList() {
      const [items, set_items] = useState([])
      return <VirtualList data={items} renderItem={(c) => <ClientRow client={c} />} />
  }

  // MAL — cada vista inventa su propia estructura
  function TicketList() {
      return <div onScroll={handle_scroll}>{tickets.map(...)}</div>
  }
  function ClientList() {
      return <Table pagination={{ page, onChange: set_page }}>{clients.map(...)}</Table>
  }
  ```

- **Dashboard: cada card es autónoma**. Cada tarjeta hace su propio fetch, maneja su propio loading con `Skeleton`, y renderiza su métrica específica. NO usar una sola API que devuelva todos los datos. Cada card es independiente: si una falla o tarda, las demás siguen funcionando.

  ```tsx
  // BIEN — cada card autónoma
  function TicketCountCard() {
      const [count, set_count] = useState(0)
      const [loading, set_loading] = useState(true)

      useEffect(() => {
          api.get('/metrics/tickets/count').then(set_count).finally(() => set_loading(false))
      }, [])

      if (loading) return <Skeleton variant="rectangular" height={120} />
      return <MetricCard title="Tickets abiertos" value={count} />
  }

  function Dashboard() {
      return (
          <Grid container spacing={2}>
              <Grid item><TicketCountCard /></Grid>
              <Grid item><RevenueCard /></Grid>
          </Grid>
      )
  }

  // MAL — una sola API que devuelve todo
  function Dashboard() {
      const [data, set_data] = useState(null)
      useEffect(() => { api.get('/dashboard').then(set_data) }, [])
      if (!data) return <Loading />
      return (
          <>
              <Card>{data.ticket_count}</Card>
              <Card>{data.revenue}</Card>
          </>
      )
  }
  ```

- **Enriquecer datos planos**. Los datos planos se enriquecen cruzando con otras APIs disponibles para agregar valor real a la vista. Si un ticket tiene `members` como lista de IDs y existe API de usuarios del workspace, se combinan para mostrar info útil: avatar, nombre, rol, acceso al perfil.

  ```tsx
  // BIEN — combinar APIs para enriquecer
  function MemberAvatar({ member_id, workspace_id }: Props) {
      const [user, set_user] = useState(null)
      return (
          <Tooltip
              title={user ? `${user.name} — ${user.role}` : 'Cargando...'}
              onOpen={() => {
                  if (!user) api.get(`/workspaces/${workspace_id}/users/${member_id}`).then(set_user)
              }}
          >
              <Avatar src={user?.avatar} />
          </Tooltip>
      )
  }

  // MAL — datos planos sin enriquecer
  function MemberList({ members }: { members: string[] }) {
      return (
          <Stack direction="row">
              {members.map((id) => <Avatar key={id}>{id.slice(0, 2)}</Avatar>)}
          </Stack>
      )
  }
  ```

---

## 10. API and HTTP patterns

- **Envelope estándar de respuesta**. Todas las APIs siguen `{ success: true, data: ... }` para éxito y `{ success: false, message: '...', cause: { code: '...' } }` para error. Listas paginadas usan `{ rows, count, offset, limit, order }` dentro de `data`. El cliente HTTP extrae `data` automáticamente — los consumidores reciben el payload directo.

  ```ts
  // Handler
  return res.success(user.toJSON());
  // → { success: true, data: { ... } }

  return res.success({ rows, count, offset, limit });
  // → { success: true, data: { rows: [...], count: 42, offset: 0, limit: 100 } }

  return res.error('Not found', 404, { code: 'ERR_NOT_FOUND' });
  // → { success: false, message: 'Not found', cause: { code: 'ERR_NOT_FOUND' } }

  // Cliente axios con interceptor
  const user = await api.get<IUser>('/users/123'); // recibe el `data` directamente

  // MAL — formatos libres
  res.json(user.toJSON());
  res.json({ users, total });
  res.status(404).json({ error: 'Not found' });
  ```

  El envelope estándar permite (1) interceptor único en el cliente HTTP, (2) errores tipados con `cause.code` para mensajes UI específicos, (3) consumidores reciben el payload directo sin destructuring repetido, (4) consistencia entre todos los endpoints.

- **Cliente HTTP con autenticación automática**. Centralizado en `src/lib/api/index.ts`. Axios con interceptors que inyectan token desde `localStorage`, redirect a `/login` en 401, extraen `data` de la respuesta estándar, y soportan genéricos TypeScript.

  ```ts
  // ./src/lib/api/index.ts
  import axios from 'axios'

  const client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30_000,
  })

  client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) config.headers.Authorization = `Bearer ${token}`
      }
      return config
  })

  client.interceptors.response.use(
      (res) => res.data?.data,
      (error) => {
          if (error.response?.status === 401) window.location.href = '/login'
          throw new APIError(error)
      }
  )

  export const api = {
      get: <T>(url: string, config?) => client.get<T>(url, config),
      post: <T>(url: string, body?, config?) => client.post<T>(url, body, config),
      put: <T>(url: string, body?, config?) => client.put<T>(url, body, config),
      patch: <T>(url: string, body?, config?) => client.patch<T>(url, body, config),
      del: (url: string, config?) => client.delete(url, config),
  }

  export default api
  ```

- **File-based routing para serverless**. En proyectos serverless (AWS Lambda, Next.js), cada carpeta es un segmento de URL. Parámetros dinámicos con `[param]`. Cada `index.ts`/`route.ts` exporta handlers HTTP como constantes. Alias `~/* → ./src/*` en tsconfig.

  ```
  src/
  ├── auth/
  │   ├── index.ts              # POST /v1/auth
  │   ├── challenge/
  │   │   └── index.ts          # POST /v1/auth/challenge
  │   └── keys/
  │       ├── index.ts          # GET/POST /v1/auth/keys
  │       └── [id]/
  │           └── index.ts      # DELETE /v1/auth/keys/{id}
  ├── chat/
  │   └── completions/
  │       └── index.ts          # POST /v1/chat/completions
  └── models/
      ├── index.ts              # GET /v1/models
      └── [id]/
          └── index.ts          # GET/DELETE /v1/models/{id}
  ```

  ```ts
  // ./src/chat/completions/index.ts
  import { http } from '~/app/lib/http'

  export const POST = http(async (req, res) => {
      res.success({ choices: [...] })
  })
  ```

- **Patrón de handlers HTTP**: cambia según el tipo de proyecto.

  - **Serverless / Next.js**: cada archivo exporta constantes por método HTTP.

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

  - **Express**: `http(pathname, handler)` con el nombre de la función como método.

    ```ts
    http('/users', async function GET(req, res, next) {
        const users = await User.all()
        res.success(users)
    })

    http('/users', async function POST(req, res, next) {
        const user = await User.create(req.body)
        res.success(user)
    })
    ```

- **`controller.ts` — Schemas Zod (4 por controller)**.

  - `schema.get` — output (toJSON a API). Solo valida forma, no transforma.
  - `schema.list` — input de paginación. Incluye FK parent + defaults (`offset: 0`, `limit: 100`, `order: "DESC"`).
  - `schema.create` — input de creación. Incluye FK parent + defaults que espejan `@Default` del modelo + sanitize.
  - `schema.update` — input de actualización. Incluye ID + todos opcionales + sanitize.

  Regla clave: `create` y `update` incluyen FK/ID para que `parsed.data` sea autocontenido y se pueda pasar directo a Sequelize.

- **CRUD methods reciclan `get()`**. En clases CRUD, `get()` valida existencia con bloque afirmativo (throw como fallback al final). `update()` y `delete()` reusan `get()` para validar antes de operar. `create()` delega directo al ORM sin validar existencia previa.

---

## 11. Async patterns and lifecycle

- **Cleanup de async ops con `AbortController`** sobre flags `destroyed` manuales. Para ops que pueden seguir corriendo tras unmount/desmontaje (fetch, SSE, polling, retry).

  ```ts
  // BIEN — AbortController
  useEffect(() => {
      const controller = new AbortController();
      (async () => {
          try {
              const res = await fetch('/api/queue', { signal: controller.signal });
              set_items(await res.json());
          } catch (err) {
              if (err.name !== 'AbortError') console.error(err);
          }
      })();
      return () => controller.abort();
  }, []);

  // BIEN — Promise.race con timeout
  const controller = new AbortController();
  const result = await Promise.race([
      fetch('/api/data', { signal: controller.signal }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
  ]);

  // MAL — flag destroyed en closure
  useEffect(() => {
      let destroyed = false;
      let timer: any;
      const poll = async () => {
          const data = await fetch('/api/queue');
          if (destroyed) return;
          set_items(await data.json());
          timer = setTimeout(poll, 5000);
      };
      poll();
      return () => { destroyed = true; clearTimeout(timer); };
  }, []);
  ```

  `AbortController` es la primitiva estándar para cancelación. Funciona con `fetch`, con `addEventListener` (signal), y se puede pasar a cualquier API que acepte signal. La respuesta del servidor recibe la señal y aborta — más limpio que descartar el resultado en el cliente.

- **SSR hydration con estado `mounted`**. Cuando un client component depende de APIs solo-browser (`window`, `localStorage`, `document`) para **render output**, renderizar `null` en el server pass para evitar hydration mismatch.

  ```ts
  const [mounted, set_mounted] = useState(false)
  useEffect(() => set_mounted(true), [])
  if (!mounted) return null
  ```

  Para acceso a datos dentro de event handlers o effects (no render), `typeof window !== 'undefined'` es suficiente.

---

## 12. Performance and re-renders

- **`memo()` solo para componentes con props computados**. `memo()` se usa cuando un componente recibe props que se calculan constantemente (objetos derivados, arrays filtrados, funciones recreadas). Si los props son valores inmutables o primitivos, NO es necesario.

  ```tsx
  // BIEN — props computados, memo necesario
  const filtered_users = users.filter(u => u.active)
  <UserList items={filtered_users} />  // filtered_users se recalcula en cada render

  function UserCard({ user, on_select }: UserCardProps) {
      return <div>{user.name}</div>
  }
  export default memo(UserCard)

  // BIEN — props inmutables, memo innecesario
  <StatusBadge label="active" color="green" />  // primitivos, no cambian

  // MAL — memo sin razón
  const Title = memo(({ text }: { text: string }) => <h1>{text}</h1>)
  // text es un string inmutable, memo no aporta nada
  ```

- **Estado muerto = re-renders innecesarios**. Si un `useState` no aparece en el JSX, no se pasa como prop y ningún efecto depende de él, NO debe existir. Cada `set_estado` es un re-render. Estado muerto es rendimiento desperdiciado y ruido en el código que engaña al lector.

  ```ts
  // BIEN — sin estado innecesario
  return { listen, once };

  // MAL — estado que nadie usa
  const [status, set_status] = useState<Status>("idle");
  set_status("connecting");   // re-render
  set_status("connected");    // re-render
  set_status("disconnected"); // re-render
  return useMemo(() => ({ listen, once, status }), [listen, once, status]);
  ```

  Si el valor solo se necesita en handlers/effects sin renderizarse, convertir a `useRef`.

---

## 13. Theme and i18n hooks

- **`useTheme` con prevención de FOUC**. Hook de tema dark/light con script `beforeInteractive` que lee preferencia de `localStorage` y aplica clase `dark` antes del mount de React. Detecta preferencia del sistema con `matchMedia`.

  ```ts
  // ./src/lib/hooks/use_theme/script.ts
  export const theme_initializer_script = `
    (function() {
      const saved = localStorage.getItem('theme')
      const prefers_dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (saved === 'dark' || (!saved && prefers_dark)) {
        document.documentElement.classList.add('dark')
      }
    })()
  `

  // ./src/app/layout.tsx
  <Script strategy="beforeInteractive">{theme_initializer_script}</Script>

  // ./src/lib/hooks/use_theme/index.ts
  export default function useTheme() {
      const [theme, setTheme] = useState<'light' | 'dark'>('light')
      const [mounted, setMounted] = useState(false)

      useEffect(() => {
          const saved = localStorage.getItem('theme')
          const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
          setTheme(saved || (prefers ? 'dark' : 'light'))
          setMounted(true)
      }, [])

      const toggle_theme = () => {
          const next = theme === 'dark' ? 'light' : 'dark'
          setTheme(next)
          localStorage.setItem('theme', next)
          document.documentElement.classList.toggle('dark')
      }

      return { theme, toggle_theme, setTheme, mounted }
  }
  ```

- **`useLocale` con carga dinámica de traducciones**. Hook de i18n con carga dinámica de JSON, cache en memoria, función `t(key)` con dot notation, idioma default español, persistencia en `localStorage`.

  ```ts
  // ./src/lib/hooks/use_locale/index.ts
  const translations_cache: Record<string, Record<string, any>> = {}

  export default function useLocale() {
      const [locale, setLocale] = useState('es')
      const [translations, setTranslations] = useState<Record<string, any>>({})

      const load_translations = async (lang: string) => {
          if (translations_cache[lang]) {
              setTranslations(translations_cache[lang])
              return
          }
          const data = await import(`@/locales/${lang}.json`)
          translations_cache[lang] = data.default
          setTranslations(data.default)
      }

      const set_locale = (lang: string) => {
          setLocale(lang)
          localStorage.setItem('locale', lang)
          load_translations(lang)
      }

      const t = (key: string): string =>
          key.split('.').reduce((obj, k) => obj?.[k], translations) || key

      return { locale, set_locale, t }
  }
  ```

---

## 14. Comments and JSDoc

- **JSDoc obligatorio en todas las funciones, métodos y clases**. Bilingüe: redactado en inglés **y** español simultáneamente en el mismo bloque. Tags (`@param`, `@returns`, `@type`, `@typedef`) son deseables pero no obligatorios. Ejemplos permitidos cuando aportan claridad.

  ```ts
  // BIEN
  /**
   * Calcula minutos hábiles entre dos fechas excluyendo fines de semana.
   * Calculates business minutes between two dates excluding weekends.
   *
   * @param start - Fecha de inicio / Start date
   * @param minutes - Minutos a agregar / Minutes to add
   * @returns Fecha resultante / Resulting date
   */
  function add_business_minutes(start: Date, minutes: number): Date { ... }

  // MAL — sin JSDoc
  function add_business_minutes(start: Date, minutes: number): Date { ... }

  // MAL — JSDoc en un solo idioma
  /** Calculates business minutes */
  function add_business_minutes(start: Date, minutes: number): Date { ... }
  ```

- **Comentarios inline dentro del cuerpo de funciones — absolutamente prohibidos**. Si algo necesita explicación, esa explicación va en el JSDoc, NO como `// comentario` entre statements. Variables, nombres de función y estructura deben llevar el significado por sí solos.

  ```ts
  // MAL
  function add_business_minutes(start: Date, minutes: number): Date {
      // calcular diferencia  ← prohibido
  }
  ```

---

## 15. Package management

- **`yarn`** es obligatorio para operaciones locales. `npm install`, `npm run` están **prohibidos** en proyectos.

  ```bash
  # BIEN
  yarn                     # instalar dependencias
  yarn add axios           # agregar dependencia
  yarn add -D typescript   # agregar devDependency
  yarn remove axios
  yarn dev
  yarn build
  yarn test

  # MAL
  npm install axios        # PROHIBIDO
  npm run dev              # PROHIBIDO
  npm run build            # PROHIBIDO
  ```

- **`npm`** solo para instalaciones globales (`npm i -g typescript`). Nunca `yarn global add`.

  ```bash
  # BIEN
  npm i -g typescript
  npm i -g eslint
  npm i -g @arcaelas/mcp

  # MAL
  yarn global add typescript   # PROHIBIDO
  ```

- **`npx -y`** para herramientas CLI de un solo uso (`npx prettier --write .`, `npx create-next-app`). NO instalar globalmente lo que se usa una sola vez.

  ```bash
  # BIEN
  npx prettier --write .
  npx create-next-app
  npx eslint .
  npx -y @arcaelas/mcp --stdio

  # MAL
  npm i -g prettier         # innecesario si solo se usa una vez
  ```

- **`tsx`** ejecuta archivos TypeScript directamente sin compilar. Se usa en desarrollo para correr servidores, scripts de migración y cualquier archivo `.ts`.

  ```bash
  # BIEN
  tsx src/server.ts
  tsx scripts/migrate.ts
  tsx scripts/seed.ts
  npx tsx bot.ts

  # MAL — compilar antes de ejecutar en desarrollo
  npx tsc && node dist/server.js   # innecesario en desarrollo
  ```

---

## 16. Git workflow

- **Nombres de rama**: formato `{prefijo}/{issue-id}`. Prefijos válidos: `fix/`, `feat/`, `chore/`, `docs/`. El número de issue es **obligatorio** — no se trabaja sin issue.

  ```bash
  # BIEN
  git checkout -b fix/15
  git checkout -b feat/42
  git checkout -b chore/8
  git checkout -b docs/23

  # MAL
  git checkout -b fix-login        # sin número de issue
  git checkout -b new-feature      # sin prefijo ni issue
  git checkout -b 42               # sin prefijo
  ```

- **Commits en español con prefijos**. Mensajes en español. Prefijo obligatorio: `fix:`, `feat:`, `chore:`, `docs:`.

  ```bash
  # BIEN
  git commit -m "fix: corregir validación de email en formulario de registro"
  git commit -m "feat: agregar filtro de búsqueda por categoría"
  git commit -m "chore: actualizar dependencias de desarrollo"
  git commit -m "docs: agregar documentación del endpoint de pagos"

  # MAL
  git commit -m "fix login bug"                    # inglés, sin formato
  git commit -m "updated dependencies"             # inglés, sin prefijo
  git commit -m "corregir bug"                     # sin prefijo
  ```

- **Flujo de ramas y push**. Dos tipos de proyectos:

  - **Tipo 1** (tiene `dev`, `main`, `prod`): PR target es `dev`. Flujo: `issue → dev → main → prod`.
  - **Tipo 2** (solo `main`): PR target es `main`. Flujo: `issue → main`.

  Workflow para ambos:

  1. Sincronizar con la rama target (`git checkout {target} && git pull origin {target}`).
  2. Crear rama desde el issue (`git checkout -b feat/54`).
  3. Commit.
  4. Push y crear PR (`git push -u origin feat/54 && gh pr create --base {target}`).
  5. Después del merge, limpiar rama local.

  ```bash
  # Tipo 1
  git checkout dev
  git pull origin dev
  git checkout -b feat/54
  # ... commits ...
  gh pr create --base dev

  # Tipo 2
  git checkout main
  git pull origin main
  git checkout -b fix/54
  # ... commits ...
  gh pr create --base main
  ```

- **Nunca push directo a `main`, `dev` o `prod`**. Push directo está **prohibido**. Todo cambio llega a estas ramas únicamente a través de PR. Después del merge, limpiar rama local.

  ```bash
  # BIEN
  git push -u origin fix/15
  gh pr create --base main --title "fix: corregir validación"
  # → code review → merge → cleanup
  git checkout main
  git pull origin main
  git branch -d fix/15

  # MAL
  git checkout main
  git push origin main          # PROHIBIDO — sin PR
  ```

---

## 17. Server start procedure

En cualquier proyecto que necesite ejecución de servidor o app, respetar estos pasos para mantener limpieza y procesos correctos:

1. **Verificar que no hay nada corriendo en el puerto** — usar `lsof -ti:<puerto>` y `ps aux | grep -E '<proceso>'` para confirmar que no hay procesos activos.
2. **Ejecutar el comando de inicio tal cual**, sin redirecciones, sin `&`, sin `2>&1`, sin `run_in_background`. Solo el comando directo.
3. **Monitorear que el servidor o app inicie sin errores ni warnings**. Cualquier warning hay que reportarlo, así sea inofensivo.

Why: usar `&` o `run_in_background` causa que el proceso quede zombie o se ejecute en puertos incorrectos. Las redirecciones ocultan errores. Se necesita ver el output limpio y ser informado de cualquier anomalía.

How to apply: cada vez que se pida iniciar un servidor, una app o reiniciarlos, seguir estos pasos exactos en orden.

---

## 18. Agent behavior while writing code

- **Silencio sobre charla — resumen al final**. El usuario NO quiere narración corriendo. Sin "ahora estoy creando el archivo...", sin narrar cada paso. Trabajar en silencio. Cuando la tarea está hecha, entregar un único resumen conciso en 1-3 párrafos cortos o lista de bullets. Sin filler, sin disculpas, sin justificaciones salvo que el usuario las pida.

  Si algo bloquea progreso a mitad de tarea y requiere input del usuario, surfacearlo con `AskUserQuestion` — NO narrar el obstáculo en prosa.

- **Preguntar cuando es ambiguo, NO asumir**. Cuando la instrucción es clara, actuar. Cuando hay ambigüedad real (alcance, archivo target, elección tecnológica, comportamiento esperado), parar y preguntar con `AskUserQuestion`. El usuario prefiere una pregunta sobre una asunción que tiene que deshacer.

  Threshold: si una asunción equivocada forzaría al usuario a corregir o hacer rollback de tu trabajo, preguntar primero. NO preguntar para confirmar elecciones trivialmente seguras — eso también desperdicia tiempo.

- **NO inventar ni sugerir capacidades que no existen**. Antes de mencionar una feature, función o capacidad de la app/proyecto en cualquier output (código, comentarios, copy de UI, demos, previews), verificar en el código que la feature realmente existe. Si no existe, no se menciona. Esta regla aplica a:
  - Textos, labels y sugerencias en la UI de cualquier app.
  - Demos o previews simulados (chats, flujos, mockups): la secuencia debe reflejar lo que realmente pasa en el producto, no agregar elementos solo porque se ven bien visualmente.
  - Documentación, comentarios y respuestas: no afirmar que algo funciona o existe sin haberlo verificado.

---

## 19. User context

- **Identidad**: nombre preferido **Miguel Alejandro**. Dirigirse al usuario por este nombre cuando aplique.

- **Carrera**: Ingeniero de Software, especializado en Back-End y DevOps. Asumir nivel avanzado en backend y devops al explicar conceptos. NO simplificar en exceso temas de servidores, infraestructura, despliegues, redes, contenedores, CI/CD, bases de datos o arquitectura backend.

- **Hardware**:
  - Equipo principal: Ubuntu con Ryzen 5 5600GT, RTX 4060, 48GB RAM DDR4 3200MHz, board B550M PRO VDH WIFI MSI.
  - Equipo secundario: MacBook Pro 2019, Intel i9, 16GB RAM.

  Considerar estas specs al recomendar herramientas, configuraciones de build, contenedores, modelos locales, cargas de GPU/CPU o entornos de desarrollo. Equipo principal es Linux/Ubuntu (Ryzen + RTX). Secundario es macOS Intel (no ARM).

- **Estilo de comunicación**:
  - Responder siempre en **español**.
  - La gramática importa: redactar correctamente, sin errores ortográficos ni de concordancia.
  - Explicaciones breves y objetivas, incluso cuando el usuario tiene experiencia avanzada.
  - Antes de opinar, revisar la conversación previa, la lógica del problema y aplicar sentido común. NO opinar en frío.
  - Conservar coherencia con las modificaciones ya realizadas en archivos durante la conversación: NO contradecir cambios anteriores ni proponer estructuras que ya fueron descartadas.

- **Estilo de código preferido**:
  - Código nuevo: breve pero funcional. Enfocado en usar el mínimo de recursos del ordenador manteniendo alto rendimiento.
  - Preferir operadores ternarios y validaciones lineales sobre bloques `if/else` extensos para evitar "sábanas de código".
  - Declarar tipado correcto siempre que sea posible (TypeScript estricto, anotaciones explícitas en funciones públicas, sin `any`).

  How to apply:
  - En lugar de `if/else` corto que asigna un valor, usar ternario: `const status = active ? "on" : "off"`.
  - Siempre tipar parámetros, retornos y estructuras de datos. Evitar inferencia ambigua en APIs públicas.
  - Preferir soluciones de una línea cuando son legibles. NO fragmentar lógica atómica en pasos separados.
