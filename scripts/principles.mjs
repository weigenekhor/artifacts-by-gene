// The same evidence, checks and retained structure advance through one shared timeline.
const frame=(title,body)=>`<svg viewBox="0 0 360 250" role="img" aria-label="${title}"><g class="reasoning-field" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
export const principles=[
 {identifier:'01 / FRICTION',name:'Start with the friction.',description:'Every tool begins with something that should work better: a repeated task, a difficult comparison, a hidden dependency, or a decision carrying too much manual effort.',handoff:'Turn recurring reasoning into a system.',figure:frame('Fragments are compared; a recurring discrepancy is located and brought into context',`
 <path class="diagram-faint" d="M0 125H45M300 125H360"/>
 <g class="evidence evidence-a"><rect x="52" y="51" width="66" height="45" rx="3"/><path d="M65 66h38m-38 12h24"/><path class="friction-mark" d="M65 81h18l5-7 7 12 8-8"/></g>
 <g class="evidence evidence-b"><rect x="49" y="148" width="76" height="54" rx="3"/><path d="M63 162h44m-44 12h28m-28 12h36"/></g>
 <path class="diagram-route route-observe route-a" pathLength="1" d="M119 75C148 75 149 109 183 109"/><path class="diagram-route route-observe route-b" pathLength="1" d="M126 172C153 172 148 139 183 139"/>
 <g class="retained-context"><path class="diagram-edge" d="M173 84V70h15m86 0h15v14m0 81v14h-15m-86 0h-15v-14"/><rect class="diagram-panel" x="184" y="87" width="94" height="77" rx="4"/><path class="diagram-edge" d="M199 108h62m-62 16h39m-39 16h48"/></g>
 <rect class="signal signal-compare" x="0" y="0" width="7" height="3" rx="1"/><path class="comparison-match" pathLength="1" d="M201 124h37"/>
 `)
 },
 {identifier:'02 / STRUCTURE',name:'Make the repeatable explicit.',description:'Capture the checks that matter. Automate what does not need human attention. Preserve the context needed for the decisions that do.',handoff:'The work reveals what needs to improve next.',figure:frame('Recurring evidence moves through retained checks and emerges as a consistent structure',`
 <path class="diagram-faint" d="M0 125H66M295 125H360"/>
 <rect class="diagram-shadow" x="82" y="79" width="206" height="116" rx="5"/>
 <rect class="diagram-panel" x="72" y="61" width="206" height="116" rx="5"/>
 <path class="diagram-faint" d="M72 90H278M145 90V177M213 90V177"/>
 <path class="diagram-edge" d="M87 76h36m88 0h10m10 0h10m10 0h10"/>
 <g class="repeated-paths"><path class="repeat-upper" d="M89 114h38m30 0h39m29 0h38"/><path class="repeat-lower" d="M89 150h38m30 0h39m29 0h38"/></g>
 <path class="diagram-route route-structure" pathLength="1" d="M89 133H127M157 133H196M225 133H263"/>
 <g class="check check-a"><circle class="cycle-operation" cx="141" cy="133" r="9"/><path class="check-mark-a" pathLength="1" d="m137 133 3 3 5-6"/></g>
 <g class="check check-b"><circle class="cycle-operation" cx="210" cy="133" r="9"/><path class="check-mark-b" pathLength="1" d="m206 133 3 3 5-6"/></g>

 <rect class="signal structure-packet" width="9" height="3" rx="1"/><g class="normalised-output"><path d="M245 146h17m-17 6h17m-17 6h17"/></g>`)
 },
 {identifier:'03 / REFINEMENT',name:'Refine through the work.',description:'Put the evidence, context, and next action where they can be understood together. Use the tool. Challenge it. Improve it as the process, data, and requirements change.',figure:frame('Use creates evidence, one relationship adjusts, and the improved structure returns to use',`
 <path class="diagram-faint" d="M0 125H65M295 125H360"/>
 <rect class="diagram-shadow" x="79" y="65" width="176" height="114" rx="4"/><path class="diagram-faint" d="M92 84h48m-48 14h78m-78 14h57"/>
 <g class="working-structure"><rect class="diagram-panel" x="104" y="90" width="176" height="114" rx="4"/><path class="diagram-edge" d="M120 108h67M120 139h97m-97 17h77m-77 17h90"/><rect class="clarity-focus" x="235" y="128" width="29" height="56" rx="3"/><path class="resolved-check" pathLength="1" d="m242 150 6 6 9-13"/></g>
 <path class="diagram-route feedback-route" pathLength="1" d="M237 108C290 80 246 34 187 40"/><path class="diagram-route" d="m194 33-8 7 10 4"/>
 <g class="adjustment"><path d="M120 122h60"/><circle cx="156" cy="122" r="3"/></g>

 <circle class="signal signal-feedback" r="2.5"/>
 <path class="evidence-response" pathLength="1" d="M120 173h90"/>`)
 }
];
export const principleSection=()=>`<section class="principles page-width" id="principle" aria-labelledby="principle-heading"><p class="eyebrow">The thinking behind the tools</p><header class="thinking-preface"><div><h2 id="principle-heading">Purpose-built<br>from the work.</h2><p>ARTIFACTS does not begin with features.<br>It begins with something in the work that should be better.</p></div><div class="thinking-intent"><h3><span>Less repetition.</span><br>More room for<br class="intent-break"> engineering judgment.</h3></div></header><div class="thinking-lead"><p>Different problems, brought into one<br>disciplined way of working.</p></div><div class="principle-cycle" data-motion="paused"><svg class="system-spine" aria-hidden="true"><path/></svg><span class="spine-packet" aria-hidden="true"></span><div class="principle-grid">${principles.map((p,i)=>`<figure class="principle-figure" data-reasoning="${i+1}"><div class="principle-drawing">${p.figure}</div><figcaption><p class="reasoning-identifier">${p.identifier}</p><h3>${p.name}</h3><p>${p.description}</p>${p.handoff?`<p class="reasoning-handoff">${p.handoff}</p>`:''}</figcaption></figure>`).join('')}</div></div></section>`;
