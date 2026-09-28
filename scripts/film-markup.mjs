export function renderFilm(app, feature, film, region, esc) {
  const name = esc(app.name),
    kind = feature.kind;
  return `<section class="feature instrument-film ${feature.paper ? "film-paper" : ""}" id="${kind}" data-feature="${kind}" data-study-app="${app.id}" data-layout="${film.layout}" data-playback-ms="${film.duration}" data-source-region="${esc(JSON.stringify(region))}" style="--scene-length:${film.length}svh" aria-labelledby="title-${kind}"><div class="feature-stage film-stage">
    <div class="film-meta"><span>${String(app.index).padStart(2, "0")} / 16</span><h2 id="title-${kind}">${name}</h2></div>
    <div class="film-heading"><h3 class="film-statement">${name}.</h3></div>
    <div class="film-view"><figure class="film-capture"><img src="${app.evidence.full}" width="${app.evidence.fullWidth}" height="${app.evidence.fullHeight}" alt="${name}: ${esc(app.evidence.label)}" loading="lazy" decoding="async"><i class="film-source-focus" aria-hidden="true"></i></figure><div class="film-operation ${kind === "surface" ? "topography" : ""}" aria-hidden="true"><canvas></canvas></div></div>
    <div class="film-inspection"><label>${esc(film.inspect)}<input class="film-focus" type="range" min="0" max="100" value="50"></label><output class="film-reading" aria-live="polite"></output>${film.alternate ? `<button class="film-alternate" aria-pressed="false">${esc(film.alternate)}</button>` : ""}</div>
    <div class="film-transport"><button class="study-play" aria-label="Play the ${name} film" aria-pressed="false"><span class="play-symbol" aria-hidden="true"></span> Play</button><label class="study-control"><span class="film-sr">Explore ${name}</span><input type="range" min="0" max="100" value="0" aria-label="Explore the ${name} film"></label><button class="film-original" data-capture="${app.id}">Original ↗</button></div>
    <p class="film-description">${esc(feature.text)} The animation illustrates the operation; it is not a live application result. ${film.beats
      .slice(1, -1)
      .map((b) => esc(b[1]))
      .join(" ")}</p>
  </div></section>`;
}
