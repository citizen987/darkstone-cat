# Pla de millora SEO — Posicionament per "jocs de taula Terrassa"

**Data**: 2026-03-08
**Objectiu**: Millorar el posicionament orgànic per a cerques tipus "jocs de taula Terrassa" en català, castellà i anglès.
**Origen**: Anàlisi de Google Search Console + auditoria interna de metadata i dades estructurades.

---

## Context

Google Search Console ha reportat 6 camps recomanats que faltaven als esquemes Event JSON-LD del layout global (divendres i dissabte). Aquesta correcció ja s'ha aplicat al commit `b0c43e1` (pàgina `/events`) i `1f2affb` (layout global).

Durant l'anàlisi s'ha detectat que el posicionament per als termes clau principals — **"jocs de taula Terrassa"** i equivalents en castellà/anglès — presenta forats importants als elements SEO amb més pes.

---

## Diagnòstic actual

### On SÍ apareixen "jocs de taula" + "Terrassa" junts

- Meta description de la home (3 idiomes)
- Títol de `/about`, `/contact`, `/faq` (3 idiomes)
- Meta description de `/events` (3 idiomes)
- JSON-LD Organization `description` + `areaServed`
- OG image subtítol (3 idiomes)
- Footer tagline (3 idiomes)
- FAQ primera resposta

### On FALTEN (ordenat per impacte SEO)

| Prioritat | Element | Valor actual (CA) | Problema |
|---|---|---|---|
| **CRITICA** | `<title>` de la home | "Darkstone Catalunya — Associació de jocs de taula i rol" | Falta "Terrassa" |
| **CRITICA** | `<h1>` de la home | "Darkstone Catalunya" | Falten ambdós termes |
| **ALTA** | OG title de la home | "Darkstone Catalunya" | Falten ambdós termes |
| **ALTA** | `<title>` de `/ludoteca` | "Ludoteca — Catàleg de jocs de taula" | Falta "Terrassa" |
| **ALTA** | `<title>` de `/events` | "Pròxims Esdeveniments — Darkstone Catalunya" | Falten ambdós termes |
| MITJA | Meta desc de `/ludoteca` | "Descobreix la col·lecció de jocs de taula..." | Falta "Terrassa" |
| MITJA | Meta desc de `/faq` | "Respostes a les preguntes més habituals..." | Falten ambdós termes |
| MITJA | Meta desc de `/contact` | "...sessions de jocs de taula i rol." | Falta "Terrassa" |
| MITJA | JSON-LD `alternateName` | "...jocs de taula i rol Darkstone Catalunya" | Falta "Terrassa" |
| BAIXA | OG image alt text | "Darkstone Catalunya — Associacio de jocs de taula i rol" | Falta "Terrassa" |
| BAIXA | Alt text d'imatges | Cap inclou "Terrassa" | Senyal menor però acumulatiu |

---

## Pla d'implementació

### FASE 1 — Metadata `<title>` i `<meta description>`

**Impacte**: Alt
**Fitxers**: `src/messages/ca.json`, `src/messages/es.json`, `src/messages/en.json`

Els títols de pàgina són el senyal de ranking #1 de Google. Les meta descriptions influeixen al CTR (click-through rate) als resultats de cerca.

#### 1.1 Títol de la Home (`home_title`)

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Darkstone Catalunya — Associació de jocs de taula i rol"` | `"Darkstone Catalunya — Jocs de taula i rol a Terrassa"` |
| ES | `"Darkstone Catalunya — Asociación de juegos de mesa y rol"` | `"Darkstone Catalunya — Juegos de mesa y rol en Terrassa"` |
| EN | `"Darkstone Catalunya — Board game and RPG association"` | `"Darkstone Catalunya — Board games & RPG in Terrassa"` |

#### 1.2 OG Title de la Home (`home_og_title`)

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Darkstone Catalunya"` | `"Darkstone Catalunya — Jocs de taula i rol a Terrassa"` |
| ES | `"Darkstone Catalunya"` | `"Darkstone Catalunya — Juegos de mesa y rol en Terrassa"` |
| EN | `"Darkstone Catalunya"` | `"Darkstone Catalunya — Board games & RPG in Terrassa"` |

#### 1.3 Títol de `/ludoteca` (`ludoteca_title`)

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Ludoteca — Catàleg de jocs de taula"` | `"Ludoteca — Jocs de taula i rol a Terrassa"` |
| ES | `"Ludoteca — Catálogo de juegos de mesa"` | `"Ludoteca — Juegos de mesa y rol en Terrassa"` |
| EN | `"Game Library — Board game collection"` | `"Game Library — Board games & RPG in Terrassa"` |

#### 1.4 Títol de `/events` (`events_title`)

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Pròxims Esdeveniments — Darkstone Catalunya"` | `"Esdeveniments de jocs de taula i rol a Terrassa"` |
| ES | `"Próximos Eventos — Darkstone Catalunya"` | `"Eventos de juegos de mesa y rol en Terrassa"` |
| EN | `"Upcoming Events — Darkstone Catalunya"` | `"Board game & RPG events in Terrassa"` |

#### 1.5 Meta descriptions amb forats

**`contact_description`** — Afegir "a Terrassa" / "en Terrassa" / "in Terrassa":

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"...sessions de jocs de taula i rol."` | `"...sessions de jocs de taula i rol a Terrassa."` |
| ES | `"...sesiones de juegos de mesa y rol."` | `"...sesiones de juegos de mesa y rol en Terrassa."` |
| EN | `"...board game and RPG sessions."` | `"...board game and RPG sessions in Terrassa."` |

**`faq_description`** — Afegir termes clau al principi:

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Respostes a les preguntes més habituals sobre l'Associació Darkstone Catalunya: horaris, preus, com fer-se soci, jocs disponibles i més."` | `"Preguntes freqüents sobre jocs de taula i rol a Terrassa. Horaris, preus, com fer-se soci de Darkstone Catalunya, jocs disponibles i més."` |
| ES | `"Respuestas a las preguntas más habituales sobre la Asociación Darkstone Catalunya: horarios, precios, cómo hacerse socio, juegos disponibles y más."` | `"Preguntas frecuentes sobre juegos de mesa y rol en Terrassa. Horarios, precios, cómo hacerse socio de Darkstone Catalunya, juegos disponibles y más."` |
| EN | `"Answers to the most common questions about Darkstone Catalunya: schedule, prices, how to join, available games and more."` | `"FAQ about board games & RPG in Terrassa. Schedule, prices, how to join Darkstone Catalunya, available games and more."` |

**`ludoteca_description`** — Afegir "a Terrassa" / "en Terrassa" / "in Terrassa":

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Descobreix la col·lecció de jocs de taula de Darkstone Catalunya. Més de 100 jocs disponibles per jugar a les nostres sessions de divendres i dissabte."` | `"Descobreix la col·lecció de jocs de taula de Darkstone Catalunya a Terrassa. Més de 100 jocs disponibles per jugar a les nostres sessions de divendres i dissabte."` |
| ES | `"Descubre la colección de juegos de mesa de Darkstone Catalunya. Más de 100 juegos disponibles para jugar en nuestras sesiones de viernes y sábado."` | `"Descubre la colección de juegos de mesa de Darkstone Catalunya en Terrassa. Más de 100 juegos disponibles para jugar en nuestras sesiones de viernes y sábado."` |
| EN | `"Discover the Darkstone Catalunya board game collection. Over 100 games available to play at our Friday and Saturday sessions."` | `"Discover the Darkstone Catalunya board game collection in Terrassa. Over 100 games available to play at our Friday and Saturday sessions."` |

---

### FASE 2 — H1 de la Home

**Impacte**: Alt
**Fitxer**: `src/components/home/Hero.tsx`

L'H1 actual és `"Darkstone Catalunya"` (hardcoded). El tagline `"Associació de Jocs de Taula i Rol"` és un `<p>`, invisible per a Google com a heading.

**Proposta**: Mantenir el disseny visual actual però incloure el tagline dins l'etiqueta `<h1>` amb un `<span>` visualment diferenciat:

```html
<h1>
  Darkstone Catalunya
  <span class="...mida-més-petita...">Jocs de taula i rol a Terrassa</span>
</h1>
```

Google veurà `"Darkstone Catalunya Jocs de taula i rol a Terrassa"` com a H1 complet, sense alterar l'aparença de la pàgina. El tagline s'ha de treure de les traduccions del `<p>` actual i integrar-lo a l'H1.

---

### FASE 3 — JSON-LD Organization `alternateName`

**Impacte**: Mitjà
**Fitxer**: `src/app/[locale]/layout.tsx`

| Camp | Ara | Proposta |
|---|---|---|
| `alternateName` | `"Associació de jugadors i jugadores de jocs de taula i rol Darkstone Catalunya"` | `"Associació de jocs de taula i rol a Terrassa — Darkstone Catalunya"` |

---

### FASE 4 — OG Image alt text

**Impacte**: Baix
**Fitxer**: `src/app/[locale]/opengraph-image.tsx`

| Idioma | Ara | Proposta |
|---|---|---|
| CA | `"Darkstone Catalunya — Associacio de jocs de taula i rol"` | `"Darkstone Catalunya — Jocs de taula i rol a Terrassa"` |
| ES | `"Darkstone Catalunya — Asociacion de juegos de mesa y rol"` | `"Darkstone Catalunya — Juegos de mesa y rol en Terrassa"` |
| EN | `"Darkstone Catalunya — Board games & RPG association"` | `"Darkstone Catalunya — Board games & RPG in Terrassa"` |

---

### FASE 5 — Accions externes (fora del codi)

| Acció | Detall | Prioritat |
|---|---|---|
| **Google Business Profile** | Crear-lo si no existeix. A Google Maps ha d'aparèixer "Darkstone Catalunya" amb adreça (Plaça del Tint, 4, Terrassa), horaris (dv 16-20:30h, ds 10-13:30h), fotos i categoria "Associació de jocs". És **imprescindible** per cerques locals. | CRITICA |
| **Sol·licitar re-indexació** | Un cop desplegats els canvis, inspeccionar `/`, `/about`, `/events`, `/ludoteca`, `/faq`, `/contact` a GSC i clicar "Sol·licita la indexació". | ALTA |
| **Validar correccions GSC** | Als 6 problemes d'Events a GSC, clicar "Valida la correcció". | ALTA |
| **Backlinks** | Buscar directoris d'associacions, pàgines d'oci a Terrassa, i webs de jocs de taula on sol·licitar un enllaç cap a darkstone.cat. | MITJA |

---

## Resum de fitxers a modificar

| Fitxer | Fase | Canvis |
|---|---|---|
| `src/messages/ca.json` | 1 | 7 claus al namespace `metadata` |
| `src/messages/es.json` | 1 | 7 claus al namespace `metadata` |
| `src/messages/en.json` | 1 | 7 claus al namespace `metadata` |
| `src/components/home/Hero.tsx` | 2 | Reestructurar H1 + tagline |
| `src/app/[locale]/layout.tsx` | 3 | Camp `alternateName` al JSON-LD Organization |
| `src/app/[locale]/opengraph-image.tsx` | 4 | 3 alt texts al mapa `OG_STRINGS` |
