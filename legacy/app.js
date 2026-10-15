(function(){
// Sprite drawing (drawSprite, drawAlly, drawGoblin, drawColossus, drawScene...) lives in src/sprites.js
const LB = 0.45359237, CM_IN = 2.54;
const MEALS = ["Breakfast","Meal 2","Lunch","Meal 4","Pre-workout","Post-workout","Dinner","Snacks"];
const SLOTS = ["Morning","Pre-gym","Evening"];
const DEFAULT_STACK = [
  {id:"cre", name:"Creatine", dose:"5 g", slot:"Morning"},
  {id:"d3", name:"Vitamin D3", dose:"2,000 IU", slot:"Morning"},
  {id:"o3", name:"Omega-3 (EPA+DHA)", dose:"1–2 g", slot:"Morning"},
  {id:"caf", name:"Caffeine", dose:"150–200 mg", slot:"Pre-gym"},
  {id:"zn", name:"Zinc", dose:"15–25 mg", slot:"Evening"},
  {id:"mg", name:"Magnesium glycinate", dose:"200–350 mg", slot:"Evening"}
];
const CUT = {kcal:2180, protein:215, carbs:208, fat:50, restKcal:1980, restCarbs:159, restFat:52};
const DEFAULT_AVATAR = {name:"Kai", skin:1, hair:1, style:0, outfit:"tee", head:"none", gear:"nogear", scene:"quest"};
const BOSS_HP = 5, BOSS_XP = 100;
const SPEAKERS = {hero:null, coach:"Coach Brock", buddy:"Gym Companion", cardio:"Cardio Master"};
const PROGRAM = {
  push:{name:"Upper Push",kind:"lift",goal:"Chest, shoulders, triceps.",time:"40–50 min",ex:[
    {n:"Bench press",alt:"or DB press",sets:4,lo:6,hi:8,inc:5},{n:"Incline DB press",sets:3,lo:8,hi:10,inc:5},{n:"Shoulder press",sets:3,lo:6,hi:8,inc:5},
    {n:"Triceps pushdown",alt:"or dips",sets:3,lo:10,hi:12,inc:5},{n:"Lateral raise",sets:3,lo:12,hi:15,inc:2.5}]},
  pull:{name:"Upper Pull",kind:"lift",goal:"Back, biceps, posture.",time:"40–50 min",ex:[
    {n:"Lat pulldown",alt:"or pull-ups",sets:4,lo:6,hi:10,inc:5},{n:"Barbell row",alt:"or seated row",sets:3,lo:6,hi:8,inc:5},{n:"Face pull",sets:3,lo:12,hi:15,inc:5},
    {n:"Hammer curl",sets:3,lo:10,hi:12,inc:5},{n:"Reverse fly",sets:3,lo:12,hi:15,inc:2.5}]},
  legs:{name:"Lower Body",kind:"lift",goal:"Strong legs without ruining your long run. Keep 2 reps in reserve.",time:"40–50 min",ex:[
    {n:"Back squat",alt:"or leg press",sets:3,lo:5,hi:6,inc:10},{n:"Romanian deadlift",sets:3,lo:6,hi:8,inc:10},{n:"Bulgarian split squat",alt:"each leg",sets:2,lo:8,hi:8,inc:5},
    {n:"Leg curl",sets:2,lo:12,hi:15,inc:5},{n:"Calf raise",sets:2,lo:15,hi:20,inc:10}]},
  speed:{name:"Speed Run",kind:"run",goal:"Get faster and boost VO₂ max. Warm up 10–15 min easy first.",time:"45–60 min",opts:["6×400 m at 5K pace, 90 s rest","10×200 m fast, walk/jog recovery","20 min tempo, comfortably hard"]},
  easy:{name:"Easy Run",kind:"run",goal:"Build your engine. Zone 2: you can talk in full sentences. Add volume, don't exhaust yourself.",time:"30–50 min"},
  long:{name:"Long Run",kind:"run",goal:"Endurance and mental resilience. Easy pace the whole way, and practice fueling past the first hour.",time:"60–120 min"},
  mobility:{name:"Off / Mobility",kind:"rest",goal:"Recovery. This is where gains come to life, so treat it as seriously as a workout.",time:"15–30 min",list:["Hip and hamstring flow, 10 min","Thoracic spine and shoulders, 5 min","Foam roll calves, quads and upper back","Easy walk outside","Weekly check-in: waist, body fat, photos"]}
};
const SESS_ORDER=["push","speed","pull","easy","legs","long","mobility"];
const SHORT={push:"Push",speed:"Speed",pull:"Pull",easy:"Easy",legs:"Legs",long:"Long",mobility:"Rest"};
const WEEK = {1:"push",2:"speed",3:"pull",4:"easy",5:"legs",6:"long",0:"mobility"};
const DEFAULT_PROFILE = {...CUT, unit:"lb", heightCm:165.1, week:WEEK, waterGoal:100, sleepGoal:7, stepGoal:8000, stack:DEFAULT_STACK, startBf:29, goalBf:15};
const STARTER_FOODS = [
  {name:"Chicken breast, cooked 4 oz", kcal:187, p:35, c:0, f:4},
  {name:"Large egg", kcal:72, p:6.3, c:0.4, f:4.8},
  {name:"White rice, cooked 1 cup", kcal:205, p:4.3, c:45, f:0.4},
  {name:"Rolled oats, dry ½ cup", kcal:150, p:5, c:27, f:3},
  {name:"Banana, medium", kcal:105, p:1.3, c:27, f:0.4},
  {name:"Greek yogurt, nonfat 170 g", kcal:100, p:17, c:6, f:0.7},
  {name:"Peanut butter 2 tbsp", kcal:190, p:7, c:7, f:16},
  {name:"Whey protein, 1 scoop", kcal:120, p:24, c:3, f:1.5}
];
const STARTER_LIFTS = ["Back squat","Bench press","Deadlift","Overhead press","Barbell row","Pull-up","Romanian deadlift","Incline dumbbell press","Lat pulldown","Leg press","Dumbbell curl","Triceps pushdown","Lateral raise","Hip thrust","Walking lunge","Plank"];

/* ---------- meal plan (cut) ---------- */
const PF = {
  egg_white:{name:"Egg whites",per:100,unit:"g",kcal:52,c:1,f:0,p:11},
  egg:{name:"Whole eggs",per:1,unit:"",kcal:72,c:0,f:5,p:6},
  spinach:{name:"Spinach, cooked",per:100,unit:"g",kcal:23,c:4,f:0,p:3},
  banana:{name:"Banana, small",per:1,unit:"",kcal:72,c:19,f:0,p:1},
  beef:{name:"Lean beef mince 10%, cooked",per:130,unit:"g",kcal:208,c:4,f:11,p:27},
  rice:{name:"Basmati rice, cooked",per:100,unit:"g",kcal:130,c:28.5,f:0.3,p:2.7},
  broccoli:{name:"Broccoli, air-fried",per:50,unit:"g",kcal:16,c:1,f:1,p:1},
  chicken:{name:"Chicken breast, cooked",per:150,unit:"g",kcal:249,c:0,f:5,p:49},
  stirfry:{name:"Veg stir-fry",per:50,unit:"g",kcal:18,c:2,f:0,p:1},
  avocado:{name:"Avocado",per:100,unit:"g",kcal:160,c:8.5,f:14.7,p:2},
  cor:{name:"Cream of rice, dry",per:100,unit:"g",kcal:370,c:82,f:0.5,p:6},
  whey:{name:"Whey protein",per:1,unit:"scoop",kcal:120,c:3,f:1.5,p:24},
  salmon:{name:"Smoked salmon",per:170,unit:"g",kcal:279,c:2,f:11,p:36},
  banana_m:{name:"Banana, medium",per:1,unit:"",kcal:105,c:27,f:0.4,p:1.3},
  drink:{name:"Sports drink",per:500,unit:"ml",kcal:120,c:30,f:0,p:0},
  gel:{name:"Energy gel",per:1,unit:"",kcal:100,c:25,f:0,p:0}
};
const LONG_FUEL={id:"m8",meal:"Snacks",name:"Long-run fuel",when:"before and during runs over 75 min",items:[["banana_m",1],["drink",500],["gel",1]]};
/* Dinner is home-cooked, so it's a 400–800 kcal budget instead of fixed foods. Sizes log estimated macros. */
const DINNER_SIZES = {
  light:{label:"Light plate",kcal:400,p:35,c:35,f:13},
  reg:{label:"Regular plate",kcal:600,p:40,c:60,f:22},
  big:{label:"Big plate",kcal:800,p:45,c:85,f:31}
};
const DINNER = {id:"m7",meal:"Dinner",name:"Mom's dinner",flex:true,when:"400–800 kcal budget",items:[]};
const PLAN = {
  train:[
    {id:"m1",meal:"Breakfast",name:"Breakfast",items:[["egg_white",150],["egg",2],["spinach",100],["banana",1]]},
    {id:"m2",meal:"Meal 2",name:"Meal 2",items:[["beef",130],["rice",70],["broccoli",100]]},
    {id:"m3",meal:"Lunch",name:"Lunch",items:[["chicken",130],["rice",100],["stirfry",100]]},
    {id:"m4",meal:"Pre-workout",name:"Pre-workout meal",when:"2–2.5 h before your lift or run",items:[["chicken",120],["rice",85]]},
    {id:"m5",meal:"Pre-workout",name:"20 min before",items:[["cor",30]]},
    {id:"m6",meal:"Post-workout",name:"Post-workout shake",items:[["whey",1]]},
    DINNER
  ],
  rest:[
    {id:"m1",meal:"Breakfast",name:"Breakfast",items:[["egg_white",150],["egg",2],["spinach",100],["banana",1]]},
    {id:"m2",meal:"Meal 2",name:"Meal 2",items:[["beef",130],["rice",70],["broccoli",100]]},
    {id:"m3",meal:"Lunch",name:"Lunch",items:[["chicken",130],["rice",100],["stirfry",100]]},
    {id:"m4",meal:"Meal 4",name:"Meal 4",items:[["chicken",120],["broccoli",100]]},
    {id:"m6",meal:"Snacks",name:"Protein shake",items:[["whey",1]]},
    DINNER
  ]
};
function planItem([k,q]){const F=PF[k], r=q/F.per;
  const label = F.unit==="g" ? `${F.name}, ${q} g` : F.unit ? `${F.name}, ${q} ${F.unit}${q>1?"s":""}` : (q>1?`${F.name} × ${q}`:F.name);
  return {name:label,kcal:Math.round(F.kcal*r),p:Math.round(F.p*r*10)/10,c:Math.round(F.c*r*10)/10,f:Math.round(F.f*r*10)/10}}
function planMeals(d){const ses=sessionOf(d);return (ses==="mobility"?PLAN.rest:ses==="long"?[...PLAN.train,LONG_FUEL]:PLAN.train).map(m=>{const items=m.items.map(planItem);const t=m.flex?{...DINNER_SIZES.reg}:items.reduce((a,x)=>({kcal:a.kcal+x.kcal,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f}),{kcal:0,p:0,c:0,f:0});return {...m,list:items,t}})}
function planLogged(d,id){return d.foods.some(x=>x.plan===id||(id===DINNER.id&&x.meal==="Dinner"))}
function nextPlanMeal(d){return planMeals(d).find(m=>!planLogged(d,m.id))}

/* ---------- game rules ---------- */
const STATS = {
  str:{name:"Strength", c:"--str", from:"Workouts and PRs"},
  fuel:{name:"Fuel", c:"--fuel", from:"Protein and calories"},
  dis:{name:"Discipline", c:"--dis", from:"Stack and check-ins"},
  vit:{name:"Vitality", c:"--vit", from:"Water, sleep, mobility"},
  end:{name:"Endurance", c:"--end", from:"Runs and distance PRs"}
};
const TITLES = [[1,"Novice"],[3,"Apprentice"],[6,"Lifter"],[10,"Iron Initiate"],[15,"Athlete"],[20,"Iron Disciple"],[30,"Elite"],[45,"Legend"]];
const PERFECT_BONUS = 50, PR_XP = 50, FREEZE_EVERY = 7, FREEZE_MAX = 2;
const ACH = [
  {id:"first", name:"First Rep", desc:"Finish your first lift session", val:G=>G.lifts, goal:1, c:"--str"},
  {id:"miles", name:"First Miles", desc:"Log your first run", val:G=>G.runs, goal:1, c:"--end"},
  {id:"hybrid", name:"Hybrid Week", desc:"3 runs and 3 lifts in one week", val:G=>G.hybrid, goal:1, c:"--end"},
  {id:"long", name:"Long Hauler", desc:"Run 60+ minutes in one go", val:G=>G.longMin, goal:60, c:"--end"},
  {id:"flaw", name:"Flawless", desc:"Finish every quest in one day", val:G=>G.perfect, goal:1, c:"--vit"},
  {id:"wk", name:"Week Warrior", desc:"Reach a 7-day streak", val:G=>G.best, goal:7, c:"--flame"},
  {id:"pro", name:"Protein Machine", desc:"Hit protein on 20 days", val:G=>G.counts.protein, goal:20, c:"--fuel"},
  {id:"pr", name:"PR Hunter", desc:"Set 10 personal records", val:G=>G.prs, goal:10, c:"--str"},
  {id:"stk", name:"Stack Loyal", desc:"Take your full stack on 14 days", val:G=>G.counts.supps, goal:14, c:"--dis"},
  {id:"h2o", name:"Hydrated", desc:"Hit your water goal on 21 days", val:G=>G.counts.water, goal:21, c:"--frost"},
  {id:"mo", name:"Iron Month", desc:"Reach a 30-day streak", val:G=>G.best, goal:30, c:"--flame"},
  {id:"boss", name:"Colossus Slayer", desc:"Defeat the weekly boss", val:G=>G.bosses, goal:1, c:"--accent"}
];
const ITEMS = [
  {id:"tee", slot:"outfit", name:"Novice tee", how:"Starter", ok:()=>true},
  {id:"tank", slot:"outfit", name:"Warrior tank", how:"Reach level 3", ok:(G,L)=>L>=3},
  {id:"runner", slot:"outfit", name:"Speed Runner kit", how:"Log 10 runs", ok:G=>G.runs>=10},
  {id:"hoodie", slot:"outfit", name:"Hoodie", how:"Reach a 7-day streak", ok:G=>G.best>=7},
  {id:"stringer", slot:"outfit", name:"Stringer", how:"Reach level 15", ok:(G,L)=>L>=15},
  {id:"singlet", slot:"outfit", name:"Meet singlet", how:"Reach a 30-day streak", ok:G=>G.best>=30},
  {id:"none", slot:"head", name:"Nothing", how:"Starter", ok:()=>true},
  {id:"band", slot:"head", name:"Sweatband", how:"Set your first PR", ok:G=>G.prs>=1},
  {id:"cap", slot:"head", name:"Backwards cap", how:"Reach level 8", ok:(G,L)=>L>=8},
  {id:"phones", slot:"head", name:"Headphones", how:"Finish every quest in one day", ok:G=>G.perfect>=1},
  {id:"crown", slot:"head", name:"Crown", how:"Clear 90 days", ok:G=>G.cleared>=90},
  {id:"nogear", slot:"gear", name:"Nothing", how:"Starter", ok:()=>true},
  {id:"wraps", slot:"gear", name:"Wrist wraps", how:"Log 50 working sets", ok:G=>G.sets>=50},
  {id:"shaker", slot:"gear", name:"Shaker bottle", how:"Hit protein on 20 days", ok:G=>G.counts.protein>=20},
  {id:"belt", slot:"gear", name:"Lifting belt", how:"Set 10 PRs", ok:G=>G.prs>=10},
  {id:"quest", slot:"scene", name:"Quest room", how:"Starter", ok:()=>true},
  {id:"gym", slot:"scene", name:"Big-box gym", how:"Reach level 5", ok:(G,L)=>L>=5},
  {id:"roof", slot:"scene", name:"Rooftop at sunset", how:"Reach level 12", ok:(G,L)=>L>=12},
  {id:"beach", slot:"scene", name:"Beach", how:"Reach level 20", ok:(G,L)=>L>=20},
  {id:"stage", slot:"scene", name:"Competition stage", how:"Log a body fat at or below your goal", ok:G=>G.bfLogged!=null&&G.bfLogged<=(S.profile.goalBf||15)}
];

const S = {profile:{...DEFAULT_PROFILE}, days:{}, date:keyOf(new Date()), tab:"quests", ward:"outfit", ready:false, readOnly:false};

/* ---------- helpers ---------- */
function pad(v){return String(v).padStart(2,"0")}
function keyOf(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function dateOf(k){const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d)}
function shift(k,v){const d=dateOf(k);d.setDate(d.getDate()+v);return keyOf(d)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function uid(){return Math.random().toString(36).slice(2,10)}
function n(v){const x=parseFloat(v);return isFinite(x)?x:0}
function fmt(v,d=0){return Number(v).toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:0})}
function U(){return S.profile.unit==="kg"?"kg":"lb"}
function LU(){return S.profile.unit==="kg"?"cm":"in"}
function DU(){return S.profile.unit==="kg"?"km":"mi"}
function toKm(v){return DU()==="mi"?v*1.609344:v}
function fromKm(km){return DU()==="mi"?km/1.609344:km}
function paceStr(min,km){if(!km||!min) return "–";const p=min/fromKm(km), m=Math.floor(p), sec=Math.round((p-m)*60);return `${sec===60?m+1:m}:${pad(sec===60?0:sec)}`}
function toKg(v){return U()==="lb"?v*LB:v}
function fromKg(kg){return U()==="lb"?kg/LB:kg}
function toCm(v){return LU()==="in"?v*CM_IN:v}
function fromCm(cm){return LU()==="in"?cm/CM_IN:cm}
function w1(kg){return Math.round(fromKg(kg)*10)/10}
function e1rm(kg,reps){return reps<=1?kg:kg*(1+reps/30)}
function shortDate(k){return dateOf(k).toLocaleDateString(undefined,{month:"short",day:"numeric"})}
function getDay(k=S.date){const d=S.days[k]||{};return {neck:d.neck??null,bfSrc:d.bfSrc??null,date:k,foods:d.foods||[],lifts:d.lifts||[],runs:d.runs||[],weight:d.weight??null,supps:d.supps||{},water:d.water||0,sleep:d.sleep??null,steps:d.steps??null,rest:d.rest??null,session:d.session??null,mob:!!d.mob,waist:d.waist??null,bf:d.bf??null,photo:!!d.photo}}
function totals(d){const t={kcal:0,p:0,c:0,f:0};for(const x of d.foods){const q=x.qty||1;t.kcal+=x.kcal*q;t.p+=x.p*q;t.c+=x.c*q;t.f+=x.f*q}return t}
function sortedKeys(){return Object.keys(S.days).sort()}
function todayKey(){return keyOf(new Date())}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function avatar(){return {...DEFAULT_AVATAR,...(S.profile.avatar||{})}}

/* ---------- targets ---------- */
function scheduledSession(k){const W=S.profile.week||WEEK;return W[dateOf(k).getDay()]||"mobility"}
function sessionOf(d){if(d.session&&PROGRAM[d.session]) return d.session; if(d.rest===true) return "mobility"; return scheduledSession(d.date)}
function isTrainDay(d){return sessionOf(d)!=="mobility"}
function targets(d){const P=S.profile, ses=sessionOf(d), rest=ses==="mobility", long=ses==="long";
  const fuel=long?{kcal:325,c:82}:{kcal:0,c:0};
  return {kcal:(rest&&P.restKcal?P.restKcal:P.kcal)+fuel.kcal, protein:P.protein, carbs:(rest&&P.restCarbs!=null?P.restCarbs:P.carbs)+fuel.c, fat:rest&&P.restFat!=null?P.restFat:P.fat, rest, long, ses}}

/* ---------- quests and XP ---------- */
function hasAny(d){return d.foods.length||d.lifts.length||d.runs.length||d.mob||d.weight!=null||Object.values(d.supps).some(Boolean)||d.water>0||d.sleep!=null||d.steps!=null||d.waist!=null}
function quests(d){
  const P=S.profile, T=targets(d), t=totals(d), train=!T.rest, q=[];
  const sets=d.lifts.reduce((a,x)=>a+x.sets.length,0), ses=T.ses, Pg=PROGRAM[ses];
  if(Pg.kind==="lift"){const planned=Pg.ex.reduce((a,e)=>a+e.sets,0), need=Math.ceil(planned*0.6);
    q.push({id:"train",kind:"lift",stat:"str",xp:40,name:`Finish ${Pg.name}`,prog:`${sets} / ${planned} working sets${sets<need?` · ${need} clears it`:""}`,done:sets>=need,go:"training"})}
  else if(Pg.kind==="run"){const km=d.runs.reduce((a,r)=>a+(r.km||0),0), mn=d.runs.reduce((a,r)=>a+(r.min||0),0);
    q.push({id:"train",kind:"run",stat:"end",xp:40,name:`Finish your ${Pg.name.toLowerCase()}`,prog:d.runs.length?`${fmt(fromKm(km),2)} ${DU()} · ${fmt(mn)} min`:Pg.time,done:d.runs.length>0,go:"training"})}
  else q.push({id:"train",kind:"rest",stat:"vit",xp:20,name:"Mobility and recovery",prog:d.mob?"Done":Pg.time+" of mobility",done:d.mob,go:"training"});
  q.push({id:"protein",stat:"fuel",xp:30,name:"Hit your protein",prog:`${fmt(t.p)} / ${fmt(T.protein)} g`,done:T.protein>0&&t.p>=T.protein*0.95,go:"food"});
  const tol=Math.max(T.kcal*0.1,220), lo=Math.round(T.kcal-tol), hi=Math.round(T.kcal+tol);
  q.push({id:"kcal",stat:"fuel",xp:25,name:"Land your calories",prog:d.foods.length?`${fmt(t.kcal)} kcal · aim ${fmt(lo)}–${fmt(hi)}`:`Aim for ${fmt(lo)}–${fmt(hi)} kcal`,done:d.foods.length>0&&t.kcal>=lo&&t.kcal<=hi,go:"food"});
  const req=(P.stack||[]).filter(s=>train||s.slot!=="Pre-gym");
  if(req.length){const taken=req.filter(s=>d.supps[s.id]).length; q.push({id:"supps",stat:"dis",xp:20,name:"Take your stack",prog:`${taken} / ${req.length} taken`,done:taken===req.length});}
  q.push({id:"water",stat:"vit",xp:15,name:"Drink your water",prog:`${fmt(d.water)} / ${fmt(P.waterGoal)} oz`,done:d.water>=P.waterGoal});
  q.push({id:"sleep",stat:"vit",xp:20,name:`Sleep ${fmt(P.sleepGoal,2)}+ hours`,prog:d.sleep!=null?`${fmt(d.sleep,2)} h logged`:"Log last night's sleep",done:d.sleep!=null&&d.sleep>=P.sleepGoal});
  q.push({id:"steps",stat:"vit",xp:15,name:"Hit your steps",prog:`${fmt(d.steps||0)} / ${fmt(P.stepGoal)}`,done:(d.steps||0)>=P.stepGoal});
  q.push({id:"weigh",stat:"dis",xp:10,name:"Weigh in",prog:d.weight!=null?`${w1(d.weight)} ${U()}`:"Morning weigh-in",done:d.weight!=null,go:"progress"});
  if(dateOf(d.date).getDay()===0||d.waist!=null) q.push({id:"check",stat:"dis",xp:25,bonus:true,name:"Weekly check-in",prog:d.waist!=null?`Waist ${fmt(fromCm(d.waist),2)} ${LU()}`:"Waist, body fat and photos",done:d.waist!=null,go:"progress"});
  const core=q.filter(x=>!x.bonus), done=core.filter(x=>x.done).length, need=Math.ceil(core.length*0.75);
  return {q,core,done,need,cleared:done>=need,perfect:done===core.length};
}
function levelOf(xp){let L=1,need=150;while(xp>=need){xp-=need;L++;need=150+50*(L-1)}return {L,into:xp,need}}
function titleOf(L){let t=TITLES[0][1];for(const [l,name] of TITLES) if(L>=l) t=name;return t}
function statLevel(xp){const L=Math.floor(Math.sqrt(xp/40))+1;const lo=40*(L-1)*(L-1),hi=40*L*L;return {L,pct:(xp-lo)/(hi-lo)*100}}
function game(){
  const today=todayKey();
  const G={xp:0,stat:{str:0,fuel:0,dis:0,vit:0,end:0},streak:0,best:0,freezes:0,days:{},prs:0,runPrs:0,perfect:0,cleared:0,sets:0,bfLogged:null,bosses:0,weekHits:0,lifts:0,runs:0,longMin:0,longestKm:0,hybrid:0,km:0,counts:{train:0,protein:0,supps:0,water:0,steps:0}};
  const keys=sortedKeys().filter(k=>k<=today&&hasAny(getDay(k)));
  if(!keys.length) return G;
  const best={}, hits={}, curWeek=weekOf(today), wl={}, wr={}, hyb={};
  for(let k=keys[0];k<=today;k=shift(k,1)){
    const d=getDay(k), r=quests(d); let xp=0; const doneIds=[];
    for(const x of r.q) if(x.done){G.stat[x.stat]+=x.xp;xp+=x.xp;doneIds.push(x.id);if(x.id in G.counts)G.counts[x.id]++}
    let pr=0;
    for(const ex of d.lifts){G.sets+=ex.sets.length;const key=ex.name.trim().toLowerCase();let top=0;for(const s of ex.sets) if(s.kg) top=Math.max(top,e1rm(s.kg,s.reps));if(!top) continue;if(best[key]!=null&&top>best[key]+1e-6) pr++;best[key]=Math.max(best[key]||0,top)}
    if(pr){G.prs+=pr;G.stat.str+=PR_XP*pr;xp+=PR_XP*pr}
    let rpr=0;
    for(const rn of d.runs){G.runs++;G.km+=rn.km||0;G.longMin=Math.max(G.longMin,rn.min||0); if(G.longestKm>0&&(rn.km||0)>G.longestKm+1e-6) rpr++; G.longestKm=Math.max(G.longestKm,rn.km||0)}
    if(rpr){G.runPrs+=rpr;G.stat.end+=PR_XP;xp+=PR_XP}
    const tq=r.q.find(x=>x.id==="train"), wk0=weekOf(k);
    if(tq&&tq.done&&tq.kind==="lift"){G.lifts++;wl[wk0]=(wl[wk0]||0)+1}
    if(d.runs.length) wr[wk0]=(wr[wk0]||0)+1;
    if(!hyb[wk0]&&(wl[wk0]||0)>=3&&(wr[wk0]||0)>=3){hyb[wk0]=1;G.hybrid++}
    if(r.perfect){xp+=PERFECT_BONUS;G.perfect++}
    if(d.bf!=null) G.bfLogged=d.bf;
    G.xp+=xp;
    let status;
    if(r.cleared){G.streak++;G.cleared++;G.best=Math.max(G.best,G.streak);if(G.streak%FREEZE_EVERY===0&&G.freezes<FREEZE_MAX)G.freezes++;status=r.perfect?"perfect":"cleared"}
    else if(k===today) status="open";
    else if(G.freezes>0){G.freezes--;status="frozen"}
    else {G.streak=0;status="missed"}
    const wk=weekOf(k), h0=hits[wk]||0, h1=h0+(r.perfect?2:r.cleared?1:0); hits[wk]=h1;
    let boss=false; if(h0<BOSS_HP&&h1>=BOSS_HP){G.bosses++;G.xp+=BOSS_XP;xp+=BOSS_XP;boss=true}
    G.days[k]={status,xp,done:r.done,total:r.core.length,pr,rpr,doneIds,boss};
  }
  G.weekHits=hits[curWeek]||0; G.weekLifts=wl[curWeek]||0; G.weekRuns=wr[curWeek]||0;
  return G;
}
function weekOf(k){const d=dateOf(k), dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow); return keyOf(d)}
function unlockedIds(G){const L=levelOf(G.xp).L;return new Set(ITEMS.filter(it=>it.ok(G,L)).map(it=>it.id))}
function latestBf(){const k=sortedKeys().reverse().find(k=>S.days[k].bf!=null);return k?S.days[k].bf:(S.profile.startBf??29)}
/* U.S. Navy circumference method (men), all inputs in cm. Typically within about ±3–4 percentage points of DEXA. */
function navyBf(waistCm,neckCm,heightCm){const dlt=waistCm-neckCm; if(!(dlt>0)||!heightCm) return null; const v=495/(1.0324-0.19077*Math.log10(dlt)+0.15456*Math.log10(heightCm))-450; return isFinite(v)?Math.round(v*10)/10:null}
function latestOf(f){const k=sortedKeys().reverse().find(k=>S.days[k][f]!=null);return k?S.days[k][f]:null}
function latestWeight(){const k=sortedKeys().reverse().find(k=>S.days[k].weight!=null);return k?S.days[k].weight:null}

/* ---------- mood ---------- */
function vitals(){
  const k=todayKey(), d=getDay(k), T=targets(d), t=totals(d), P=S.profile, now=new Date(), h=now.getHours()+now.getMinutes()/60;
  const exp=Math.min(1,Math.max(0.15,(h-7)/14));
  const fuel=T.protein?Math.min(1,(t.p/T.protein)/exp):0;
  const hyd=P.waterGoal?Math.min(1,(d.water/P.waterGoal)/exp):0;
  let energy=d.sleep==null?0.7:Math.min(1,d.sleep/(P.sleepGoal||7));
  if(h>=23||h<5) energy=Math.min(energy,0.3);
  const r=quests(d);
  let mood="content";
  if(h>=23||h<5) mood="late";
  else if(energy<0.6) mood="sleepy";
  else if(fuel<0.5&&h>=10) mood="hungry";
  else if(hyd<0.5&&h>=12) mood="thirsty";
  else if(r.perfect) mood="ecstatic";
  else if(r.cleared) mood="happy";
  else if(d.lifts.some(x=>x.sets.length)||d.runs.length) mood="pumped";
  return {d,t,T,h,fuel,hyd,energy,mood,r};
}
const MOOD_LABEL={late:"Sleepy",sleepy:"Tired",hungry:"Hungry",thirsty:"Thirsty",ecstatic:"Ecstatic",happy:"Happy",pumped:"Pumped",content:"Ready"};
let VS=null;
function moodLine(v){
  const A=avatar(), nm=nextPlanMeal(v.d), P=S.profile;
  const greet=v.h<12?"Morning":v.h<17?"Afternoon":"Evening";
  switch(v.mood){
    case "late": return `It's late. Sleep is a quest too: ${fmt(P.sleepGoal,2)} hours earns Vitality XP. See you in the morning.`;
    case "sleepy": return `Only ${fmt(v.d.sleep,2)} h of sleep. Train smart today and aim for an earlier night.`;
    case "hungry": return nm?`I'm running on empty. ${nm.name} is next: ${fmt(nm.t.p)} g protein.`:`I'm running on empty. Log a meal?`;
    case "thirsty": return `Water check: ${fmt(v.d.water)} / ${fmt(P.waterGoal)} oz. Grab 16 oz?`;
    case "ecstatic": return `Every quest done today. That's how it's done.`;
    case "happy": return `Day cleared. ${v.r.core.length-v.r.done} more for a perfect day.`;
    case "pumped": return `Session's in. Now eat and recover.`;
    default: return `${greet}! ${pepLine(v)}`;
  }
}
function pepLine(v){
  v=v||vitals(); const d=v.d, r=v.r, P=S.profile, open=r.core.filter(x=>!x.done);
  if(!open.length) return pick(["Nothing left on the board today. Rest up.","All quests done. Proud of you.","Clean sweep today. Same again tomorrow."]);
  const x=open[0];
  if(x.id==="train"){const Pg=PROGRAM[sessionOf(d)];
    if(Pg.kind==="lift") return `${Pg.name} is still open. Start with ${Pg.ex[0].n.toLowerCase()}, ${Pg.ex[0].sets}×${Pg.ex[0].lo}${Pg.ex[0].hi>Pg.ex[0].lo?"–"+Pg.ex[0].hi:""}, and leave 1–2 reps in reserve.`;
    if(Pg.kind==="run") return `Your ${Pg.name.toLowerCase()} is still open. ${Pg.time}.${sessionOf(d)==="easy"?" Keep it conversational.":""}`;
    return `Mobility's still open. 15 minutes is enough. Recovery is training too.`}
  if(x.id==="protein"){const left=Math.max(0,v.T.protein-v.t.p), nm=nextPlanMeal(d); return `${fmt(left)} g protein to go.${nm?` ${nm.name} covers ${fmt(nm.t.p)} g.`:""}`}
  if(x.id==="kcal") return v.t.kcal<v.T.kcal*0.9?`${fmt(v.T.kcal-v.t.kcal)} kcal left. Stick to the plan.`:`Over on calories today. No need to make up for it tomorrow, just get back on plan.`;
  if(x.id==="supps"){const left=(P.stack||[]).filter(s=>(isTrainDay(d)||s.slot!=="Pre-gym")&&!d.supps[s.id]).map(s=>s.name);return `Still to take: ${left.slice(0,3).join(", ")}${left.length>3?"…":""}.`}
  if(x.id==="water") return `${fmt(Math.max(0,P.waterGoal-d.water))} oz of water left today.`;
  if(x.id==="sleep") return `Log last night's sleep in Recovery.`;
  if(x.id==="steps") return `Steps are still open. A 20-minute walk is about 2,000.`;
  if(x.id==="weigh") return `Weigh-in's open. Best right after you wake up.`;
  return `Let's keep going.`;
}

/* ---------- character engine ---------- */
let tick=0, lastStep=0, nextBlink=0, blinkUntil=0, act=null, particles=[], speechQ=[], speechT=null, typeT=null, greeted=false, speaking=null;
const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function heroState(now){
  const A=avatar(), G=GS, v=VS||(VS=vitals()), u=unlockedIds(G);
  const sl=statLevel(G.stat.str).L, m=Math.min(4,Math.floor((sl-1)/2));
  const bf=latestBf(), f=bf>=27?4:bf>=23?3:bf>=19?2:bf>=15?1:0;
  let pose="idle", expr="smile", sweat=false;
  const mood=v.mood;
  if(mood==="late"||mood==="sleepy"){pose="sleepy";expr="sleepy"}
  else if(mood==="hungry"){pose="sad";expr="frown"}
  else if(mood==="thirsty"){expr="frown";sweat=true}
  else if(mood==="ecstatic"){expr="excited"; if(tick%12<2) pose="cheer"}
  else if(mood==="pumped"){expr="happy"; if(tick%14<2) pose="flex"}
  else if(mood==="happy") expr="happy";
  if(act&&now<act.until&&!act.speaker){pose=act.pose;expr=act.expr||"happy";sweat=act.pose==="lift"}
  else if(act&&now<act.until&&act.heroPose){pose=act.heroPose;expr=act.heroExpr||"happy"}
  const eq=(id,def)=>u.has(id)?id:def;
  return {m,f,pose,frame:RM?0:tick,blink:now<blinkUntil,expr,sweat,skin:A.skin,hair:A.hair,style:A.style,
    outfit:eq(A.outfit,"tee"),head:eq(A.head,"none"),gear:eq(A.gear,"nogear"),scene:eq(A.scene,"quest")};
}
/* today's challenger: goblin on training days (workout quest), treadmill shadow on rest days (steps quest) */
function challenger(){
  const d=getDay(todayKey()), r=quests(d), Pg=PROGRAM[sessionOf(d)], q=r.q.find(x=>x.id==="train");
  if(Pg.kind==="lift") return {id:"goblin",name:"Heavy Dumbbell Goblin",ko:!!(q&&q.done)};
  if(Pg.kind==="run") return {id:"shadow",name:"The Treadmill Shadow",ko:!!(q&&q.done)};
  return {id:"none",name:"Rest day",ko:true};
}
const sceneCv=$("#scene"), sceneX=sceneCv.getContext("2d"), dockCv=$("#dockCv"), dockX=dockCv.getContext("2d"), bossX=$("#bossCv").getContext("2d");
sceneX.imageSmoothingEnabled=false; dockX.imageSmoothingEnabled=false; bossX.imageSmoothingEnabled=false;
let lastDraw=0;
function drawChar(now){
  if(!GS) return;
  const st=heroState(now), live=act&&now<act.until;
  if(S.tab==="quests"){
    drawScene(sceneX,st.scene);
    const foe=challenger(), ally=live&&act.speaker?act.speaker:null;
    // challenger on the right
    if(foe.id==="goblin"){ sceneX.drawImage(drawGoblin(foe.ko,RM?0:tick),64,32); }
    else if(foe.id==="shadow"){ drawTreadmill(sceneX,62,59); if(!foe.ko){ const sh=drawSprite({m:2,f:1,pose:"idle",frame:RM?0:tick+1,expr:"angry",skin:1,hair:1,style:0,outfit:"tank",silhouette:true},"shadow"); sceneX.globalAlpha=.92; sceneX.drawImage(sh,58,11); sceneX.globalAlpha=1 } }
    // ally on the left while speaking
    if(ally){ groundShadow(sceneX,14); sceneX.drawImage(drawAlly(ally,act.pose||"idle",RM?0:tick,now<blinkUntil),-6,14) }
    groundShadow(sceneX,44); sceneX.drawImage(drawSprite(st,"hero"),24,14);
    for(const p of particles){sceneX.fillStyle=p.c;sceneX.fillRect(Math.round(p.x),Math.round(p.y),1,1)}
    if(now-lastDraw>400){lastDraw=now; const hp=Math.max(0,BOSS_HP-GS.weekHits); bossX.clearRect(0,0,64,48); bossX.drawImage(drawColossus(hp,BOSS_HP,RM?0:tick),0,0)}
  } else {
    dockX.fillStyle="#1F2233"; dockX.fillRect(0,0,32,30); dockX.fillStyle="#3A3F55"; dockX.fillRect(0,26,32,4);
    dockX.drawImage(drawSprite(st,"hero"),4,0,32,30,0,0,32,30);
  }
}
function loop(now){
  requestAnimationFrame(loop);
  if(document.hidden) return;
  if(!RM&&now-lastStep>450){tick++;lastStep=now}
  if(now>nextBlink){blinkUntil=now+150;nextBlink=now+2600+Math.random()*3200}
  if(particles.length){for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.life--} particles=particles.filter(p=>p.life>0&&p.y<64)}
  drawChar(now);
}
function burst(){ if(RM) return; const cols=["#C42F39","#2350C8","#E8B33C","#1D7F51","#FFFFFF","#FFD866"];
  for(let i=0;i<36;i++) particles.push({x:42+Math.random()*8,y:16+Math.random()*6,vx:(Math.random()-.5)*1.8,vy:-1.2-Math.random()*1.4,c:pick(cols),life:70+Math.random()*30}) }
function heroName(){return avatar().name}
/* o.low: ambient lines (greetings) that any new event can cut off; o.now: user taps, which cut off everything */
function say(text,o={}){
  speechQ = o.now? [] : speechQ.filter(s=>!s.low);
  if(o.now||(speaking&&speaking.low)){clearTimeout(speechT);speechT=null}
  speechQ.push({text,...o}); if(speechQ.length>4) speechQ.splice(0,speechQ.length-4);
  if(!speechT) nextSpeech();
}
function typeInto(el,text){
  clearInterval(typeT); if(RM){el.textContent=text;return}
  let i=0; el.textContent=""; typeT=setInterval(()=>{i+=2; el.textContent=text.slice(0,i); if(i>=text.length) clearInterval(typeT)},18);
}
function setDialog(speaker,text,typed){
  const who=$("#dlgWho"); who.textContent=(speaker?SPEAKERS[speaker]:heroName()).toUpperCase(); who.className="who pix "+(speaker||"");
  if(typed) typeInto($("#dlgText"),text); else {clearInterval(typeT); $("#dlgText").textContent=text}
}
function idleDialog(){ if(speechT) return; const v=VS||vitals(); setDialog(v.mood==="late"||v.mood==="sleepy"?null:"coach", moodLine(v), false) }
function nextSpeech(){
  const s=speechQ.shift(); speaking=s||null;
  if(!s){speechT=null; $("#dockBubble").hidden=true; if(S.tab==="quests") idleDialog(); return}
  const onStage=S.tab==="quests", sp=s.speaker||null;
  if(onStage){ setDialog(sp,s.text,true); $("#dockBubble").hidden=true }
  else { const el=$("#dockBubble"); el.innerHTML=`<b>${esc(sp?SPEAKERS[sp]:heroName())}</b>${esc(s.text)}`; el.hidden=false; el.style.animation="none"; void el.offsetWidth; el.style.animation=""; const dk=$("#dock");dk.classList.remove("bounce");void dk.offsetWidth;dk.classList.add("bounce") }
  act={pose:s.pose||(sp?"idle":"wave"),expr:s.expr,speaker:sp,heroPose:s.heroPose,heroExpr:s.heroExpr,until:performance.now()+Math.max(2600,Math.min(6000,s.text.length*55))};
  if(s.celebrate) burst();
  if(s.xp&&onStage){const f=$("#xpFloat");f.textContent=`+${s.xp} XP`;f.hidden=false;f.style.animation="none";void f.offsetWidth;f.style.animation="";setTimeout(()=>{f.hidden=true},1400)}
  speechT=setTimeout(nextSpeech, Math.max(2800, Math.min(6500, s.text.length*60)));
}
function interact(kind){
  const v=VS=vitals(), G=GS, sl=statLevel(G.stat.str).L;
  if(kind==="high") say(pick([`Up top! ${v.r.done} of ${v.r.core.length} quests done.`, "Nice one!", `${GS.streak}-day streak. Keep it rolling.`]),{pose:"highfive",expr:"excited",now:true});
  else if(kind==="flex") say(pick([`Strength level ${sl}. Built on ${fmt(G.sets)} working sets.`, `${GS.prs} PRs so far. More coming.`, `Fuel level ${statLevel(G.stat.fuel).L}. The protein is paying off.`]),{pose:"flex",expr:"happy",now:true});
  else if(kind==="pep") say(pepLine(v),{speaker:"coach",pose:"point",heroPose:"idle",heroExpr:"smile",now:true});
  else say(pick(["Hey! That tickles.","Ready when you are.","What are we hitting today?"]),{pose:"wave",expr:"excited",now:true});
}
let tapCycle=0;
function eventLine(evt,k){
  const d=getDay(k), T=targets(d), t=totals(d), P=S.profile;
  if(evt.type==="food"){const it=evt.item, left=T.protein-t.p, kl=T.kcal-t.kcal;
    return {speaker:"buddy",pose:"wave",heroPose:"eat",heroExpr:"chew",text: it.p>=20? `${it.name}: +${fmt(it.p)} g protein. ${left>0?`${fmt(left)} g to go.`:"Protein target hit!"}` : `Logged ${it.name}. ${kl>=0?fmt(kl)+" kcal left.":fmt(-kl)+" kcal over."}`}}
  if(evt.type==="dinner"){const z=DINNER_SIZES[evt.size], left=Math.round(T.protein-t.p), kl=Math.round(T.kcal-t.kcal);
    return {speaker:"buddy",pose:"wave",heroPose:"eat",heroExpr:"chew",text:`Mom's cooking, ${z.label.toLowerCase()}: about ${z.kcal} kcal. ${left>10?`${left} g protein to go. A Greek yogurt or a shake closes it.`:"Protein's covered."}${kl<-150?" A little over today, that's fine.":""}`}}
  if(evt.type==="plan"){const nx=nextPlanMeal(d);return {speaker:"buddy",pose:"wave",heroPose:"eat",heroExpr:"chew",text:`${evt.name} logged. ${nx?`Next up: ${nx.name}.`:"That's the whole plan for today."}`}}
  if(evt.type==="set") return {speaker:"coach",pose:"point",heroPose:"lift",heroExpr:"strain",text:`${evt.ex}: ${evt.w>0?`${fmt(evt.w,1)} ${U()} × `:""}${evt.reps}. ${pick(["Good set.","Control the negative.","Again.","That's how we do it."])}`};
  if(evt.type==="water") return evt.amt>0?{speaker:"buddy",pose:"drink",heroPose:"drink",heroExpr:"smile",text:`Hydration check: ${fmt(d.water)} / ${fmt(P.waterGoal)} oz.`}:null;
  if(evt.type==="supp"){ if(!evt.on) return null; const req=(P.stack||[]).filter(s=>isTrainDay(d)||s.slot!=="Pre-gym"); const all=req.every(s=>d.supps[s.id]); return {speaker:"buddy",pose:"wave",heroPose:"drink",text:all?"Full stack taken. Nice.":`${evt.name}, check.`}}
  if(evt.type==="weigh"){const a=avgWeight(k);return {speaker:"coach",pose:"point",text:`Weigh-in logged.${a?` 7-day average: ${fmt(fromKg(a),1)} ${U()}. The average is what counts.`:""}`}}
  if(evt.type==="sleep") return d.sleep>=P.sleepGoal?{speaker:"buddy",pose:"wave",heroPose:"flex",text:`${fmt(d.sleep,2)} h of sleep. Fully charged.`}:{speaker:"buddy",pose:"idle",heroPose:"sleepy",heroExpr:"sleepy",text:`${fmt(d.sleep,2)} h. Take it easy and aim for an earlier night.`};
  if(evt.type==="steps") return {speaker:"cardio",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`${fmt(d.steps)} steps! Keep those legs moving.`};
  if(evt.type==="check") return {speaker:"coach",pose:"point",heroPose:"flex",text:`Check-in saved. ${evt.msg||"Same time next week."}`};
  if(evt.type==="session"){const Pg=PROGRAM[sessionOf(d)];return Pg.kind==="lift"?{speaker:"coach",pose:"point",heroPose:"flex",text:`Switched to ${Pg.name}. The goblin's waiting.`}:Pg.kind==="run"?{speaker:"cardio",pose:"flex",text:`Switched to ${Pg.name}. Let's go!`}:{speaker:"buddy",pose:"wave",text:"Recovery day it is. Mobility, an easy walk, and sleep."}}
  if(evt.type==="run"){const dist=fromKm(evt.km);return {speaker:"cardio",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`${fmt(dist,2)} ${DU()} in ${fmt(evt.min)} min: ${paceStr(evt.min,evt.km)} per ${DU()}. ${evt.rtype==="easy"?"Easy is the point. Nice.":evt.rtype==="long"?"Big engine day.":"Fast feet!"}`}}
  if(evt.type==="load"){const Pg=PROGRAM[sessionOf(d)], e=Pg.ex[0];return {speaker:"coach",pose:"point",heroPose:"flex",text:`${Pg.name} loaded. First up: ${e.n.toLowerCase()}, ${e.sets}×${e.lo}${e.hi>e.lo?"–"+e.hi:""}. Leave 1–2 in the tank.`}}
  if(evt.type==="mob") return {speaker:"buddy",pose:"wave",heroPose:"flex",text:"Mobility done. Your joints say thanks."};
  return null;
}
function react(prev,cur,k,evt){
  const a=prev.days[k]||{doneIds:[],pr:0,status:"none"}, b=cur.days[k]||{doneIds:[],pr:0,status:"none"}, msgs=[];
  const line=evt?eventLine(evt,k):null;
  if(b.pr>a.pr) msgs.push({speaker:"coach",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`New PR${evt&&evt.ex?` on ${evt.ex}`:""}! +${PR_XP} XP`,celebrate:true,xp:PR_XP});
  else if(line) msgs.push({...line,low:true});
  const newQ=b.doneIds.filter(id=>!a.doneIds.includes(id)), isToday=k===todayKey(), train=isTrainDay(getDay(k));
  if(newQ.length){const qs=quests(getDay(k)).q.filter(x=>newQ.includes(x.id)), xp=qs.reduce((s,x)=>s+x.xp,0);
    const tq=qs.find(x=>x.id==="train");
    if(isToday&&tq){
      if(tq.kind==="lift") msgs.push({speaker:"coach",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`${PROGRAM[sessionOf(getDay(k))].name} done. The Heavy Dumbbell Goblin is down! +40 XP`,celebrate:true,xp:40});
      else if(tq.kind==="run") msgs.push({speaker:"cardio",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`Run's in. You outran the Treadmill Shadow! +40 XP`,celebrate:true,xp:40});
      else msgs.push({speaker:"buddy",pose:"wave",heroPose:"flex",text:`Recovery logged. This is where the gains show up. +20 XP`,xp:20});
    }
    const rest=qs.filter(x=>!(isToday&&x.id==="train"));
    if(rest.length) msgs.push({pose:line?"idle":"highfive",expr:"happy",heroPose:"highfive",text:`Quest done: ${rest.map(x=>x.name).join(", ")}. +${rest.reduce((s,x)=>s+x.xp,0)} XP`,xp:rest.reduce((s,x)=>s+x.xp,0)})}
  if(b.status==="perfect"&&a.status!=="perfect") msgs.push({speaker:"coach",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`Perfect day! Every quest done. +${PERFECT_BONUS} XP`,celebrate:true});
  else if(b.status==="cleared"&&a.status!=="cleared"&&a.status!=="perfect") msgs.push({pose:"cheer",expr:"excited",text:`Day cleared! That's a hit on the Iron Colossus. Streak: ${cur.streak}.`});
  if((b.rpr||0)>(a.rpr||0)) msgs.push({speaker:"cardio",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`New distance PR! +${PR_XP} XP`,celebrate:true,xp:PR_XP});
  if(cur.hybrid>prev.hybrid) msgs.push({speaker:"coach",pose:"cheer",heroPose:"flex",heroExpr:"excited",text:`Hybrid week complete: 3 runs and 3 lifts. That's the sweet spot.`,celebrate:true});
  if(cur.bosses>prev.bosses) msgs.push({speaker:"coach",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`Iron Colossus defeated! +${BOSS_XP} XP. It'll be back Monday.`,celebrate:true});
  if(cur.freezes>prev.freezes) msgs.push({pose:"flex",expr:"happy",text:`${FREEZE_EVERY} days straight. I earned a streak freeze.`});
  const L0=levelOf(prev.xp).L, L1=levelOf(cur.xp).L;
  if(L1>L0) msgs.push({speaker:"coach",pose:"cheer",heroPose:"cheer",heroExpr:"excited",text:`Level ${L1}! New title: ${titleOf(L1)}.`,celebrate:true});
  const u0=unlockedIds(prev), u1=unlockedIds(cur);
  for(const it of ITEMS) if(u1.has(it.id)&&!u0.has(it.id)) msgs.push({pose:"cheer",expr:"excited",text:`Unlocked: ${it.name}! It's in the Wardrobe.`,celebrate:true});
  msgs.forEach(m=>say(m.text,m));
}

/* ---------- storage: your account (db) or this browser ---------- */
const Store = {
  mode:null, col:null, chains:{},
  async init(){
    let db=null, user=null;
    if(window.claude && typeof window.claude.use==="function"){
      try{ [db,user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]); }catch(e){}
    }
    let id=null;
    if(db && user){ try{ id = await user.id(); }catch(e){} }
    if(db && id){
      this.mode="cloud"; this.col = db.collection("data/users/"+id);
      await this.subscribe();
      setStatus("Saved to your account. Only you can see this log.");
    } else {
      this.mode="local"; this.loadLocal();
      setStatus("Saved in this browser only.");
    }
  },
  subscribe(){
    return new Promise(res=>{
      let first=true;
      this.col.onSnapshot(snap=>{
        const days={}; let prof=null;
        for(const d of snap.docs){
          const b=d.data(); if(!b) continue;
          if(d.id==="profile") prof=JSON.parse(JSON.stringify(b));
          else if(d.id.startsWith("d-")) days[d.id.slice(2)]=JSON.parse(JSON.stringify(b));
        }
        S.days=days; if(prof) S.profile={...DEFAULT_PROFILE,...prof};
        if(first){first=false;res()} render();
      }, ()=>{ setStatus("Sync stopped. Reload the page to reconnect.","warn"); if(first){first=false;res()} });
    });
  },
  loadLocal(){
    try{ const raw=localStorage.getItem("liftfuel:v1"); if(raw){const o=JSON.parse(raw); S.days=o.days||{}; S.profile={...DEFAULT_PROFILE,...(o.profile||{})}} }catch(e){}
  },
  put(id, body){
    if(this.mode==="cloud"){
      const ref=this.col.doc(id);
      this.chains[id]=(this.chains[id]||Promise.resolve()).then(()=>ref.set(body)).catch(e=>{
        if(e && e.code==="invalid_argument"){S.readOnly=true;setStatus("This log is read-only for you. Changes are not saved.","warn")}
        else if(e && e.code==="quota_exceeded"){setStatus("Storage is full. Delete some old entries to keep logging.","warn")}
        else setStatus("Couldn't save the last change. Check your connection and try again.","warn");
      });
    } else {
      try{ localStorage.setItem("liftfuel:v1", JSON.stringify({profile:S.profile, days:S.days})); }
      catch(e){ setStatus("This browser blocked saving. Entries will be lost on reload.","warn") }
    }
  }
};
function setStatus(t,cls){const el=$("#saveState");el.textContent=t;el.className="status"+(cls?" "+cls:"")}
function saveDay(d,evt){
  if(!S.ready){setStatus("Still loading your log. Try again in a moment.","warn");return}
  const prev=GS;
  const rec={date:d.date,foods:d.foods,lifts:d.lifts,runs:d.runs,weight:d.weight,supps:d.supps,water:d.water,sleep:d.sleep,steps:d.steps,rest:d.rest,session:d.session,mob:d.mob,waist:d.waist,neck:d.neck,bf:d.bf,bfSrc:d.bfSrc,photo:d.photo};
  S.days[d.date]=rec; Store.put("d-"+d.date, rec); render(true);
  if(prev) react(prev,GS,d.date,evt);
}
function saveProfile(){ if(!S.ready) return; Store.put("profile", S.profile); render(true); }

/* ---------- icons ---------- */
const ICON_FLAME=`<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.6 1.8c.6 3.3-1.6 5-3 6.9C8.4 10.3 7.5 12 7.5 14a4.5 4.5 0 0 0 9 0c0-1.4-.5-2.6-1.2-3.6 1.9.7 3.7 2.8 3.7 5.6A7 7 0 0 1 5 16c0-4.6 3.3-7 5.2-9.6 1-1.4 1.8-2.9 2.4-4.6zM12 12.5c.9 1 1.8 2 1.8 3.2a1.8 1.8 0 0 1-3.6 0c0-1.2.9-2.2 1.8-3.2z"/></svg>`;
const ICON_FROST=`<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/></svg>`;
const ICON_CHECK=`<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const ICON_LOCK=`<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
function plate(c,size=40){return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="var(${c})" stroke-width="6"/><circle cx="20" cy="20" r="8" fill="none" stroke="var(${c})" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="var(${c})"/></svg>`}

/* ---------- render ---------- */
function $(s,r=document){return r.querySelector(s)}
let lastKey="", GS=null;
function render(force){
  const key=JSON.stringify([S.date,S.tab,S.ward,S.profile,S.days]);
  if(!force && key===lastKey) return; lastKey=key;
  GS=game(); VS=vitals();
  renderHeader(); renderSummary(); renderChip();
  $("#dock").hidden = S.tab==="quests";
  if(S.tab==="quests") renderQuests();
  if(S.tab==="food") renderFood();
  if(S.tab==="training") renderTraining();
  if(S.tab==="progress") renderProgress();
  if(S.tab==="goals") renderGameGoals();
}
function renderChip(){
  const lv=levelOf(GS.xp);
  $("#lvChip").innerHTML=`<b class="num">Lv ${lv.L}</b>${ICON_FLAME}<span class="num">${GS.streak}</span>`;
  $("#lvChip").setAttribute("aria-label",`Level ${lv.L}, ${GS.streak}-day streak. Open quests`);
}
function renderHeader(){
  const today=todayKey();
  const lbl = S.date===today?"Today":S.date===shift(today,-1)?"Yesterday":dateOf(S.date).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  $("#whenLabel").textContent=lbl;
  $("#dateInput").value=S.date;
  $("#nextDay").disabled = S.date>=today;
  $("#todayBtn").hidden = S.date===today;
}
function renderSummary(){
  const d=getDay(), t=totals(d), T=targets(d);
  $("#kcalLabel").textContent = `Calories · ${T.rest?"rest day":T.long?"long-run day":"training day"}`;
  $("#sumKcal").innerHTML=fmt(t.kcal)+"<small>/ "+fmt(T.kcal)+" kcal</small>";
  const pct=T.kcal?t.kcal/T.kcal*100:0;
  const bar=$("#kcalBar"); bar.classList.toggle("over",pct>100); bar.firstElementChild.style.width=Math.min(100,pct)+"%";
  const left=T.kcal-t.kcal;
  $("#kcalLeft").textContent = left>=0 ? fmt(left)+" kcal left" : fmt(-left)+" kcal over target";
  const rows=[["Protein","p","protein","--protein"],["Carbs","c","carbs","--carbs"],["Fat","f","fat","--fat"]];
  $("#sumMacros").innerHTML = rows.map(([name,k,g,c])=>{
    const goal=T[g]||0, v=t[k], w=goal?Math.min(100,v/goal*100):0;
    return `<div class="macro" style="--c:var(${c})"><b><span class="dot"></span>${name}</b><div class="bar"><i style="width:${w}%"></i></div><span class="num">${fmt(v)} / ${fmt(goal)} g</span></div>`;
  }).join("");
  const sets=d.lifts.reduce((a,x)=>a+x.sets.length,0);
  const vol=d.lifts.reduce((a,x)=>a+x.sets.reduce((b,s)=>b+fromKg(s.kg)*s.reps,0),0);
  const Pg=PROGRAM[T.ses];
  if(d.runs.length&&!d.lifts.length){const km=d.runs.reduce((a,r)=>a+(r.km||0),0), mn=d.runs.reduce((a,r)=>a+(r.min||0),0);
    $("#sumTrain").innerHTML=`<div><span class="v num">${fmt(fromKm(km),2)}</span><span class="label">${DU()}</span></div><div><span class="v num">${fmt(mn)}</span><span class="label">Minutes</span></div><div><span class="v num">${paceStr(mn,km)}</span><span class="label">Pace /${DU()}</span></div>`}
  else $("#sumTrain").innerHTML=`<div><span class="v num">${d.lifts.length}</span><span class="label">Exercises</span></div><div><span class="v num">${sets}</span><span class="label">Sets</span></div><div><span class="v num">${vol>=10000?fmt(vol/1000,1)+"k":fmt(vol)}</span><span class="label">Volume ${U()}</span></div>`;
  $("#trainNote").textContent = `${Pg.name} · ${Pg.time}${d.lifts.length?" · "+d.lifts.map(x=>x.name).join(", "):d.mob?" · done":""}`;
}
function renderQuests(){
  const G=GS, lv=levelOf(G.xp), P=S.profile, today=todayKey(), A=avatar(), v=VS;
  $("#nameBar").textContent=`${A.name} · Lv ${lv.L}`;
  const foe=challenger();
  const foeShort=foe.id==="goblin"?"Dumbbell Goblin":"Treadmill Shadow";
  $("#foeBar").hidden=false; $("#foeBar").textContent = foe.id==="none"? "Rest day" : foe.ko? `${foeShort}: KO` : `Vs. ${foeShort}`;
  // weekly boss
  const hp=Math.max(0,BOSS_HP-G.weekHits), wk=weekOf(today);
  $("#bossWeek").textContent=`Week of ${shortDate(wk)}`;
  $("#bossHp").innerHTML=[...Array(BOSS_HP)].map((_,i)=>`<i class="${i<hp?"":"gone"}"></i>`).join("");
  $("#bossTxt").textContent = hp<=0? `Defeated this week. +${BOSS_XP} XP earned. A new one shows up Monday.` : `Each cleared day lands a hit, and a perfect day lands two. ${hp} hit${hp===1?"":"s"} left for +${BOSS_XP} XP.`;
  $("#bossName").textContent = hp<=0? "Iron Colossus · KO" : "Iron Colossus";
  if(!speechT) idleDialog();
  const pct=lv.into/lv.need;
  const frz=[...Array(FREEZE_MAX)].map((_,i)=>`<span class="${i<G.freezes?"":"off"}">${ICON_FROST}</span>`).join("");
  const vit=[["Energy",v.energy,"--vit",v.d.sleep==null?"Log sleep":`${fmt(v.d.sleep,2)} h sleep`],["Fuel",v.fuel,"--fuel",`${fmt(v.t.p)} g protein`],["Hydration",v.hyd,"--frost",`${fmt(v.d.water)} oz`]];
  $("#who").innerHTML=`
    <span class="label">${esc(A.name)} · Level ${lv.L}</span>
    <h2>${esc(titleOf(lv.L))}</h2>
    <div class="xpbar" role="progressbar" aria-label="XP to next level" aria-valuemin="0" aria-valuemax="${lv.need}" aria-valuenow="${lv.into}"><i style="width:${(pct*100).toFixed(1)}%"></i></div>
    <span class="hint num">${fmt(lv.into)} / ${fmt(lv.need)} XP to level ${lv.L+1} · ${fmt(G.xp)} XP total</span>
    <div class="badges">
      <span class="pill flame">${ICON_FLAME}<span class="num">${G.streak}</span>-day streak</span>
      <span class="pill frost" title="Streak freezes cover one missed day each">${frz}<span>${G.freezes} freeze${G.freezes===1?"":"s"}</span></span>
      <span class="pill"><span class="muted">Best</span><span class="num">${G.best}</span></span>
    </div>
    <div class="vitals">
      <div class="mood"><span class="label">Mood</span><b>${MOOD_LABEL[v.mood]}</b></div>
      ${vit.map(([nm,val,c,sub])=>`<div class="vital" style="--c:var(${c})"><b>${nm}</b><div class="bar ${val<0.5?"low":""}"><i style="width:${Math.round(val*100)}%"></i></div><span class="num hint" style="text-align:right">${Math.round(val*100)}%</span></div>`).join("")}
      <span class="hint">Fuel and hydration are measured against where you should be by this time of day.</span>
    </div>`;
  $("#statGrid").innerHTML=Object.entries(STATS).map(([k,s])=>{const sl=statLevel(G.stat[k]);return `<div class="stat" style="--c:var(${s.c})"><div class="top2"><span class="nm">${s.name}</span><span class="sv num">${sl.L}</span></div><div class="bar"><i style="width:${sl.pct.toFixed(1)}%"></i></div><span class="hint">${s.from} · <span class="num">${fmt(G.stat[k])}</span> XP</span></div>`}).join("");
  renderWardrobe();
  // Quests
  const d=getDay(), r=quests(d), isToday=S.date===today;
  $("#questTitle").textContent = isToday?"Today's quests":`Quests for ${shortDate(S.date)}`;
  $("#questCount").textContent = `${r.done} / ${r.core.length} done`;
  $("#questMeter").innerHTML = r.core.map((_,i)=>`<i class="${i<r.done?"on":""} ${i===r.need-1?"need":""}"></i>`).join("");
  const info=G.days[S.date];
  $("#questRule").textContent = r.perfect? `Every quest done. +${PERFECT_BONUS} XP perfect-day bonus.` : r.cleared? `Day cleared. Your streak is safe. Finish all ${r.core.length} for a +${PERFECT_BONUS} XP bonus.` : (info&&info.status==="frozen")? `A streak freeze covered this day.` : (info&&info.status==="missed")? `This day broke the streak. Logging it now still earns XP.` : `Clear ${r.need} of ${r.core.length} to keep your streak. ${r.need-r.done} to go.`;
  $("#questList").innerHTML = r.q.map(x=>{
    const s=STATS[x.stat], tag=x.go?"button":"div";
    return `<${tag} ${x.go?`type="button" data-go="${x.go}"`:""} class="quest ${x.done?"done":""}" style="--c:var(${s.c})">
      <span class="check">${ICON_CHECK}</span>
      <span style="min-width:0"><span class="qn">${esc(x.name)}</span><br><span class="qp">${esc(x.prog)}</span></span>
      <span class="xp"><b>+${x.xp} XP</b><span class="tag">${x.bonus?"BONUS · ":""}${s.name.toUpperCase()}</span></span></${tag}>`;
  }).join("") + (info&&info.pr?`<div class="quest done" style="--c:var(--str)"><span class="check">${ICON_CHECK}</span><span><span class="qn">New personal record${info.pr>1?"s":""}</span><br><span class="qp">${info.pr} PR${info.pr>1?"s":""} set</span></span><span class="xp"><b>+${PR_XP*info.pr} XP</b><span class="tag">STRENGTH</span></span></div>`:"");
  const train=isTrainDay(d), ses=sessionOf(d), sch=scheduledSession(d.date);
  $("#restNote").textContent = ses===sch? `Scheduled: ${PROGRAM[sch].name}` : `Swapped from ${PROGRAM[sch].name}`;
  if(document.activeElement!==$("#sessSel")) $("#sessSel").innerHTML=SESS_ORDER.map(k2=>`<option value="${k2}" ${k2===ses?"selected":""}>${PROGRAM[k2].name}</option>`).join("");
  // Stack
  const stack=P.stack||[];
  if(!stack.length){ $("#stackList").innerHTML=`<div class="empty">No supplements yet. Add your stack under Goals.</div>`; $("#stackCount").textContent=""; }
  else{
    const req=stack.filter(s=>train||s.slot!=="Pre-gym");
    $("#stackCount").textContent=`${req.filter(s=>d.supps[s.id]).length} / ${req.length}`;
    $("#stackList").innerHTML = SLOTS.map(sl=>{
      const items=stack.filter(s=>s.slot===sl); if(!items.length) return "";
      const skip=sl==="Pre-gym"&&!train;
      return `<div class="slot ${skip?"skip":""}"><div class="slot-h"><span class="label">${sl}</span>${skip?`<span class="hint">Training days only</span>`:""}</div>`+
        items.map(s=>`<button type="button" class="supp" data-supp="${esc(s.id)}" aria-pressed="${!!d.supps[s.id]}"><span class="check">${ICON_CHECK}</span><span class="sn">${esc(s.name)}</span><span class="sd">${esc(s.dose)}</span></button>`).join("")+`</div>`;
    }).join("");
  }
  // Recovery
  $("#waterTxt").textContent=`${fmt(d.water)} / ${fmt(P.waterGoal)} oz`;
  $("#waterBar").firstElementChild.style.width=Math.min(100,P.waterGoal?d.water/P.waterGoal*100:0)+"%";
  if(document.activeElement!==$("#sleepVal")) $("#sleepVal").value=d.sleep??"";
  if(document.activeElement!==$("#stepsVal")) $("#stepsVal").value=d.steps??"";
  $("#sleepLabel").textContent=`Sleep the night before (hours) · goal ${fmt(P.sleepGoal,2)}`;
  // Streak strip
  const cells=[];
  for(let i=27;i>=0;i--){
    const k=shift(today,-i), g=G.days[k], st=g?g.status:"none";
    const lab={perfect:"every quest done",cleared:"cleared",frozen:"saved by a freeze",missed:"missed",open:"in progress",none:"no log"}[st];
    cells.push(`<button type="button" class="cell ${st} ${k===today?"today":""} ${k===S.date?"sel":""}" data-day="${k}" title="${shortDate(k)}: ${lab}${g?` · ${g.done}/${g.total} quests · +${g.xp} XP`:""}" aria-label="${shortDate(k)}: ${lab}"></button>`);
  }
  $("#streakStrip").innerHTML=cells.join("");
  // Achievements
  let got=0;
  $("#achList").innerHTML=ACH.map(a=>{const val=Math.min(a.val(G),a.goal), ok=val>=a.goal; if(ok) got++;
    return `<div class="medal ${ok?"":"locked"}">${plate(a.c,38)}<div class="mt"><b>${esc(a.name)}</b><span class="hint">${esc(a.desc)}</span><span class="hint num">${ok?"Unlocked":`${fmt(val)} / ${fmt(a.goal)}`}</span></div></div>`}).join("");
  $("#achCount").textContent=`${got} / ${ACH.length} unlocked`;
}
function renderWardrobe(){
  const A=avatar(), u=unlockedIds(GS);
  $("#wardCount").textContent=`${ITEMS.filter(i=>u.has(i.id)).length} / ${ITEMS.length} unlocked`;
  document.querySelectorAll("[data-ward]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.ward===S.ward)));
  if(S.ward==="look"){
    $("#wardBody").innerHTML=`
      <form id="nameForm" class="row" autocomplete="off"><div class="field" style="flex:1 1 180px"><label for="avName">Name</label><input id="avName" maxlength="14" value="${esc(A.name)}"></div><button class="btn" type="submit">Save name</button></form>
      <div class="field"><label>Skin tone</label><div class="swatches">${SKINS.map((c,i)=>`<button type="button" class="sw" data-look="skin:${i}" aria-pressed="${A.skin===i}" aria-label="Skin tone ${i+1}" style="background:${c}"></button>`).join("")}</div></div>
      <div class="field"><label>Hair color</label><div class="swatches">${HAIRS.map((c,i)=>`<button type="button" class="sw" data-look="hair:${i}" aria-pressed="${A.hair===i}" aria-label="Hair color ${i+1}" style="background:${c}"></button>`).join("")}</div></div>
      <div class="field"><label>Hair style</label><div class="chips">${STYLES.map((s,i)=>`<button type="button" class="chip" data-look="style:${i}" aria-pressed="${A.style===i}">${s}</button>`).join("")}</div></div>
      <span class="hint">Your lifter's build follows you: shoulders and arms grow with your Strength level, and the waist slims as your logged body fat drops.</span>`;
    return;
  }
  const list=ITEMS.filter(i=>i.slot===S.ward);
  $("#wardBody").innerHTML=`<div class="items">${list.map(it=>{const ok=u.has(it.id), on=A[S.ward]===it.id;
    return `<button type="button" class="itm ${ok?"":"locked"}" ${ok?`data-equip="${S.ward}:${it.id}"`:`aria-disabled="true"`} aria-pressed="${on}"><b>${ok?"":ICON_LOCK+" "}${esc(it.name)}</b><span>${on?"Equipped":ok?"Tap to equip":esc(it.how)}</span></button>`}).join("")}</div>`;
}
function renderPlan(){
  const d=getDay(), meals=planMeals(d), T=targets(d);
  $("#planDay").textContent = T.rest?"Rest day":T.long?"Long-run day":"Training day";
  $("#planList").innerHTML = meals.map(m=>{const done=planLogged(d,m.id);
    if(m.flex){const t=totals(d), dn=d.foods.filter(x=>x.meal==="Dinner"), dk=dn.reduce((a,x)=>a+x.kcal*(x.qty||1),0), dp=dn.reduce((a,x)=>a+x.p*(x.qty||1),0);
      const pLeft=Math.max(0,Math.round(T.protein-(t.p-dp)));
      return `<div class="pmeal"><h3>${esc(m.name)} <span class="hint" style="font-weight:500">· ${esc(m.when)}</span></h3>
      <span class="its">Whatever's cooking. Fill half the plate with veg, take a palm-to-hand-sized portion of the meat or fish, and a fist of the rice, pasta or potatoes.</span>
      <span class="mac">${done?`<b>${fmt(dk)} kcal</b> · <span style="--c:var(--protein)">P ${fmt(dp)}</span> logged`:`Aim for <span style="--c:var(--protein)">${pLeft>0?`about ${fmt(Math.min(60,Math.max(30,pLeft)))} g protein`:"30+ g protein"}</span> from this plate`}</span>
      <div class="act">${done?`<button class="btn sm done" type="button" disabled>Logged</button><button class="btn sm" type="button" data-unplan="${m.id}">Undo</button>`:`${Object.entries(DINNER_SIZES).map(([k,v])=>`<button class="btn sm ${k==="reg"?"primary":""}" type="button" data-dinner="${k}">${v.label.split(" ")[0]} ~${v.kcal}</button>`).join("")}<button class="btn sm" type="button" id="dinnerExact">Log exact</button>`}</div></div>`}
    return `<div class="pmeal"><h3>${esc(m.name)}${m.when?` <span class="hint" style="font-weight:500">· ${esc(m.when)}</span>`:""}</h3>
      <span class="its">${m.list.map(x=>esc(x.name)).join(" · ")}</span>
      <span class="mac"><b>${fmt(m.t.kcal)} kcal</b> · <span style="--c:var(--protein)">P ${fmt(m.t.p)}</span> · <span style="--c:var(--carbs)">C ${fmt(m.t.c)}</span> · <span style="--c:var(--fat)">F ${fmt(m.t.f)}</span></span>
      <div class="act">${done?`<button class="btn sm done" type="button" disabled>Logged</button><button class="btn sm" type="button" data-unplan="${m.id}">Undo</button>`:`<button class="btn sm primary" type="button" data-plan="${m.id}">Log meal</button>`}</div></div>`}).join("");
  const tt=meals.reduce((a,m)=>({kcal:a.kcal+m.t.kcal,p:a.p+m.t.p}),{kcal:0,p:0});
  $("#planNote").textContent=`Plan total about ${fmt(tt.kcal)} kcal · ${fmt(tt.p)} g protein, counting dinner as a regular plate. A light (400) or big (800) dinner still clears the calorie quest. Rice is cooked weight.`;
}
function renderFood(){
  renderPlan();
  const d=getDay();
  const seen=new Set(), recent=[];
  for(const k of sortedKeys().reverse()){ for(const x of [...(S.days[k].foods||[])].reverse()){ if(x.plan) continue; const nm=x.name.toLowerCase(); if(!seen.has(nm)){seen.add(nm);recent.push(x)} if(recent.length>=10)break } if(recent.length>=10)break }
  const list = recent.length? recent : STARTER_FOODS;
  $("#quickLabel").textContent = recent.length? "Your recent foods" : "Quick add (common foods; tap to fill the form)";
  $("#quickFoods").innerHTML = list.map((x,i)=>`<button type="button" class="chip" data-quick="${i}">${esc(x.name)}<em>${fmt(x.kcal)}</em></button>`).join("");
  $("#quickFoods")._list=list;
  if(!d.foods.length){ $("#mealList").innerHTML=`<div class="empty">Nothing logged for this day yet. Tap Log meal on your plan, or add a food above.</div>`; return }
  const cats=[...MEALS, ...new Set(d.foods.map(x=>x.meal).filter(m=>!MEALS.includes(m)))];
  $("#mealList").innerHTML = cats.map(m=>{
    const items=d.foods.filter(x=>x.meal===m); if(!items.length) return "";
    const sub=items.reduce((a,x)=>a+x.kcal*(x.qty||1),0);
    return `<div class="meal"><div class="meal-h"><h3>${esc(m)}</h3><span class="num muted">${fmt(sub)} kcal</span></div>`+
      items.map(x=>{const q=x.qty||1;return `<div class="item"><div class="name">${esc(x.name)}${q!==1?` <span class="muted num">× ${fmt(q,2)}</span>`:""}</div>
        <div class="mac num"><b>${fmt(x.kcal*q)}</b> · <span style="--c:var(--protein)">P ${fmt(x.p*q)}</span> · <span style="--c:var(--carbs)">C ${fmt(x.c*q)}</span> · <span style="--c:var(--fat)">F ${fmt(x.f*q)}</span></div>
        <button class="x" data-delfood="${x.id}" aria-label="Remove ${esc(x.name)}">×</button></div>`}).join("")+`</div>`;
  }).join("");
}
function lastTime(name, before){
  const nm=name.toLowerCase();
  for(const k of sortedKeys().reverse()){ if(k>=before) continue;
    const ex=(S.days[k].lifts||[]).find(x=>x.name.toLowerCase()===nm && x.sets.length);
    if(ex) return {date:k, ex};
  }
  return null;
}
function progEx(name){const nm=name.trim().toLowerCase();for(const k of ["push","pull","legs"]){const e=PROGRAM[k].ex.find(x=>x.n.toLowerCase()===nm);if(e) return e}return null}
function suggest(e){
  const lt=lastTime(e.n,S.date); if(!lt) return {kg:null,up:false,txt:"First time: pick a weight you could lift for 2 more reps."};
  const sets=lt.ex.sets, top=sets.reduce((a,s)=>s.kg>a.kg?s:a,sets[0]);
  const atTop=sets.length>=e.sets&&sets.every(s=>s.reps>=e.hi), inc=U()==="lb"?e.inc*LB:e.inc*0.5;
  if(atTop&&top.kg>0) return {kg:top.kg+inc,up:true,txt:`Hit ${e.hi}+ on every set last time. Go up to ${fmt(w1(top.kg+inc),1)} ${U()}.`};
  return {kg:top.kg||null,up:false,txt:`Last: ${top.kg?w1(top.kg)+" "+U()+" × ":""}${sets.map(s=>s.reps).join(", ")}. ${top.kg?"Same weight, add reps.":"Add reps."}`};
}
function fmtPace(v){const m=Math.floor(v), sec=Math.round((v-m)*60);return `${sec===60?m+1:m}:${pad(sec===60?0:sec)}`}
function easyHint(){
  const k=sortedKeys().reverse().find(k=>(S.days[k].runs||[]).some(r=>r.type==="speed"&&r.km&&r.min));
  if(!k) return "Log a speed session and I'll work out your easy pace from it. Until then, keep it conversational.";
  const r=S.days[k].runs.find(r=>r.type==="speed"&&r.km&&r.min), p=r.min/fromKm(r.km), add=DU()==="mi"?[1.6,3.2]:[1,2];
  return `Easy pace target: about ${fmtPace(p+add[0])}–${fmtPace(p+add[1])} per ${DU()}, based on your last speed session.`;
}
function renderWeek(){
  const wk=weekOf(S.date), today=todayKey(); let lifts=0,runs=0,km=0;
  $("#weekStrip").innerHTML=[...Array(7)].map((_,i)=>{const k=shift(wk,i), d=getDay(k), ses=sessionOf(d), Pg=PROGRAM[ses], q=quests(d).q.find(x=>x.id==="train"), done=!!(q&&q.done);
    if(done&&Pg.kind==="lift") lifts++; if(d.runs.length) runs++; km+=d.runs.reduce((a,r)=>a+(r.km||0),0);
    const c=Pg.kind==="lift"?"--str":Pg.kind==="run"?"--end":"--vit";
    return `<button type="button" class="wd ${done?"done":""} ${k===S.date?"sel":""} ${k===today?"today":""}" data-day="${k}" style="--c:var(${c})"><span>${DOW[dateOf(k).getDay()]}</span><b>${esc(SHORT[ses])}</b><i></i></button>`}).join("");
  $("#weekMeta").textContent=`${lifts}/3 lifts · ${runs}/3 runs · ${fmt(fromKm(km),1)} ${DU()}`;
}
function renderSession(){
  const d=getDay(), ses=sessionOf(d), Pg=PROGRAM[ses];
  $("#sessTitle").textContent=Pg.name;
  $("#sessMeta").textContent=`${dateOf(S.date).toLocaleDateString(undefined,{weekday:"long"})} · ${Pg.time}`;
  $("#sessGoal").textContent=Pg.goal;
  if(Pg.kind==="lift"){
    const have=new Set(d.lifts.map(x=>x.name.toLowerCase()));
    const rows=Pg.ex.map(e=>{const sg=suggest(e), ex=d.lifts.find(x=>x.name.toLowerCase()===e.n.toLowerCase()), dn=ex?ex.sets.length:0;
      return `<div class="prow"><b>${esc(e.n)}${e.alt?` <span class="hint" style="font-weight:400">${esc(e.alt)}</span>`:""}</b><span class="tg">${dn?`${dn} of `:""}${e.sets}×${e.lo}${e.hi>e.lo?"–"+e.hi:""}</span><span class="sub">${sg.up?`<em>${esc(sg.txt)}</em>`:esc(sg.txt)}</span></div>`}).join("");
    const missing=Pg.ex.filter(e=>!have.has(e.n.toLowerCase())).length;
    $("#sessBody").innerHTML=`<div class="prog">${rows}</div><div class="row" style="margin-top:12px;align-items:center;justify-content:space-between"><span class="hint" style="flex:1 1 240px">Lift heavy, stay controlled, leave 1–2 reps in reserve. Top of the range on every set means add weight next time.</span>${missing?`<button class="btn primary" type="button" id="loadLifts">${missing===Pg.ex.length?"Load today's lifts":"Load the rest"}</button>`:`<span class="hint">All ${Pg.ex.length} exercises are loaded below.</span>`}</div>`;
  } else if(Pg.kind==="run"){
    const runs=d.runs.map(r=>`<div class="runrow"><span><b>${esc((PROGRAM[r.type]||{name:"Run"}).name)}</b>${r.type==="speed"&&r.variant!=null&&PROGRAM.speed.opts[r.variant]?` <span class="hint">· ${esc(PROGRAM.speed.opts[r.variant])}</span>`:""}${r.rpe?` <span class="hint">· effort ${r.rpe}/10</span>`:""}</span><span class="num">${fmt(fromKm(r.km),2)} ${DU()} · ${fmt(r.min)} min · ${paceStr(r.min,r.km)}/${DU()}</span><button class="x" type="button" data-delrun="${r.id}" aria-label="Remove run">×</button></div>`).join("");
    const opts=Pg.opts?`<div class="label" style="margin-bottom:6px">Pick one</div><div class="opts">${Pg.opts.map((o,i)=>`<button type="button" class="opt" data-ropt="${i}" aria-pressed="${S.runPick===i}"><span class="check">${ICON_CHECK}</span><span>${esc(o)}</span></button>`).join("")}</div>`:"";
    const hint= ses==="easy"? easyHint() : ses==="long"? "Fuel is on today's meal plan: a banana before, then a sports drink and a gel once you pass 75 minutes. Build the long run gradually, about 10 minutes more each week." : "";
    $("#sessBody").innerHTML=`${opts}${hint?`<p class="note" style="margin-top:4px">${esc(hint)}</p>`:""}
      <form id="runForm" class="row" autocomplete="off" style="margin-top:12px">
        <div class="field" style="flex:1 1 100px"><label for="rDist">Distance (${DU()})</label><input id="rDist" type="number" min="0.1" step="0.01" inputmode="decimal" required></div>
        <div class="field" style="flex:1 1 100px"><label for="rMin">Time (min)</label><input id="rMin" type="number" min="1" step="0.5" inputmode="decimal" required></div>
        <div class="field" style="flex:0 1 96px"><label for="rRpe">Effort 1–10</label><input id="rRpe" type="number" min="1" max="10" step="1" inputmode="numeric"></div>
        <button class="btn primary" type="submit">Log run</button></form>
      ${runs?`<div style="margin-top:6px">${runs}</div>`:""}`;
  } else {
    $("#sessBody").innerHTML=`<ul class="note" style="padding-left:18px;margin:0 0 12px">${Pg.list.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><button class="btn ${d.mob?"done":"primary"}" type="button" id="mobBtn">${d.mob?"Mobility done":"Mark mobility done"}</button>`;
  }
}
function renderTraining(){
  renderWeek(); renderSession();
  const d=getDay();
  const names=new Set(STARTER_LIFTS); for(const k in S.days) for(const x of S.days[k].lifts||[]) names.add(x.name);
  $("#exList").innerHTML=[...names].sort().map(x=>`<option value="${esc(x)}">`).join("");
  const past=sortedKeys().filter(k=>k<S.date && (S.days[k].lifts||[]).length).reverse().slice(0,12);
  $("#copyRow").innerHTML = past.length? `<div class="field" style="flex:1 1 260px"><label for="copyFrom">Repeat a past workout</label><select id="copyFrom">${past.map(k=>`<option value="${k}">${shortDate(k)}: ${esc(S.days[k].lifts.map(x=>x.name).join(", "))}</option>`).join("")}</select></div><button class="btn" type="button" id="copyBtn">Add these exercises</button>` : `<span class="hint">Tip: once you've logged a workout, you can repeat it here in one tap.</span>`;
  if(!d.lifts.length){ $("#exercises").innerHTML=`<div class="empty">No exercises for this day. Add one above, for example "Bench press", then log each set's weight and reps.</div>`; return }
  $("#exercises").innerHTML=d.lifts.map(ex=>{
    const lt=lastTime(ex.name,S.date);
    let lastTxt="First time logging this exercise";
    if(lt){ const top=lt.ex.sets.reduce((a,s)=>s.kg>a.kg?s:a,lt.ex.sets[0]); lastTxt=`Last time (${shortDate(lt.date)}): ${lt.ex.sets.length} sets, top ${w1(top.kg)} ${U()} × ${top.reps}. Beat it for a PR.` }
    const pe=progEx(ex.name), sg=pe?suggest(pe):null;
    if(pe) lastTxt=`Target ${pe.sets}×${pe.lo}${pe.hi>pe.lo?"–"+pe.hi:""} · ${sg.txt}`;
    const pre = ex.sets.length? ex.sets[ex.sets.length-1] : (sg&&sg.kg!=null? {kg:sg.kg,reps:pe.lo} : (lt? lt.ex.sets[0] : null));
    const rows = ex.sets.map((s,i)=>`<tr><td class="num">${i+1}</td><td class="num r">${w1(s.kg)}</td><td class="num r">${s.reps}</td><td class="num r muted">${fmt(fromKg(e1rm(s.kg,s.reps)),0)}</td><td class="r"><button class="x" data-delset="${ex.id}:${i}" aria-label="Remove set ${i+1}">×</button></td></tr>`).join("");
    return `<div class="ex box" style="padding:0;gap:0">
      <div class="ex-h"><div style="min-width:0"><h3>${esc(ex.name)}</h3><div class="last">${lastTxt}</div></div><button class="x" data-delex="${ex.id}" aria-label="Remove ${esc(ex.name)}">×</button></div>
      ${ex.sets.length?`<div class="tablewrap"><table><thead><tr><th>Set</th><th class="r">Weight ${U()}</th><th class="r">Reps</th><th class="r">Est. 1RM</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:""}
      <form class="addset" data-addset="${ex.id}" autocomplete="off">
        <div class="field"><label for="w-${ex.id}">Weight ${U()}</label><input id="w-${ex.id}" name="w" type="number" min="0" step="0.5" inputmode="decimal" value="${pre?w1(pre.kg):""}" placeholder="0 = bodyweight"></div>
        <div class="field"><label for="r-${ex.id}">Reps</label><input id="r-${ex.id}" name="r" type="number" min="1" step="1" inputmode="numeric" required value="${pre?pre.reps:""}"></div>
        <button class="btn primary" type="submit">Add set</button>
      </form></div>`;
  }).join("");
}
function avgWeight(k){const vals=[];for(let i=0;i<7;i++){const d=S.days[shift(k,-i)];if(d&&d.weight!=null) vals.push(d.weight)}return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function lineChart(pts,{avg=null,label,dec=1}={}){
  const all=[...pts.map(p=>p.v),...(avg||[]).map(p=>p.v)];
  const lo=Math.min(...all),hi=Math.max(...all),pd=Math.max(dec?0.5:1,(hi-lo)*.15);
  const a=Math.floor(lo-pd),b=Math.ceil(hi+pd),WW=320,HH=170,l=40,r=10,t=10,bt=24;
  const t0=dateOf(pts[0].k).getTime(),t1=dateOf(pts[pts.length-1].k).getTime();
  const X=k=>l+(WW-l-r)*((dateOf(k).getTime()-t0)/((t1-t0)||1)), Y=v=>t+(HH-t-bt)*(1-(v-a)/(b-a));
  let s=`<svg viewBox="0 0 ${WW} ${HH}" role="img" aria-label="${esc(label)}">`;
  [a,(a+b)/2,b].forEach(v=>{s+=`<line x1="${l}" x2="${WW-r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${l-6}" y="${Y(v)+4}" text-anchor="end">${fmt(v,1)}</text>`});
  if(avg&&avg.length>1){
    for(const p of pts) s+=`<circle cx="${X(p.k).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.2" fill="var(--muted)" opacity=".55"/>`;
    const line=avg.map(p=>`${X(p.k).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
    s+=`<polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/>`;
    const lp=avg[avg.length-1]; s+=`<circle cx="${X(lp.k)}" cy="${Y(lp.v)}" r="4" fill="var(--accent)"/>`;
  } else {
    const line=pts.map(p=>`${X(p.k).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
    s+=`<polygon points="${X(pts[0].k)},${Y(a)} ${line} ${X(pts[pts.length-1].k)},${Y(a)}" fill="var(--accent)" opacity=".12"/><polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>`;
    const lp=pts[pts.length-1]; s+=`<circle cx="${X(lp.k)}" cy="${Y(lp.v)}" r="4" fill="var(--accent)"/>`;
  }
  s+=`<text x="${l}" y="${HH-6}">${shortDate(pts[0].k)}</text><text x="${WW-r}" y="${HH-6}" text-anchor="end">${shortDate(pts[pts.length-1].k)}</text></svg>`;
  return s;
}
function renderProgress(){
  const P=S.profile, today=todayKey();
  // Body check-in
  $("#waistLabel").textContent=`Waist at navel (${LU()})`;
  const cd=getDay();
  if(document.activeElement!==$("#waistVal")) $("#waistVal").value=cd.waist!=null?Math.round(fromCm(cd.waist)*100)/100:"";
  if(document.activeElement!==$("#bfVal")) $("#bfVal").value=cd.bf!=null&&cd.bfSrc!=="tape"?cd.bf:"";
  if(document.activeElement!==$("#neckVal")) $("#neckVal").value=cd.neck!=null?Math.round(fromCm(cd.neck)*100)/100:"";
  $("#neckLabel").textContent=`Neck (${LU()})`;
  $("#photoBtn").setAttribute("aria-pressed",String(cd.photo)); $("#photoBtn").classList.toggle("done",cd.photo); $("#photoBtn").textContent=cd.photo?"Photos taken":"Took progress photos";
  const wk=sortedKeys().filter(k=>S.days[k].waist!=null), lastPhoto=sortedKeys().reverse().find(k=>S.days[k].photo);
  const lastCheck=wk[wk.length-1];
  $("#checkHint").textContent = lastCheck? `Last check-in ${shortDate(lastCheck)}${lastPhoto?` · photos ${shortDate(lastPhoto)}`:""}` : "Once a week, same time of day";
  const bf=latestBf(), lw=latestWeight(), bfLogged=sortedKeys().some(k=>S.days[k].bf!=null);
  const wStat = wk.length? (()=>{const f=fromCm(S.days[wk[0]].waist), l=fromCm(S.days[lastCheck].waist), dlt=l-f; return `<div><span class="v num">${fmt(l,2)}</span><span class="label">Waist ${LU()}</span><span class="hint num">${wk.length>1?`${dlt>0?"+":""}${fmt(dlt,2)} since ${shortDate(wk[0])}`:"First check-in"}</span></div>`})() : `<div><span class="v num">–</span><span class="label">Waist ${LU()}</span><span class="hint">Measure at the navel</span></div>`;
  let comp=`<div><span class="v num">–</span><span class="label">Lean mass</span><span class="hint">Needs a weigh-in</span></div><div><span class="v num">–</span><span class="label">Weight at goal</span><span class="hint">Needs a weigh-in</span></div>`;
  if(lw!=null){const wt=fromKg(lw), lean=wt*(1-bf/100), atGoal=lean/(1-(P.goalBf||15)/100);
    comp=`<div><span class="v num">${fmt(lean)}</span><span class="label">Lean mass ${U()}</span><span class="hint num">${fmt(wt-lean)} ${U()} fat</span></div><div><span class="v num">${fmt(atGoal)}</span><span class="label">Weight at ${fmt(P.goalBf||15)}%</span><span class="hint">Keeping today's muscle</span></div>`}
  const bfK=sortedKeys().reverse().find(k=>S.days[k].bf!=null), bfSrc=bfK?(S.days[bfK].bfSrc==="tape"?"Tape estimate":"Scan"):"Starting estimate";
  const hcm=P.heightCm||165.1, wcm=latestOf("waist"), ncm=latestOf("neck"), navy=wcm&&ncm?navyBf(wcm,ncm,hcm):null;
  const bmi=lw!=null? lw/Math.pow(hcm/100,2) : null, whtr=wcm? wcm/hcm : null;
  const row2=`<div><span class="v num">${navy!=null?fmt(navy,1)+"%":"–"}</span><span class="label">Tape estimate</span><span class="hint">${navy!=null?"Navy method, ±3–4%":"Needs waist and neck"}</span></div>`+
    `<div><span class="v num">${whtr?fmt(whtr,2):"–"}</span><span class="label">Waist ÷ height</span><span class="hint">${whtr?(whtr<0.5?"Healthy range (under 0.5)":"Aim for under 0.5"):"Needs a waist"}</span></div>`+
    `<div><span class="v num">${bmi?fmt(bmi,1):"–"}</span><span class="label">BMI</span><span class="hint">${bmi?"Ignores muscle, so trust it least":"Needs a weigh-in"}</span></div>`+
    `<div><span class="v num">${ncm?fmt(fromCm(ncm),2):"–"}</span><span class="label">Neck ${LU()}</span><span class="hint">Just below the Adam's apple</span></div>`;
  $("#bodyStats").innerHTML = wStat + `<div><span class="v num">${fmt(bf,1)}%</span><span class="label">Body fat</span><span class="hint">${bfSrc} · goal ${fmt(P.goalBf||15)}%</span></div>` + comp + row2;
  $("#bodyHint").textContent=`Height ${LU()==="in"?`${Math.floor(hcm/2.54/12)}'${Math.round(hcm/2.54%12)}"`:fmt(hcm)+" cm"} (change it under Goals). Measure waist and neck relaxed, first thing in the morning. Leave the scan box blank to use the tape estimate, or enter a DEXA/BodPod result, which always wins.`;
  const wpts=wk.slice(-26).map(k=>({k,v:Math.round(fromCm(S.days[k].waist)*100)/100}));
  $("#waistChart").innerHTML = wpts.length>=2? lineChart(wpts,{label:"Waist trend",dec:1}) : `<div class="empty">${wpts.length?"One check-in so far. Log another next week to see the trend.":"Log your waist weekly to see the trend. It's the clearest sign of fat loss while you build muscle."}</div>`;
  // Week stats
  const keys=[...Array(7)].map((_,i)=>shift(S.date,-i));
  const fed=keys.map(k=>getDay(k)).filter(d=>d.foods.length);
  const avgK=fed.length?fed.reduce((a,d)=>a+totals(d).kcal,0)/fed.length:0;
  const avgP=fed.length?fed.reduce((a,d)=>a+totals(d).p,0)/fed.length:0;
  const trained=keys.filter(k=>getDay(k).lifts.length).length;
  $("#weekStats").innerHTML=`
    <div><span class="v num">${fed.length?fmt(avgK):"–"}</span><span class="label">Avg kcal / day</span></div>
    <div><span class="v num">${fed.length?fmt(avgP):"–"}</span><span class="label">Avg protein g</span></div>
    <div><span class="v num">${fed.length}/7</span><span class="label">Days logged</span></div>
    <div><span class="v num">${trained}</span><span class="label">Training days</span></div>`;
  // Calorie chart
  const days=[...Array(14)].map((_,i)=>shift(S.date,i-13));
  const vals=days.map(k=>totals(getDay(k)).kcal), tg=days.map(k=>targets(getDay(k)).kcal), goal=P.kcal||0;
  const W=640,H=210,L=44,R=10,T=12,B=28, max=Math.max(goal*1.25,...vals,500);
  const top=Math.ceil(max/500)*500, y=v=>T+(H-T-B)*(1-v/top), bw=(W-L-R)/14;
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Calories eaten each day over the last 14 days compared with your target">`;
  for(let v=0;v<=top;v+=top/4){svg+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${fmt(v)}</text>`}
  days.forEach((k,i)=>{const v=vals[i],x=L+i*bw+bw*.18,w=bw*.64;
    svg+=`<line x1="${x-1}" x2="${x+w+1}" y1="${y(tg[i])}" y2="${y(tg[i])}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="3 2" opacity=".55"/>`;
    if(v>0) svg+=`<rect x="${x}" y="${y(v)}" width="${w}" height="${y(0)-y(v)}" rx="3" fill="${v>tg[i]*1.05?"var(--warn)":"var(--kcal)"}" opacity="${k===S.date?1:.75}"><title>${shortDate(k)}: ${fmt(v)} of ${fmt(tg[i])} kcal</title></rect>`;
    if(i%2===1||i===13) svg+=`<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${dateOf(k).getDate()}</text>`;
  });
  $("#kcalChart").innerHTML=svg+"</svg>"+`<p class="hint" style="margin:8px 0 0">${vals.some(v=>v)?"Dashes mark each day's target: training days are higher than rest days.":"Bars appear as you log food. Dashes mark each day's target."}</p>`;
  // Weight with 7-day average
  $("#wLabel").textContent=`Weigh-in for ${S.date===today?"today":shortDate(S.date)} (${U()})`;
  const wd=getDay(); if(document.activeElement!==$("#wVal")) $("#wVal").value = wd.weight!=null? w1(wd.weight):"";
  const pts=sortedKeys().filter(k=>S.days[k].weight!=null).slice(-60).map(k=>({k,v:w1(S.days[k].weight)}));
  if(pts.length<2){ $("#wChart").innerHTML=`<div class="empty">${pts.length?`One weigh-in so far (${pts[0].v} ${U()}). Log another day to see the trend.`:"Weigh in each morning. The 7-day average smooths out water swings."}</div>` }
  else{
    const avg=pts.map(p=>({k:p.k,v:Math.round(fromKg(avgWeight(p.k))*10)/10}));
    const lp=avg[avg.length-1], prevA=avgWeight(shift(lp.k,-7));
    const rate=prevA!=null? lp.v-fromKg(prevA) : null;
    $("#wChart").innerHTML=lineChart(pts,{avg,label:"Body weight with 7-day average"})+`<p class="hint" style="margin:6px 0 0">7-day average <b class="num">${fmt(lp.v,1)} ${U()}</b>${rate!=null?` · <span class="num">${rate>0?"+":""}${fmt(rate,1)}</span> ${U()} this week. Aim for −1 to −1.5.`:""} Dots are single days.</p>`;
  }
  // PRs
  const best={};
  for(const k of sortedKeys()) for(const ex of S.days[k].lifts||[]) for(const s of ex.sets){ if(!s.kg) continue;
    const nm=ex.name.trim(), key=nm.toLowerCase(), e=e1rm(s.kg,s.reps);
    if(!best[key]||e>best[key].e) best[key]={name:nm,e,s,k};
  }
  const pr=Object.values(best).sort((a,b)=>b.e-a.e);
  $("#prs").innerHTML = pr.length? `<div class="tablewrap"><table><thead><tr><th>Exercise</th><th class="r">Best set</th><th class="r">Est. 1RM</th></tr></thead><tbody>${pr.map(p=>`<tr><td>${esc(p.name)}<div class="hint">${shortDate(p.k)}</div></td><td class="num r">${w1(p.s.kg)} × ${p.s.reps}</td><td class="num r"><b>${fmt(fromKg(p.e))}</b> ${U()}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">Your best lifts show up here once you log weighted sets.</div>`;
}
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function renderGameGoals(){
  const P=S.profile, W=P.week||WEEK;
  $("#weekLayout").innerHTML=[1,2,3,4,5,6,0].map(i=>`<div class="field" style="flex:1 1 118px"><label for="wl${i}">${DOW[i]}</label><select id="wl${i}" data-wl="${i}">${SESS_ORDER.map(k=>`<option value="${k}" ${W[i]===k?"selected":""}>${PROGRAM[k].name}</option>`).join("")}</select></div>`).join("");
  const stack=P.stack||[];
  $("#stackEdit").innerHTML = stack.length? stack.map(s=>`<div class="stackrow"><span class="sn">${esc(s.name)}</span><span class="hint num">${esc(s.dose)}</span><span class="label">${esc(s.slot)}</span><button class="x" type="button" data-delstack="${esc(s.id)}" aria-label="Remove ${esc(s.name)}">×</button></div>`).join("") : `<div class="empty">Your stack is empty. Add what you take below.</div>`;
}
function fillGoals(){
  const P=S.profile; $("#gK").value=P.kcal; $("#gP").value=P.protein; $("#gC").value=P.carbs; $("#gF").value=P.fat; $("#gU").value=P.unit;
  $("#gRK").value=P.restKcal??P.kcal; $("#gRC").value=P.restCarbs??P.carbs; $("#gRF").value=P.restFat??P.fat;
  $("#gWater").value=P.waterGoal; $("#gSleep").value=P.sleepGoal; $("#gSteps").value=P.stepGoal; $("#gBF").value=P.goalBf??15; $("#gHLabel").textContent=`Height (${LU()})`; $("#gH").value=Math.round(fromCm(P.heightCm||165.1)*2)/2;
  $("#eHLabel").textContent = U()==="lb"?"Height (in)":"Height (cm)";
  $("#eWLabel").textContent = `Weight (${U()})`;
  const lw=latestWeight(); if(lw!=null) $("#eW").value=w1(lw);
  $("#eH").value = U()==="kg"? Math.round(P.heightCm||165.1) : Math.round(fromCm(P.heightCm||165.1)*2)/2;
  macroCheck(); estimate(); renderGameGoals();
}
function macroCheck(){
  const k=n($("#gK").value),p=n($("#gP").value),c=n($("#gC").value),f=n($("#gF").value), m=p*4+c*4+f*9;
  $("#macroCheck").textContent = `Training-day macros add up to ${fmt(m)} kcal (protein and carbs 4 kcal/g, fat 9 kcal/g)` + (k? (Math.abs(m-k)<=60?", which matches your calorie target.":`, ${fmt(Math.abs(m-k))} kcal ${m>k?"above":"below"} your calorie target.`):".");
}
let EST=null;
function estimate(){
  const sex=$("#eSex").value, age=n($("#eAge").value), h=n($("#eH").value), w=n($("#eW").value), act=n($("#eAct").value), g=n($("#eGoal").value);
  if(!age||!h||!w){ $("#estOut").innerHTML=`<span class="hint">Enter age, height and weight to see an estimate.</span>`; EST=null; return }
  const kg=U()==="lb"?w*LB:w, cm=U()==="lb"?h*2.54:h;
  const bmr=10*kg+6.25*cm-5*age+(sex==="m"?5:-161), tdee=bmr*act, kcal=Math.round((tdee+g)/10)*10;
  const protein=Math.round(kg/LB*0.8), fat=Math.round(kcal*0.25/9), carbs=Math.max(0,Math.round((kcal-protein*4-fat*9)/4));
  EST={kcal,protein,carbs,fat};
  $("#estOut").innerHTML=`<div class="stats"><div><span class="v num">${fmt(kcal)}</span><span class="label">kcal</span></div><div><span class="v num" style="color:var(--protein)">${protein}</span><span class="label">Protein g</span></div><div><span class="v num" style="color:var(--carbs)">${carbs}</span><span class="label">Carbs g</span></div><div><span class="v num" style="color:var(--fat)">${fat}</span><span class="label">Fat g</span></div></div>
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start"><span class="hint">Maintenance ≈ ${fmt(Math.round(tdee/10)*10)} kcal · protein 0.8 g per lb of body weight</span><button class="btn primary" type="button" id="useEst">Use for training days</button></div>`;
}

/* ---------- events ---------- */
function setTab(t){
  S.tab=t;
  document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===t)));
  ["quests","food","training","progress","goals"].forEach(x=>$("#tab-"+x).hidden = x!==t);
  if(t==="goals") fillGoals();
  $("#dockBubble").hidden=true;
  render(true);
  if(t==="quests"&&!speechT) idleDialog();
}
function setDate(k){ if(!k) return; const today=todayKey(); S.date = k>today?today:k; render(true) }

document.addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b) return;
  if(b.dataset.tab) return setTab(b.dataset.tab);
  if(b.id==="lvChip"||b.id==="dock") return setTab("quests");
  if(b.id==="stage"){const k=["high","flex","pep","poke"][tapCycle++%4]; return interact(k)}
  if(b.id==="actHigh") return interact("high");
  if(b.id==="actFlex") return interact("flex");
  if(b.id==="actPep") return interact("pep");
  if(b.dataset.ward){S.ward=b.dataset.ward; return render(true)}
  if(b.dataset.equip){const [slot,id]=b.dataset.equip.split(":"); S.profile={...S.profile,avatar:{...avatar(),[slot]:id}}; saveProfile(); return say(pick(["Looking sharp.","Fresh fit.","Oh, I like this."]),{pose:"flex",expr:"happy"})}
  if(b.dataset.look){const [k,v]=b.dataset.look.split(":"); S.profile={...S.profile,avatar:{...avatar(),[k]:+v}}; return saveProfile()}
  if(b.dataset.go) return setTab(b.dataset.go);
  if(b.id==="prevDay") return setDate(shift(S.date,-1));
  if(b.id==="nextDay") return setDate(shift(S.date,1));
  if(b.id==="todayBtn") return setDate(todayKey());
  if(b.dataset.day) return setDate(b.dataset.day);
  if(b.dataset.supp){ const d=getDay(), id=b.dataset.supp, on=!d.supps[id], s=(S.profile.stack||[]).find(x=>x.id===id); d.supps={...d.supps,[id]:on}; return saveDay(d,{type:"supp",on,name:s?s.name:"Supplement"}) }
  if(b.dataset.water){ const d=getDay(), amt=n(b.dataset.water); d.water=Math.max(0,d.water+amt); return saveDay(d,{type:"water",amt}) }
  if(b.id==="loadLifts"){ const d=getDay(), Pg=PROGRAM[sessionOf(d)]; if(Pg.kind!=="lift") return; const have=new Set(d.lifts.map(x=>x.name.toLowerCase()));
    d.lifts=[...d.lifts,...Pg.ex.filter(e=>!have.has(e.n.toLowerCase())).map(e=>({id:uid(),name:e.n,sets:[]}))]; return saveDay(d,{type:"load"}) }
  if(b.dataset.ropt!=null){ S.runPick=+b.dataset.ropt; return render(true) }
  if(b.dataset.delrun){ const d=getDay(); d.runs=d.runs.filter(r=>r.id!==b.dataset.delrun); return saveDay(d) }
  if(b.id==="mobBtn"){ const d=getDay(); d.mob=!d.mob; return saveDay(d, d.mob?{type:"mob"}:null) }
  if(b.id==="photoBtn"){ const d=getDay(); d.photo=!d.photo; return saveDay(d, d.photo?{type:"check",msg:"Photos noted. Same light and poses next time."}:null) }
  if(b.dataset.plan){ const d=getDay(), m=planMeals(d).find(x=>x.id===b.dataset.plan); if(!m) return;
    d.foods=[...d.foods,...m.list.map(it=>({id:uid(),meal:m.meal,name:it.name,kcal:it.kcal,p:it.p,c:it.c,f:it.f,qty:1,plan:m.id}))]; return saveDay(d,{type:"plan",name:m.name}) }
  if(b.dataset.unplan){ const d=getDay(), id=b.dataset.unplan; d.foods=d.foods.filter(x=>x.plan!==id&&!(id===DINNER.id&&x.meal==="Dinner")); return saveDay(d) }
  if(b.dataset.dinner){ const d=getDay(), z=DINNER_SIZES[b.dataset.dinner]; if(!z) return;
    d.foods=[...d.foods,{id:uid(),meal:"Dinner",name:`Mom's dinner, ${z.label.toLowerCase()}`,kcal:z.kcal,p:z.p,c:z.c,f:z.f,qty:1,plan:DINNER.id}]; return saveDay(d,{type:"dinner",size:b.dataset.dinner}) }
  if(b.id==="dinnerExact"){ $("#fMeal").value="Dinner"; $("#fName").value="Mom's dinner: "; $("#fName").focus(); $("#fName").scrollIntoView({block:"center",behavior:RM?"auto":"smooth"}); return }
  if(b.dataset.delstack){ S.profile={...S.profile,stack:(S.profile.stack||[]).filter(s=>s.id!==b.dataset.delstack)}; return saveProfile() }
  if(b.dataset.quick!=null){
    const x=$("#quickFoods")._list[+b.dataset.quick];
    $("#fName").value=x.name; $("#fKcal").value=x.kcal; $("#fP").value=x.p; $("#fC").value=x.c; $("#fF").value=x.f; $("#fQty").value=1;
    if(x.meal&&MEALS.includes(x.meal)) $("#fMeal").value=x.meal; $("#fQty").focus(); $("#fQty").select(); return;
  }
  if(b.dataset.delfood){ const d=getDay(); d.foods=d.foods.filter(x=>x.id!==b.dataset.delfood); return saveDay(d) }
  if(b.dataset.delex){ const d=getDay(); d.lifts=d.lifts.filter(x=>x.id!==b.dataset.delex); return saveDay(d) }
  if(b.dataset.delset){ const [id,i]=b.dataset.delset.split(":"); const d=getDay(); const ex=d.lifts.find(x=>x.id===id); if(ex){ex.sets=ex.sets.filter((_,j)=>j!==+i); saveDay(d)} return }
  if(b.id==="copyBtn"){ const src=getDay($("#copyFrom").value), d=getDay(); const have=new Set(d.lifts.map(x=>x.name.toLowerCase()));
    for(const ex of src.lifts) if(!have.has(ex.name.toLowerCase())) d.lifts.push({id:uid(),name:ex.name,sets:[]}); return saveDay(d) }
  if(b.id==="useEst" && EST){ S.profile={...S.profile,...EST}; fillGoals(); saveProfile(); setStatusFlash("Training-day targets updated."); }
});
function setStatusFlash(t){ const el=$("#saveState"), prev=el.textContent, cls=el.className; el.textContent=t; setTimeout(()=>{ if(el.textContent===t){el.textContent=prev;el.className=cls} },2500) }

$("#dateInput").addEventListener("change",e=>setDate(e.target.value));
$("#foodForm").addEventListener("submit",e=>{
  e.preventDefault(); const name=$("#fName").value.trim(); if(!name) return;
  const d=getDay(), qty=n($("#fQty").value)||1;
  const item={id:uid(),meal:$("#fMeal").value,name,kcal:n($("#fKcal").value),p:n($("#fP").value),c:n($("#fC").value),f:n($("#fF").value),qty};
  d.foods=[...d.foods,item];
  saveDay(d,{type:"food",item:{name,p:item.p*qty}}); ["fName","fKcal","fP","fC","fF"].forEach(id=>$("#"+id).value=""); $("#fQty").value=1; $("#fName").focus();
});
$("#exForm").addEventListener("submit",e=>{
  e.preventDefault(); const name=$("#exName").value.trim(); if(!name) return;
  const d=getDay(); d.lifts=[...d.lifts,{id:uid(),name,sets:[]}]; $("#exName").value=""; saveDay(d);
  const last=d.lifts[d.lifts.length-1]; const inp=$("#r-"+last.id); if(inp) inp.focus();
});
$("#exercises").addEventListener("submit",e=>{
  const f=e.target.closest("[data-addset]"); if(!f) return; e.preventDefault();
  const reps=Math.round(n(f.r.value)); if(reps<1) return;
  const d=getDay(), ex=d.lifts.find(x=>x.id===f.dataset.addset); if(!ex) return;
  const w=n(f.w.value);
  ex.sets=[...ex.sets,{kg:toKg(w),reps}]; const id=ex.id; saveDay(d,{type:"set",ex:ex.name,w,reps});
  const inp=$("#r-"+id); if(inp){inp.focus();inp.select()}
});
$("#wForm").addEventListener("submit",e=>{ e.preventDefault(); const v=n($("#wVal").value); if(!v) return; const d=getDay(); d.weight=toKg(v); $("#wVal").blur(); saveDay(d,{type:"weigh"}) });
$("#checkForm").addEventListener("submit",e=>{ e.preventDefault();
  const wv=n($("#waistVal").value), nv=n($("#neckVal").value), bv=n($("#bfVal").value); if(!wv&&!bv&&!nv) return;
  const d=getDay(), prevK=sortedKeys().reverse().find(k=>k<d.date&&S.days[k].waist!=null);
  if(wv) d.waist=toCm(wv); if(nv) d.neck=toCm(nv);
  if(bv){d.bf=Math.round(bv*10)/10; d.bfSrc="scan"}
  else if(d.waist&&d.neck){const est=navyBf(d.waist,d.neck,S.profile.heightCm||165.1); if(est!=null&&est>2&&est<60){d.bf=est; d.bfSrc="tape"}}
  let msg=d.bfSrc==="tape"&&d.bf!=null?`Tape estimate: ${fmt(d.bf,1)}% body fat.`:"Same time next week.";
  if(wv&&prevK){const dl=wv-fromCm(S.days[prevK].waist); msg = dl<0?`Waist down ${fmt(-dl,2)} ${LU()} since ${shortDate(prevK)}. The cut is working.`: dl>0?`Waist up ${fmt(dl,2)} ${LU()}. One reading is noise; watch next week.`:"Waist holding steady.";}
  if(d.bfSrc==="tape"&&wv&&prevK) msg+=` Tape estimate ${fmt(d.bf,1)}%.`;
  $("#waistVal").blur(); $("#neckVal").blur(); $("#bfVal").blur(); saveDay(d,{type:"check",msg});
});
$("#sleepForm").addEventListener("submit",e=>{ e.preventDefault(); const d=getDay(); d.sleep=Math.min(16,Math.max(0,n($("#sleepVal").value))); $("#sleepVal").blur(); saveDay(d,{type:"sleep"}) });
$("#stepsForm").addEventListener("submit",e=>{ e.preventDefault(); const d=getDay(); d.steps=Math.max(0,Math.round(n($("#stepsVal").value))); $("#stepsVal").blur(); saveDay(d,{type:"steps"}) });
$("#goalForm").addEventListener("submit",e=>{ e.preventDefault();
  S.profile={...S.profile,kcal:n($("#gK").value),protein:n($("#gP").value),carbs:n($("#gC").value),fat:n($("#gF").value),restKcal:n($("#gRK").value),restCarbs:n($("#gRC").value),restFat:n($("#gRF").value),unit:$("#gU").value};
  saveProfile(); fillGoals(); setStatusFlash("Targets saved.");
});
$("#gameForm").addEventListener("submit",e=>{ e.preventDefault();
  S.profile={...S.profile,waterGoal:n($("#gWater").value)||100,sleepGoal:n($("#gSleep").value)||7,stepGoal:Math.round(n($("#gSteps").value))||8000,goalBf:n($("#gBF").value)||15,heightCm:toCm(n($("#gH").value))||S.profile.heightCm||165.1};
  saveProfile(); fillGoals(); setStatusFlash("Quest settings saved.");
});
$("#stackForm").addEventListener("submit",e=>{ e.preventDefault(); const name=$("#sName").value.trim(); if(!name) return;
  S.profile={...S.profile,stack:[...(S.profile.stack||[]),{id:uid(),name,dose:$("#sDose").value.trim(),slot:$("#sSlot").value}]};
  $("#sName").value=""; $("#sDose").value=""; saveProfile(); $("#sName").focus();
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.wl!=null){ S.profile={...S.profile,week:{...(S.profile.week||WEEK),[t.dataset.wl]:t.value}}; saveProfile(); setStatusFlash("Weekly layout saved."); return }
  if(t.id==="sessSel"){ const d=getDay(), v=t.value; d.session = v===scheduledSession(d.date)? null : v; d.rest=null; t.blur(); saveDay(d,{type:"session"}) }
});
document.addEventListener("submit",e=>{ if(e.target.id!=="runForm") return; e.preventDefault();
  const dist=n($("#rDist").value), mn=n($("#rMin").value), rpe=Math.round(n($("#rRpe").value))||null; if(!dist||!mn) return;
  const d=getDay(), ses=sessionOf(d), type=PROGRAM[ses].kind==="run"?ses:"easy", km=toKm(dist);
  d.runs=[...d.runs,{id:uid(),type,variant:type==="speed"?(S.runPick??null):null,km,min:mn,rpe}];
  saveDay(d,{type:"run",km,min:mn,rtype:type});
});
document.addEventListener("submit",e=>{ if(e.target.id!=="nameForm") return; e.preventDefault();
  const nm=($("#avName").value||"").trim().slice(0,14)||"Kai"; S.profile={...S.profile,avatar:{...avatar(),name:nm}}; saveProfile(); say(`${nm}. I like it.`,{pose:"wave",expr:"excited"});
});
$("#goalForm").addEventListener("input",macroCheck);
$("#estForm").addEventListener("input",estimate);
$("#estForm").addEventListener("change",estimate);
setInterval(()=>{ if(!GS) return; const prevMood=VS&&VS.mood; VS=vitals(); if(S.tab==="quests"&&VS.mood!==prevMood) render(true) },60000);

/* ---------- boot ---------- */
render(true);
requestAnimationFrame(loop);
Store.init().then(()=>{
  S.ready=true;
  if(S.profile.plan!=="hybrid-v1"){
    const fresh=S.profile.plan!=="cut-v1";
    S.profile={...S.profile,...(fresh?CUT:{}),week:{...WEEK},startBf:S.profile.startBf??29,goalBf:S.profile.goalBf??15,plan:"hybrid-v1"};
    saveProfile();
    say(`Hybrid program loaded: 3 runs and 3 lifts a week, Sunday for recovery.${fresh?` Targets: ${fmt(CUT.kcal)} kcal on training days, ${fmt(CUT.restKcal)} on rest days.`:""}`,{speaker:"coach",pose:"point"});
  }
  render(true);
  if(S.tab==="goals") fillGoals();
  if(!greeted){greeted=true; VS=vitals(); const foe=challenger(); const sleepy=VS.mood==="late"||VS.mood==="sleepy";
    say(moodLine(VS),{pose:sleepy?"sleepy":"wave",expr:sleepy?"sleepy":"smile",low:true});
    const Pg=PROGRAM[sessionOf(getDay(todayKey()))];
    if(!sleepy&&!foe.ko&&Pg.kind==="lift") say(`${Pg.name} today. The Heavy Dumbbell Goblin's waiting. Start with ${Pg.ex[0].n.toLowerCase()}, ${Pg.ex[0].sets}×${Pg.ex[0].lo}–${Pg.ex[0].hi}.`,{speaker:"coach",pose:"point",low:true});
    else if(!sleepy&&!foe.ko&&Pg.kind==="run") say(`${Pg.name} today, ${Pg.time}! Log it to outrun the Treadmill Shadow.`,{speaker:"cardio",pose:"flex",low:true});
    else if(!sleepy&&Pg.kind==="rest") say(`Recovery day. 15 minutes of mobility, an easy walk, and your weekly check-in.`,{speaker:"buddy",pose:"wave",low:true});
  }
});
})();
