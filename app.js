import {create,decode,encode,dueCards,grade} from './model.js';
const $=s=>document.querySelector(s),KEY='recall-cards-v1';let cards=[],current=null;
function say(t){$('#message').textContent=t;}
try{const saved=localStorage.getItem(KEY);if(saved)cards=decode(saved);}catch(e){say('Saved deck could not be read. Import a backup or start a new deck.');}
function save(){try{localStorage.setItem(KEY,encode(cards));return true;}catch(e){say('Storage unavailable. Export a backup before closing.');return false;}}
function render(){
 const due=dueCards(cards);current=due[0]||null;$('#due').textContent=due.length;$('#total').textContent=`${cards.length} cards in your deck`;$('#question').textContent=current?current.front:cards.length?'All caught up. Let it settle.':'Every good idea starts with a question.';$('#answer').hidden=true;$('#answer').textContent=current?.back||'';$('#reveal').hidden=!current;$('#ratings').hidden=true;$('#progress').textContent=current?`${due.length} due`:'Nothing due';
 const deck=$('#deck');deck.replaceChildren();
 for(const c of [...cards].sort((a,b)=>a.due-b.due)){
  const row=document.createElement('div');row.className='deckitem';const info=document.createElement('div');info.textContent=c.front;const small=document.createElement('small');small.textContent=`${c.reviews} reviews · Due ${new Date(c.due).toLocaleString()}`;info.append(small);row.append(info);const del=document.createElement('button');del.textContent='Delete';del.setAttribute('aria-label',`Delete ${c.front}`);del.onclick=()=>{if(confirm('Delete this card?')){cards=cards.filter(x=>x.id!==c.id);save();render();}};row.append(del);deck.append(row);
 }
}
$('#add').onsubmit=e=>{e.preventDefault();try{if(cards.length>=500)throw Error('Maximum 500 cards');const f=new FormData(e.target);cards.push(create(f.get('front'),f.get('back'),crypto.randomUUID()));save();e.target.reset();render();say('Card added.');}catch(e){say(e.message);}};
$('#reveal').onclick=()=>{$('#answer').hidden=false;$('#reveal').hidden=true;$('#ratings').hidden=false;};
for(const b of document.querySelectorAll('[data-grade]'))b.onclick=()=>{if(!current)return;cards=cards.map(c=>c.id===current.id?grade(c,b.dataset.grade):c);save();render();say('Review saved.');};
$('#sample').onclick=()=>{if(cards.length&&!confirm('Replace the current deck with 4 synthetic study examples? Export first to keep your cards.'))return;cards=[['What is SQL GROUP BY used for?','Combining rows with matching values into groups for aggregation.'],['What is Java encapsulation?','Keeping state and behavior together while restricting direct access to internal details.'],['Why use a database transaction?','To commit related changes together or roll them back if any operation fails.'],['What is a spreadsheet relative reference?','A reference such as A1 that adjusts when a formula is copied.']].map(([f,b],i)=>create(f,b,'sample-'+i));save();render();say('Synthetic sample deck loaded.');};
$('#export').onclick=()=>{const u=URL.createObjectURL(new Blob([encode(cards)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='recall-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
$('#import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1000000)throw Error('Backup exceeds 1 MB');const imported=decode(await f.text());if(cards.length&&!confirm(`Replace your deck with ${imported.length} imported cards?`))return;cards=imported;save();render();say('Backup imported.');}catch(e){say('Import failed: '+e.message);}finally{e.target.value='';}};
render();
