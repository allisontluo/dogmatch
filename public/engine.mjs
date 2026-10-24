// Values are simplified project estimates for adult dogs, not veterinary advice.
import {extendedBreeds,householdTraits} from './catalog.mjs?v=19';
export {householdTraits};
const originalBreeds = [
 {id:'havanese',name:'Havanese',size:'small',exercise:45,training:1,grooming:3,shedding:1,space:1,experience:1,description:'A small, sociable companion with a cheerful outlook.',watch:'A long coat needs consistent grooming; plan for company and coat care.',url:'https://www.akc.org/dog-breeds/havanese/'},
 {id:'whippet',name:'Whippet',size:'medium',exercise:60,training:1,grooming:1,shedding:2,space:1,experience:1,description:'A graceful sprinter with a soft spot for home comforts.',watch:'Secure exercise areas matter. Discuss prey drive around smaller pets.',url:'https://www.akc.org/dog-breeds/whippet/'},
 {id:'labrador',name:'Labrador Retriever',size:'large',exercise:90,training:2,grooming:2,shedding:3,space:2,experience:1,description:'An energetic, outgoing companion for an active routine.',watch:'Make room for daily exercise, training, and a shedding coat.',url:'https://www.akc.org/dog-breeds/Labrador-retriever/'},
 {id:'poodle',name:'Standard Poodle',size:'large',exercise:90,training:2,grooming:3,shedding:1,space:2,experience:1,description:'A bright, active partner with a lower-shedding curly coat.',watch:'Budget time and resources for brushing and professional coat care.',url:'https://www.akc.org/dog-breeds/poodle-standard/'},
 {id:'collie',name:'Border Collie',size:'medium',exercise:120,training:3,grooming:2,shedding:3,space:2,experience:2,description:'A focused working partner who thrives with a job to do.',watch:'Needs substantial mental enrichment as well as physical activity.',url:'https://www.akc.org/dog-breeds/border-collie/'},
 {id:'greyhound',name:'Greyhound',size:'large',exercise:60,training:1,grooming:1,shedding:2,space:1,experience:1,description:'A gentle, independent hound with a sprinter’s spirit.',watch:'Ask about safe off-leash areas and compatibility with small animals.',url:'https://www.akc.org/dog-breeds/greyhound/'},
 {"id": "samoyed", "name": "Samoyed", "size": "large", "exercise": 90, "training": 2, "grooming": 3, "shedding": 3, "space": 2, "experience": 2, "description": "A bright, active companion with a thick white coat and an expressive smile.", "watch": "Plan for regular brushing, substantial shedding, daily activity, and company.", "url": "https://www.akc.org/dog-breeds/samoyed/"},
 {"id": "aussiedoodle", "name": "Aussiedoodle", "size": "medium", "exercise": 90, "training": 3, "grooming": 3, "shedding": 2, "space": 2, "experience": 2, "description": "An active Australian Shepherd–Poodle mix. This profile models a medium adult; size and coat vary.", "watch": "Ask about the individual dog’s adult size, shedding, grooming, and herding tendencies.", "url": "https://www.petmd.com/dog/breeds/aussiedoodle"},
 {"id": "golden", "name": "Golden Retriever", "size": "large", "exercise": 90, "training": 2, "grooming": 2, "shedding": 3, "space": 2, "experience": 1, "description": "An outgoing, energetic companion who enjoys activities and time with people.", "watch": "Allow time for exercise, training, and brushing a shedding, feathered coat.", "url": "https://www.akc.org/dog-breeds/golden-retriever/"},
 {"id": "goldendoodle", "name": "Mini Goldendoodle", "size": "small", "exercise": 60, "training": 2, "grooming": 3, "shedding": 2, "space": 1, "experience": 1, "description": "A smaller Golden Retriever–Poodle mix. This representative profile models a small adult; individual size, coat, and activity needs vary.", "watch": "Coats and shedding differ between dogs. Plan for regular brushing and professional grooming.", "url": "https://www.petmd.com/dog/breeds/goldendoodle"},
 {"id": "terrier", "name": "Jack Russell Terrier", "size": "small", "exercise": 90, "training": 3, "grooming": 1, "shedding": 2, "space": 1, "experience": 2, "coatLabel": "Short or rough coat", "description": "A small, lively working terrier with plenty of energy and a strong interest in exploring.", "watch": "Small does not mean low energy. Plan for enrichment, training, secure exercise, and prey-drive management.", "url": "https://vcahospitals.com/know-your-pet/jack-russell-terrier"}
];
export const breeds = [...originalBreeds,...extendedBreeds];
export const defaults = {home:'apartment',size:'any',experience:'new',exercise:60,alone:4,support:'none',training:2,grooming:1,shedding:'any',priority:'balanced',fluff:'any',children:'none',pets:'none',barking:'any',social:'any',drool:'any'};
const choices={children:['none','older','young'],pets:['none','dogs','cats','small'],barking:['any','quiet'],social:['any','visitors'],drool:['any','low'],fluff:['any','fluffy','sleek'],home:['apartment','house'],size:['any','small','medium','large'],experience:['new','experienced'],support:['none','yes'],shedding:['any','low'],priority:['balanced','activity','coat','size']};
export function normalizeProfile(raw={}) {
 if(!raw || typeof raw!=="object") raw={};
 const p={...defaults};
 for(const [key,values] of Object.entries(choices)) if(values.includes(raw[key])) p[key]=raw[key];
 for(const [key,min,max,step] of [['exercise',0,240,1],['alone',0,24,.5],['training',1,3,1],['grooming',1,3,1]]) {
  const n=Number(raw[key]); if(raw[key]!==undefined&&Number.isFinite(n)&&n>=min&&n<=max&&n%step===0) p[key]=n;
 }
 return p;
}
export function needsCarePlan(p){return p.alone>5&&p.support!=='yes';}
export function scoreBreed(b,raw) {
 const p=normalizeProfile(raw);
 const fit={activity:Math.min(100,p.exercise/b.exercise*100),training:Math.min(100,p.training/b.training*100),space:p.home==='house'||b.space===1?100:65,size:p.size==='any'||p.size===b.size?100:30,grooming:Math.min(100,p.grooming/b.grooming*100),shedding:p.shedding==='any'?100:(4-b.shedding)/3*100,experience:p.experience==='experienced'||b.experience===1?100:45};
 const t=householdTraits[b.id];
 fit.coat=matchesCoat(b,p)?100:0;
 fit.children=p.children==='none'?100:p.children==='older'?(t.children===1?65:100):t.children/3*100;
 fit.pets=p.pets==='none'?100:p.pets==='dogs'?t.dogs/3*100:Math.max(0,100-(t.prey-1)*(p.pets==='small'?40:30));
 fit.barking=p.barking==='any'?100:(4-t.bark)/3*100;
 fit.social=p.social==='any'?100:t.social/3*100;
 fit.drool=p.drool==='any'?100:(4-t.drool)/3*100;
 const weights={activity:25,training:15,space:10,size:15,grooming:15,shedding:10,experience:10};
 if(p.fluff!=='any')weights.coat=30;
 if(p.children!=='none')weights.children=15;
 if(p.pets!=='none')weights.pets=15;
 if(p.barking!=='any')weights.barking=10;
 if(p.social!=='any')weights.social=10;
 if(p.drool!=='any')weights.drool=10;
 if(p.priority==='activity'){weights.activity*=2;weights.training*=2;}
 if(p.priority==='coat'){weights.grooming*=2;weights.shedding*=2;}
 if(p.priority==='size')weights.size*=2;
 const weighted=Object.entries(weights).reduce((sum,[k,w])=>sum+w*fit[k],0)/Object.values(weights).reduce((a,b)=>a+b,0);
 return {breed:b,score:Math.min(needsCarePlan(p)?55:100,Math.round(weighted)),fit,uncappedScore:weighted};
}
export function rankBreeds(p){return breeds.map(b=>scoreBreed(b,p)).sort((a,b)=>b.score-a.score||b.uncappedScore-a.uncappedScore||a.breed.name.localeCompare(b.breed.name));}
export function restoreState(raw) {
 if(!raw||typeof raw!=='object'||raw.version!==1)throw new Error('Unrecognized saved data');
 const ids=new Set(breeds.map(b=>b.id));
 const list=value=>Array.isArray(value)?[...new Set(value.filter(id=>ids.has(id)))]:[];
 return {version:1,profile:normalizeProfile(raw.profile),step:Number.isInteger(raw.step)&&raw.step>=0&&raw.step<=3?raw.step:0,completed:raw.completed===true,favorites:list(raw.favorites),compare:list(raw.compare).slice(0,3),history:normalizeHistory(raw.history)};
}

// Coat appearance is separate from grooming and shedding. A fluffy dog may shed little.
export const fluffLevels = {havanese:3,whippet:0,labrador:0,poodle:3,collie:2,greyhound:0,samoyed:3,aussiedoodle:3,golden:2,goldendoodle:3,terrier:1,...Object.fromEntries(extendedBreeds.map(b=>[b.id,b.fluff]))};
// Coat preferences filter the shortlist and deck; the full catalog remains browsable.
export function matchesCoat(b,raw) {
 const p=normalizeProfile(raw);
 return p.fluff==='any'||(p.fluff==='fluffy'?fluffLevels[b.id]>=2:fluffLevels[b.id]<=1);
}
export function normalizeHistory(raw) {
 if(!Array.isArray(raw))return [];
 const seen=new Set();
 return raw.filter(item=>item&&breeds.some(b=>b.id===item.id)&&['like','pass'].includes(item.choice)&&!seen.has(item.id)&&seen.add(item.id))
  .map(item=>({id:item.id,choice:item.choice,wasSaved:item.wasSaved===true}));
}
function similarity(a,b) {
 const sizes={small:0,medium:1,large:2};
 return ((1-Math.abs(fluffLevels[a.id]-fluffLevels[b.id])/3)*0.5+
  (1-Math.abs(sizes[a.size]-sizes[b.size])/2)*0.25+
  (1-Math.abs(a.exercise-b.exercise)/105)*0.25)*100;
}
export function discoveryQueue(profile,history=[]) {
 const p=normalizeProfile(profile), decisions=normalizeHistory(history);
 const seen=new Set(decisions.map(d=>d.id));
 return rankBreeds(p).filter(row=>matchesCoat(row.breed,p)&&!seen.has(row.breed.id)).map(row=>{
  // Likes favor similar traits; passes favor different ones. Each vote has equal weight.
  const learned=decisions.length?decisions.reduce((sum,d)=>{
   const prior=breeds.find(b=>b.id===d.id), match=similarity(row.breed,prior);
   return sum+(d.choice==='like'?match:100-match);
  },0)/decisions.length:50;
  const confidence=Math.min(decisions.length/3,1);
  const discoveryScore=row.uncappedScore*0.85+(learned*confidence+50*(1-confidence))*0.15;
  return {...row,discoveryScore};
 }).sort((a,b)=>b.discoveryScore-a.discoveryScore||a.breed.name.localeCompare(b.breed.name));
}
