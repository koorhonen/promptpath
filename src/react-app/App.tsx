import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { getLessons, getCourses } from '../shared/lessons';
import type { Language, CourseId } from '../shared/lessons';
import type { Evaluation } from '../shared/evaluation';
import { translations } from './translations';
import {progressKey,normalizeProgress} from './progress';
import './App.css';

const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const demo = import.meta.env.VITE_DEMO_MODE === 'true';
function loadProgress(language: Language, course: CourseId = 'foundations'): number {
  try {
    const value:unknown=JSON.parse(localStorage.getItem(progressKey(language,course,demo))||'0');
    return normalizeProgress(value,getLessons(language,course).length);
  } catch { return 0; }
}
function preferredLanguage(): Language {
  try { return localStorage.getItem('promptpath-language') === 'en' ? 'en' : 'fi'; } catch { return 'fi'; }
}

export default function App() {
  const [language, setLanguage] = useState<Language>(preferredLanguage);
  const [playing, setPlaying] = useState(false);
  const [course,setCourse]=useState<CourseId|null>(null);
  const [rememberError, setRememberError] = useState(false);
  const t = translations[language];
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'fi' ? 'Promptpath — opi ohjaamaan tekoälyä' : 'Promptpath — learn to guide AI';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'fi' ? 'Opi ohjaamaan tekoälyä käytännön harjoituksilla neljässä oppimisluokassa.' : 'Learn to guide AI through practical exercises in four classes.');
  }, [language]);
  function choose(value: Language) {
    setLanguage(value);
    try { localStorage.setItem('promptpath-language', value); } catch { setRememberError(true); }
  }
  function goHome() { setCourse(null); setPlaying(false); window.scrollTo({ top: 0 }); }
  if (playing && course) return <Training key={language+course} language={language} course={course} onHome={goHome} onCourses={()=>{setCourse(null);window.scrollTo({top:0});}} />;
  if (playing) return <CourseSelection language={language} onHome={goHome} onSelect={value=>{setCourse(value);window.scrollTo({top:0});}} />;
  const fi = language === 'fi';
  const courses=getCourses(language);
  const progress=courses.reduce((sum,c)=>sum+loadProgress(language,c.id),0);
  const total=courses.reduce((sum,c)=>sum+c.lessons.length,0);
  const steps = fi ? [
    { title: 'Ymmärrä periaate', text: 'Lyhyt opetus ja käytännön esimerkki auttavat alkuun.' },
    { title: 'Kirjoita oma promptisi', text: 'Sovella oppimaasi selkeässä harjoituksessa.' },
    { title: 'Kehitä ja etene', text: 'Saat palautetta. Kun tavoitteet täyttyvät, seuraava taso avautuu.' }
  ] : [
    { title: 'Understand the principle', text: 'A short lesson and a practical example get you started.' },
    { title: 'Write your own prompt', text: 'Apply what you learned in a focused exercise.' },
    { title: 'Improve and progress', text: 'Get feedback. Meet the goals to unlock the next level.' }
  ];
  return <div className="welcome-page">
    <div className="backdrop" aria-hidden="true">promptpath</div>
    <div className="midground" aria-hidden="true"/>
    <header className="site-header story-header"><a className="brand" href="./"><span className="brand-mark">p/</span>promptpath<span className="beta">{t.training}</span></a><span className="header-note">{fi ? 'OPI OHJAAMAAN TEKOÄLYÄ' : 'LEARN TO GUIDE AI'}</span><a className="story-shortcut" href="#language">Suomi / English <span aria-hidden="true">↗</span></a></header>
    <main className="welcome-main">
      <section className="chapter chapter-hero" aria-labelledby="welcome-title">
        <div className="hero-rule" aria-hidden="true"/>
        <div className="welcome-copy reveal"><p className="eyebrow">{fi ? 'TERVETULOA PROMPTPATHIIN' : 'WELCOME TO PROMPTPATH'}</p><h1 id="welcome-title">{fi ? <>Paremmat vastaukset<br/>alkavat <em className="title">sinusta.</em></> : <>Better answers<br/>start with <em className="title">you.</em></>}</h1><p className="welcome-intro">{fi ? 'Opi antamaan tekoälylle selkeitä ohjeita. Harjoittele omaan tahtiisi, hyödynnä palautetta ja etene perusteista vaativampiin taitoihin.' : 'Learn to give AI clear instructions. Practise at your own pace, get useful feedback and progress from the basics to advanced skills.'}</p><div className="welcome-stats"><span><strong>{total}</strong>{fi ? 'käytännön harjoitusta' : 'practical exercises'}</span><span><strong>02</strong>{fi ? 'kielivaihtoehtoa' : 'languages to choose from'}</span><span><strong>∞</strong>{fi ? 'mahdollisuutta oppia' : 'opportunities to learn'}</span></div><a className="text-link" href="#principle">{steps[0].title} <span aria-hidden="true">↓</span></a></div>
      </section>
      {steps.map((step,i) => <section className={'chapter chapter-step chapter-step-'+(i+1)} id={i===0?'principle':undefined} key={step.title} aria-labelledby={'step-'+i}><div className="chapter-inner"><div className="chapter-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</div><div className="chapter-copy reveal"><p className="eyebrow">{t.path} / {String(i+1).padStart(2,'0')}</p><h2 className="chapter-title" id={'step-'+i}>{step.title}</h2><p>{step.text}</p><div className="chapter-line" aria-hidden="true"/></div></div></section>)}
      <section className="chapter chapter-language" id="language" aria-labelledby="language-heading"><div className="language-layout"><div className="language-context reveal"><p className="eyebrow">{t.path}</p><h2 className="chapter-title">{t.develop}<br/><span className="title">{t.oneLevel}</span></h2><p>{fi ? 'Opetus, tehtävät ja palaute ovat valitsemallasi kielellä.' : 'Lessons, exercises and feedback use your chosen language.'}</p></div><div className="language-panel reveal"><p className="eyebrow">{fi ? 'VALITSE HARJOITTELUKIELI' : 'CHOOSE YOUR LANGUAGE'}</p><h2 id="language-heading">{fi ? 'Millä kielellä aloitetaan?' : 'Which language will you use?'}</h2><fieldset><legend className="sr-only">Suomi / English</legend>{(['fi','en'] as const).map(value => <label className={'language-option '+(language===value?'selected':'')} key={value}><input type="radio" name="language" value={value} checked={language===value} onChange={()=>choose(value)}/><span className="language-code" aria-hidden="true">{value.toUpperCase()}</span><span><strong lang={value}>{value==='fi'?'Suomi':'English'}</strong><small lang={value}>{value==='fi'?'Harjoittele suomeksi':'Practise in English'}</small></span><span className="radio-mark" aria-hidden="true"/></label>)}</fieldset>
      {progress>0&&<p className="returning-progress">{fi?'Tallennettu eteneminen: ':'Saved progress: '}{progress} / {total} {fi?'tasoa':'levels'}</p>}
      <button className="primary button start-button" onClick={()=>{setPlaying(true);window.scrollTo({top:0});}}>{fi?'Valitse luokka →':'Choose a class →'}</button><p className="welcome-save-note">{fi?'Et tarvitse käyttäjätiliä. Etenemisesi tallentuu tähän selaimeen erikseen kummallekin kielelle.':'No account needed. Progress is saved in this browser separately for each language.'}</p>{rememberError&&<p role="status" className="notice">{t.storageError}</p>}{demo&&<p className="welcome-demo">{t.demo}{'. '}{t.demoPrivacy}</p>}</div></div></section>
    </main><footer className="story-footer">{fi?'Selkeä ajatus. Selkeä ohje. Parempi lopputulos.':'Clear thinking. Clear instructions. Better results.'}</footer>
  </div>;
}

function CourseSelection({language,onHome,onSelect}:{language:Language;onHome:()=>void;onSelect:(course:CourseId)=>void}){
 const fi=language==='fi',courses=getCourses(language);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus();},[]);
 return <><header className="site-header"><button className="brand brand-button" onClick={onHome} aria-label={translations[language].home}><span className="brand-mark">p/</span>promptpath<span className="beta">{translations[language].training}</span></button><span className="header-note">{fi?'VALITSE OMA OPPIMISPOLKUSI':'CHOOSE YOUR LEARNING PATH'}</span><button className="language-switch" onClick={onHome}>{language.toUpperCase()} / {translations[language].switchLanguage}</button></header>
 <main className="course-main"><p className="eyebrow">{fi?'NELJÄ LUOKKAA. ERILAISIA TAITOJA.':'FOUR CLASSES. DIFFERENT SKILLS.'}</p><h1 ref={heading} tabIndex={-1}>{fi?'Mitä haluat oppia?':'What would you like to learn?'}</h1><p className="course-intro">{fi?'Aloita perusteista tai valitse kiinnostava aihe. Jokaisessa luokassa on omat opetukset, tehtävät ja eteneminen. Voit vaihtaa luokkaa milloin tahansa.':'Start with the foundations or pick a topic. Each class has its own lessons, exercises and progress. You can switch classes at any time.'}</p>
 <div className="course-grid">{courses.map((c,i)=>{const done=loadProgress(language,c.id);return <article className="course-card" key={c.id} aria-labelledby={'course-'+c.id}><div className="course-meta"><span>{String(i+1).padStart(2,'0')}</span><span>{c.lessons.length} {fi?'HARJOITUSTA':'EXERCISES'}</span></div><h2 id={'course-'+c.id}>{c.title}</h2><p>{c.description}</p><div className="course-progress"><span>{done} / {c.lessons.length} {fi?'suoritettu':'completed'}</span><progress value={done} max={c.lessons.length} aria-label={c.title+' / '+translations[language].progress}/></div><button className="primary course-button" onClick={()=>onSelect(c.id)} aria-label={(done>0?(fi?'Jatka: ':'Continue: '):(fi?'Aloita: ':'Start: '))+c.title}>{done===c.lessons.length?(fi?'Kertaa luokka →':'Review class →'):done>0?(fi?'Jatka luokkaa →':'Continue class →'):(fi?'Aloita luokka →':'Start class →')}</button></article>;})}</div><footer>{translations[language].saved}</footer></main></>;
}

function Training({ language, course, onHome, onCourses }: { language: Language; course: CourseId; onHome: () => void; onCourses: () => void }) {
  const t = translations[language];
  const lessons = getLessons(language,course);
  const courseTitle=getCourses(language).find(c=>c.id===course)!.title;
  const [completed, setCompleted] = useState(() => loadProgress(language,course));
  const [current, setCurrent] = useState(() => Math.min(completed, lessons.length - 1));
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<Evaluation | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const inFlight = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lesson = lessons[current], prompt = drafts[current] || '';
  const rank = t.ranks[completed === lessons.length ? 3 : completed >= Math.ceil(lessons.length*.75) ? 2 : completed >= Math.ceil(lessons.length*.4) ? 1 : 0];
  const milestones = [1, Math.ceil(lessons.length*.4), Math.ceil(lessons.length*.75), lessons.length];
  useEffect(() => { headingRef.current?.focus(); }, [current]);
  function persist(value: number) { setCompleted(value); try { localStorage.setItem(progressKey(language,course,demo), JSON.stringify(value)); } catch { setStorageError(true); } }
  function select(index: number) { if (inFlight.current) return; setCurrent(index); setHint(false); setResult(null); setError(''); }
  async function evaluate(event: FormEvent) {
    event.preventDefault(); if (inFlight.current || prompt.trim().length < 10) return;
    inFlight.current = true; setBusy(true); setResult(null); setError('');
    try {
      let evaluation: Evaluation;
      if (demo) evaluation = { passed: true, feedback: t.demoFeedback, improvements: [t.selfCheck + lesson.criteria.join('. ') + '.'] };
      else {
        const response = await fetch(api + '/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept-Language': language }, body: JSON.stringify({ lessonId: lesson.id, prompt, language, courseId:course }), signal: AbortSignal.timeout(45000) });
        if (!response.ok) {
          const data: unknown = await response.json().catch(() => null);
          throw Error(data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : response.status === 429 ? t.rateError : t.genericError);
        }
        const data: unknown = await response.json();
        if (!data || typeof data !== 'object' || !('passed' in data) || typeof data.passed !== 'boolean' || !('feedback' in data) || typeof data.feedback !== 'string' || !('improvements' in data) || !Array.isArray(data.improvements) || !data.improvements.every(x => typeof x === 'string')) throw Error(t.invalid);
        evaluation = data as Evaluation;
      }
      setResult(evaluation); if (evaluation.passed && current === completed) persist(completed + 1);
    } catch (e) { setError(e instanceof Error && e.name === 'TimeoutError' ? t.timeout : e instanceof TypeError ? t.connection : e instanceof Error ? e.message : t.connection); }
    finally { inFlight.current = false; setBusy(false); requestAnimationFrame(() => feedbackRef.current?.focus()); }
  }
  return <><header className="site-header"><button className="brand brand-button" onClick={onHome} disabled={busy} aria-label={t.home}><span className="brand-mark">p/</span>promptpath<span className="beta">{t.training}</span></button><span className="header-note">{t.tagline}</span><button className="language-switch" onClick={onHome} disabled={busy}>{language.toUpperCase()} / {t.switchLanguage}</button><span className="xp">{completed * 100} XP</span></header>
    <div className="layout"><aside><button className="course-back" disabled={busy} onClick={onCourses}>{language==='fi'?'← Vaihda luokkaa':'← Change class'}</button><p className="active-course">{courseTitle}</p><div className="player-card"><span className="player-avatar" aria-hidden="true">{String(Math.min(completed + 1, lessons.length)).padStart(2, '0')}</span><div><small>{t.skill}</small><strong>{rank}</strong><span>{t.level} {Math.min(completed + 1, 8)} · {completed * 100} XP</span></div></div><p className="eyebrow map-title">{t.path}</p><h2>{t.develop}<br/>{t.oneLevel}</h2><div className="progress-label"><span>{completed} / {lessons.length} {t.completed}</span><span>{Math.round(completed / lessons.length * 100)} %</span></div><progress value={completed} max={lessons.length} aria-label={t.progress}/><nav aria-label={t.levels}>{lessons.map((l, i) => <button key={l.id} className={'level ' + (i === current ? 'active ' : '') + (i < completed ? 'complete ' : '') + (i > completed ? 'locked' : '')} disabled={busy || i > completed} aria-current={i === current ? 'step' : undefined} aria-label={t.level + ' ' + l.id + ': ' + l.title + (i > completed ? ', ' + t.locked : '')} onClick={() => select(i)}><span className="level-number">{i < completed ? '✓' : String(l.id).padStart(2, '0')}</span><span className="level-name"><strong>{l.title}</strong><small>{i < completed ? t.done + ' · 100 XP' : i === completed ? t.ready : l.group}</small></span>{i > completed && <span className="lock" aria-hidden="true">⌑</span>}</button>)}</nav><div className="achievements"><p className="eyebrow">{t.achievements} · {milestones.filter(at => completed >= at).length}/4</p><div className="badges">{milestones.map((at, i) => <span key={at} className={completed >= at ? 'badge earned' : 'badge'} title={t.badges[i] + (completed >= at ? ' — ' + t.earned : ' — ' + t.completeLevels + ': ' + at)} aria-label={t.badges[i] + ', ' + (completed >= at ? t.earned : t.locked)}>{String(at).padStart(2, '0')}</span>)}</div></div><div className="aside-foot">{t.unlimited}<small>{t.saved}</small></div><button className="reset" disabled={busy} onClick={() => { if (confirm(t.confirmReset)) { persist(0); select(0); setDrafts({}); } }}>{t.reset}</button></aside>
      <main><div className="topline"><span className="pill">{t.level.toUpperCase()} {lesson.id} / {lessons.length} · {lesson.group.toUpperCase()}</span><span>{demo ? t.demo : t.coach}</span></div><div className="lesson-heading"><div><p className="eyebrow">{t.exerciseLabel}</p><h1 ref={headingRef} tabIndex={-1}>{lesson.title}</h1><p className="subtitle">{t.subtitle}</p></div><div className="lesson-index" aria-hidden="true">{String(lesson.id).padStart(2, '0')}<span>/ {String(lessons.length).padStart(2,'0')}</span></div></div>{storageError && <p role="status" className="notice">{t.storageError}</p>}
        <section className="card lesson-card"><div className="section-label"><span>01</span>{t.principle}<small>{t.readTime}</small></div><p className="intro">{lesson.intro}</p><div className="example"><p className="eyebrow">{t.example}</p><p>{lesson.example}</p></div></section>
        <section className="card exercise"><div className="quest-reward">{t.reward}</div><div className="section-label"><span>02</span>{t.task}</div><h2>{t.apply}</h2><p>{lesson.task}</p><ul className="criteria">{lesson.criteria.map(c => <li key={c}>{c}</li>)}</ul><form onSubmit={evaluate}><label htmlFor="prompt">{t.yourPrompt}</label><textarea id="prompt" value={prompt} minLength={10} maxLength={4000} required disabled={busy} aria-describedby="prompt-note" onChange={e => { setDrafts({ ...drafts, [current]: e.target.value }); setResult(null); setError(''); }} placeholder={t.placeholder}/><div className="editor-foot"><button type="button" className="hint-button" aria-expanded={hint} aria-controls="hint" onClick={() => setHint(!hint)}>{hint ? t.hideHint : t.showHint}</button><span>{prompt.length} / 4000</span></div><p id="hint" className="hint" hidden={!hint}>{lesson.hint}</p><p id="prompt-note" className="privacy">{t.privacy} {demo ? t.demoPrivacy : t.livePrivacy}</p><div className="submit-row"><span>{t.eachTry}</span><button className="primary" disabled={busy || prompt.trim().length < 10}>{busy ? t.evaluating : t.submit}</button></div></form>
          <div ref={feedbackRef} tabIndex={-1} role="status" aria-live="polite" className={(result || error || busy ? 'feedback ' : '') + (result?.passed ? 'victory' : '')}>{busy && <p>{t.reading}</p>}{error && <><h3>{t.errorTitle}</h3><p>{error}</p><p>{t.retry}</p></>}{result && <><h3>{result.passed ? demo ? t.demoPassed : t.passed : t.tryAgain}</h3><p>{result.feedback}</p>{result.improvements.length > 0 && <ul>{result.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul>}{result.passed && (current < lessons.length - 1 ? <button className="primary" onClick={() => { select(current + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t.next}</button> : <p className="finish">{t.finish}</p>)}</>}</div></section><footer>{t.footer}</footer>
      </main></div></>;
}
