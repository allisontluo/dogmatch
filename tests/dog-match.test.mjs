import test from 'node:test';
import assert from 'node:assert/strict';
import {breeds,defaults,rankBreeds,normalizeProfile,restoreState} from '../public/engine.mjs';
test('every score stays finite and in range across preference combinations',()=>{
 for(const exercise of [15,60,150])for(const grooming of [1,2,3])for(const priority of ['balanced','activity','coat','size'])for(const alone of [0,10]){
  const rows=rankBreeds({...defaults,exercise,grooming,priority,alone});
  assert.equal(rows.length,breeds.length);assert(rows.every(x=>Number.isInteger(x.score)&&x.score>=0&&x.score<=100));
  assert(rows.every((x,i)=>i===0||rows[i-1].score>=x.score));
 }
});
test('exercise and coat choices change relative matches',()=>{
 const low=rankBreeds({...defaults,exercise:15});const high=rankBreeds({...defaults,exercise:150,training:3,experience:'experienced'});
 assert(high.find(x=>x.breed.id==='collie').score>low.find(x=>x.breed.id==='collie').score);
 const coats=rankBreeds({...defaults,grooming:3,shedding:'low',priority:'coat'});
 assert(coats.find(x=>x.breed.id==='poodle').score>rankBreeds(defaults).find(x=>x.breed.id==='poodle').score);
});
test('long unsupervised days cap all results; care support clears the cap',()=>{
 assert(rankBreeds({...defaults,alone:9}).every(x=>x.score<=55));
 assert.equal(rankBreeds({...defaults,alone:9})[0].breed.id,rankBreeds(defaults)[0].breed.id);
 assert(rankBreeds({...defaults,alone:9,support:'yes'})[0].score>55);
 // A hidden prior care selection must not affect ordinary short days.
 assert.deepEqual(rankBreeds({...defaults,alone:4,support:'yes'}),rankBreeds(defaults));
});
test('corrupt persisted lists and numerical values cannot break charts or scores',()=>{
 const state=restoreState({version:1,profile:{exercise:'NaN',grooming:500,size:'invalid'},favorites:['bogus','poodle','poodle'],compare:['bogus',...breeds.map(x=>x.id)]});
 assert.equal(state.profile.exercise,60);assert.equal(state.profile.grooming,1);assert.deepEqual(state.favorites,['poodle']);assert.equal(state.compare.length,3);
 assert.throws(()=>restoreState({version:2}));
 assert.deepEqual(normalizeProfile(null),defaults);
});

test('coat preference and likes/pass votes adapt the unseen queue',async()=>{
 const {discoveryQueue}=await import('../public/engine.mjs');
 const fluffy=discoveryQueue({...defaults,fluff:'fluffy'});
 const sleek=discoveryQueue({...defaults,fluff:'sleek'});
 const get=(rows,id)=>rows.find(x=>x.breed.id===id).discoveryScore;
 const {fluffLevels}=await import('../public/engine.mjs');
 assert(fluffy.every(x=>fluffLevels[x.breed.id]>=2));
 assert(sleek.every(x=>fluffLevels[x.breed.id]<=1));
 assert(!fluffy.some(x=>['greyhound','whippet'].includes(x.breed.id)));
 assert(fluffy.some(x=>x.breed.id==='samoyed'));
 assert(sleek.some(x=>x.breed.id==='greyhound'));
 const liked=discoveryQueue(defaults,[{id:'havanese',choice:'like'}]);
 const passed=discoveryQueue(defaults,[{id:'havanese',choice:'pass'}]);
 assert(get(liked,'poodle')>get(passed,'poodle'));
 assert(get(passed,'whippet')>get(liked,'whippet'));
 assert(!liked.some(x=>x.breed.id==='havanese'));
 assert.equal(discoveryQueue(defaults,breeds.map(b=>({id:b.id,choice:'pass'}))).length,0);
});
test('old saved state migrates; duplicate or invalid swipe records are dropped',()=>{
 const old=restoreState({version:1,profile:defaults});assert.deepEqual(old.history,[]);assert.equal(old.profile.fluff,'any');
 const saved=restoreState({version:1,history:[{id:'poodle',choice:'like',wasSaved:true},{id:'poodle',choice:'pass'},{id:'bogus',choice:'like'},{id:'collie',choice:'hack'}]});
 assert.deepEqual(saved.history,[{id:'poodle',choice:'like',wasSaved:true}]);
});

test('expanded catalog has photos, coat values, and preserves the old swipe history',async()=>{
 const {existsSync}=await import('node:fs');
 const {fluffLevels,discoveryQueue}=await import('../public/engine.mjs');
 assert(breeds.length>=50);
 for(const id of ['samoyed','aussiedoodle','golden','goldendoodle','terrier']) assert(breeds.some(b=>b.id===id));
 for(const b of breeds){
  assert(Number.isFinite(fluffLevels[b.id]));
  assert(existsSync(new URL(`../public/photos/${b.id}.jpg`,import.meta.url)));
 }
 const original=['havanese','whippet','labrador','poodle','collie','greyhound'];
 const oldHistory=original.map(id=>({id,choice:'pass'}));
 const queue=discoveryQueue(defaults,oldHistory);
 assert.equal(queue.length,breeds.length-original.length);assert(queue.every(x=>Number.isFinite(x.discoveryScore)&&!original.includes(x.breed.id)));
 const restored=restoreState({version:1,history:oldHistory,favorites:['poodle'],completed:true});
 assert.equal(restored.history.length,6);assert.deepEqual(restored.favorites,['poodle']);assert(restored.completed);
});

test('household answers change scores and survive restoration',async()=>{
 const {scoreBreed}=await import('../public/engine.mjs');
 const score=(id,p)=>scoreBreed(breeds.find(b=>b.id===id),{...defaults,...p}).score;
 assert(score('beagle',{barking:'quiet'})<score('beagle',{}));
 assert(score('newfoundland',{drool:'low'})<score('newfoundland',{}));
 assert(score('maltese',{children:'young'})<score('maltese',{}));
 assert(score('whippet',{pets:'cats'})<score('whippet',{}));
 assert(score('shiba',{social:'visitors'})<score('shiba',{}));
 const profile={...defaults,children:'young',pets:'cats',barking:'quiet',social:'visitors',drool:'low'};
 const restored=restoreState({version:1,step:3,profile,completed:true,favorites:['samoyed']});
 assert.deepEqual(restored.profile,profile);assert.equal(restored.step,3);assert(restored.completed);
 assert.deepEqual(restored.favorites,['samoyed']);
});
test('every type has unique identity, source, and complete household estimates',async()=>{
 const {householdTraits,scoreBreed}=await import('../public/engine.mjs');
 assert.equal(new Set(breeds.map(b=>b.id)).size,breeds.length);
 assert.equal(new Set(breeds.map(b=>b.name)).size,breeds.length);
 for(const b of breeds){
  assert(b.url.startsWith('https://'));
  for(const field of ['children','dogs','prey','bark','social','drool']) assert([1,2,3].includes(householdTraits[b.id][field]),b.id+' '+field);
  const result=scoreBreed(b,{...defaults,fluff:'fluffy',children:'young',pets:'small',barking:'quiet',social:'visitors',drool:'low'});
  assert(Number.isFinite(result.score)&&result.score>=0&&result.score<=100);
 }
});
test('coat filter stays consistent throughout a whole swipe round and can be changed',async()=>{
 const {discoveryQueue,fluffLevels}=await import('../public/engine.mjs');
 const p={...defaults,fluff:'fluffy'},history=[];
 let queue=discoveryQueue(p,history);
 const expected=breeds.filter(b=>fluffLevels[b.id]>=2).length;
 while(queue.length){const current=queue[0];assert(fluffLevels[current.breed.id]>=2);history.push({id:current.breed.id,choice:'pass'});queue=discoveryQueue(p,history);}
 assert.equal(history.length,expected);
 assert(discoveryQueue({...p,fluff:'sleek'},history).some(x=>x.breed.id==='greyhound'));
});

test('every dog type has a complete profile without invented owner-provided facts',async()=>{
 const {dogProfiles}=await import('../public/profiles.mjs');
 assert.equal(Object.keys(dogProfiles).length,breeds.length);
 for(const b of breeds){
  const dog=dogProfiles[b.id];assert(dog&&dog.name,b.id);assert(dog.sex===null||['Female','Male'].includes(dog.sex));
  if(dog.name==='Link'||dog.name==='Mit'){assert.equal(dog.age,null);assert.equal(dog.likes,null);}
  else if(dog.ownerProvided){assert.equal(dog.name,'Winnie');assert.equal(dog.sex,'Female');assert.equal(dog.age,5);assert.equal(dog.likes,'Swimming, boat rides, and walks');}
  else {assert(dog.likes);assert(Number.isInteger(dog.age)&&dog.age>0&&dog.age<25);}
 }
 assert.equal(dogProfiles.golden.name,'Ginger');assert.equal(dogProfiles.golden.age,5);
 assert(dogProfiles.golden.likes.toLowerCase().includes('fetch'));
});

test('routine values retain exact minutes and extended slider ranges after saving',()=>{
 for(const exercise of [0,40,121,180,240]){
  const profile={...defaults,exercise,alone:12.5};
  assert.equal(normalizeProfile(profile).exercise,exercise);
  const saved=restoreState({version:1,profile,favorites:[],compare:[],history:[]});
  assert.equal(saved.profile.exercise,exercise);
  assert.equal(saved.profile.alone,12.5);
  assert(rankBreeds(saved.profile).every(row=>Number.isFinite(row.score)&&row.score>=0&&row.score<=100));
 }
});
