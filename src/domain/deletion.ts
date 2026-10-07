import {type State} from './model';
import {D,sum,stock,transact} from './engine';
export type RecordKind='ingredient'|'supplier'|'recipe'|'product'|'equipment'|'purchase'|'production'|'sale'|'waste'|'movement'|'lot';
const blocked=(message:string)=>{throw Error(message)};
export function deleteRecord(state:State,kind:RecordKind,ref:string):State{
 if(kind==='lot'){const entry=state.movements.find(m=>m.lotId===ref&&D(m.qty).gt(0));if(!entry)blocked('Este lote no tiene una entrada registrada.');return deleteRecord(state,'movement',entry!.id)}
 if(kind==='movement'){const movement=state.movements.find(m=>m.id===ref);if(!movement)blocked('El movimiento ya no existe.');const source=movement!.type.includes('compra')?'purchase':movement!.type.includes('producción')?'production':movement!.type.includes('venta')?'sale':movement!.type==='Merma'?'waste':null;if(source)return deleteRecord(state,source,movement!.reference);if(movement!.type!=='Ajuste por conteo')blocked('Elimina este movimiento desde su registro de origen.');}
 const list={ingredient:'ingredients',supplier:'suppliers',recipe:'recipes',product:'products',equipment:'equipment',purchase:'purchases',production:'productions',sale:'sales',waste:'wastes',movement:'movements'}[kind] as 'ingredients'|'suppliers'|'recipes'|'products'|'equipment'|'purchases'|'productions'|'sales'|'wastes'|'movements';
 const record=state[list].find(x=>x.id===ref);if(!record)blocked('El registro ya no existe.');
 const used=(test:boolean,message:string)=>{if(test)blocked(message)};
 if(kind==='ingredient')used(state.lots.some(x=>x.ingredientId===ref)||state.movements.some(x=>x.ingredientId===ref)||state.purchases.some(x=>x.lines.some(l=>l.ingredientId===ref))||state.recipes.some(x=>x.stockIngredientId===ref||x.components.some(c=>c.kind==='ingredient'&&c.ref===ref)),'El insumo tiene lotes, movimientos o recetas. Elimina primero sus registros relacionados.');
 if(kind==='supplier')used(state.purchases.some(x=>x.supplierId===ref)||state.lots.some(x=>x.supplierId===ref),'El proveedor tiene compras o lotes. Elimina primero las compras relacionadas.');
 if(kind==='recipe')used(state.products.some(x=>x.recipeId===ref)||state.productions.some(x=>x.recipeId===ref)||state.recipes.some(x=>x.components.some(c=>c.kind==='recipe'&&c.ref===ref))||state.lots.some(x=>x.ingredientId===state.recipes.find(r=>r.id===ref)?.stockIngredientId),'La receta tiene productos, producciones, lotes o subrecetas relacionadas. Elimina primero esos registros.');
 if(kind==='equipment')used(state.recipes.some(x=>x.components.some(c=>c.kind==='equipment'&&c.ref===ref)),'El equipo se utiliza en una receta. Retíralo de la receta antes de eliminarlo.');
 const transactional=['purchase','production','sale','waste','movement'].includes(kind);
 const movements=transactional?state.movements.filter(m=>kind==='movement'?m.id===ref:m.reference===ref):[];
 // Only reverse the most recent movements of each affected ingredient: later costs stay valid.
 for(const movement of movements){const index=state.movements.findIndex(m=>m.id===movement.id);used(state.movements.slice(index+1).some(m=>m.ingredientId===movement.ingredientId&&!movements.some(x=>x.id===m.id)),`Hay movimientos posteriores de ${state.ingredients.find(i=>i.id===movement.ingredientId)?.name}. Elimina primero esos movimientos desde su origen.`)}
 return transact(state,'Eliminar registro',draft=>{
  for(const m of [...movements].reverse()){const lot=draft.lots.find(l=>l.id===m.lotId);if(!lot)blocked('No se puede revertir: falta el lote original.');if(D(m.qty).lt(0)){const qty=D(lot!.qty).minus(m.qty);if(qty.gt(lot!.initialQty))blocked('La reversión excedería la cantidad original del lote.');lot!.qty=qty.toString()}else{if(!D(lot!.qty).eq(m.qty))blocked('Este lote ya fue consumido. Elimina primero sus consumos.');draft.lots=draft.lots.filter(l=>l.id!==m.lotId)}}
  draft.movements=draft.movements.filter(m=>!movements.some(x=>x.id===m.id));
  if(kind!=='movement')(draft[list] as {id:string}[])=(draft[list] as {id:string}[]).filter(x=>x.id!==ref);
  if(kind==='purchase')draft.history=draft.history.filter(h=>h.reference!==ref);
  if(kind==='supplier')draft.ingredients.filter(i=>i.supplierId===ref).forEach(i=>i.supplierId='');
  for(const ingredientId of new Set(movements.map(m=>m.ingredientId))){const ingredient=draft.ingredients.find(i=>i.id===ingredientId)!;const qty=stock(draft,ingredientId);if(qty.gt(0)){const value=draft.settings.valuation==='average'?sum(draft.movements.filter(m=>m.ingredientId===ingredientId).map(m=>D(m.qty).mul(m.unitCost))):sum(draft.lots.filter(l=>l.ingredientId===ingredientId).map(l=>D(l.qty).mul(l.unitCost)));ingredient.averageCost=value.div(qty).toString()}else ingredient.averageCost=draft.movements.filter(m=>m.ingredientId===ingredientId&&D(m.qty).gt(0)).at(-1)?.unitCost||'0'}
  draft.audit.push({id:crypto.randomUUID(),date:new Date().toISOString(),actor:state.settings.actor,operation:'Registro eliminado · '+kind,before:JSON.stringify({record,movements}),after:'',reference:ref});
 });
}
