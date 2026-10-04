// Original illustrations describe interface structure, not fabricated engineering results.
const frame=(title,body)=>`<svg viewBox="0 0 360 230" role="img" aria-label="${title}"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
export const principles=[
 {name:'Purpose-built',description:'Each application begins with a specific engineering task that needs a better tool.',figure:frame('A dedicated operation fitted between its inputs and result',`
 <g class="diagram-faint"><path d="M24 62H95M24 115H95M24 168H95M265 62H336M265 115H336M265 168H336"/><rect x="24" y="52" width="32" height="20" rx="3"/><rect x="24" y="105" width="32" height="20" rx="3"/><rect x="24" y="158" width="32" height="20" rx="3"/><path d="M303 52v20m-12-20v20m24 33v20m-12 33v20m-12-20v20"/></g>
 <path class="diagram-route" d="M56 115H116M244 115H304"/>
 <rect class="diagram-panel" x="116" y="57" width="128" height="116" rx="5"/>
 <path class="diagram-edge" d="M116 83H244M139 108h20m-20 14h34m-34 14h25M190 109l10 10 18-26"/>
 <path class="diagram-bracket" d="M104 68V45h24m104 0h24v23m0 94v23h-24m-104 0h-24v-23"/>
 <g class="diagram-faint"><path d="M180 20v12m0 166v12"/></g>`)
 },
 {name:'Designed for speed',description:'Repeated steps become reusable operations. More time for the work that needs judgment.',figure:frame('Repeated handoffs give way to one direct operation',`
 <path class="diagram-faint" d="M32 70H80V120H136V70H192V120H248V70H328"/>
 <g class="diagram-faint"><circle cx="32" cy="70" r="4"/><circle cx="80" cy="120" r="4"/><circle cx="136" cy="70" r="4"/><circle cx="192" cy="120" r="4"/><circle cx="248" cy="70" r="4"/><circle cx="328" cy="70" r="4"/></g>
 <path class="diagram-faint" d="M32 82v83m296-83v83" stroke-dasharray="2 5"/>
 <path class="diagram-route speed-route" d="M32 174H328"/>
 <rect class="diagram-panel" x="137" y="153" width="86" height="42" rx="4"/>
 <path class="diagram-edge" d="M158 174h42m-8-8 8 8-8 8"/>
 <circle class="diagram-edge" cx="32" cy="174" r="4"/><circle class="diagram-edge" cx="328" cy="174" r="4"/>`)
 },
 {name:'Built for clarity',description:'Evidence is given structure, so differences, context and the next decision are easier to see.',figure:frame('Separate evidence is aligned into a readable comparison',`
 <g class="diagram-fragments diagram-faint"><path d="M26 55h50m-50 8h31M22 104h58m-58 8h42M32 161h41m-41 8h24"/><path d="M81 59C111 59 105 74 133 74M85 109C111 109 112 115 133 115M78 165C115 165 100 156 133 156"/></g>
 <rect class="diagram-panel" x="133" y="42" width="193" height="146" rx="5"/>
 <path class="diagram-faint" d="M133 64H326M218 64V188M133 95H326M133 136H326M133 177H326"/>
 <path class="diagram-edge" d="M148 54h34m53 0h29M148 78h49m38 0h49M148 119h39m48 0h28M148 160h43m44 0h44"/>
 <rect class="clarity-focus" x="228" y="103" width="89" height="24" rx="2"/>
 <path class="diagram-route" d="m294 113 5 5 9-9"/>`)
 }
];
export const principleSection=()=>`<section class="principles page-width" id="principle" aria-labelledby="principle-heading"><div class="principle-intro" data-reveal><p class="eyebrow">The thinking behind the tools</p><h2 id="principle-heading">Engineering tools should reduce the distance <span>between a problem and a decision.</span></h2></div><div class="principle-grid">${principles.map((p,i)=>`<figure class="principle-figure" data-reveal><div class="principle-drawing">${p.figure}</div><figcaption><span class="principle-number">0${i+1}</span><h3>${p.name}</h3><p>${p.description}</p></figcaption></figure>`).join('')}</div></section>`;
