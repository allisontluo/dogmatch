import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,chapters,activeQuestions,answerText,duration} from '../public/prototype/questions.mjs';
import {defaults,normalizeProfile} from '../public/engine.mjs';
test('prototype covers every matching input with unique questions and valid choices',()=>{
 assert.deepEqual([...questions.map(q=>q.id)].sort(),Object.keys(defaults).sort());
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){assert(chapters[q.chapter]);if(q.options)for(const [value] of q.options){assert.notEqual(answerText(q,value),'Not answered');assert.equal(String(normalizeProfile({...defaults,[q.id]:value})[q.id]),value);}}
});
test('longer hours away no longer add a care question',()=>{
 for(const alone of [0,5,5.5,24]){
  const active=activeQuestions({...defaults,alone},['alone']);
  assert.equal(active.length,15);
  assert(!active.some(q=>q.id==='support'));
  assert.equal(active[active.findIndex(q=>q.id==='alone')+1].id,'training');
 }
});
test('prototype durations use readable hours and minutes, including zero and half hours',()=>{
 assert.equal(duration(0),'0 minutes');assert.equal(duration(79),'1 hour 19 minutes');assert.equal(duration(240),'4 hours');
 const alone=questions.find(q=>q.id==='alone');assert.equal(answerText(alone,.5),'30 minutes');assert.equal(answerText(alone,6.5),'6 hours 30 minutes');
});
