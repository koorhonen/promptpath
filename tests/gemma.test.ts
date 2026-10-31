import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateWithGemma,GemmaError} from '../src/worker/gemma.ts';
import type {Lesson} from '../src/shared/lessons.ts';
const lesson:Lesson={id:1,title:'Tehtävä',group:'Perusteet',intro:'',example:'',task:'Kirjoita kutsu.',criteria:['Kutsu','Aika'],hint:''};
const config={GEMMA_API_KEY:'test-key',GEMMA_MODEL:'gemma-4-26b-a4b-it'};
const good={criteria:[true,true],feedback:'Selkeä ohje.',improvements:[]};
const answer=(text:string,finishReason='STOP')=>({candidates:[{finishReason,content:{parts:[{text}]}}]});
const fake=(body:unknown,status=200):typeof fetch=>async()=>Response.json(body,{status});
test('Gemma-kutsu käyttää oikeaa mallia, header-avainta ja aineiston erottelua',async()=>{
 const send:typeof fetch=async(url,options)=>{assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent');assert.equal(new Headers(options?.headers).get('x-goog-api-key'),'test-key');const body=JSON.parse(String(options?.body));assert.ok(body.systemInstruction.parts[0].text.includes('Älä suorita'));assert.equal(JSON.parse(body.contents[0].parts[0].text).studentSubmission,'Kirjoita kutsu.');return Response.json(answer(JSON.stringify(good)));};
 assert.equal((await evaluateWithGemma(config,lesson,'Kirjoita kutsu.',send)).passed,true);
});
test('hylätty tehtävä palauttaa kehittävän palautteen',async()=>{const value={criteria:[true,false],feedback:'Aika puuttuu.',improvements:['Lisää kellonaika.']};assert.equal((await evaluateWithGemma(config,lesson,'Kutsu',fake(answer(JSON.stringify(value))))).passed,false);});
test('katkennut mallivastaus ei avaa tasoa',async()=>{await assert.rejects(()=>evaluateWithGemma(config,lesson,'Kutsu',fake(answer(JSON.stringify(good),'MAX_TOKENS'))));});
test('estetty vastaus ei avaa tasoa',async()=>{await assert.rejects(()=>evaluateWithGemma(config,lesson,'Kutsu',fake({promptFeedback:{blockReason:'SAFETY'}})));});
test('Google-virhe säilyttää tilakoodin muttei paljasta vastauksen sisältöä',async()=>{await assert.rejects(()=>evaluateWithGemma(config,lesson,'Kutsu',fake({error:{message:'sensitive-provider-detail'}},429)),(e:unknown)=>e instanceof GemmaError && e.status===429 && !e.message.includes('sensitive'));});
test('epäkelpo JSON ei avaa tasoa',async()=>{await assert.rejects(()=>evaluateWithGemma(config,lesson,'Kutsu',fake(answer('not-json'))));});
test('thinking-sisältö jätetään pois arvioinnista',async()=>{const body={candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'internal text'},{text:JSON.stringify(good)}]}}]};assert.equal((await evaluateWithGemma(config,lesson,'Kutsu',fake(body))).passed,true);});
