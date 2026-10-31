import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getLessons} from '../src/shared/lessons.ts';
import {translations} from '../src/react-app/translations.ts';
import {errors} from '../src/shared/errors.ts';
test('molemmissa kielissä on kahdeksan vastaavaa ja kokonaista tasoa',()=>{
 const fi=getLessons('fi'),en=getLessons('en');assert.equal(fi.length,8);assert.equal(en.length,8);
 for(let i=0;i<8;i++){assert.equal(fi[i].id,en[i].id);assert.equal(fi[i].criteria.length,en[i].criteria.length);for(const lesson of [fi[i],en[i]]){for(const field of ['title','group','intro','example','task','hint'] as const)assert.ok(lesson[field].trim());assert.ok(lesson.criteria.every(c=>c.trim().length>0));}assert.notEqual(fi[i].title,en[i].title);}
});
test('käyttöliittymässä ja virheilmoituksissa on samat käännösavaimet',()=>{
 assert.deepEqual(Object.keys(translations.fi).sort(),Object.keys(translations.en).sort());assert.deepEqual(Object.keys(errors.fi).sort(),Object.keys(errors.en).sort());
 for(const lang of ['fi','en'] as const)for(const value of Object.values(translations[lang])){if(Array.isArray(value))assert.ok(value.every(x=>x.length>0));else assert.ok(value.length>0);}
});
