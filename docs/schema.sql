-- Modelo de referencia PostgreSQL para migración futura. No ejecutado.
-- Añadir tenant_id, RLS, auth.users y transacciones RPC antes de producción.
create table suppliers(id uuid primary key, name text not null, company text, phone text, whatsapp text, email text, address text, notes text);
create table ingredient_categories(id uuid primary key, name text unique not null);
create table ingredients(id uuid primary key, name text not null, category_id uuid references ingredient_categories, supplier_id uuid references suppliers, brand text, presentation text, pack_qty numeric(30,12) check(pack_qty>0), base_unit text check(base_unit in ('g','ml','pieza')), minimum numeric(30,12) default 0, average_cost numeric(30,12) default 0, location text, notes text);
create table purchases(id uuid primary key, supplier_id uuid references suppliers, date date not null, ticket text, tax numeric(30,12), discount numeric(30,12), freight numeric(30,12), total numeric(30,12), payment text, notes text);
create table purchase_items(id uuid primary key, purchase_id uuid references purchases, ingredient_id uuid references ingredients, quantity numeric(30,12), unit text, price numeric(30,12), landed_cost numeric(30,12));
create table inventory_lots(id uuid primary key, ingredient_id uuid references ingredients, supplier_id uuid references suppliers, purchase_item_id uuid references purchase_items, code text, entered date, expires date, quantity numeric(30,12) check(quantity>=0), initial_quantity numeric(30,12), unit_cost numeric(30,12), location text);
create table equipment(id uuid primary key, name text, energy_price numeric(30,12), effective_hours numeric(30,12) check(effective_hours>0));
create table recipes(id uuid primary key, name text not null, type text check(type in ('masa','subreceta','producto')), yield_quantity numeric(30,12), waste numeric(30,12), unit text, check(yield_quantity>waste));
create table recipe_components(id uuid primary key, recipe_id uuid references recipes, ingredient_id uuid references ingredients, subrecipe_id uuid references recipes, equipment_id uuid references equipment, quantity numeric(30,12) check(quantity>0), check(num_nonnulls(ingredient_id,subrecipe_id,equipment_id)=1));
create table products(id uuid primary key, name text);
create table product_variants(id uuid primary key, product_id uuid references products, size text, recipe_id uuid references recipes, sale_price numeric(30,12) check(sale_price>0));
create table production_batches(id uuid primary key, recipe_id uuid references recipes, date timestamptz, actor text, scale numeric(30,12), final_quantity numeric(30,12), waste numeric(30,12), theoretical_cost numeric(30,12), actual_cost numeric(30,12), notes text);
create table production_batch_items(id uuid primary key, batch_id uuid references production_batches, ingredient_id uuid references ingredients, quantity numeric(30,12), snapshot_cost numeric(30,12));
create table dough_ball_outputs(id uuid primary key, batch_id uuid references production_batches, grams numeric(30,12), count integer check(count>0));
create table waste_records(id uuid primary key, ingredient_id uuid references ingredients, quantity numeric(30,12), cost numeric(30,12), date timestamptz, reason text, actor text, notes text);
create table inventory_movements(id uuid primary key, ingredient_id uuid references ingredients, lot_id uuid references inventory_lots, date timestamptz, type text, quantity numeric(30,12), unit_cost numeric(30,12), physical_unit_cost numeric(30,12), reference uuid, actor text, notes text);
create table cost_history(id uuid primary key, ingredient_id uuid references ingredients, supplier_id uuid references suppliers, date timestamptz, previous numeric(30,12), current numeric(30,12), reference uuid);
create table audit_log(id uuid primary key, date timestamptz, actor text, operation text, reference text, before_value jsonb, after_value jsonb);
create table settings(id uuid primary key, identity jsonb, operation jsonb, version integer);
create index lots_fefo on inventory_lots(ingredient_id,expires,entered) where quantity>0;
create index movements_kardex on inventory_movements(ingredient_id,date);
create index cost_history_dates on cost_history(ingredient_id,date);
-- Empaques: categoría de insumo, unidad pieza. Subrecetas: tipo de receta.
-- Energía: equipo con precio y horas. Alertas: vistas derivadas, no duplicar stock.
alter table recipes add column stock_ingredient_id uuid references ingredients;
