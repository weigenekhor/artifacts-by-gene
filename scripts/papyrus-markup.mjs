export function renderPapyrus(app, data, escape) {
  const esc = escape;

  return `<section class="feature feature-compare papyrus-study" id="compare" data-feature="compare" data-study-app="${esc(app.id)}" data-playback-ms="26500" style="--scene-length:480svh" aria-labelledby="title-compare"><div class="feature-stage papyrus-stage">

    <div class="papyrus-meta"><span>${String(app.index).padStart(2, "0")} / 16</span><h2 id="title-compare">${esc(app.name)}</h2><button class="study-menu" aria-haspopup="dialog" aria-controls="study-picker">Index ↗</button></div>

    <div class="papyrus-heading"><h3 class="papyrus-statement">Papyrus Reader.</h3></div>

    <div class="papyrus-view">

      <figure class="papyrus-capture"><img src="${data.source.image}" width="${data.source.width}" height="${data.source.height}" alt="Papyrus Reader in text comparison mode, showing the complete current interface" loading="lazy" decoding="async"><i class="papyrus-source-focus" aria-hidden="true"></i></figure>

      <div class="papyrus-comparison" role="img" aria-label="Illustrative XML identity comparison"><canvas aria-hidden="true"></canvas></div>

    </div>

    <div class="papyrus-inspection"><span class="papyrus-inspection-cue">XML identity mode · illustrative</span><output class="papyrus-reading" aria-live="polite">EnablePrint <b>1 → 0</b></output><div class="papyrus-differences" role="group" aria-label="Inspect a changed property">${data.rows

      .filter((r) => r.left !== r.right)

      .map(
        (r) =>
          `<button data-difference="${r.id}" aria-pressed="false">${r.property} <span>${r.left} → ${r.right}</span></button>`,
      )

      .join("")}</div></div>



    <div class="papyrus-transport"><button class="study-play" aria-label="Play the Papyrus Reader comparison sequence" aria-pressed="false"><span class="play-symbol" aria-hidden="true"></span> Play</button><label class="study-control"><span class="sr-only">Explore the Papyrus Reader sequence</span><input type="range" min="0" max="100" value="0" aria-label="Explore Papyrus Reader: interface, raw positions, correspondence, differences, return"></label><button class="papyrus-original" data-capture="papyrus-reader">View original interface ↗</button></div>

    <p class="papyrus-accessible">This illustrative comparison uses named XML structures from Papyrus Reader. In the raw excerpts, corresponding properties occupy different lines. Matching node and property identities aligns them. Category and unchanged severity values agree; EnablePrint changes from 1 to 0 and Severity from 2 to 3; a later Severity property is absent in the compared document, leaving an explicit empty counterpart. The full original interface opens and closes the sequence. Example values explain the operation and are not results from the displayed capture.</p>

  <noscript><a href="${data.source.image}" target="_blank" rel="noopener">View original interface ↗</a></noscript></div></section>`;
}
