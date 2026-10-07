# Pizzas del Abraham

Sistema local de inventario, recetas, producción y costeo, en español y MXN. Identidad Napoli: terracota, harina y Azzurro; wordmark provisional y logos configurables.

## Ejecutar

Requisitos: Node 24 y pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

La aplicación vive en `/pizzas/`. Las rutas usan hash, por ejemplo `/pizzas/#Inventario`, por lo que no requieren rewrites de servidor. `dist/` es el resultado estático. `scripts/test.mjs` transpila y ejecuta los casos de dominio con el runner nativo de Node, sin procesos secundarios; los mismos casos son compatibles con Vitest. Vite usa la API de TypeScript para compilar TSX en entornos restringidos. La comprobación de tipos se realiza con `tsc`, separada de la transpilación.

## GitHub Pages

El workflow `.github/workflows/pages.yml` instala dependencias con lockfile, ejecuta pruebas, verifica TypeScript, construye y publica `dist`. En Settings → Pages selecciona **GitHub Actions** como origen. La URL prevista es `https://peptoramx.github.io/pizzas/`. No se ejecuta Node en Pages. El primer despliegue requiere que Pages esté habilitado en el repositorio. Un workflow configurado no demuestra por sí mismo que la publicación haya ocurrido: consulta su estado en Actions.

## Arquitectura

- `src/domain/model.ts`: entidades relacionadas y configuración.
- `src/domain/engine.ts`: conversiones, recetas recursivas, compras, FEFO, producción, mermas, conteos, alertas y valuación.
- `src/data/repository.ts`: contrato async de persistencia, adaptador local, validación de respaldos y exportación.
- `src/data/demo.ts`: datos de demostración identificados; compras, dos lotes de queso, masa, salsa, pizza, proveedores y amasada.
- `src/ui/`: pantallas, captura, tablas, simulación y tokens CSS.
- [Decisiones de arquitectura](docs/arquitectura.md).
- [Esquema relacional de referencia](docs/schema.sql), para una futura migración; no es un backend ya conectado.

Los datos se guardan únicamente en este navegador y origen. No hay autenticación ni sincronización multi-dispositivo. Se pueden exportar e importar respaldos JSON completos. El adaptador local usa transacciones sobre una copia validada del estado; si una operación falla no se guarda parcialmente. No abrir varias pestañas para editar simultáneamente: no hay control de concurrencia entre pestañas.

Para conectar Supabase, implementar `Repository`, autenticación y RLS por negocio; mover compras y consumos a transacciones SQL/RPC y utilizar `numeric` para moneda y cantidades. No almacenar una service-role key en Vite ni suponer que el frontend garantiza aislamiento de usuarios.

## Modelo y costeo

Proveedor → compra → partidas → lotes → kardex. Insumos/equipos/subrecetas → componentes de receta → variantes de producto. Producción → instantánea de ingredientes y costos reales. Merma/conteo → movimiento y auditoría. Los costos actuales son derivados; los históricos de producción permanecen guardados.

Cantidades y costos se serializan como cadenas y calculan con `decimal.js` a 40 dígitos. kg→g y L→ml multiplican por 1000. No hay conversión automática de masa a volumen. Para una bolsa, lata o caja comercial se declara su contenido en g, ml o piezas. Se muestran importes finales a dos decimales, costos base a seis.

Promedio ponderado perpetuo por defecto. Consumo físico FEFO entre lotes no caducados; los caducados pueden darse de baja por merma. FIFO financiero está disponible para una base nueva y usa capas de entrada independientemente del orden físico. Con movimientos existentes se bloquea el cambio de método para no mezclar valuaciones.

Compra: cantidad convertida a base, costo neto más impuestos/flete menos descuento, distribuidos proporcionalmente; nuevo lote, movimiento, historial y promedio ponderado. Los impuestos se consideran parte del costo capturado: no hay desglose fiscal de IVA acreditable.

Receta: suma de componentes; subreceta = costo total / rendimiento útil × cantidad utilizada; equipo = precio / (horas × 60) × minutos. Masa útil = rendimiento final − merma. Bola = gramaje × costo / masa útil. Número de bolas completas = parte entera de masa útil / gramaje; se informa remanente. Mezclas de gramajes se validan contra el peso útil real.

Producto: costo variable = alimentos + empaque + equipo. Se muestran food cost alimentario, costo variable / venta, contribución y margen de contribución. Precio objetivo = costo variable / (objetivo/100). No se presenta la contribución como utilidad neta ni como utilidad bruta contable sin mano de obra/costos indirectos.

## Uso diario

1. **Proveedores:** crear contacto y datos comerciales. La comparación muestra el último precio registrado por proveedor y unidad base.
2. **Insumos:** crear nombre, categoría, proveedor, presentación, contenido, unidad base, mínimo y ubicación. Ejemplo: mozzarella de 2.5 kg → contenido 2500, unidad g.
3. **Compras:** elegir proveedor y fecha, agregar partidas. Si se elige “presentación”, el precio corresponde a una bolsa/caja declarada. Capturar lote y caducidad. Guardar crea entradas y actualiza costos; no editar stock a mano.
4. **Recetas / Amasadas:** crear componentes en unidades base, rendimiento final y merma. La receta de masa muestra alternativas de 220/300/400/500 g. Las subrecetas se pueden anidar; se rechazan ciclos.
5. **Producción:** seleccionar receta, multiplicador, consumos reales, peso final antes de merma, merma y bolas reales por gramaje. El registro consume ingredientes y conserva costos.
6. **Productos:** primero crear una receta tipo producto; luego asociar producto, tamaño y precio. Abrir escandallo y simulador. Los precios relativos del simulador no cambian inventario. “Guardar precio y gramajes” guarda solo venta y cantidades; los costos de insumos se actualizan mediante compras.
7. **Inventario:** consultar stock, lotes y kardex; conteo físico con motivo genera ajuste. Las sugerencias consideran mínimo, consumo de 30 días y lotes próximos a vencer.
8. **Mermas:** registrar insumo, cantidad y motivo; se genera salida y costo histórico.
9. **Reportes:** filtrar por fecha y exportar CSV o imprimir/guardar PDF con el navegador. Inventario y rentabilidad reflejan el estado actual, no una reconstrucción a fecha histórica.
10. **Configuración:** editar identidad, logos raster, favicon, gramajes, objetivo y umbrales. Exportar respaldos antes de restaurar o vaciar. “Vaciar datos y comenzar” elimina también la demostración.

## Identidad y responsive

Tokens en `src/ui/styles.css`. Display editorial y sans legible para datos, colores cálidos con Azzurro como acento. Sidebar de escritorio, drawer móvil y tablas adaptadas a filas con etiquetas. Logos en configuración e impresión; sin archivo de logo hardcodeado. PNG/JPG/WEBP hasta 1.5 MB. SVG no habilitado. Las fuentes tienen fallback local si Google Fonts no está disponible.

## Alcance y siguientes ampliaciones

Esta entrega es una versión local funcional; no equivale todavía a un sistema multiusuario conectado. Las preparaciones internas (masa/salsa) generan un insumo elaborado y un lote al registrar producción. Los productos consumen ese lote cuando existe; si la subreceta nunca se ha producido se expanden los insumos originales. Asigna caducidad a los lotes de elaborados en Inventario → Lotes. El costeo teórico siempre refleja la receta vigente y el real conserva el valor de los lotes consumidos. El punto de venta registra ingresos y tickets de control; rentabilidad en Productos sigue siendo un cálculo unitario. El POS no procesa cobros bancarios ni emite facturas fiscales.

Pendiente para cubrir todo el alcance operativo original: devoluciones/transferencias explícitas, reconstrucción de costos teóricos a fecha, reportes y gráficas avanzadas de importes, importación CSV, permisos multiusuario y backend Supabase. Auditoría local no es un registro inviolable. Respaldos validados por estructura y referencias; no representan verificación contable de archivos ajenos.

## Validación

Pruebas de conversiones, precisión, promedio ponderado, distribución de cargos, recetas/subrecetas, bolas, ciclos, FEFO, falta de stock, atomicidad, producción histórica y mermas. Comprobar también captura y navegación en escritorio y móvil antes de usar datos reales. Los datos demo y sus precios son ficticios.


## Punto de venta rápido

En **Punto de venta**, pulsa un producto/tamaño, ajusta cantidades, captura un descuento opcional, elige Efectivo/Tarjeta/Transferencia y registra el cobro. Efectivo calcula cambio; los otros métodos registran el importe exacto. El catálogo usa los productos y precios configurados.

Por defecto registra únicamente la venta para control. Activa **Descontar insumos al vender** si no has registrado antes la producción de esas pizzas. El descuento genera movimientos FEFO; un error de stock o de pago rechaza toda la operación. No descontar producción y venta del mismo producto dos veces.

Los tickets guardan precio, tamaño, cantidades y costo histórico. En modo solo control el costo es teórico; con inventario corresponde al consumo financiero más energía. Incluye resumen del día consultado, efectivo vendido, ticket promedio, historial, CSV y comprobante imprimible. No integra terminal bancaria, facturación fiscal, cancelaciones ni corte contable de caja. Los respaldos previos sin ventas migran automáticamente con un historial vacío.
