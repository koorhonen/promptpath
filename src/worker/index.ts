import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {bodyLimit} from 'hono/body-limit';
import {getLessons,isCourseId} from '../shared/lessons';
import {errors} from '../shared/errors';
import {evaluateWithGemma,GemmaError} from './gemma';
interface Bindings {GEMMA_API_KEY:string;GEMMA_MODEL:string;ALLOWED_ORIGINS:string;RATE_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>}}
const app=new Hono<{Bindings:Bindings}>();
const messages=(header:string|undefined)=>errors[header?.toLowerCase().startsWith('en')?'en':'fi'];
app.use('/api/*',async(c,next)=>{c.header('Cache-Control','no-store');await next();});
app.use('/api/*',cors({origin:(origin,c)=>(c.env.ALLOWED_ORIGINS||'').split(',').map((x:string)=>x.trim()).includes(origin)?origin:'',allowMethods:['POST','OPTIONS'],allowHeaders:['Content-Type']}));
app.use('/api/*',async(c,next)=>{const origin=c.req.header('Origin');if(!origin || !(c.env.ALLOWED_ORIGINS||'').split(',').map((x:string)=>x.trim()).includes(origin))return c.json({error:messages(c.req.header('Accept-Language')).origin},403);await next();});
app.use('/api/evaluate',bodyLimit({maxSize:20000,onError:c=>c.json({error:messages(c.req.header('Accept-Language')).body},413)}));
app.post('/api/evaluate',async c=>{
 if(!c.env.RATE_LIMITER)return c.json({error:messages(c.req.header('Accept-Language')).limiter},503);
 const limit=await c.env.RATE_LIMITER.limit({key:c.req.header('CF-Connecting-IP')||'local'});
 if(!limit.success)return c.json({error:messages(c.req.header('Accept-Language')).rate},429);
 if(!c.req.header('Content-Type')?.startsWith('application/json'))return c.json({error:messages(c.req.header('Accept-Language')).content},415);
 let input:unknown;try{input=await c.req.json();}catch{return c.json({error:messages(c.req.header('Accept-Language')).json},400);}
 if(!input || typeof input!=='object' || !('lessonId' in input) || !('prompt' in input))return c.json({error:messages(c.req.header('Accept-Language')).missing},400);
 const language='language' in input ? input.language : 'fi';
 if(language!=='fi' && language!=='en')return c.json({error:messages(c.req.header('Accept-Language')).language},400);
 const courseId='courseId' in input?input.courseId:'foundations';
 if(!isCourseId(courseId))return c.json({error:messages(c.req.header('Accept-Language')).course},400);
 const lesson=getLessons(language,courseId).find(l=>l.id===input.lessonId);
 if(!lesson || typeof input.prompt!=='string' || input.prompt.trim().length<10 || input.prompt.length>4000)return c.json({error:messages(c.req.header('Accept-Language')).input},400);
 if(!c.env.GEMMA_API_KEY)return c.json({error:messages(c.req.header('Accept-Language')).setup},503);
 try{
  return c.json(await evaluateWithGemma(c.env,lesson,input.prompt,fetch,language));
 }catch(error){
  if(error instanceof GemmaError && error.status===429)return c.json({error:messages(c.req.header('Accept-Language')).quota},503);
  if(error instanceof Error && error.name==='TimeoutError')return c.json({error:messages(c.req.header('Accept-Language')).timeout},504);
  return c.json({error:messages(c.req.header('Accept-Language')).model},502);
 }
});
app.notFound(c=>c.json({error:messages(c.req.header('Accept-Language')).notFound},404));
app.onError((_e,c)=>c.json({error:messages(c.req.header('Accept-Language')).server},500));
export default app;
