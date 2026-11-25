# Money — app de finanzas personales (PWA)

App instalable para celular y PC, funciona sin internet. Hecha en HTML/CSS/JS puro, sin dependencias, para que cargue rápido.

## Archivos
- `index.html` — toda la app (estilos + lógica). Datos en `localStorage`: `money-v2` (cuentas, metas, préstamos, pagos fijos, presupuesto) y un `money-v2-tx-AAAA-MM` por mes de movimientos; al guardar solo se reescriben los meses marcados con `touch()`. Si existe `money-v1` (formato viejo) se migra solo y se borra cuando todo quedó guardado. Montos con coma (`en-US`): $20,000.
- `sw.js` — service worker: guarda la app en caché para usarla offline. **Al cambiar cualquier archivo, sube `CACHE` (money-v1 → money-v2)** para que los celulares reciban la actualización.
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png` — para instalarla como app.

## Secciones
Inicio (saldo con ojo para ocultar, flujo del mes vs mes pasado, accesos rápidos, "Lo que noté" con patrones aprendidos, presupuesto diario, próximos pagos fijos, cuentas, gastos por categoría, últimos movimientos, respaldo con recordatorio). Ya no hay botón + flotante: se registra con Gasto/Ingreso/Transferir de Inicio. El formulario pide solo valor y descripción; fecha y hora se guardan solas y lo demás es editable después. Pagos fijos (`recurring`) se anotan solos cada mes. · Movimientos (por mes, búsqueda, filtros) · Presupuesto (límites por categoría) · Resumen (totales por rango de meses, por categoría y mes a mes) · Metas de ahorro · Pendientes (pestaña `deudas`): "Plata en el aire" (`pending`: lo que le deben del camello, Seguro/Tal vez, pago completo o parcial que crea un ingreso categoría Trabajo, "No llegó"; no cuenta en el saldo) + Préstamos (me deben / yo debo; `debts`). Mensajes de plata según monto: <5k chichiguas, 200k+ "¿y esa plata qué?", 1M+ palos (vocabulario: liga, lukas, caleta, mangos).

## Reglas para Claude Code
- Mantener: oscuro, minimalista, intuitivo, en español de Colombia **coloquial** (parce, perra, quiubo; el usuario lo pidió así), montos en COP sin decimales. Saludos en `SALUDO` rotan y cambian según cómo va con la plata.
- Nada de menús del sistema: `enhance()` convierte select, fecha, hora y listas en selectores propios que se despliegan en el panel. Efecto vidrio en hero, botones, barra y paneles. Paneles se cierran arrastrando y bloquean el fondo.
- Rendimiento (el usuario notó lag en el celular): `backdrop-filter` solo en lo que flota (barra, diálogo, aviso), nunca en tarjetas ni listas; el fondo de colores va en `body::before` fijo, no con `background-attachment:fixed`; saldos en caché (`BAL`, se limpia en `save()`). Debe aguantar decenas de miles de movimientos: usar `ofMonth()`/`idx()` (índice por mes) y `memo()` en vez de recorrer u ordenar `S.tx` completo; `save()` escribe diferido (`flush` en idle y al ocultar la app); "Lo que noté" se calcula en idle (`insLater`). Probado con 20.000 movimientos.
- Sin selección de texto ni menú de copiar al dejar el dedo (solo en inputs).
- Secciones de gastos editables en `S.cats` (Presupuesto → Secciones, `catsForm`): renombrar actualiza gastos, límites y pagos fijos; borrar deja los gastos como "Sin categoría"; el ojo las oculta sin borrarlas (`S.catsOff`, usar `catsOn()` para listas visibles). Ocultar o borrar una sección le quita el límite; los totales del presupuesto usan `budsOn()` (solo visibles). `CAT_OUT` es solo el valor inicial. Versión visible al final de Inicio (`APP_VER`, subirla junto con `CACHE`).
- Cuentas con `excl:true` ("Contar en el saldo" apagado) no suman en `total()`; se muestran aparte con `apart()`.
- Gama baja: `LITE` (≤4 GB o ≤4 núcleos o movimiento reducido) pone `html.lite` y apaga desenfoques, sombras y animaciones con blur. Bloqueo del fondo con `html.locked` (overflow), no con position:fixed. Tras guardar se redibuja con `later()` para no trabar el cierre del panel. Números con `nf()` (Intl reusado).
- Monto grande (`amtIn`/`amtLive`/`numPad`): teclado de números propio de la app (1-9, 000, 0, ⌫; mantener ⌫ borra todo), sin teclado del sistema. El valor va en un input oculto y se muestra con comas en `.amtv`. Sale solo si el monto está vacío; se esconde al enfocar otro campo. Los campos de plata pequeños (límites, meta total) usan `smallPad`: mismo teclado de la app, aparece debajo del campo tocado; nunca el teclado del sistema.
- Actualizaciones: `sw.js` abre la app al instante con la copia guardada (no espera internet) y la refresca por detrás. La página mira `sw.js` en idle: si su `money-vN` es mayor que `APP_VER`, baja la versión nueva y se recarga sola (espera si hay un panel abierto). Subir SIEMPRE `CACHE` y `APP_VER` juntos.
- Gasto: categorías como botoncitos debajo de "¿En qué?" (`#fCatC`, fila que se desliza de lado); se marcan solas según la descripción (`catGuess`). El arrastre del panel ignora gestos de lado.
- Avisos sin comas y variados (`OK`/`say()`, `MSG`/`moneyMsg()`). Si falta un dato se usa `need()`: pide solo ese campo, lo enfoca y lo sacude. Enter en el panel va al siguiente campo vacío o guarda.
- Sin frameworks ni librerías externas (debe abrir sin internet).
- No cambiar el formato de datos sin migrar lo que ya existe en `localStorage`.

## Publicar (una vez, gratis) con GitHub Pages
1. Crear un repositorio público `money` en GitHub y subir estos archivos.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Abrir `https://<usuario>.github.io/money/` en el celular (Chrome) → menú ⋮ → "Instalar app".
Después de abrirla una vez, funciona sin internet.

Probar en el PC: `npx serve .` o `python -m http.server` y abrir http://localhost:8000
