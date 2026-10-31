import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseEvaluation} from '../src/shared/evaluation.ts';
test('hyväksyntä vaatii kaikki kriteerit',()=>{assert.equal(parseEvaluation({criteria:[true,false],feedback:'Aika puuttuu.',improvements:['Lisää aika.']},2).passed,false);});
test('kaikki kriteerit hyväksytään',()=>{assert.equal(parseEvaluation({criteria:[true,true],feedback:'Selkeä ohje.',improvements:[]},2).passed,true);});
test('puuttuvat kriteerit eivät avaa tasoa',()=>{assert.throws(()=>parseEvaluation({criteria:[true],feedback:'OK',improvements:[]},2));});
test('totuusarvoa ei voi korvata tekstillä',()=>{assert.throws(()=>parseEvaluation({criteria:['true',true],feedback:'OK',improvements:[]},2));});
test('hylätty arvio tarvitsee parannusehdotuksen',()=>{assert.throws(()=>parseEvaluation({criteria:[false,true],feedback:'Korjattavaa.',improvements:[]},2));});
test('tyhjä tai liian pitkä palaute hylätään',()=>{for(const feedback of ['', 'x'.repeat(2001)])assert.throws(()=>parseEvaluation({criteria:[true,true],feedback,improvements:[]},2));});
