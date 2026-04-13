# 🎨 Morph-Exquisite

> Juego colaborativo de dibujo inspirado en el **Cadáver Exquisito** surrealista — cada jugador dibuja un segmento del personaje sin ver lo que dibujaron los demás. Al final, los segmentos se ensamblan en una criatura colaborativa única.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-gratuito-3ECF8E?style=flat-square&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/licencia-sin_licencia-gray?style=flat-square)

---

## 🕹️ ¿Cómo se juega?

1. Un jugador **crea una partida** y elige entre 3 y 7 segmentos
2. Comparte el **código de sala** (ej: `HW2X`) con sus amigos
3. Cada jugador **dibuja su segmento** en su turno — solo ve los últimos 20px del segmento anterior como guía
4. Al completar todos los turnos, el sistema **ensambla el personaje final** automáticamente
5. ¡Todos ven la criatura colaborativa y pueden descargarla en PNG!

---

## ✨ Características

| Funcionalidad | Descripción |
|---|---|
| 🖌️ **Canvas de dibujo** | Pincel suave con interpolación, soporte táctil y mouse |
| 🎨 **Paleta de colores** | 9 colores + control de grosor del pincel |
| 🔗 **Salas con código** | Códigos de 4 letras para unirse a partidas |
| ⏳ **Sala de espera** | Progreso en tiempo real mientras otros dibujan |
| 📡 **Multijugador real** | Sincronización instantánea vía Supabase Realtime |
| 👁️ **Guía de 20px** | Los últimos 20px del turno anterior son visibles para conectar los segmentos |
| 🧩 **Ensamblado automático** | Los segmentos se unen en un solo personaje al terminar |
| ⬇️ **Descarga PNG** | El personaje final se puede descargar |

---

## 🛠️ Stack técnico

```
Frontend:   React 18 + Vite 8 + Tailwind CSS 4
Backend:    Supabase (PostgreSQL + Realtime + Storage)
Despliegue: GitHub Codespaces (desarrollo)
Presupuesto: $0 — todo en capas gratuitas
```

---

## 📁 Estructura del proyecto

```
morph-exquisite/
├── src/
│   ├── components/
│   │   ├── Canvas.jsx        # Lienzo de dibujo con soporte táctil/mouse
│   │   └── Toolbar.jsx       # Paleta de colores y control de grosor
│   ├── pages/
│   │   ├── Lobby.jsx         # Crear o unirse a una partida
│   │   ├── WaitingRoom.jsx   # Sala de espera con progreso en tiempo real
│   │   ├── DrawingRoom.jsx   # Pantalla de juego con guía de 20px
│   │   └── Result.jsx        # Personaje final ensamblado + descarga
│   ├── lib/
│   │   ├── supabase.js       # Cliente de Supabase
│   │   └── gameService.js    # Lógica del juego (sesiones, turnos, storage, realtime)
│   ├── App.jsx               # Máquina de estados principal (lobby → waiting → drawing → result)
│   └── main.jsx
├── .env                      # Variables de entorno (no se sube a GitHub)
├── .gitignore
└── vite.config.js
```

---

## 🗄️ Base de datos (Supabase)

### Tabla `sessions`
```sql
id              UUID PRIMARY KEY
code            TEXT UNIQUE        -- Código de sala (ej: "HW2X")
total_segments  INT                -- Entre 3 y 7
current_turn    INT DEFAULT 0      -- Turno activo
status          TEXT               -- 'waiting' | 'playing' | 'finished'
created_at      TIMESTAMPTZ
```

### Tabla `segments`
```sql
id          UUID PRIMARY KEY
session_id  UUID REFERENCES sessions(id)
turn_number INT
image_url   TEXT                   -- URL pública en Supabase Storage
created_at  TIMESTAMPTZ
```

### Storage
- Bucket `segments` (público) — almacena los PNG de cada segmento como `{session_id}/turn-{n}.png`

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/ArizzaYF/Morph-Exquisite.git
cd Morph-Exquisite
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Configurar Supabase
Ejecuta este SQL en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Tablas
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  total_segments INT NOT NULL CHECK (total_segments BETWEEN 3 AND 7),
  current_turn INT DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  turn_number INT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_segments_session ON segments(session_id);
CREATE INDEX idx_sessions_code ON sessions(code);

-- Bucket de Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('segments', 'segments', true);

-- Políticas de Storage
CREATE POLICY "public upload segments"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'segments');

CREATE POLICY "public read segments"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'segments');
```

Activa **Realtime** para la tabla `sessions` en **Database → Publications → supabase_realtime**.

### 4. Correr en desarrollo
```bash
npm run dev
```

---

## 🔄 Flujo de la aplicación

```
Lobby
  ├── Crear partida (elige 3-7 segmentos) ──→ DrawingRoom (turno 0)
  └── Unirse con código ──────────────────→ WaitingRoom

DrawingRoom
  └── Terminar turno ──→ guarda PNG en Storage + avanza current_turn en DB
        ├── ¿Hay más turnos? ──→ WaitingRoom (espera Realtime)
        └── ¿Último turno?  ──→ Result

WaitingRoom
  └── Supabase Realtime detecta UPDATE en sessions
        ├── ¿Es mi turno? ──→ DrawingRoom
        └── ¿status = finished? ──→ Result

Result
  └── Ensambla todos los segmentos en un canvas
      └── Descarga PNG del personaje final
```

---

## 🚀 Hoja de ruta

- [x] Paso 1 — Canvas de dibujo funcional
- [x] Paso 2 — Integración con Supabase (sesiones, turnos, storage)
- [x] Paso 3 — Multijugador real con Supabase Realtime
- [ ] Paso 4 — Animación del personaje con IA
- [ ] Paso 5 — Galería pública de personajes
- [ ] Paso 6 — Deploy en Vercel

---

## 👨‍💻 Autor

**Jairo Ariza** — [@ArizzaYF](https://github.com/ArizzaYF)  
Estudiante de Ingeniería de Software — Unidades Tecnológicas de Santander (UTS)

---

## 🎓 Contexto académico

Proyecto desarrollado como ejercicio práctico de desarrollo fullstack con React, Supabase y tiempo real. Construido paso a paso desde cero en GitHub Codespaces.

---

*"El Cadáver Exquisito beberá el vino nuevo" — André Breton*
