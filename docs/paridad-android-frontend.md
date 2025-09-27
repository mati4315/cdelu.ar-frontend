## Guía de Paridad Visual Android ↔ Frontend (Diario CdelU)

Esta guía indica cómo replicar en la app Android el mismo look & feel que el frontend actual (captura provista). Está pensada para que una IA/desarrolladora implemente el estilo usando tokens de diseño compartidos y componentes equivalentes.

### 1) Objetivo
- **Paridad 1:1** del diseño: colores, tipografía, espaciados, radios, sombras, iconografía y estados.
- **Mis mismos componentes**: AppBar, Tabs, Cards (Encuesta/Post), FAB, Bottom Bar, contadores e iconos.
- **Theming único**: usar un set de tokens que sirva tanto para web como para Android.

---

### 2) Tokens de diseño (fuente de verdad)
Definir estos tokens y usarlos en TODO el proyecto. Si el frontend ya tiene variables CSS, mapear 1:1. Si no, establecer estos valores y aplicarlos en ambos lados.

> Nota: Los HEX listados son aproximados a la captura. Reemplazar por los exactos del frontend (usar un color picker o los estilos existentes). Mantener nombres de tokens.

#### 2.1 Colores
- `--color-primary-600`: #3B82F6  (azul de acento: indicador de pestañas, FAB, enlaces)
- `--color-primary-500`: #5590F7  (hover/pressed claro)
- `--color-primary-50`:  #EAF2FF  (fondo sutil de énfasis)
- `--color-surface`:      #F5F6FA  (fondo general claro)
- `--color-surface-card`: #EEF0F6  (fondo de las cards claras)
- `--color-border`:       #E1E3EC  (bordes/Dividers)
- `--color-text-strong`:  #0F172A  (títulos)
- `--color-text-body`:    #334155  (cuerpo)
- `--color-text-muted`:   #64748B  (metadatos/labels)
- `--color-success-600`:  #16A34A  (si aplica)
- `--color-warning-600`:  #D97706  (si aplica)
- `--color-danger-600`:   #DC2626  (si aplica)

Estados (opacidad sobre `primary-600` o `text`):
- `--state-hover`: 8% overlay
- `--state-pressed`: 16% overlay
- `--state-focus-ring`: 2px `--color-primary-600` 40% de opacidad

Modo oscuro (mapear):
- `--dark-surface`: #0B0F1A
- `--dark-surface-card`: #131A28
- `--dark-text-strong`: #E5E7EB
- `--dark-text-body`: #CBD5E1
- `--dark-border`: #1F2937
- `--dark-primary-600`: mantener `#3B82F6` o ajustar según marca

#### 2.2 Tipografía
- Familia: Inter (preferida) o Roboto si Inter no está disponible.
- Pesos usados: 700, 600, 500, 400.
- Escala:
  - Display/AppBar Title: 22–24 px, 700
  - Section/Card Title: 18–20 px, 700
  - Subtitle/Meta: 13–14 px, 600/500, color muted
  - Body: 15–16 px, 400
  - Caption/Badge: 12–13 px, 500

#### 2.3 Espaciado y radios
- Base de espaciado: 4 px. Usar múltiplos: 8/12/16/20/24.
- Padding estándar de pantalla: 16 px.
- `--radius-card`: 16 px
- `--radius-chip`: 12 px
- `--radius-fab`: 16 px (si es cuadrada/rounded) o 28 px (si circular)

#### 2.4 Elevación/Sombras (Android → `shadow`/`tonalElevation`)
- Card principal: elevación 1–2, blur sutil, color negro 8%.
- FAB: elevación 3–4, sombra más marcada.

---

### 3) Componentes a replicar

#### 3.1 AppBar superior
- Título alineado a la izquierda: "Diario CdelU" (Display 22–24/700, `--color-text-strong`).
- Acciones a la derecha: campana y avatar/usuario (iconos 24 px, `--color-text-strong`).
- Fondo transparente sobre `--color-surface` sin borde, altura ~56 dp.

#### 3.2 Card de Encuesta Activa
- Contenedor: `--color-surface-card`, borde suave `--color-border`, radio `--radius-card`, padding 16–20.
- Cabecera: punto indicador azul (`--color-primary-600`), label "Encuesta Activa" con texto muted, total de votos a la derecha.
- Título de la pregunta: 18–20 px, 700.
- Opciones: ítems en columna, cada fila con texto a la izquierda y número a la derecha; alto de fila 44–48 px.
- Pie: enlace "+1 más opciones" centrado con color `--color-text-muted`.

#### 3.3 Tabs (segmentación de feed)
- Etiquetas: "Todo", "Noticias", "Comunicaciones", etc.
- Activa: texto `--color-text-strong` y subrayado/indicador 2 px `--color-primary-600`.
- Inactivas: texto `--color-text-muted`.

#### 3.4 Card de Post (feed)
- Header: Autor (muted/600) + fecha (muted/500) en 12–13 px.
- Título: 18–20 px, 700.
- Cuerpo: 15–16 px, 400, `--color-text-body`.
- Footer de acciones: corazón + contador, mensaje + contador, compartir a la derecha. Iconos 20–24 px, color `--color-text-muted` al reposo; `--color-primary-600` cuando activo.

#### 3.5 FAB (botón flotante)
- Ubicación: bottom-right con margen 16–20 px sobre la Bottom Bar.
- Tamaño: 56 dp. Color de fondo `--color-primary-600`, icono blanco.
- Forma: circular o rounded grande. Sombra 3–4.

#### 3.6 Bottom Navigation Bar
- 5 acciones con iconos (Home, …, Favoritos, etc.), sin labels o labels opcionales.
- Altura ~64 dp, fondo `--color-surface`, ítem activo en `--color-primary-600`.

---

### 4) Reglas de layout
- Ancho objetivo móvil: 360–430 dp.
- Padding horizontal de pantalla: 16 px.
- Separación entre cards: 12–16 px.
- Lista con `LazyColumn`/`RecyclerView` con `contentPadding` top/bottom 12–16 px.
- Respetar Safe Areas; la FAB no debe tapar contenido.

---

### 5) Implementación en Android (Jetpack Compose recomendado)

#### 5.1 Definir tema (colores, tipografía, formas)
```kotlin
// Color.kt
object AppColors {
  val Primary600 = Color(0xFF3B82F6)
  val Primary500 = Color(0xFF5590F7)
  val Surface = Color(0xFFF5F6FA)
  val SurfaceCard = Color(0xFFEEF0F6)
  val Border = Color(0xFFE1E3EC)
  val TextStrong = Color(0xFF0F172A)
  val TextBody = Color(0xFF334155)
  val TextMuted = Color(0xFF64748B)
}

// Type.kt
val AppTypography = Typography(
  titleLarge = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Bold, fontSize = 22.sp),
  titleMedium = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Bold, fontSize = 18.sp),
  bodyLarge = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Normal, fontSize = 16.sp),
  bodyMedium = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 14.sp),
  labelSmall = TextStyle(fontFamily = Inter, fontWeight = FontWeight.Medium, fontSize = 12.sp)
)

// Theme.kt (Material 3)
@Composable
fun DiarioTheme(content: @Composable () -> Unit) {
  val colorScheme = lightColorScheme(
    primary = AppColors.Primary600,
    onPrimary = Color.White,
    surface = AppColors.Surface,
    onSurface = AppColors.TextBody,
    surfaceVariant = AppColors.SurfaceCard,
    outline = AppColors.Border
  )
  MaterialTheme(colorScheme = colorScheme, typography = AppTypography, shapes = Shapes(
    medium = RoundedCornerShape(16.dp)
  )) {
    Box(Modifier.background(MaterialTheme.colorScheme.surface)) { content() }
  }
}
```

#### 5.2 Ejemplos de componentes clave
```kotlin
@Composable
fun TopBar(title: String) {
  TopAppBar(
    title = { Text(title, style = MaterialTheme.typography.titleLarge, color = AppColors.TextStrong) },
    actions = {
      Icon(Icons.Rounded.Notifications, contentDescription = null, tint = AppColors.TextStrong)
      Spacer(Modifier.width(12.dp))
      Icon(Icons.Rounded.Person, contentDescription = null, tint = AppColors.TextStrong)
    },
    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
  )
}

@Composable
fun PollCard(/* datos */) {
  ElevatedCard(shape = RoundedCornerShape(16.dp)) {
    Column(Modifier.background(AppColors.SurfaceCard).padding(16.dp)) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).background(AppColors.Primary600, CircleShape))
        Spacer(Modifier.width(8.dp))
        Text("Encuesta Activa", style = MaterialTheme.typography.bodyMedium, color = AppColors.TextMuted)
        Spacer(Modifier.weight(1f))
        Text("156 votos", style = MaterialTheme.typography.bodyMedium, color = AppColors.TextMuted)
      }
      Spacer(Modifier.height(12.dp))
      Text("¿Qué funcionalidad te gustaría ver próximamente?", style = MaterialTheme.typography.titleMedium, color = AppColors.TextStrong)
      // ... Opciones de la encuesta en filas con conteo a la derecha
      Spacer(Modifier.height(8.dp))
      Text("+1 más opciones", modifier = Modifier.align(Alignment.CenterHorizontally), color = AppColors.TextMuted)
    }
  }
}
```

---

### 6) Mapeo Web ↔ Android (sugerido)

Si el frontend usa CSS variables, crear correspondencias como estas:

```css
:root {
  --color-primary-600: #3B82F6;
  --color-surface: #F5F6FA;
  --color-surface-card: #EEF0F6;
  --color-border: #E1E3EC;
  --color-text-strong: #0F172A;
  --color-text-body: #334155;
  --color-text-muted: #64748B;
}
```

Y en Android, usar los mismos HEX en `Color.kt` y, si se prefiere XML, en `values/colors.xml` con los mismos nombres lógicos.

---

### 7) Estados e interacciones
- Ripple sutil en botones y filas, con color basado en `primary` o `text` y opacidad 8–16%.
- Ítems activos (tab/bottom bar) en `primary-600`.
- Iconos en reposo: `text-muted`; al activo: `primary-600`.

---

### 8) Accesibilidad
- Contraste mínimo 4.5:1 en texto normal.
- Tamaños táctiles ≥ 44×44 px.
- Soporte de `dynamic type`/escala de fuente del sistema.

---

### 9) Entregables de la IA (criterios de aceptación)
- Archivo de tema Compose completo (`Color.kt`, `Type.kt`, `Theme.kt`, `Shapes.kt`).
- Componentes: `TopBar`, `Tabs`, `PollCard`, `PostCard`, `Fab`, `BottomBar`.
- Pantalla Home replicando la captura con espaciados y jerarquía visual iguales.
- Modo claro y oscuro funcionando.
- Paleta/tokens idénticos a los del frontend.

---

### 10) Cómo validar paridad
1. Capturar pantalla de Android y compararla con el frontend (Diff visual al 2–3%).
2. Verificar colores con inspección (HEX exacto) y tipografías/pesos.
3. Probar estados: hover/pressed/active, conteos, cambios de icono.
4. Confirmar que la FAB no solape el contenido.

---

### 11) Notas
- Si el frontend actualiza la paleta, solo se cambian los tokens; los componentes quedan intactos.
- Si se usa XML en vez de Compose, replicar los mismos nombres en `colors.xml`, `styles.xml` y `shapeAppearance` con radios 16.


