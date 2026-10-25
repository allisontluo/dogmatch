import {breeds,defaults,restoreState} from './engine.mjs?v=22';
import {questions,activeQuestions} from './questions.mjs';

export const mainStateKey='pawfect-match-v2';
export const mainPreferenceKey='pawfect-match-v2-preferences';
const knownIds=new Set(breeds.map(dog=>dog.id));
const questionIds=new Set(questions.map(question=>question.id));
export const freshExperience=()=>({version:1,profile:{...defaults},step:0,completed:false,favorites:[],compare:[],history:[],answered:[],question:'home',topPick:null});

export function restoreExperience(raw,{legacy=false}={}){
 const restored=restoreState(raw);
 const answered=[...new Set((Array.isArray(raw.answered)?raw.answered:legacy?Object.keys(raw.profile||{}):[]).filter(id=>questionIds.has(id)))];
 const active=activeQuestions(restored.profile,answered);
 const question=active.some(q=>q.id===raw.question)?raw.question:(active.find(q=>q.chapter===restored.step&&!answered.includes(q.id))||active.find(q=>!answered.includes(q.id))||active[0]).id;
 return {...restored,answered,question,completed:restored.completed&&active.every(q=>answered.includes(q.id)),topPick:knownIds.has(raw.topPick)?raw.topPick:null};
}

export function normalizePreferences(raw={}){
 return {size:Math.max(85,Math.min(150,Number(raw?.size)||100)),motion:raw?.motion===true,theme:raw?.theme==='dark'?'dark':'light'};
}

// Import once into a new key. Both original records remain available for rollback.
// Completed prototype answers take priority; favorites from both versions survive.
export function loadSavedExperience(storage){
 let storageOK=true;
 function read(key,json=true){
  let value;try{value=storage.getItem(key);}catch{storageOK=false;return null;}
  if(!value)return null;
  if(!json)return value;
  try{return JSON.parse(value);}catch{return null;}
 }
 function candidate(key,legacy=false){const raw=read(key);if(!raw)return null;try{return restoreExperience(raw,{legacy});}catch{return null;}}
 const saved=candidate(mainStateKey);
 const prototype=candidate('pawfect-prototype-v2');
 const previous=candidate('uxdesign-pawfect-match-v1',true);
 const meaningful=s=>s&&(s.answered.length||s.favorites.length||s.compare.length||s.history.length||s.topPick);
 let source='fresh',state=saved||freshExperience();
 if(saved)source='main';
 else{
  const preferPrototype=meaningful(prototype)&&(prototype.completed||!previous?.completed);
  const primary=preferPrototype?prototype:previous||prototype;
  const secondary=preferPrototype?previous:prototype;
  if(primary){
   source=preferPrototype?'prototype':previous?'legacy':'prototype';
   const secondaryFavorites=new Set(secondary?.favorites||[]);
   const topPick=primary.topPick||secondary?.topPick||null;
   state={...primary,
    favorites:[...new Set([...primary.favorites,...secondaryFavorites,...(topPick?[topPick]:[])])],
    compare:[...new Set([...primary.compare,...(secondary?.compare||[])])].slice(0,3),
    history:primary.history.map(item=>({...item,wasSaved:item.wasSaved||secondaryFavorites.has(item.id)})),
    topPick
   };
  }
 }
 const currentPreferences=read(mainPreferenceKey);
 const prototypePreferences=read('pawfect-prototype-v2-preferences');
 const legacyPreferences={...read('pawfect-accessibility-v1'),theme:read('uxdesign-pawfect-theme',false)};
 const preferences=normalizePreferences(currentPreferences||(source==='prototype'?prototypePreferences:null)||legacyPreferences);
 return {state,preferences,storageOK,source};
}
