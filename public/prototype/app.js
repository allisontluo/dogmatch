import {dogProfiles} from '../profiles.mjs?v=22';
import {breeds,defaults,normalizeProfile,needsCarePlan,rankBreeds,restoreState,discoveryRound as discoveryQueue,fluffLevels,matchesCoat} from '../engine.mjs?v=22';
const $=id=>document.getElementById(id);
const pawIcon='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="6" cy="8" rx="2.2" ry="3" fill="currentColor"/><ellipse cx="11" cy="5" rx="2" ry="2.7" fill="currentColor"/><ellipse cx="17" cy="6" rx="2" ry="2.8" fill="currentColor"/><ellipse cx="21" cy="11" rx="1.8" ry="2.5" fill="currentColor"/><path d="M6 17c0-3 3-7 6-7s7 4 7 7c0 4-4 2-6 2s-7 2-7-2" fill="currentColor"/></svg>';
function heartIcon(filled=false){return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'.replace('fill="none"',filled?'fill="currentColor"':'fill="none"');}
const key='uxdesign-dogmatch-prototype-v1';
let currentView=['quiz','discover','matches','comparison'].includes(location.hash.slice(1))?location.hash.slice(1):'welcome';
let dogView='recommended';
let state={version:1,profile:{...defaults},step:0,completed:false,favorites:[],compare:[],history:[]};
let storageOK=true,toastTimer,editing=false,welcomeSettled=false;
let answered=new Set();
try{const saved=localStorage.getItem(key);if(saved){const raw=JSON.parse(saved);state=restoreState(raw);answered=new Set(Array.isArray(raw.answered)?raw.answered:Object.keys(state.profile));}}catch{storageOK=false;$('save-status').textContent='Saved data unavailable · session only';}
const form=$('match-form');
const LAST_STEP=document.querySelectorAll('[data-step]').length-1;
function fillAnswers(){for(const [name,value] of Object.entries(state.profile))form.elements.namedItem(name).value=answered.has(name)?value:'';}
fillAnswers();
function fitChart(score,compact=false) {
 const value=Math.max(0,Math.min(100,Math.round(score)));
 return `<div class="fit-chart ${compact?'compact':''}" role="img" aria-label="${value}% profile fit, ${100-value}% difference" title="Profile fit; the pale segment shows differences"><div class="fit-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-track" cx="50" cy="50" r="44"/><circle class="ring-value" cx="50" cy="50" r="44" pathLength="100" stroke-dasharray="${value} ${100-value}"/></svg><span>${value}%</span></div>${compact?'':'<small>Profile fit</small>'}</div>`;
}
const themeButton=$('theme-toggle');
function refreshTheme(){const dark=document.documentElement.dataset.theme==='dark';themeButton.innerHTML=pawIcon+(dark?' Light mode':' Dark mode');themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');themeButton.title=dark?'Switch to light mode':'Switch to dark mode';themeButton.setAttribute('aria-pressed',String(dark));}
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('uxdesign-prototype-theme',theme)}catch{}refreshTheme();});
refreshTheme();
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function persist(){try{localStorage.setItem(key,JSON.stringify({...state,answered:[...answered]}));storageOK=true;$('save-status').textContent='Saved on this device';}catch{if(storageOK)toast('Browser storage is unavailable. Your quiz still works for this visit.');storageOK=false;$('save-status').textContent='Session only · storage unavailable';}}
function showStep(focus=false){document.querySelector('.quiz-card').classList.toggle('editing',editing);$('quiz-progress-fill').style.width=`${(state.step+1)/(LAST_STEP+1)*100}%`;if(editing){document.querySelectorAll('[data-step]').forEach(el=>el.hidden=false);document.querySelector('.steps').hidden=true;$('back').hidden=true;$('next').hidden=true;$('finish').hidden=false;$('finish').textContent='Update recommendations';$('step-label').textContent='Edit any answer';return;}document.querySelector('.steps').hidden=false;$('finish').textContent='Meet my matches →';document.querySelectorAll('[data-step]').forEach(el=>el.hidden=Number(el.dataset.step)!==state.step);document.querySelectorAll('.steps li').forEach((el,i)=>{el.classList.toggle('active',i===state.step);if(i===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');const button=el.querySelector('button');if(button){if(i===state.step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}});$('back').hidden=state.step===0;$('next').hidden=state.step===LAST_STEP;$('finish').hidden=state.step!==LAST_STEP;$('step-label').textContent=`Step ${state.step+1} of ${LAST_STEP+1}`;if(focus){document.querySelector(`[data-step="${state.step}"] select, [data-step="${state.step}"] input`).focus({preventScroll:true});welcomeSettled=true;document.querySelector('.welcome-banner').style.setProperty('--welcome-height','320px');window.scrollTo({top:0,behavior:'instant'});}}
function updateProfile(event){if(event?.target?.name){if(event.target.value!=='')answered.add(event.target.name);else answered.delete(event.target.name);}state.profile=normalizeProfile(Object.fromEntries(new FormData(form)));persist();render();}
function render(){$('browse-label').textContent=$('breed-search').value.trim()?'Search results':`Browse (${breeds.length} dog types)`;const p=state.profile;const ranked=rankBreeds(p);$('exercise-value').textContent=answered.has('exercise')?`Selected: ${p.exercise} minutes`:'Choose your daily minutes';$('alone-value').textContent=answered.has('alone')?`Selected: ${p.alone} ${p.alone===1?'hour':'hours'} away from home`:'Choose your hours away';form.elements.exercise.setAttribute('aria-valuetext',`${p.exercise} minutes of daily walks and play`);form.elements.alone.setAttribute('aria-valuetext',`${p.alone} hours away from home`);$('care-branch').hidden=!answered.has('alone')||p.alone<=5;
 $('live-preview').innerHTML=state.completed?ranked.filter(row=>matchesCoat(row.breed,p)).slice(0,3).map(({breed:b,score})=>`<div class="live-row"><img class="recommendation-photo" src="../photos/${b.id}.jpg?v=56" alt="${dogProfiles[b.id].name}, ${b.name}" width="80" height="80"><div class="live-copy"><strong>${dogProfiles[b.id].name}</strong><small>${b.name}</small></div>${fitChart(score,true)}</div>`).join(''):'<div class="preview-pack"><figure><img src="../photos/aussiedoodle.jpg?v=56" alt="Winnie the Aussiedoodle"><figcaption>Winnie</figcaption></figure><figure><img src="../photos/long-haired-dachshund.jpg?v=56" alt="Link the Dachshund"><figcaption>Link</figcaption></figure><figure><img src="../photos/chihuahua.jpg?v=56" alt="Mit the Chihuahua"><figcaption>Mit</figcaption></figure></div><p class="preview-waiting">Different dogs. Different lives.<small>Your answers help find the right fit.</small></p>';
 $('preview-filter').textContent=state.completed?'Based on your answers':'Complete the questionnaire to reveal your recommendations.';
 $('matches').hidden=!state.completed;
 $('discover').hidden=!state.completed;
 $('discover-nav').hidden=!state.completed;
 $('matches-nav').hidden=!state.completed;
 $('discover-locked').hidden=state.completed;
 $('results-placeholder').hidden=state.completed;$('results-content').hidden=!state.completed;
 $('results-subtitle').textContent=state.completed?'The dogs you’ve saved.':'Finish the quiz to reveal your personalized matches.';
 $('care-message').hidden=!needsCarePlan(p);$('care-message').textContent='Care plan needed: more than 5 hours away without support. Match scores stay at 55 or below until you add a plan.';
 const query=$('breed-search').value.toLowerCase().replace(/[^a-z0-9]/g,'');
 const visible=ranked.filter(x=>(!$('only-saved').checked||state.favorites.includes(x.breed.id))&&(x.breed.name+' '+dogProfiles[x.breed.id].name).toLowerCase().replace(/[^a-z0-9]/g,'').includes(query));
 $('catalog-count').textContent=`${visible.length} of ${breeds.length} dog types`;
 $('breed-cards').innerHTML=visible.length?visible.map(profileCard).join(''):'<div class="empty"><h3>No dogs found.</h3><p>Try another name or dog type.</p></div>';
 renderMatchProfiles(ranked);
 renderChart(ranked);
 renderDiscovery();
 syncScreen();
}
function profileCard({breed:b,score}){const dog=dogProfiles[b.id];
  return `<article class="match-profile" aria-label="${dog.name}, ${b.name} profile"><img class="match-photo" src="../photos/${b.id}.jpg?v=56" alt="${dog.name}, ${b.name}" loading="lazy" width="600" height="500"><div class="match-profile-body"><button class="favorite" data-save="${b.id}" aria-label="${state.favorites.includes(b.id)?'Remove':'Save'} ${dog.name}" aria-pressed="${state.favorites.includes(b.id)}">${heartIcon(state.favorites.includes(b.id))}</button>${fitChart(score)}<h3>${dog.name}${dog.age?` <span>age ${dog.age}</span>`:''}</h3><p class="profile-breed">${dog.sex?dog.sex+' · ':''}${b.name}</p>${dog.likes?`<p class="profile-likes"><strong>Loves:</strong> ${dog.likes}.</p>`:''}<details class="profile-details"><summary>About ${dog.name}</summary>${dog.ownerProvided?`<p>${dog.name} is the ${b.name} in the owner-provided photo.</p>`:`<p>${dog.name} is a sample ${dog.age}-year-old ${b.name} who enjoys ${dog.likes.charAt(0).toLowerCase()+dog.likes.slice(1)}.</p>`}<p>${b.description}</p><p><strong>Care:</strong> ${b.watch}</p><a href="${b.url}">Read the dog-type guide ↗</a></details><label class="check-label"><input type="checkbox" data-compare="${b.id}" ${state.compare.includes(b.id)?'checked':''}> Compare ${dog.name}</label><button type="button" class="final-choice-button" data-final="${b.id}">Mark as top pick</button></div></article>`;
}
function renderMatchProfiles(ranked) {
 const liked=ranked.filter(row=>state.favorites.includes(row.breed.id));
 const rows=dogView==='favorites'?liked:ranked.filter(row=>matchesCoat(row.breed,state.profile)).slice(0,6);
 $('match-list-title').textContent=dogView==='favorites'?`Favorites (${liked.length})`:'Recommended for you';
 $('match-list-note').textContent=dogView==='favorites'?'The dogs you want to come back to.':'A shortlist shaped by your answers.';
 $('matches-shortcut').textContent=liked.length?`View favorites (${liked.length})`:'View recommendations';
 $('match-profiles').dataset.count=String(rows.length);
 $('match-profiles').innerHTML=rows.length?rows.map(profileCard).join(''):'<div class="empty"><h3>No favorites yet.</h3><p>Like a dog in Discover, or save one while browsing.</p><button type="button" class="button" data-open-discover>Meet your dogs</button></div>';
}
function renderChart(ranked=rankBreeds(state.profile)){
 $('comparison').hidden=!state.completed||state.compare.length<2;
 $('comparison-nav').hidden=!state.completed||state.compare.length<2;
 const selected=state.compare.map(id=>ranked.find(x=>x.breed.id===id)).filter(Boolean).sort((a,b)=>b.score-a.score);
 $('compare-shortcut').hidden=!state.completed||selected.length<2;
 $('compare-count').textContent=`(${selected.length})`;$('compare-shortcut').setAttribute('aria-label',`Compare ${selected.length} selected dogs`);
 $('chart').dataset.count=String(selected.length);
 const labels={activity:'daily activity time',training:'training time',space:'home space',size:'preferred size',grooming:'grooming commitment',shedding:'shedding preference',experience:'dog-owning experience',coat:'coat preference',children:'household with children',pets:'other pets',barking:'barking preference',social:'social preferences',drool:'drool preference'};
 $('comparison-reasons').innerHTML=selected.length<2?'<p>Select another dog to see what makes their fit different.</p>':selected.slice(1).map(other=>{
  const top=selected[0],name=dogProfiles[top.breed.id].name,otherName=dogProfiles[other.breed.id].name;
  const advantages=Object.keys(labels).filter(k=>top.fit[k]>other.fit[k]).sort((a,b)=>(top.fit[b]-other.fit[b])-(top.fit[a]-other.fit[a])).slice(0,3).map(k=>labels[k]);
  const tradeoffs=Object.keys(labels).filter(k=>other.fit[k]>top.fit[k]).slice(0,2).map(k=>labels[k]);
  return `<p><strong>${name} &amp; ${otherName}: ${top.score===other.score?'same overall fit':`${name} +${top.score-other.score} points`}</strong><span>${advantages.length?`${name} fits your ${advantages.join(', ')} better.`:'Their scores are similar across your preferences.'}</span>${tradeoffs.length?`<small>${otherName} fits your ${tradeoffs.join(' and ')} better.</small>`:''}</p>`;
 }).join('');

 const metric=$('metric').value;const max={score:100,exercise:150,grooming:3,training:3,fluff:3}[metric];
 $('chart').innerHTML=state.compare.length<2?'<div class="empty"><h3>Who is on your shortlist?</h3><p>Select two or three dogs from Your dogs to compare them.</p><a class="button" href="#matches">Choose dogs</a></div>':state.compare.map(id=>ranked.find(x=>x.breed.id===id)).filter(Boolean).map(({breed:b,score})=>{const value=metric==='score'?score:metric==='fluff'?fluffLevels[b.id]:b[metric];const suffix=metric==='score'?'%':metric==='exercise'?' min':' / 3';return `<div class="chart-row"><button class="remove-comparison" type="button" data-remove-compare="${b.id}" aria-label="Remove ${dogProfiles[b.id].name} from comparison">×</button><div class="chart-dog"><div class="chart-photo photo-${b.id}"><img src="../photos/${b.id}.jpg?v=56" alt="${b.name} breed example" width="360" height="280"></div><strong>${dogProfiles[b.id].name}</strong><span class="comparison-breed">${b.name}</span><button type="button" class="final-choice-button" data-final="${b.id}">Mark as top pick</button></div>${metric==='score'?fitChart(score):`<div class="track" aria-hidden="true"><div class="bar" style="width:${value/max*100}%"></div></div><span>${value}${suffix}</span>`}</div>`;}).join('');
 syncScreen();
}
form.addEventListener('input',updateProfile);
$('next').addEventListener('click',()=>{if(!validateAnswers(false))return;state.step=Math.min(LAST_STEP,state.step+1);persist();showStep(true);});
$('back').addEventListener('click',()=>{state.step=Math.max(0,state.step-1);persist();showStep(true);});
// Enter on an earlier step advances instead of bypassing the quiz.
form.addEventListener('submit',event=>{event.preventDefault();if(!validateAnswers(editing||state.step===LAST_STEP))return;if(editing){editing=false;persist();showStep();render();navigate('matches');toast('Recommendations updated.');return;}if(state.step<LAST_STEP){state.step++;persist();showStep(true);return;}state.completed=true;persist();render();navigate('discover');$('discovery-title').tabIndex=-1;$('discovery-title').focus({preventScroll:true});toast('Your matches are ready. Swipe right to like or left to pass.');});
['breed-cards','match-profiles'].forEach(container=>$(container).addEventListener('click',event=>{const button=event.target.closest('[data-save]');if(!button)return;const id=button.dataset.save;const saved=state.favorites.includes(id);state.favorites=saved?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();render();const replacement=document.querySelector(`[data-save="${id}"]`);if(replacement)replacement.focus();else $('only-saved').focus();toast(saved?'Removed from your matches.':'Saved to your matches.');}));
['breed-cards','match-profiles'].forEach(container=>$(container).addEventListener('change',event=>{const input=event.target;if(!input.matches('[data-compare]'))return;const id=input.dataset.compare;if(input.checked&&state.compare.length>=3){input.checked=false;toast('Choose up to 3 dogs. Uncheck one before adding another.');return;}state.compare=input.checked?[...state.compare,id]:state.compare.filter(x=>x!==id);document.querySelectorAll(`[data-compare="${id}"]`).forEach(el=>el.checked=input.checked);persist();renderChart();}));
$('metric').addEventListener('change',()=>renderChart());$('only-saved').addEventListener('change',()=>render());
$('breed-search').addEventListener('input',()=>{dogView='browse';render();const searching=$('breed-search').value.trim().length>0;document.querySelector('.all-matches').open=searching;$('browse-label').textContent=searching?'Search results':`Browse (${breeds.length} dog types)`;});
function editAnswers(){navigate('quiz');editing=true;showStep();welcomeSettled=true;document.querySelector('.welcome-banner').style.setProperty('--welcome-height','320px');window.scrollTo({top:0,behavior:'instant'});form.elements.home.focus({preventScroll:true});}
$('edit').addEventListener('click',editAnswers);
document.addEventListener('click',event=>{const link=event.target.closest('a[href="#quiz"]');if(link&&state.completed&&/edit/i.test(link.textContent)){event.preventDefault();editAnswers();}});
$('reset-quiz').addEventListener('click',()=>{$('reset').click();welcomeSettled=true;document.querySelector('.welcome-banner').style.setProperty('--welcome-height','320px');window.scrollTo({top:0,behavior:'instant'});form.elements.home.focus({preventScroll:true});});
$('reset').addEventListener('click',()=>{currentView='quiz';editing=false;answered.clear();try{localStorage.removeItem(key);}catch{}state={version:1,profile:{...defaults},step:0,completed:false,favorites:[],compare:[],history:[]};fillAnswers();$('only-saved').checked=false;$('breed-search').value='';$('metric').value='score';showStep();render();$('save-status').textContent='Saved data cleared';toast('Your answers and shortlist have been cleared.');});

// Pointer gestures, keyboard arrows, and buttons all use the same decision handler.
function renderDiscovery() {
 const queue=discoveryQueue(state.profile,state.history),current=queue[0];
 $('discover-fluff').value=state.profile.fluff;
 const eligible=breeds.filter(b=>matchesCoat(b,state.profile));
 const roundSize=Math.min(10,eligible.length);
 const relevant=state.history.filter(d=>eligible.some(b=>b.id===d.id)).slice(0,roundSize);
 const likes=relevant.filter(d=>d.choice==='like').length;
 $('learning-status').textContent=state.history.length?`${relevant.length} of ${roundSize} explored · ${likes} liked`:`A short round of ${roundSize} recommended dogs.`;
 $('undo-swipe').disabled=state.history.length===0;
 $('restart-swipes').disabled=state.history.length===0;
 $('like-dog').disabled=!current;$('pass-dog').disabled=!current;
 $('swipe-card').classList.toggle('deck-empty',!current);
 $('swipe-card').parentElement.classList.toggle('round-complete',!current);
 $('swipe-card').setAttribute('aria-label',current?'Dog discovery card. Use left arrow to pass or right arrow to like.':'Swipe round complete');
 $('swipe-card').style.transform='';
 if(!current){$('swipe-card').innerHTML=`<div class="deck-finished"><h3>Round complete</h3><p>You’ve finished your ${roundSize}-dog round. Browse the full catalog below, or start a new round.</p><p>${likes?`${likes} dogs liked and saved in Favorites.`:"No dogs liked yet. Try another coat preference or start again."}</p><a class="button" href="#matches">View saved dogs</a></div>`;return;}
 const {breed:b,score}=current;
 const dog=dogProfiles[b.id];
 const coat=b.coatLabel||(fluffLevels[b.id]>=2?'Fluffy coat':'Sleek coat');
 $('swipe-card').innerHTML=`<img src="../photos/${b.id}.jpg?v=56" alt="${b.name} breed example" draggable="false" width="900" height="650"><div class="swipe-overlay"><span class="swipe-count">${relevant.length+1} / ${roundSize}</span>${fitChart(score,true)}<h3>${dog.name}${dog.age?`, age ${dog.age}`:''}</h3><p class="swipe-breed">${dog.sex?dog.sex+' · ':''}${b.name}</p>${dog.likes?`<p class="swipe-interest">Loves ${dog.likes.charAt(0).toLowerCase()+dog.likes.slice(1)}</p>`:''}<p>${coat} · ${b.size} · ${b.exercise} min activity target</p></div><span class="sample-chip">${dog.ownerProvided?'Owner-provided profile':'Sample profile'}</span><div class="swipe-feedback" aria-hidden="true"></div>`;
}
function decide(choice) {
 const current=discoveryQueue(state.profile,state.history)[0];if(!current)return;
 const id=current.breed.id,wasSaved=state.favorites.includes(id);
 state.history.push({id,choice,wasSaved});
 state.favorites=choice==='like'?[...new Set([...state.favorites,id])]:state.favorites.filter(x=>x!==id);
 persist();render();toast(`${choice==='like'?'Liked':'Passed'} ${current.breed.name}. ${discoveryQueue(state.profile,state.history).length===0?'You’ve met your matching pack.':'Your next pick is updated.'}`);
}
$('like-dog').addEventListener('click',()=>decide('like'));
$('pass-dog').addEventListener('click',()=>decide('pass'));
$('discover-fluff').addEventListener('change',()=>{form.elements.fluff.value=$('discover-fluff').value;updateProfile();});
$('undo-swipe').addEventListener('click',()=>{const last=state.history.pop();if(!last)return;state.favorites=last.wasSaved?[...new Set([...state.favorites,last.id])]:state.favorites.filter(id=>id!==last.id);persist();render();toast('Last choice undone.');});
$('restart-swipes').addEventListener('click',()=>{state.history=[];persist();render();toast('New round started. Saved favorites kept.');});
$('swipe-card').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();decide(event.key==='ArrowRight'?'like':'pass');}});
let gesture=null;
$('swipe-card').addEventListener('pointerdown',event=>{if(event.button!==0||!event.target.closest('img'))return;gesture={x:event.clientX,y:event.clientY,id:event.pointerId};$('swipe-card').setPointerCapture(event.pointerId);});
$('swipe-card').addEventListener('pointermove',event=>{if(!gesture||event.pointerId!==gesture.id)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>20){cancelGesture();return;}const card=$('swipe-card');card.style.transform=`translateX(${Math.max(-120,Math.min(120,dx))}px) rotate(${dx/25}deg)`;const feedback=card.querySelector('.swipe-feedback');if(feedback){feedback.textContent=Math.abs(dx)>35?(dx>0?'LIKE':'PASS'):'';feedback.classList.toggle('passing',dx<0);}});
function cancelGesture(){gesture=null;$('swipe-card').style.transform='';const feedback=$('swipe-card').querySelector('.swipe-feedback');if(feedback)feedback.textContent='';}
$('swipe-card').addEventListener('pointerup',event=>{if(!gesture)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;cancelGesture();if(Math.abs(dx)>=70&&Math.abs(dx)>Math.abs(dy)*1.2)decide(dx>0?'like':'pass');});
$('swipe-card').addEventListener('pointercancel',cancelGesture);

showStep();render();
if(location.hash==='#discover'&&!state.completed){history.replaceState(null,'','#quiz');navigate('quiz');}

let pendingFinal=null;
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-final]');if(!button)return;
 pendingFinal=button.dataset.final;
 const dog=dogProfiles[pendingFinal];
 $('final-heading').textContent=`Mark ${dog.name} as your top pick?`;
 $('final-description').textContent='Confirm your top pick to celebrate your match.';
 $('final-photo').src=`../photos/${pendingFinal}.jpg?v=56`;
 $('final-photo').alt=dog.name;
 $('confirm-final').hidden=false;
 $('confirm-final').textContent=`Yes, mark ${dog.name} as my top pick`;
 $('close-final').textContent='Keep comparing';
 $('final-confetti').replaceChildren();
 $('final-dialog').showModal();
});
$('close-final').addEventListener('click',()=> $('final-dialog').close());
$('confirm-final').addEventListener('click',()=>{
 if(!pendingFinal)return;
 const dog=dogProfiles[pendingFinal];
 $('final-heading').textContent=`${dog.name} is your top pick!`;
 $('final-description').textContent='You’ve chosen your match. Time to celebrate!';
 $('confirm-final').hidden=true;$('close-final').textContent='Back to my dogs';
 $('final-confetti').innerHTML=Array.from({length:65},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:${(i%9)*.12}s;--color:${['#719be2','#f2bf65','#e58eac','#75bca8'][i%4]};--turn:${i*53}deg"></i>`).join('');
});

document.querySelector('.steps').addEventListener('click',event=>{const button=event.target.closest('[data-go-step]');if(!button)return;navigate('quiz');editing=false;state.step=Number(button.dataset.goStep);persist();showStep(true);});

function validateAnswers(all){
 const fields=[...form.querySelectorAll(all?'[data-step] select,[data-step] input':`[data-step="${state.step}"] select,[data-step="${state.step}"] input`)];
 const missing=fields.find(input=>!(input.name==='support'&&(!answered.has('alone')||state.profile.alone<=5))&&(!answered.has(input.name)||input.value===''||!input.checkValidity()));
 if(!missing)return true;
 editing=false;state.step=Number(missing.closest('[data-step]').dataset.step);showStep();
 missing.setCustomValidity(missing.value===''?'Please choose your answer.':'Choose a value within the shown range.');missing.reportValidity();missing.setCustomValidity('');missing.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});toast('Please answer each question before continuing.');return false;
}


function syncScreen(){
 if(!state.completed&&['discover','matches','comparison'].includes(currentView))currentView='quiz';
 document.querySelectorAll('.screen').forEach(el=>el.hidden=el.id!==currentView);
 document.querySelector('.app-header').hidden=currentView==='welcome';
 document.querySelector('.app-footer').hidden=currentView==='welcome';
 $('app-canvas').hidden=currentView==='welcome';
 for(const id of ['discover-nav','matches-nav','comparison-nav'])$(id).hidden=false;
 document.querySelectorAll('[data-screen-link]').forEach(link=>{const active=link.dataset.screenLink===currentView;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');link.setAttribute('aria-disabled',String(!state.completed&&link.dataset.screenLink!=='quiz'));});
 $('nav-compare-count').textContent=state.compare.length?`(${state.compare.length})`:'';
 $('favorites-count').textContent=String(state.favorites.length);
 $('compare-shortcut').hidden=currentView!=='matches'||state.compare.length<2;
 document.querySelectorAll('[data-dog-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.dogView===dogView)));
 document.querySelector('.all-matches').open=dogView==='browse';
 $('profile-view').hidden=dogView==='browse';$('catalog-view').hidden=dogView!=='browse';
 $('match-list-title').hidden=dogView==='browse';$('match-list-note').hidden=dogView==='browse';
 $('results-subtitle').textContent=dogView==='favorites'?'Your saved dogs.':dogView==='browse'?`Explore ${breeds.length} dog types.`:'A shortlist shaped by your life.';
}
function navigate(view){
 if(!state.completed&&['discover','matches','comparison'].includes(view)){toast('Complete your questionnaire first.');view='quiz';}
 if(view==='comparison'&&state.compare.length<2){view='matches';dogView='favorites';toast('Choose two or three dogs to compare.');}
 currentView=view;if(location.hash!==(view==='welcome'?'#welcome':`#${view}`))history.pushState(null,'',view==='welcome'?'#welcome':`#${view}`);syncScreen();window.scrollTo({top:0,behavior:'instant'});
}
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');if(link&&!event.defaultPrevented){event.preventDefault();const view=link.getAttribute('href').slice(1);if(view==='matches'&&(link.id==='matches-shortcut'||link.closest('.deck-finished')))dogView=state.favorites.length?'favorites':'recommended';if(['welcome','quiz','discover','matches','comparison'].includes(view))navigate(view);}
 const tab=event.target.closest('[data-dog-view]');if(tab){dogView=tab.dataset.dogView;$('breed-search').value='';render();}
 if(event.target.closest('[data-open-discover]'))navigate('discover');
 const remove=event.target.closest('[data-remove-compare]');if(remove){state.compare=state.compare.filter(id=>id!==remove.dataset.removeCompare);persist();render();}
});
$('edit-shortcut').addEventListener('click',editAnswers);
$('sources-toggle').addEventListener('click',()=>{$('sources-dialog').showModal();$('sources-toggle').setAttribute('aria-expanded','true');});
$('close-sources').addEventListener('click',()=> $('sources-dialog').close());
$('sources-dialog').addEventListener('close',()=> $('sources-toggle').setAttribute('aria-expanded','false'));
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(['welcome','quiz','discover','matches','comparison'].includes(route)){currentView=route;syncScreen();}});
syncScreen();
