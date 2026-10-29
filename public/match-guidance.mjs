import {normalizeProfile} from './engine.mjs?v=24';
import {duration} from './questions.mjs?v=4';

const training=['','short daily practice','regular daily training','lots of training and mental work'];
const grooming=['','basic coat care','regular brushing','brushing and professional grooming'];

// Explain the model's actual inputs, rather than treating a percentage as a guarantee.
export function explainMatch(row,raw){
 const p=normalizeProfile(raw),b=row.breed,f=row.fit,strengths=[],concerns=[];
 const check=(key,good,issue)=>{if(f[key]>=99.99)strengths.push(good);else concerns.push({key,fit:f[key],text:issue});};
 check('activity',`Activity: your plan covers the ${duration(b.exercise)} daily target.`,`Activity: ${duration(b.exercise)} daily target; you planned ${duration(p.exercise)}.`);
 check('training','Training: your commitment meets this profile’s needs.',`Training: needs ${training[b.training]}; you chose ${training[p.training]}.`);
 check('grooming',`Coat care: your plan covers ${grooming[b.grooming]}.`,`Coat care: needs ${grooming[b.grooming]}, beyond your selection.`);
 if(p.size!=='any')check('size',`Size: matches your preference for a ${p.size} dog.`,`Size: this is a ${b.size} profile; you prefer ${p.size}.`);
 if(f.space<100)concerns.push({key:'space',fit:f.space,text:'Home: a roomier home matches this profile better.'});
 if(f.experience<100)concerns.push({key:'experience',fit:f.experience,text:'Experience: better suited to someone who has cared for dogs before.'});
 if(p.fluff!=='any')check('coat','Coat: matches the appearance you selected.','Coat: outside your selected coat preference.');
 if(p.shedding==='low')check('shedding','Shedding: fits your lower-shedding preference.','Shedding: more fur than your lower-shedding preference.');
 if(p.children!=='none')check('children','Children: a stronger household fit in this model.','Children: a lower household fit; check the individual dog’s history.');
 if(p.pets!=='none')check('pets','Other pets: a stronger household fit in this model.','Other pets: a lower fit for the pets in your household.');
 if(p.barking==='quiet')check('barking','Barking: fits your preference for a quieter dog.','Barking: above your preference for a quieter dog.');
 if(p.social==='visitors')check('social','Visitors: matches your preference for an outgoing dog.','Visitors: below your preference for an outgoing dog.');
 if(p.drool==='low')check('drool','Drool: fits your lower-drool preference.','Drool: more than your lower-drool preference.');
 concerns.sort((a,b)=>a.fit-b.fit);
 const majorGap=f.activity<50||f.training<50;
 const level=row.score<70||majorGap?'changes':row.score>=85&&!concerns.length?'strong':'tradeoffs';
 const label={strong:'Strong profile fit',tradeoffs:'Good fit with trade-offs',changes:'Needs changes to fit'}[level];
 return {level,label,strengths,concerns:concerns.map(c=>c.text),reasons:concerns.length?concerns.slice(0,2).map(c=>c.text):strengths.slice(0,2)};
}
