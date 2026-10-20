export const DAY=86400000;
export function validCard(x){
 if(!x||typeof x!=='object'||typeof x.id!=='string'||!/^[\w-]{1,80}$/.test(x.id)||typeof x.front!=='string'||!x.front.trim()||x.front.length>300||typeof x.back!=='string'||!x.back.trim()||x.back.length>1000||!Number.isFinite(x.due)||(x.due<0||x.due>8640000000000000)||!Number.isInteger(x.interval)||x.interval<0||x.interval>365||!Number.isInteger(x.reviews)||x.reviews<0||!Number.isFinite(x.ease)||x.ease<1.3||x.ease>3)throw Error('Invalid card data');
 return {id:x.id,front:x.front.trim(),back:x.back.trim(),due:x.due,interval:x.interval,reviews:x.reviews,ease:x.ease};
}
export function create(front,back,id,now=Date.now()){return validCard({id,front,back,due:now,interval:0,reviews:0,ease:2.5});}
export function decode(text){const x=JSON.parse(text);if(!x||x.version!==1||!Array.isArray(x.cards)||x.cards.length>500)throw Error('Expected version 1 backup with up to 500 cards');const cards=x.cards.map(validCard);if(new Set(cards.map(c=>c.id)).size!==cards.length)throw Error('Duplicate card IDs');return cards;}
export function encode(cards){return JSON.stringify({version:1,cards:cards.map(validCard)},null,2);}
export function dueCards(cards,now=Date.now()){return cards.filter(c=>c.due<=now).sort((a,b)=>a.due-b.due||a.id.localeCompare(b.id));}
export function grade(card,rating,now=Date.now()){
 const c=validCard(card);if(!['again','good','easy'].includes(rating))throw Error('Unknown grade');
 if(rating==='again')return {...c,due:now+600000,interval:0,reviews:c.reviews+1,ease:Math.max(1.3,c.ease-.2)};
 const interval=Math.min(365,Math.max(1,Math.round(c.interval?c.interval*c.ease*(rating==='easy'?1.3:1):rating==='easy'?3:1)));
 return {...c,interval,due:now+interval*DAY,reviews:c.reviews+1,ease:Math.min(3,c.ease+(rating==='easy'?.1:0))};
}
