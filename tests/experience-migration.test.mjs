import test from 'node:test';
import assert from 'node:assert/strict';
import {freshExperience,loadSavedExperience,mainStateKey,mainPreferenceKey,restoreExperience} from '../public/experience-state.mjs';
import {questions} from '../public/questions.mjs';
const store=records=>({getItem:key=>records[key]===undefined?null:typeof records[key]==='string'?records[key]:JSON.stringify(records[key])});
const complete=changes=>({...freshExperience(),completed:true,answered:questions.map(q=>q.id),...changes});

test('new visitors have blank answers, no scores, and the original light palette',()=>{
 const loaded=loadSavedExperience(store({}));assert.equal(loaded.source,'fresh');assert.deepEqual(loaded.state.answered,[]);assert.equal(loaded.state.completed,false);assert.deepEqual(loaded.preferences,{size:100,motion:false,theme:'light'});
});
test('completed prototype answers migrate while old favorites and comparisons survive',()=>{
 const old=complete({profile:{...freshExperience().profile,exercise:40},favorites:['golden','aussiedoodle'],compare:['golden'],history:[]});
 const prototype=complete({profile:{...freshExperience().profile,exercise:120},favorites:['goldendoodle'],compare:['goldendoodle','aussiedoodle'],topPick:'goldendoodle',history:[{id:'golden',choice:'pass',wasSaved:false}]});
 const records={'uxdesign-pawfect-match-v1':old,'pawfect-prototype-v2':prototype,'pawfect-prototype-v2-preferences':{size:120,motion:true,theme:'light'}};
 const before=JSON.stringify(records),loaded=loadSavedExperience(store(records));
 assert.equal(loaded.source,'prototype');assert.equal(loaded.state.profile.exercise,120);assert.deepEqual(loaded.state.favorites,['goldendoodle','golden','aussiedoodle']);assert.deepEqual(loaded.state.compare,['goldendoodle','aussiedoodle','golden']);assert.equal(loaded.state.history[0].wasSaved,true);assert.equal(loaded.state.topPick,'goldendoodle');assert.equal(loaded.preferences.size,120);assert.equal(JSON.stringify(records),before);
});
test('an empty prototype does not overwrite a completed legacy questionnaire',()=>{
 const legacy=complete({profile:{...freshExperience().profile,exercise:79},favorites:['beagle'],compare:['beagle'],history:[{id:'beagle',choice:'like',wasSaved:false}]});
 const loaded=loadSavedExperience(store({'uxdesign-pawfect-match-v1':legacy,'pawfect-prototype-v2':freshExperience(),'pawfect-accessibility-v1':{size:130,motion:true},'uxdesign-pawfect-theme':'dark'}));
 assert.equal(loaded.source,'legacy');assert.equal(loaded.state.profile.exercise,79);assert.equal(loaded.state.history.length,1);assert.deepEqual(loaded.preferences,{size:130,motion:true,theme:'dark'});
});
test('a migrated or reset main record takes precedence on subsequent visits',()=>{
 const current=freshExperience();const loaded=loadSavedExperience(store({[mainStateKey]:current,'pawfect-prototype-v2':complete({favorites:['aussiedoodle']}),[mainPreferenceKey]:{size:100,theme:'light'}}));assert.equal(loaded.source,'main');assert.deepEqual(loaded.state.favorites,[]);assert.equal(loaded.state.completed,false);
});
test('legacy records without answered metadata retain actual saved inputs',()=>{
 const old=complete();delete old.answered;assert.equal(restoreExperience(old,{legacy:true}).completed,true);
 assert.equal(restoreExperience({...old,answered:[]},{legacy:true}).completed,false);
 const loaded=loadSavedExperience(store({'uxdesign-pawfect-match-v1':{...old,compare:['bad','beagle','beagle'],favorites:['bad','beagle'],history:[null,{id:'beagle',choice:'like'}]}}));assert.deepEqual(loaded.state.compare,['beagle']);assert.deepEqual(loaded.state.favorites,['beagle']);
});
test('corrupt storage falls back safely and blocked storage stays usable for the visit',()=>{
 const valid=complete({favorites:['beagle']});assert.equal(loadSavedExperience(store({[mainStateKey]:'bad json','uxdesign-pawfect-match-v1':valid})).state.completed,true);
 const loaded=loadSavedExperience({getItem(){throw new Error('blocked');}});assert.equal(loaded.storageOK,false);assert.deepEqual(loaded.state.answered,[]);
});
