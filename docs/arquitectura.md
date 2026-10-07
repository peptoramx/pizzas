# Arquitectura y decisiones

Frontend estático React + TypeScript + Vite; rutas hash compatibles con /pizzas/. Sin servidor Node en Pages. Capa de dominio independiente de React, cantidades y moneda como cadenas decimales y operaciones con Decimal (40 dígitos). Presentación monetaria a dos decimales, sin redondeos intermedios.

Relaciones: proveedor → compra → partidas → lotes → movimientos; insumo → componentes de receta; receta → componentes (insumo/subreceta/equipo); variante de producto → receta; producción → receta + partidas reales + instantánea de costos y lotes consumidos; merma/conteo → movimientos. Los IDs son estables. No se borra un insumo referenciado.

Unidades base: g, ml, pieza, min. kg→g y L→ml multiplican por 1000. Una presentación comercial tiene contenido explícito y unidad compatible. No convertir masa a volumen sin densidad; recetas declaran peso final medido. Paquetes/cajas/bolsas se convierten mediante su contenido, no con factores universales.

Valuación: promedio ponderado perpetuo por defecto; FIFO opcional. FEFO selecciona lotes físicos vigentes y excluye caducados. Consumos se prevalidan y se aplican de forma atómica a una copia del estado. Kardex registra lote, cantidad, costo financiero, costo físico, responsable y referencia. Producciones conservan instantáneas inmutables. Compras distribuyen descuento, impuestos y flete proporcionalmente al valor de las partidas.

Recetas recursivas con detección de ciclos. Equipos calculan costo/minuto. Masa y subrecetas se costean por rendimiento útil. Productos suman ingredientes, empaques, cocción y otros variables. Food cost alimentario se distingue del porcentaje de costo variable total; la sugerencia pedida usa costo variable / objetivo.

Persistencia: Repository async y LocalRepository con validación Zod, versión de esquema, respaldo JSON y notificación de errores de cuota. Los datos son locales a navegador/origen, no hay autenticación ficticia. Para Supabase sustituir Repository y trasladar transacciones al servidor con RLS, autenticación, numeric y control de concurrencia. No colocar claves secretas en Vite. Un esquema SQL orientativo se incluye; no se anuncia conexión sin configurar.

Identidad: tokens CSS centralizados, wordmark provisional, marcas configurables con imágenes raster. SVG rechazado para evitar contenido activo. Logos y favicon almacenados en configuración y reutilizados en pantalla e impresión.

Producción interna: masa y subrecetas generan un insumo Elaborados y un lote con costo real / rendimiento útil. Cuando existe stockIngredientId, flatten consume ese elaborado en vez de expandir nuevamente sus materias primas. La caducidad del lote se captura posteriormente en Inventario → Lotes.
