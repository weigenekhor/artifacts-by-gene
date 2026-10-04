import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {esc,icon,nativeShell} from './native-ui.mjs';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
import {principleSection} from './principles.mjs';
const num=n=>String(n).padStart(2,'0');
model.apps.sort((a,b)=>a.order-b.order);
const homeReferences=JSON.parse(await fs.readFile('content/home-reference.json','utf8'));
const image=(capture,name,feature=false)=>`<img src="${capture.base}/1280.webp" srcset="${(capture.sources||[]).map(s=>`${s.src} ${s.width}w`).join(',')}" sizes="${feature?'90vw':'(max-width:760px) 94vw, (max-width:1300px) 46vw, 840px'}" width="${capture.width||10240}" height="${capture.height||5520}" loading="lazy" decoding="async" alt="${esc(name)} — ${esc(capture.caption)}">`;
function gallery(app,index){
 const first=Math.max(0,app.images.findIndex(c=>c.theme==='pentimento')),capture=app.images[first];
 return `<article class="gallery-app${app.featured?' gallery-feature':app.standalone?' gallery-standard-wide':''}" data-gallery-app="${app.id}" data-initial-slide="${first}" id="app-${app.id}" aria-labelledby="app-${app.id}-title"><header><div><span class="app-index">${num(index+1)}</span><h3 id="app-${app.id}-title">${esc(app.name)}</h3></div><button type="button" class="open-capture" data-lightbox aria-label="Enlarge ${esc(app.name)} screenshot" aria-haspopup="dialog" disabled>${icon('expand')}</button></header><button type="button" class="gallery-image" data-lightbox aria-label="Enlarge ${esc(app.name)} screenshot" aria-haspopup="dialog" disabled>${image(capture,app.name,app.featured)}</button><div class="gallery-navigation"><span class="gallery-count" aria-live="off">${num(first+1)} <span>/ ${num(app.images.length)}</span></span><div class="gallery-progress" aria-hidden="true"><span></span></div><button type="button" class="gallery-play" aria-label="Pause ${esc(app.name)} slideshow" aria-pressed="false" disabled>${icon('pause',16)}</button><button type="button" data-previous aria-label="Previous ${esc(app.name)} screenshot" disabled>${icon('back',18)}</button><button type="button" data-next aria-label="Next ${esc(app.name)} screenshot" disabled>${icon('next',18)}</button></div><div class="gallery-caption"><p>${esc(app.purpose)}</p><span data-slide-caption>${esc(capture.caption)}</span></div><noscript><div class="capture-fallback">${app.images.map((c,i)=>`<a href="${c.base}/full.webp">Capture ${i+1}</a>`).join('')}</div></noscript></article>`;
}
for(let i=0;i<model.apps.length;){
 if(model.apps[i].featured){i++;continue;}
 let end=i;while(end<model.apps.length&&!model.apps[end].featured)end++;
 if((end-i)%2)model.apps[end-1].standalone=true;
 i=end;
}
const html=`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Artifacts by Gene</title><meta name="description" content="Explore ARTIFACTS: engineering applications for analysis, diagnosis, comparison and reporting. Developed by Gene (Wei Gene Khor)."><link rel="canonical" href="https://artifactsbygene.com/"><meta name="theme-color" content="#101113"><meta property="og:title" content="Artifacts by Gene"><meta property="og:description" content="Built around real engineering work."><meta property="og:type" content="website"><meta property="og:url" content="https://artifactsbygene.com/"><meta property="og:image" content="https://artifactsbygene.com/assets/social-preview.png"><link rel="icon" type="image/svg+xml" href="assets/brand/artifacts-symbol.svg"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="site.css"><link rel="stylesheet" href="shell.css"><script>document.documentElement.classList.add('js');</script></head>
<body id="top"><a class="skip-link" href="#applications">Skip to applications</a>
<nav class="website-nav page-width" aria-label="Website navigation"><a href="#top" class="website-brand"><img src="assets/brand/artifacts-symbol.svg" width="25" height="25" alt=""><span>ARTIFACTS</span></a><div><a href="#applications">Applications</a><a href="#gene">About</a></div></nav>
<main><section class="hero" aria-labelledby="hero-heading"><div class="hero-intro page-width" data-reveal><p class="eyebrow">ARTIFACTS</p><h1 id="hero-heading">Engineering applications<br class="hero-break"> built around <span>real problems,<br class="hero-break"> real workflows, and real decisions.</span></h1><p class="hero-description">A coherent system of tools for analysis, diagnosis, automation, and engineering workflows.</p></div>${nativeShell(model,homeReferences)}</section>
${principleSection()}
<section class="applications page-width" id="applications" aria-labelledby="collection-heading"><header class="collection-heading" data-reveal><div><p class="eyebrow">The collection</p><h2 id="collection-heading">Applications</h2></div><p><span>${num(model.apps.length)}</span> purpose-built applications</p></header><div class="gallery-grid">${model.apps.map(gallery).join('')}</div></section>
<section class="authorship page-width" id="gene" aria-labelledby="author-name" data-reveal><div class="author-credit"><p class="eyebrow">The person behind ARTIFACTS</p><h2 id="author-name">Gene<span>Wei Gene Khor</span></h2><div class="author-rule" aria-hidden="true"></div><div class="author-links"><a href="mailto:weigenekhor@gmail.com"><span><small>Email</small>weigenekhor@gmail.com</span> ${icon('external',17)}</a><a href="https://www.linkedin.com/in/weigenekhor/" target="_blank" rel="noopener noreferrer"><span><small>Connect</small>LinkedIn</span> ${icon('external',17)}</a></div></div></section>
<footer class="ending page-width"><a href="#top" class="closing-identity"><img src="assets/brand/artifacts-symbol.svg" width="25" height="25" alt=""><span>ARTIFACTS</span></a><p>Built around real engineering work.</p></footer></main>
<dialog class="lightbox" id="capture-viewer" aria-labelledby="viewer-title"><div class="lightbox-bar"><div><h2 id="viewer-title"></h2><p id="viewer-caption"></p></div><div><span id="viewer-count"></span><button type="button" data-viewer-close aria-label="Close image viewer">${icon('close')}</button></div></div><div class="lightbox-stage"><button type="button" data-viewer-prev aria-label="Previous screenshot">${icon('back')}</button><div class="lightbox-image-wrap"><img id="viewer-image" alt=""><span class="image-loading" role="status" hidden>Loading capture…</span></div><button type="button" data-viewer-next aria-label="Next screenshot">${icon('next')}</button></div><div class="lightbox-footer"><span>Original application capture</span><a id="viewer-original" target="_blank" rel="noopener">Full resolution ${icon('external',16)}</a></div></dialog>
<noscript><style>.app-shell,.product-toolbar,.mobile-app-picker{display:none!important}.gallery-navigation button,.open-capture{display:none}.gallery-image{cursor:default}</style><p class="noscript-note page-width">Enable JavaScript to explore the product. All application captures remain available below.</p></noscript>
<script type="application/json" id="artifacts-data">${JSON.stringify(model).replaceAll('<','\\u003c')}</script><script type="module" src="site.js"></script></body></html>`;
let output=html;
for(const file of ['tokens.css','site.css','shell.css','site.js']){
 const hash=createHash('sha256').update(await fs.readFile(file)).digest('hex').slice(0,10);
 output=output.replaceAll(`"${file}"`,`"${file}?v=${hash}"`);
}
await fs.writeFile('index.html',output);
console.log(`Built native ARTIFACTS: ${model.apps.length} applications, ${model.expeditions.length} Expeditions, ${model.apps.reduce((n,a)=>n+a.images.length,0)} screenshots.`);
