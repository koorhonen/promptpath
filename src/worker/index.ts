import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {bodyLimit} from 'hono/body-limit';
import {lessons} from '../shared/lessons';
import {evaluateWithGemma,GemmaError} from './gemma';
interface Bindings {GEMMA_API_KEY:string;GEMMA_MODEL:string;ALLOWED_ORIGINS:string;RATE_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>}}
const app=new Hono<{Bindings:Bindings}>();
app.use('/api/*',async(c,next)=>{c.header('Cache-Control','no-store');await next();});
app.use('/api/*',cors({origin:(origin,c)=>(c.env.ALLOWED_ORIGINS||'').split(',').map((x:string)=>x.trim()).includes(origin)?origin:'',allowMethods:['POST','OPTIONS'],allowHeaders:['Content-Type']}));
app.use('/api/*',async(c,next)=>{const origin=c.req.header('Origin');if(!origin || !(c.env.ALLOWED_ORIGINS||'').split(',').map((x:string)=>x.trim()).includes(origin))return c.json({error:'Tätä alkuperää ei sallita.'},403);await next();});
app.use('/api/evaluate',bodyLimit({maxSize:20000,onError:c=>c.json({error:'Pyyntö on liian suuri.'},413)}));
app.post('/api/evaluate',async c=>{
 if(!c.env.RATE_LIMITER)return c.json({error:'Palvelun pyyntörajoitus puuttuu.'},503);
 const limit=await c.env.RATE_LIMITER.limit({key:c.req.header('CF-Connecting-IP')||'local'});
 if(!limit.success)return c.json({error:'Liian monta yritystä. Odota minuutti ja yritä uudelleen.'},429);
 if(!c.req.header('Content-Type')?.startsWith('application/json'))return c.json({error:'Lähetä JSON-muotoinen pyyntö.'},415);
 let input:unknown;try{input=await c.req.json();}catch{return c.json({error:'Virheellinen JSON.'},400);}
 if(!input || typeof input!=='object' || !('lessonId' in input) || !('prompt' in input))return c.json({error:'Taso tai prompti puuttuu.'},400);
 const lesson=lessons.find(l=>l.id===input.lessonId);
 if(!lesson || typeof input.prompt!=='string' || input.prompt.trim().length<10 || input.prompt.length>4000)return c.json({error:'Tarkista taso ja promptin pituus (10–4000 merkkiä).'},400);
 if(!c.env.GEMMA_API_KEY)return c.json({error:'Gemma-arviointia ei ole vielä otettu käyttöön.'},503);
 try{
  return c.json(await evaluateWithGemma(c.env,lesson,input.prompt));
 }catch(error){
  if(error instanceof GemmaError && error.status===429)return c.json({error:'Gemman käyttöraja tuli vastaan. Odota hetki ja yritä uudelleen.'},503);
  if(error instanceof Error && error.name==='TimeoutError')return c.json({error:'Gemma-arviointi kesti liian kauan. Yritä uudelleen.'},504);
  return c.json({error:'Gemma-arvio ei onnistunut. Yritä hetken kuluttua uudelleen.'},502);
 }
});
app.notFound(c=>c.json({error:'Reittiä ei löytynyt.'},404));
app.onError((_e,c)=>c.json({error:'Palvelussa tapahtui virhe. Yritä myöhemmin uudelleen.'},500));
export default app;
