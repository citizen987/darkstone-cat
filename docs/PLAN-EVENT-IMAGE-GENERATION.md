# Plan: Generación Automática de Imágenes de Eventos

## Resumen

Sistema para generar imágenes 1080×1080 (Instagram) automáticamente para eventos de Ludoya, mostrando los juegos programados con sus portadas, marcos por dificultad e iconos por tipo (mesa/RPG). Incluye endpoint API reutilizable y página web de gestión.

---

## Decisiones Técnicas

| Aspecto | Decisión |
|---|---|
| Librería de imagen | `@napi-rs/canvas` |
| Matching Ludoya→BGG | Fuzzy matching + tabla de overrides manuales |
| Detección RPG | Categoría BGG + lista manual fallback |
| Umbrales dificultad | Verde < 2.5, Naranja 2.5–3.5, Rojo > 3.5, Sin dato = Naranja |
| Máx. juegos en imagen | 8 |
| Layout | Posiciones fijas condicionadas al número de juegos |
| Priorización | Equilibrio mesa/RPG, luego los N primeros |
| Juegos sin match BGG | No se visualizan |
| Endpoint | `GET /api/events/[eventId]/image` — PNG, sin cache, público |
| Textos imagen | Siempre en catalán |
| Tamaño imagen | 1080×1080 px |
| Página web | `/events/images` — pública, listado + descarga |
| Bot Telegram | Futuro — arquitectura preparada con endpoint reutilizable |

---

## Fases de Implementación

### Fase 1 — Motor de matching de juegos (Ludoya → BGG)

**Objetivo**: Dado un `gameName` de Ludoya, encontrar el `BggGame` correspondiente con su imagen, peso y categorías.

**Ficheros a crear/modificar**:

- `src/lib/game-matching.ts` — Módulo principal de matching

**Funcionalidades**:

1. **Tabla de overrides manuales** (`GAME_NAME_OVERRIDES`)
   - Mapa `Record<string, string>` donde key = nombre exacto en Ludoya, value = BGG game ID
   - Permite resolver manualmente juegos con nombres problemáticos
   - Ejemplo: `{ "Catan": "13", "Gloomhaven": "174430" }`

2. **Normalización de nombres** (`normalizeName()`)
   - Lowercase, trim
   - Eliminar acentos/diacríticos (`normalize('NFD')` + regex)
   - Eliminar artículos comunes (el, la, los, the, a, an)
   - Eliminar caracteres especiales excepto espacios
   - Colapsar espacios múltiples

3. **Fuzzy matching** (`findBestMatch()`)
   - Implementar distancia de Levenshtein
   - Buscar contra la colección BGG del club
   - Comparar tanto `name` como `originalName` del BggGame
   - Umbral de similitud configurable (ej. ≥ 0.75)
   - Retornar el mejor match o `null`

4. **Pipeline de resolución** (`resolveGame()`)
   - Paso 1: Buscar en overrides → si existe, buscar por ID en colección BGG
   - Paso 2: Match exacto normalizado contra colección BGG
   - Paso 3: Fuzzy matching contra colección BGG
   - Paso 4: Sin match → retornar `null` (juego no se visualiza)

5. **Lista manual de RPGs** (`RPG_GAME_NAMES`)
   - `Set<string>` con nombres conocidos de juegos de rol
   - Usado como fallback si el juego no tiene categoría BGG

6. **Clasificación de tipo** (`getGameType()`)
   - Si BGG categories incluye algún término RPG → `"rpg"`
   - Si nombre está en `RPG_GAME_NAMES` → `"rpg"`
   - Else → `"boardgame"`

7. **Clasificación de dificultad** (`getDifficultyFrame()`)
   - `weight < 2.5` → `"green"`
   - `weight >= 2.5 && weight <= 3.5` → `"orange"`
   - `weight > 3.5` → `"red"`
   - Sin peso / 0 → `"orange"` (por defecto)
   - Tipo RPG → siempre `"rpg"` (ignora peso)

8. **Tipo de retorno unificado** (`ResolvedGame`):
   ```typescript
   interface ResolvedGame {
     name: string;           // Nombre a mostrar (de Ludoya)
     bggId: string;
     imageUrl: string;       // URL de la imagen BGG (alta resolución)
     weight: number;
     type: "boardgame" | "rpg";
     frame: "green" | "orange" | "red" | "rpg";
   }
   ```

9. **Función principal** (`resolveEventGames()`)
   - Input: `LudoyaPlannedPlay[]` + `BggGame[]`
   - Para cada planned play: ejecutar pipeline de resolución
   - Filtrar `null` (sin match)
   - Aplicar priorización: equilibrar mesa/RPG, luego orden original
   - Limitar a máximo 8 juegos
   - Output: `ResolvedGame[]`

**Lógica de priorización (equilibrio mesa/RPG)**:
- Separar juegos resueltos en dos listas: boardgames y rpgs
- Si total ≤ 8: mostrar todos
- Si total > 8: repartir slots proporcionalmente, mínimo 1 de cada tipo si hay
- Dentro de cada tipo, mantener orden original (como vienen de Ludoya)

**Tests manuales (Fase 1)**:
- [ ] Override manual resuelve correctamente
- [ ] Match exacto funciona (nombre idéntico)
- [ ] Fuzzy match funciona (pequeñas diferencias)
- [ ] Juego sin match retorna null
- [ ] Clasificación RPG por categoría BGG
- [ ] Clasificación RPG por lista manual
- [ ] Umbrales de dificultad correctos
- [ ] Priorización equilibrada mesa/RPG
- [ ] Límite de 8 juegos respetado

---

### Fase 2 — Motor de generación de imagen

**Objetivo**: Dado un array de `ResolvedGame[]` + datos del evento, generar un PNG de 1080×1080.

**Dependencia a instalar**: `@napi-rs/canvas`

**Ficheros a crear**:

- `src/lib/event-image/generator.ts` — Orquestador principal
- `src/lib/event-image/layouts.ts` — Posiciones fijas por número de juegos
- `src/lib/event-image/composer.ts` — Composición de capas en canvas
- `src/lib/event-image/text.ts` — Renderizado de textos (fecha, hora)
- `src/lib/event-image/assets.ts` — Carga y cache de assets estáticos

#### 2.1 — Assets estáticos (`assets.ts`)

Cargar y cachear en memoria (singleton):
- `placeholder.png` — Fondo 1080×1080
- `frame_green.png`, `frame_orange.png`, `frame_red.png`, `frame_rpg.png`
- `icon_boardgame.png`, `icon_rpg.png`
- Fuentes: `font_gloria-hallelujah.ttf`, `font_luckybones-bold.ttf`

Registrar fuentes con `GlobalFonts.registerFromPath()` de `@napi-rs/canvas`.

Método para obtener imágenes de juegos remotas (BGG):
- Fetch de la URL `imageUrl` del `ResolvedGame`
- Convertir a `Image` de canvas
- No cachear (las URLs de BGG ya son CDN)

#### 2.2 — Sistema de layouts (`layouts.ts`)

Definir posiciones y rotaciones fijas para cada cantidad de juegos (0–8).

```typescript
interface GameSlot {
  x: number;         // Centro X del frame en canvas 1080×1080
  y: number;         // Centro Y del frame en canvas 1080×1080
  rotation: number;  // Ángulos en radianes
  scale: number;     // Factor de escala del frame (1.0 = tamaño base)
}

type LayoutPreset = GameSlot[];

const LAYOUTS: Record<number, LayoutPreset> = {
  0: [],
  1: [/* 1 slot centrado, grande */],
  2: [/* 2 slots lado a lado */],
  3: [/* triángulo / fila + 1 */],
  4: [/* grid 2×2 */],
  5: [/* 2+3 filas */],
  6: [/* 2+2+2 o 3+3 */],
  7: [/* como en el ejemplo */],
  8: [/* grid 2+3+3 o similar */],
};
```

**Zona útil para juegos**: Área central del placeholder donde no hay textos fijos.
Basándome en el ejemplo, la zona de juegos ocupa aproximadamente:
- X: 30px – 1050px
- Y: 200px – 880px
- Hay que respetar el texto de fecha (arriba-izquierda), ubicación (arriba-derecha), "PARTIDES PROGRAMADES" (centro-arriba) y "O proposeu-ne de noves!" (abajo)

Cada preset debe definirse empíricamente para que quede estéticamente coherente con el ejemplo. Las polaroids deben tener ligeras rotaciones (±5°–15°) y solapamiento parcial para el efecto "scattered".

**Tamaño base de frame**: ~200×240 px (polaroid con margen inferior para nombre). Ajustable con `scale` por layout.

#### 2.3 — Composición (`composer.ts`)

Función `composeGameFrame()`:
1. Crear offscreen canvas del tamaño del frame
2. Dibujar el frame PNG (green/orange/red/rpg) como fondo
3. Dibujar la imagen del juego (BGG) recortada dentro del área de la polaroid
4. Dibujar el icono (boardgame/rpg) en esquina del frame
5. Dibujar el nombre del juego en el margen inferior del frame
6. Retornar el canvas del frame compuesto

Función `composeEventImage()` (orquestador):
1. Crear canvas 1080×1080
2. Dibujar `placeholder.png` como fondo
3. Dibujar texto de fecha (fuente Gloria Hallelujah, ~40px, color acorde)
4. Dibujar texto de horario (fuente Gloria Hallelujah, ~24px)
5. Para cada juego según layout:
   - Componer frame con `composeGameFrame()`
   - Aplicar rotación y posición del slot
   - Dibujar en canvas principal
6. Exportar como PNG Buffer

#### 2.4 — Textos dinámicos (`text.ts`)

Formateo de fecha/hora del evento en catalán:
- Día de la semana: "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"
- Formato fecha: `{dia_semana} {DD}/{MM}`
- Formato hora: `de {HH}h a {HH}:{MM}h`
- Timezone: usar `event.timeZone` (Europe/Madrid)

#### 2.5 — Orquestador (`generator.ts`)

```typescript
export async function generateEventImage(
  event: LudoyaEvent,
  bggGames: BggGame[]
): Promise<Buffer>
```

Pipeline:
1. `resolveEventGames(event.plannedPlays, bggGames)` → `ResolvedGame[]`
2. Obtener layout según `resolvedGames.length`
3. Fetch imágenes remotas de BGG en paralelo
4. `composeEventImage(event, resolvedGames, layout)` → Buffer PNG
5. Retornar buffer

**Tests manuales (Fase 2)**:
- [ ] Imagen generada con 0 juegos muestra placeholder + fecha
- [ ] Imagen con 1 juego: frame centrado correctamente
- [ ] Imagen con 4 juegos: grid 2×2 sin solapamiento excesivo
- [ ] Imagen con 7 juegos: layout similar al ejemplo
- [ ] Imagen con 8 juegos: todos visibles
- [ ] Frames de colores correctos según peso
- [ ] Frame RPG para juegos de rol
- [ ] Iconos correctos (mesa vs RPG)
- [ ] Fecha y hora legibles en catalán
- [ ] Nombres de juegos legibles en los frames
- [ ] Tamaño de salida: 1080×1080 PNG

---

### Fase 3 — Endpoint API

**Objetivo**: Servir la imagen generada por HTTP.

**Fichero a crear**:

- `src/app/api/events/[eventId]/image/route.ts`

**Implementación**:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<Response>
```

Pipeline:
1. Extraer `eventId` de params
2. Validar formato de eventId (string no vacío)
3. Fetch eventos de Ludoya (`fetchUpcomingEvents()`)
4. Buscar evento por ID en regularEvents + specialEvents
5. Si no existe → 404 JSON `{ error: "event_not_found" }`
6. Fetch colección BGG (`fetchBggCollection()`)
7. `generateEventImage(event, bggGames)` → Buffer PNG
8. Retornar `new Response(buffer, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } })`

**Errores**:
- 400: `eventId` inválido
- 404: Evento no encontrado
- 500: Error de generación (log + JSON error)

**Consideraciones Vercel**:
- Serverless function timeout: por defecto 10s en Hobby, 60s en Pro
- La generación puede ser intensiva (fetch imágenes BGG + canvas)
- Considerar `maxDuration` si es necesario:
  ```typescript
  export const maxDuration = 30; // segundos
  ```

**Tests manuales (Fase 3)**:
- [ ] GET con eventId válido retorna PNG 1080×1080
- [ ] GET con eventId inexistente retorna 404
- [ ] GET con evento sin juegos retorna imagen con placeholder + fecha
- [ ] Imagen se puede descargar y abrir correctamente
- [ ] Content-Type es image/png
- [ ] No hay cache (Cache-Control: no-store)

---

### Fase 4 — Página web de gestión

**Objetivo**: Página `/events/images` con listado de eventos futuros y botón para ver/descargar la imagen.

**Ficheros a crear/modificar**:

- `src/app/[locale]/events/images/page.tsx` — Server component
- `src/components/events/EventImagesContent.tsx` — Client component
- `src/messages/{ca,es,en}.json` — Nuevas claves de traducción
- `src/app/sitemap.ts` — Añadir entrada (baja prioridad)
- `src/components/NavBar.tsx` — Añadir a `SUBPAGE_THEMES`

#### 4.1 — Server component (`page.tsx`)

- `generateMetadata()` con título/descripción traducidos
- Fetch `fetchUpcomingEvents()` en servidor
- Pasar eventos al client component
- JSON-LD: BreadcrumbList + WebPage
- `revalidate = 86400`

#### 4.2 — Client component (`EventImagesContent.tsx`)

**UI propuesta**:
- Hero section coherente con el resto de subpáginas
- Lista de tarjetas de eventos futuros que tienen `plannedPlayCount > 0`
- Cada tarjeta muestra:
  - Título del evento
  - Fecha y hora formateadas
  - Número de juegos programados
  - Lista de nombres de juegos (text pills como en EventsContent)
  - Botón "Veure imatge" → Abre modal/preview con la imagen del endpoint
  - Botón "Descarregar" → Descarga directa del PNG (via fetch + blob + download)
- Eventos sin juegos programados se muestran en gris/deshabilitados con texto "Cap joc programat"
- Separación entre eventos regulares y especiales

**Flujo de descarga**:
```typescript
const downloadImage = async (eventId: string, eventTitle: string) => {
  const res = await fetch(`/api/events/${eventId}/image`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `darkstone-${eventTitle}-${date}.png`;
  a.click();
  URL.revokeObjectURL(url);
};
```

**Estado de carga**: Mostrar spinner/skeleton mientras se genera la imagen (puede tardar unos segundos por el fetch de imágenes BGG).

#### 4.3 — Traducciones

Namespace `event_images`:
```json
{
  "event_images": {
    "title": "Imatges d'Esdeveniments",
    "subtitle": "Genera i descarrega imatges...",
    "view": "Veure imatge",
    "download": "Descarregar",
    "no_games": "Cap joc programat",
    "generating": "Generant imatge...",
    "games_count": "{count} jocs programats",
    "error": "Error generant la imatge"
  }
}
```

#### 4.4 — Actualizaciones menores

- `NavBar.tsx`: Añadir `"/events/images"` a `SUBPAGE_THEMES`
- `sitemap.ts`: Añadir entrada con `changeFrequency: "weekly"`, `priority: 0.3`
- `scripts/lighthouse/config.mjs`: Añadir a `PAGES` (baja prioridad)
- `CLAUDE.md`: Actualizar tabla de páginas y estructura de componentes

**Tests manuales (Fase 4)**:
- [ ] Página accesible en `/events/images`, `/es/events/images`, `/en/events/images`
- [ ] Lista muestra eventos futuros correctamente
- [ ] Eventos sin juegos aparecen deshabilitados
- [ ] Botón "Veure imatge" muestra preview de la imagen
- [ ] Botón "Descarregar" descarga PNG con nombre correcto
- [ ] Spinner durante generación de imagen
- [ ] Error handling si el endpoint falla
- [ ] Responsive: funciona en móvil y desktop
- [ ] NavBar muestra tema correcto en esta página

---

## Estructura de Ficheros Final

```
src/
├── lib/
│   ├── game-matching.ts              # Fase 1: Motor de matching
│   └── event-image/
│       ├── generator.ts              # Fase 2: Orquestador principal
│       ├── layouts.ts                # Fase 2: Posiciones fijas por nº juegos
│       ├── composer.ts               # Fase 2: Composición canvas
│       ├── text.ts                   # Fase 2: Formateo textos catalán
│       └── assets.ts                 # Fase 2: Carga de assets y fuentes
├── app/
│   ├── api/
│   │   └── events/
│   │       └── [eventId]/
│   │           └── image/
│   │               └── route.ts      # Fase 3: Endpoint API
│   └── [locale]/
│       └── events/
│           └── images/
│               └── page.tsx          # Fase 4: Página de gestión
└── components/
    └── events/
        └── EventImagesContent.tsx    # Fase 4: UI de gestión

public/generation/event/              # Assets existentes (no modificar)
├── placeholder.png
├── frame_green.png
├── frame_orange.png
├── frame_red.png
├── frame_rpg.png
├── icon_boardgame.png
├── icon_rpg.png
├── font_gloria-hallelujah.ttf
└── font_luckybones-bold.ttf
```

## Dependencias a Instalar

```bash
npm install @napi-rs/canvas
```

No se necesitan otras dependencias nuevas. El fuzzy matching se implementa con Levenshtein propio (sin librería externa).

---

## Orden de Implementación y Verificación

```
Fase 1 → Verificar matching en consola con datos reales de Ludoya + BGG
   ↓
Fase 2 → Generar imagen de test con script temporal / test route
   ↓
Fase 3 → Probar endpoint en navegador: /api/events/{id}/image
   ↓
Fase 4 → Página web completa con UX de descarga
```

Cada fase es independientemente testeable. Se puede mergear por fases.

---

## Consideraciones Futuras (No implementar ahora)

- **Bot de Telegram**: Consumirá `GET /api/events/[eventId]/image` directamente. La arquitectura del endpoint ya lo soporta.
- **Autenticación**: Añadir header `Authorization: Bearer <token>` al endpoint y validar contra env var.
- **Página solo admin**: Proteger `/events/images` con autenticación (NextAuth, Clerk, o similar).
- **Cache inteligente**: Cachear imágenes generadas en Vercel Blob Storage o similar, invalidar cuando cambien los planned plays.
- **Formatos adicionales**: Stories (1080×1920), landscape (1200×630 para OG).
