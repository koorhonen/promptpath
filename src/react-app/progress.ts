import type {CourseId,Language} from '../shared/lessons.ts';
export function progressKey(language:Language,course:CourseId,demo:boolean):string {
 const legacy=(demo?'promptpath-demo-v1':'promptpath-v1')+(language==='en'?'-en':'');
 return course==='foundations'?legacy:legacy+'-'+course;
}
export function normalizeProgress(value:unknown,count:number):number {
 return typeof value==='number' && Number.isInteger(value) && value>=0 && value<=count?value:0;
}
