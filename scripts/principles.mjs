// One cycle, drawn in three connected views. No app-specific or invented data.
const frame=(title,body)=>`<svg viewBox="0 0 360 250" role="img" aria-label="${title}"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
export const principles=[
 {name:'Start with the real problem.',description:'Every tool begins inside the work: a recurring task, an unclear comparison, or a process that asks too much of memory.',figure:frame('Separate pieces of work brought into a shared frame of reference',`
 <path class="diagram-faint" d="M0 125H48M312 125H360"/>
 <g class="diagram-fragments"><rect x="62" y="53" width="62" height="43" rx="3"/><path d="M74 67h31m-31 11h19"/><rect x="52" y="139" width="72" height="54" rx="3"/><path d="M65 153h43m-43 12h28m-28 12h35"/></g>
 <path class="diagram-route" d="M125 74C159 74 141 111 175 111M125 165C151 165 150 139 175 139"/>
 <path class="diagram-edge" d="M174 87V71h16m84 0h16v16m0 76v16h-16m-84 0h-16v-16"/>
 <rect class="diagram-panel" x="185" y="88" width="94" height="74" rx="4"/>
 <path class="diagram-edge" d="M201 109h60m-60 15h39m-39 15h47"/>
 <circle class="cycle-joint" cx="0" cy="125" r="3"/><circle class="cycle-joint" cx="360" cy="125" r="3"/>`)
 },
 {name:'Keep the useful reasoning.',description:'Make repeatable checks explicit. Automate the repeated steps. Leave more room for the work that needs judgment.',figure:frame('A considered response becomes a repeatable working structure',`
 <path class="diagram-faint" d="M0 125H65M295 125H360"/>
 <rect class="diagram-shadow" x="82" y="79" width="206" height="116" rx="5"/><rect class="diagram-panel" x="72" y="61" width="206" height="116" rx="5"/>
 <path class="diagram-faint" d="M72 90H278M145 90V177M213 90V177"/>
 <path class="diagram-edge" d="M87 76h36m88 0h10m10 0h10m10 0h10"/>
 <path class="diagram-route" d="M89 133H127M157 133H196M225 133H263"/>
 <circle class="cycle-operation" cx="141" cy="133" r="9"/><circle class="cycle-operation" cx="210" cy="133" r="9"/>
 <path class="diagram-edge" d="m138 133 2 2 4-5m63 3 2 2 4-5"/>
 <circle class="cycle-joint" cx="0" cy="125" r="3"/><circle class="cycle-joint" cx="360" cy="125" r="3"/>`)
 },
 {name:'Put clarity to work.',description:'Bring evidence, context, and the next action into view. Use the tool, question it, and refine it as the work changes.',figure:frame('Real use feeds a more considered response into the next cycle',`
 <path class="diagram-faint" d="M0 125H65M295 125H360"/>
 <rect class="diagram-shadow" x="79" y="65" width="176" height="114" rx="4"/>
 <path class="diagram-faint" d="M92 84h48m-48 14h78m-78 14h57"/>
 <rect class="diagram-panel" x="104" y="90" width="176" height="114" rx="4"/>
 <path class="diagram-edge" d="M120 108h67M120 139h97m-97 17h77m-77 17h90"/>
 <rect class="clarity-focus" x="235" y="128" width="29" height="56" rx="3"/>
 <path class="diagram-route" d="m243 145 5 5 8-11M237 108C290 80 246 34 187 40"/>
 <path class="diagram-route" d="m194 33-8 7 10 4"/>
 <circle class="cycle-joint" cx="0" cy="125" r="3"/><circle class="cycle-joint" cx="360" cy="125" r="3"/>`)
 }
];
export const principleSection=()=>`<section class="principles page-width" id="principle" aria-labelledby="principle-heading"><div class="principle-intro"><p class="eyebrow">The thinking behind the tools</p><h2 id="principle-heading">Less repetition.<br><span>More room for engineering judgment.</span></h2></div><div class="principle-cycle"><div class="principle-grid">${principles.map((p,i)=>`<figure class="principle-figure"><div class="principle-drawing">${p.figure}</div><figcaption><span class="principle-number">0${i+1}</span><h3>${p.name}</h3><p>${p.description}</p></figcaption></figure>`).join('')}</div><div class="cycle-return" aria-hidden="true"><svg viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M1000 1V25Q1000 45 980 45H220Q200 45 200 25V1"/><path d="m195 9 5-8 5 8"/></svg><span>Real use sets the next brief.</span></div></div></section>`;
