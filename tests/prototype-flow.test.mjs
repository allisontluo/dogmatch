import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,chapters,activeQuestions,answerText,duration} from '../public/prototype/questions.mjs';
import {defaults,normalizeProfile} from '../public/engine.mjs';
test('prototype covers every matching input with unique questions and valid choices',()=>{
 assert.deepEqual([...questions.map(q=>q.id)].sort(),Object.keys(defaults).sort());
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){assert(chapters[q.chapter]);if(q.options)for(const [value] of q.options){assert.notEqual(answerText(q,value),'Not answered');assert.equal(String(normalizeProfile({...defaults,[q.id]:value})[q.id]),value);}}
});
test('prototype adds the care question only after explicit longer hours away',()=>{
 assert(!activeQuestions({...defaults,alone:8},[]).some(q=>q.id==='support'));
 assert(!activeQuestions({...defaults,alone:5},['alone']).some(q=>q.id==='support'));
 assert(activeQuestions({...defaults,alone:5.5},['alone']).some(q=>q.id==='support'));
});
test('prototype durations use readable hours and minutes, including zero and half hours',()=>{
 assert.equal(duration(0),'0 minutes');assert.equal(duration(79),'1 hour 19 minutes');assert.equal(duration(240),'4 hours');
 const alone=questions.find(q=>q.id==='alone');assert.equal(answerText(alone,.5),'30 minutes');assert.equal(answerText(alone,6.5),'6 hours 30 minutes');
});
