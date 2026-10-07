export type BaseUnit='g'|'ml'|'pieza'|'min';
export interface Ingredient {id:string;name:string;category:string;brand:string;supplierId:string;presentation:string;packQty:string;packUnit:BaseUnit;min:string;location:string;notes:string;averageCost:string;demo?:boolean}
export interface Supplier {id:string;name:string;company:string;phone:string;whatsapp:string;email:string;address:string;notes:string;demo?:boolean}
export interface Lot {id:string;ingredientId:string;supplierId:string;code:string;entered:string;purchased:string;expires:string;qty:string;initialQty:string;unitCost:string;location:string;demo?:boolean}
export interface Movement {id:string;date:string;ingredientId:string;lotId:string;type:string;qty:string;unitCost:string;physicalCost:string;reference:string;actor:string;notes:string;demo?:boolean}
export interface PurchaseLine {ingredientId:string;qty:string;unit:string;price:string;expires:string;lotCode:string}
export interface Purchase {id:string;date:string;supplierId:string;ticket:string;lines:PurchaseLine[];tax:string;discount:string;freight:string;total:string;payment:string;notes:string;demo?:boolean}
export interface Component {kind:'ingredient'|'recipe'|'equipment';ref:string;qty:string}
export interface Recipe {stockIngredientId?:string;id:string;name:string;type:'masa'|'subreceta'|'producto';yield:string;unit:BaseUnit;waste:string;components:Component[];demo?:boolean}
export interface Equipment {id:string;name:string;price:string;hours:string;demo?:boolean}
export interface Product {id:string;name:string;size:string;recipeId:string;price:string;demo?:boolean}
export interface Sale {id:string;ticket:string;date:string;actor:string;payment:'Efectivo'|'Tarjeta'|'Transferencia';received:string;change:string;discount:string;subtotal:string;total:string;cost:string;consumeInventory:boolean;notes:string;items:{productId:string;name:string;size:string;qty:string;price:string;cost:string}[]}
export interface Production {id:string;date:string;actor:string;recipeId:string;scale:string;finalQty:string;waste:string;balls:{grams:string;count:string}[];theoreticalCost:string;actualCost:string;items:{ingredientId:string;qty:string;cost:string}[];notes:string;demo?:boolean}
export interface Waste {id:string;date:string;ingredientId:string;qty:string;cost:string;reason:string;actor:string;notes:string;demo?:boolean}
export interface CostHistory {id:string;date:string;ingredientId:string;supplierId:string;previous:string;current:string;reference:string;demo?:boolean}
export interface Audit {id:string;date:string;actor:string;operation:string;before:string;after:string;reference:string;demo?:boolean}
export interface Settings {name:string;primary:string;secondary:string;currency:string;language:string;logo:string;compactLogo:string;favicon:string;target:string;expiryDays:number;priceAlert:string;valuation:'average'|'fifo';actor:string;ballSizes:string[]}
export interface State {version:1;sales:Sale[];ingredients:Ingredient[];suppliers:Supplier[];lots:Lot[];movements:Movement[];purchases:Purchase[];recipes:Recipe[];equipment:Equipment[];products:Product[];productions:Production[];wastes:Waste[];history:CostHistory[];audit:Audit[];settings:Settings}
export const id=()=>crypto.randomUUID();
export const now=()=>new Date().toISOString();
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Hermosillo'}).format(new Date());
export const defaults:Settings={name:'Pizzas del Abraham',primary:'#A84A32',secondary:'#0067B1',currency:'MXN',language:'Español',logo:'',compactLogo:'',favicon:'',target:'30',expiryDays:7,priceAlert:'10',valuation:'average',actor:'Abraham',ballSizes:['220','300','400','500']};
export const empty=():State=>({version:1,sales:[],ingredients:[],suppliers:[],lots:[],movements:[],purchases:[],recipes:[],equipment:[],products:[],productions:[],wastes:[],history:[],audit:[],settings:{...defaults}});

