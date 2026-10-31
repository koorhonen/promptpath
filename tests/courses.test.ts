import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCourses,getLessons,isCourseId,courseIds} from '../src/shared/lessons.ts';
import {progressKey,normalizeProgress} from '../src/react-app/progress.ts';
test('neljä luokkaa sisältää 20 harjoitusta molemmilla kielillä',()=>{
 for(const language of ['fi','en'] as const){const courses=getCourses(language);assert.equal(courses.length,4);assert.equal(courses.reduce((n,c)=>n+c.lessons.length,0),20);assert.equal(new Set(courses.map(c=>c.id)).size,4);for(const c of courses){assert.ok(c.title && c.description);assert.equal(new Set(c.lessons.map(l=>l.id)).size,c.lessons.length);assert.deepEqual(c.lessons.map(l=>l.id),c.lessons.map((_,i)=>i+1));}}
});
test('jokaisella luokalla on vastaavat ja täydet opetukset molemmilla kielillä',()=>{
 for(const course of courseIds){const fi=getLessons('fi',course),en=getLessons('en',course);assert.equal(fi.length,en.length);for(let i=0;i<fi.length;i++){assert.equal(fi[i].criteria.length,en[i].criteria.length);assert.notEqual(fi[i].title,en[i].title);for(const lesson of [fi[i],en[i]]){for(const field of ['title','intro','example','task','hint'] as const)assert.ok(lesson[field].trim());assert.ok(lesson.criteria.length>=2);}}}
});
test('luokan tunnisteet tarkistetaan ennen arviointia',()=>{
 for(const id of courseIds)assert.equal(isCourseId(id),true);
 for(const id of ['missing','__proto__','constructor',null,1,{}])assert.equal(isCourseId(id),false);
});
test('sama tasotunniste valitsee eri luokissa eri tehtävän',()=>{
 const answer=getLessons('fi','answers').find(l=>l.id===1);const writing=getLessons('fi','writing').find(l=>l.id===1);assert.notDeepEqual(answer?.criteria,writing?.criteria);assert.equal(getLessons('fi','tools').find(l=>l.id===5),undefined);
});
test('perusteiden vanhat tallennusavaimet säilyvät',()=>{
 assert.equal(progressKey('fi','foundations',false),'promptpath-v1');assert.equal(progressKey('en','foundations',false),'promptpath-v1-en');assert.equal(progressKey('fi','foundations',true),'promptpath-demo-v1');
});
test('luokat, kielet ja demo käyttävät erillisiä tallennusavaimia',()=>{
 const keys=[];for(const lang of ['fi','en'] as const)for(const course of courseIds)for(const demo of [true,false])keys.push(progressKey(lang,course,demo));assert.equal(new Set(keys).size,16);
 const storage=new Map<string,string>();storage.set(progressKey('fi','tools',false),'1');assert.equal(storage.get(progressKey('fi','answers',false)),undefined);assert.equal(storage.get(progressKey('en','tools',false)),undefined);
});
test('tallennettua etenemistä ei hyväksytä luokan tasomäärän ulkopuolelta',()=>{
 assert.equal(normalizeProgress(4,4),4);for(const value of [8,-1,1.5,'2',null])assert.equal(normalizeProgress(value,4),0);
});
