export interface Evaluation {passed:boolean;feedback:string;improvements:string[]}
export function parseEvaluation(value:unknown,count:number):Evaluation {
 if (!value || typeof value !== 'object') throw Error('Invalid evaluation');
 const v=value as Record<string,unknown>;
 if (!Array.isArray(v.criteria) || v.criteria.length!==count || !v.criteria.every(x=>typeof x==='boolean') || typeof v.feedback!=='string' || !v.feedback.trim() || v.feedback.length>2000 || !Array.isArray(v.improvements) || v.improvements.length>5 || !v.improvements.every(x=>typeof x==='string' && x.trim().length>0 && x.length<=500)) throw Error('Invalid evaluation');
 const passed=v.criteria.every(Boolean);
 if (!passed && !v.improvements.length) throw Error('Missing improvement');
 return {passed,feedback:v.feedback,improvements:v.improvements as string[]};
}
