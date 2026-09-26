export function renderPapyrus(app, data, escape) {
  const esc = escape;
  const pane = (side) =>
    `<div class="papyrus-pane" data-side="${side}"><div class="papyrus-pane-label"><span>${side ? "Compared" : "Reference"}</span><span>XML / example ${side ? "B" : "A"}</span></div><div class="papyrus-rows">${data.rows.map((r, i) => `<button class="papyrus-row${r.left !== r.right ? " has-difference" : ""}" data-row="${i}" data-key="${r.id}" data-side="${side}" aria-label="${esc(r.node)}, ${r.property}: ${esc(r.left)} in reference; ${esc(r.right)} in comparison" aria-pressed="false" tabindex="-1"><span class="papyrus-line" aria-hidden="true">${String(r.line[side]).padStart(2, "0")}</span><span class="papyrus-node"><i>NODE</i> <span class="papyrus-node-prefix">Waterpanel.</span>${esc(r.node.replace("Waterpanel.", ""))}</span><span class="papyrus-property"><i>PROPERTY</i> ${esc(r.property)}<b>${esc(side ? r.right : r.left)}</b></span><span class="papyrus-row-mark" aria-hidden="true">${r.left !== r.right ? "≠" : "="}</span></button>`).join("")}</div></div>`;
  return `<section class="feature feature-compare papyrus-study" id="compare" data-feature="compare" data-study-app="${esc(app.id)}" data-playback-ms="22000" style="--scene-length:460svh" aria-labelledby="title-compare"><div class="feature-stage papyrus-stage">
    <div class="papyrus-meta"><span>${String(app.index).padStart(2, "0")} / 16</span><h2 id="title-compare">${esc(app.name)}</h2><button class="study-menu" aria-haspopup="dialog" aria-controls="study-picker">Choose an application ↗</button></div>
    <div class="papyrus-heading"><h3 class="papyrus-statement">Papyrus Reader.</h3><p class="papyrus-chapter">Logical recipe and text comparison.</p></div>
    <div class="papyrus-view">
      <figure class="papyrus-capture"><img src="${data.source.image}" width="${data.source.width}" height="${data.source.height}" alt="Papyrus Reader comparing two XML documents in its real paired text panes" loading="lazy" decoding="async"><i class="papyrus-source-focus" aria-hidden="true"></i></figure>
      <div class="papyrus-comparison" aria-label="Illustrative logical comparison of two XML recipe excerpts"><svg class="papyrus-relations" aria-hidden="true"><g>${data.rows.map(() => "<path></path>").join("")}</g><line class="papyrus-register"/><g class="papyrus-match-marks">${data.rows.map(() => '<circle r="2.5"/>').join("")}</g></svg>${pane(0)}${pane(1)}<span class="papyrus-axis" aria-hidden="true">Correspondence</span></div>
    </div>
    <div class="papyrus-inspection"><span class="papyrus-inspection-cue">Inspect a paired property</span><output class="papyrus-reading" aria-live="polite">EnablePrint <b>1 → 0</b></output><div class="papyrus-differences" aria-label="Inspect a changed property">${data.rows
      .filter((r) => r.left !== r.right)
      .map(
        (r) =>
          `<button data-difference="${r.id}" aria-pressed="false">${r.property} <span>${r.left} → ${r.right}</span></button>`,
      )
      .join("")}</div></div>
    <div class="papyrus-bottom"><span class="papyrus-provenance">Actual Papyrus Reader interface</span><button class="papyrus-original" data-capture="papyrus-reader">View original interface ↗</button></div>
    <div class="papyrus-transport"><button class="study-play" aria-label="Play the Papyrus Reader comparison sequence" aria-pressed="false"><span aria-hidden="true">▷</span> Watch sequence</button><label class="study-control"><span class="sr-only">Explore the Papyrus Reader sequence</span><input type="range" min="0" max="100" value="0" aria-label="Explore Papyrus Reader: interface, raw positions, correspondence, differences, return"></label><span class="papyrus-progress-label" aria-hidden="true">01 / Interface</span></div>
    <p class="papyrus-accessible">This illustrative comparison uses named XML structures from Papyrus Reader. In the raw excerpts, corresponding properties occupy different lines. Matching node and property identities aligns them. Category and unchanged severity values agree; EnablePrint changes from 1 to 0 and Severity from 2 to 3. The full original interface opens and closes the sequence. Example values explain the operation and are not results from the displayed capture.</p>
  </div></section>`;
}
