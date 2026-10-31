import {useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {lessons} from '../shared/lessons';
import type {Evaluation} from '../shared/evaluation';
import './App.css';
const api=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'');
const demo=import.meta.env.VITE_DEMO_MODE==='true';
const key=demo?'promptpath-demo-v1':'promptpath-v1';
function load():number {try {const v:unknown=JSON.parse(localStorage.getItem(key)||'0');return typeof v==='number' && Number.isInteger(v) && v>=0 && v<=lessons.length?v:0;} catch{return 0;}}
export default function App(){
 const [completed,setCompleted]=useState(load);
 const [current,setCurrent]=useState(()=>Math.min(completed,lessons.length-1));
 const [drafts,setDrafts]=useState<Record<number,string>>({});
 const [hint,setHint]=useState(false);
 const [result,setResult]=useState<Evaluation|null>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [storageError,setStorageError]=useState(false);
 const inFlight=useRef(false);
 const feedbackRef=useRef<HTMLDivElement>(null);
 const lesson=lessons[current],prompt=drafts[current]||'';
 const rank=completed===8?'Promptimestari':completed>=6?'Edistynyt':completed>=3?'Taitaja':'Aloittelija';
 const earned=[{icon:'01',title:'Ensimmäinen askel',at:1},{icon:'03',title:'Perusteet hallussa',at:3},{icon:'06',title:'Taitajan taidot',at:6},{icon:'08',title:'Promptimestari',at:8}];
 function persist(v:number){setCompleted(v);try{localStorage.setItem(key,JSON.stringify(v));}catch{setStorageError(true);}}
 function select(i:number){if(inFlight.current)return;setCurrent(i);setHint(false);setResult(null);setError('');}
 async function evaluate(event:FormEvent){
  event.preventDefault();if(inFlight.current || prompt.trim().length<10)return;
  inFlight.current=true;setBusy(true);setResult(null);setError('');
  try{
   let evaluation:Evaluation;
   if(demo)evaluation={passed:true,feedback:'Tämä on demotila. Promptia ei arvioitu tekoälyllä. Voit kokeilla tasojen etenemistä vapaasti.',improvements:['Tarkista itse: '+lesson.criteria.join('. ')+'.']};
   else{
    const response=await fetch(api+'/api/evaluate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonId:lesson.id,prompt}),signal:AbortSignal.timeout(45000)});
    const data:unknown=await response.json();
    if(!response.ok)throw Error(typeof data==='object' && data && 'error' in data && typeof data.error==='string'?data.error:'Arviointi ei onnistunut.');
    if(!data || typeof data!=='object' || !('passed' in data) || typeof data.passed!=='boolean' || !('feedback' in data) || typeof data.feedback!=='string' || !('improvements' in data) || !Array.isArray(data.improvements) || !data.improvements.every(x=>typeof x==='string'))throw Error('Arviointipalvelun vastaus oli virheellinen.');
    evaluation=data as Evaluation;
   }
   setResult(evaluation);if(evaluation.passed && current===completed)persist(completed+1);
  }catch(e){setError(e instanceof Error && e.name==='TimeoutError'?'Arviointi kesti liian kauan. Yritä uudelleen.':e instanceof Error?e.message:'Yhteys epäonnistui. Yritä uudelleen.');}
  finally{inFlight.current=false;setBusy(false);requestAnimationFrame(()=>feedbackRef.current?.focus());}
 }
 return <><header className="site-header"><a className="brand" href="./"><span className="brand-mark">p/</span>promptpath<span className="beta">TRAINING</span></a><span className="header-note">PAREMPI OHJE. PAREMPI LOPPUTULOS.</span><span className="xp">{completed*100} XP</span></header><div className="layout"><aside><div className="player-card"><span className="player-avatar" aria-hidden="true">{String(Math.min(completed+1,8)).padStart(2,'0')}</span><div><small>OSAAMISTASOSI</small><strong>{rank}</strong><span>Taso {Math.min(completed+1,8)} · {completed*100} XP</span></div></div><p className="eyebrow map-title">OPPIMISPOLKU</p><h2>Kehitä taitoasi.<br/>Taso kerrallaan.</h2><div className="progress-label"><span>{completed} / {lessons.length} tasoa suoritettu</span><span>{Math.round(completed/lessons.length*100)} %</span></div><progress value={completed} max={lessons.length} aria-label="Oppimispolun edistyminen"/><nav aria-label="Oppimistasot">{lessons.map((l,i)=><button key={l.id} className={'level '+(i===current?'active ':'')+(i<completed?'complete ':'')+(i>completed?'locked':'')} disabled={busy||i>completed} aria-current={i===current?'step':undefined} aria-label={'Taso '+l.id+': '+l.title+(i>completed?', lukittu':'')} onClick={()=>select(i)}><span className="level-number">{i<completed?'✓':String(l.id).padStart(2,'0')}</span><span className="level-name"><strong>{l.title}</strong><small>{i<completed?'Suoritettu · 100 XP':i===completed?'Valmis aloitettavaksi':l.group}</small></span>{i>completed&&<span className="lock" aria-hidden="true">⌑</span>}</button>)}</nav><div className="achievements"><p className="eyebrow">SAAVUTUKSET · {earned.filter(b=>completed>=b.at).length}/4</p><div className="badges">{earned.map(b=><span key={b.at} className={completed>=b.at?'badge earned':'badge'} title={b.title+(completed>=b.at?' — ansaittu':' — suorita '+b.at+' tasoa')} aria-label={b.title+(completed>=b.at?', ansaittu':', lukittu')}>{b.icon}</span>)}</div></div><div className="aside-foot">Yrityksiä on rajattomasti.<small>Etenemisesi tallentuu tälle selaimelle.</small></div><button className="reset" disabled={busy} onClick={()=>{if(confirm('Poistetaanko tämän tilan tallennettu eteneminen?')){persist(0);select(0);setDrafts({});}}}>Aloita alusta</button></aside>
 <main><div className="topline"><span className="pill">TASO {lesson.id} / {lessons.length} · {lesson.group.toUpperCase()}</span><span>{demo?'Demotila · ei tekoälyarviota':'Gemma 4 · Arviointi'}</span></div><div className="lesson-heading"><div><p className="eyebrow">PROMPT ENGINEERING / HARJOITUS</p><h1>{lesson.title}</h1><p className="subtitle">Ymmärrä periaate. Kirjoita oma ohje. Kehitä sitä palautteen avulla.</p></div><div className="lesson-index" aria-hidden="true">{String(lesson.id).padStart(2,'0')}<span>/ 08</span></div></div>{storageError&&<p role="status" className="notice">Selain ei salli tallentamista. Eteneminen säilyy vain tämän käyttökerran ajan.</p>}
 <section className="card lesson-card"><div className="section-label"><span>01</span> PERIAATE <small>LUKUAIKA 1 MIN</small></div><p className="intro">{lesson.intro}</p><div className="example"><p className="eyebrow">ESIMERKKI</p><p>{lesson.example}</p></div></section>
 <section className="card exercise"><div className="quest-reward">100 XP / TASO</div><div className="section-label"><span>02</span> TEHTÄVÄSI</div><h2>Sovella oppimaasi</h2><p>{lesson.task}</p><ul className="criteria">{lesson.criteria.map(c=><li key={c}>{c}</li>)}</ul><form onSubmit={evaluate}><label htmlFor="prompt">Oma promptisi</label><textarea id="prompt" value={prompt} minLength={10} maxLength={4000} required disabled={busy} aria-describedby="prompt-note" onChange={e=>{setDrafts({...drafts,[current]:e.target.value});setResult(null);setError('');}} placeholder="Kirjoita tähän ohje, jonka antaisit tekoälylle…"/><div className="editor-foot"><button type="button" className="hint-button" aria-expanded={hint} aria-controls="hint" onClick={()=>setHint(!hint)}>☼ {hint?'Piilota vinkki':'Näytä vinkki'}</button><span>{prompt.length} / 4000</span></div>{hint&&<p id="hint" className="hint">{lesson.hint}</p>}<p id="prompt-note" className="privacy">Älä kirjoita henkilötietoja tai salaisuuksia. {demo?'Demotilassa tekstiä ei lähetetä palvelimelle.':'Promptisi lähetetään Googlen Gemma 4 -mallille arvioitavaksi.'}</p><div className="submit-row"><span>Jokainen yritys opettaa jotain.</span><button className="primary" disabled={busy||prompt.trim().length<10}>{busy?'Arvioidaan…':'Arvioi prompti →'}</button></div></form>
 <div ref={feedbackRef} tabIndex={-1} role="status" aria-live="polite" className={(result||error||busy?'feedback ':'')+(result?.passed?'victory':'')}>{busy&&<p>Tekoäly lukee promptiasi…</p>}{error&&<><h3>Arviointi ei onnistunut</h3><p>{error}</p><p>Promptisi säilyy kentässä. Voit yrittää uudelleen.</p></>}{result&&<><h3>{result.passed?demo?'Demotaso kokeiltu':'Taso suoritettu':'Hyvä alku — kokeillaan vielä'}</h3><p>{result.feedback}</p>{result.improvements.length>0&&<ul>{result.improvements.map((item,i)=><li key={i}>{item}</li>)}</ul>}{result.passed&&(current<lessons.length-1?<button className="primary" onClick={()=>{select(current+1);window.scrollTo({top:0,behavior:'smooth'});}}>Seuraava taso →</button>:<p className="finish">Olet suorittanut koko polun! Voit palata kertaamaan kaikkia tasoja.</p>)}</>}</div></section><footer>Hyvä prompti ei ole taikasana. Se on selkeä ohje.</footer></main></div></>;
}
