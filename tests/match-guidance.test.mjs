import test from 'node:test';
import assert from 'node:assert/strict';
import {breeds,defaults,scoreBreed,rankBreeds} from '../public/engine.mjs';
import {explainMatch} from '../public/match-guidance.mjs';
const row=(id,p)=>scoreBreed(breeds.find(b=>b.id===id),p);

test('advice states concrete activity and training gaps instead of generic positive feedback',()=>{
 const p={...defaults,exercise:15,training:1},advice=explainMatch(row('collie',p),p);
 assert.equal(advice.level,'changes');
 assert(advice.concerns.some(text=>text.includes('2 hours')&&text.includes('15 minutes')));
 assert(advice.concerns.some(text=>text.includes('lots of training')&&text.includes('short daily practice')));
 assert(!advice.reasons.some(text=>text.includes('your plan covers')));
});

test('strong labels require the profile needs to fit and ignore removed care answers',()=>{
 const p={...defaults,home:'house',size:'any',exercise:240,training:3,grooming:3,experience:'experienced'};
 assert.equal(explainMatch(row('havanese',p),p).level,'strong');
 const away={...p,alone:9,support:'none'};
 assert.equal(explainMatch(row('havanese',away),away).level,'strong');
 assert.equal(explainMatch(row('havanese',{...away,support:'yes'}),{...away,support:'yes'}).level,'strong');
});

test('all catalog profiles have useful, consistent explanations for selected preferences',()=>{
 const p={...defaults,exercise:30,alone:8,support:'none',training:1,grooming:1,size:'small',fluff:'fluffy',children:'young',pets:'cats',barking:'quiet',drool:'low',social:'visitors'};
 for(const result of rankBreeds(p)){
  const advice=explainMatch(result,p);
  assert(advice.reasons.length>0&&advice.reasons.length<=2);
  assert(advice.label.length>0);
  if(result.fit.activity<50||result.fit.training<50)assert.equal(advice.level,'changes');
 }
});
