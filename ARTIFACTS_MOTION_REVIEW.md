# ARTIFACTS — motion grounded in the applications

26 September 2026. Source review and proposed cinematic treatment; these sequences are not implemented yet. The approved hero remains unchanged. The collection heading is now **What the work demanded.**

## Review basis

Reviewed the UI wiring and principal parsing, calculation, comparison and output paths of all sixteen application widgets under `C:/Users/Gene/Desktop/Plessey AppVerse/AppVerse/Genepy/widgets`. This was a source review, not a live equipment/database test. No desktop application code was modified or copied into the website.

Several widgets deliberately route to generated demo results in this local edition. Metria's database entry point raises `NotImplementedError`; its file import, sample generation, analysis and inspection code are implemented. Films must use approved demo fixtures and distinguish illustrative geometry from measured output. A successful animation is not evidence of a live integration.

The sixteen-app sequence on the website corresponds to `LEGACY_HOME_GROUPS`. This newer desktop copy also has an eight-app default home. Preserve the user's sixteen-app website order; do not silently substitute that smaller home.

## What the current films get wrong

- LotViewer's important work is wafer-level deposition reconstruction, including interruptions and reruns. A chronological line alone misses the result.
- Altus ANKO Viewer derives renewal dates from identified ANKO history and recipe type. It is not primarily schedule-lane alignment.
- WaferCount reads the latest chamber counter values. Its current event-history expansion implies a historical reconstruction the widget does not provide.
- Pathfinder indexes and dispatches chart shortcuts, including multiple selections. It does not itself calculate the charts depicted in its film.
- LT Zone Assistant makes inner/outer measurement windows and their anchors visible on the susceptor. It does not register two independent coordinate systems.
- Magus GaN and Legacy calculate parameter status from configured limits. The current vague review-field and format-normalisation metaphors conceal that logic. Legacy is not a file-format conversion tool.
- ANKO Helper derives status before calculating the next due date. A generic maintenance timeline skips the consequential part.
- Metria supports rule evaluation, linked inspection, pinning, common ranges and equipment comparison. The film currently stops at aligned charts.

## Film direction

The subject of each film is the operation that earns the application's existence. Each sequence gets a distinct composition, camera route and decisive event. Preserve a brief complete real-interface opening and a complete uncropped return. The interpretation expands from the corresponding source region; it does not pretend to be a new feature of the application.

Use depth to separate evidence, reference and result. Use movement to reveal correspondence, calculation, exclusion or causation. Hold the decisive result long enough to inspect. Target roughly 18–24 seconds of authored action, with a separate user-controlled inspection interval rather than long idle playback. Native scroll remains reversible. These are editorial chapters, not invented automated connections between applications.

### 01 — Altus LotViewer: reconstruct the wafer

**Verified:** `parser_widget.py:42`, `:431`, `:518`, `:691`. Parses batch/recipe/chamber context, deposition starts and ends, error recovery and reruns. Produces per-wafer deposition status and duration. The parser distinguishes complete five-deposition sequences, partial, missing and excessive deposition counts.

**Film:** Start very close to one wafer's interrupted path. Process-start and process-end marks appear on separate depth planes. Matching wafer identity brings them together. Pull back to reveal several wafers, each with five potential deposition positions. An interruption breaks one sequence; a rerun visibly reconnects the affected wafer instead of changing every wafer. The completed, partial and excessive histories become distinguishable through filled, empty and additional positions. Only then show duration.

**Decisive image:** One lot resolves into individual wafer histories, with the exceptional wafer still visible in context. A rerun has an understandable consequence.

**Inspection:** Select a wafer to retrace its contributing events. Do not imply the schematic layer count measures physical film thickness.

### 02 — Altus ANKO Viewer: find the event that starts the clock

**Verified:** `altusanko_widget.py:882`, `:1128`, `:1225`. Identifies relevant history and recipe types, associates chambers, derives the next ANKO date and compares it with the current date. Some load-lock checks have scheduled weekdays. The local UI also includes generated demo schedules.

**Film:** A shallow stack of dated history entries passes the camera. Irrelevant entries recede; the relevant ANKO event remains attached to its chamber. Its recipe identity selects the applicable interval. That interval physically extends from the event to a due marker. Pull back to see different chambers with differently positioned due dates. A quiet present-time plane makes overdue, today and upcoming legible.

**Decisive image:** The due date is visibly derived from a source event, not an unexplained point on a timeline.

**Inspection:** Choose a chamber to reveal the originating event and interval. Keep recipe-based renewal separate from weekday checks.

### 03 — Altus WaferCount: read the chamber, not the noise

**Verified:** `wafercount_widget.py:49`, `:374`, `:443`, `:449`. The retained file-processing path selects the latest `.pdsf`, extracts the configured A/B counter fields and fills per-chamber gauges with configured display maxima. The current button path generates demo values.

**Film:** Several equipment-record surfaces enter as a restrained stack. The newest record moves into focus. Two counter positions detach from that record and settle into paired chamber instruments. The camera travels sideways through the equipment set, revealing markedly different loading levels. One chamber approaches the top of its configured gauge and holds attention.

**Decisive image:** A pair of values buried in a machine record becomes immediately legible chamber loading.

**Inspection:** Select a chamber to expose its source counter and scale. Do not invent event-by-event histories, predicted maintenance dates or a physical wafer stack representing unverified totals.

### 04 — TopoTracer: a measurement has a place

**Verified:** `topotracer_widget.py:455`, `:1466`, `:1492`. Coordinates and values feed multiquadric radial-basis interpolation, a wafer mask, surface/map views, radial means, horizontal/vertical centre profiles and a distribution.

**Film:** Preserve the strong wafer material. Begin at a single measured location, then reveal the other samples and their spatial positions. Lift the interpolated surface between them while keeping the original samples distinguishable. Rotate toward a plan view; the same surface becomes a filled map. A centre section rises from the field as its corresponding profile. A radial sweep can then explain the radial mean, one view at a time.

**Decisive image:** The surface, map and section are visibly different views of the same values.

**Inspection:** Orbit gently; switch centre profile or radial view. The changing height is a plotted parameter, not necessarily physical wafer topography. Use actual centre sections for the app representation; label any freely movable website section as an explanatory interaction.

### 05 — Papyrus Reader: preserve meaning through rearrangement

**Verified:** `xml_widget.py:1071`. XML comparison matches named NODE/DEVICE blocks and named properties, reveals changed/added/missing content and can suppress unchanged blocks. Other document/recipe modes use different comparison paths.

**Film:** Keep the paired-comparison concept. Two XML documents stand in slightly separated depth planes. Their order differs. Positional guides fail visibly, then named identities find their counterparts. The camera moves through a single matched block; unchanged properties become quiet while one changed value remains between its two contexts. Pull back to reveal an added or missing property without losing the reference.

**Decisive image:** Order changes, but correspondence remains attached to identity.

**Inspection:** Scrub paired properties. Present this as the XML mode; do not claim arbitrary recipe steps are semantically understood in every supported format.

### 06 — SPC Pathfinder: gather the charts you came for

**Verified:** `path_widget.py:461`, `:533`, `:603`, `:758`, `:807`. Loads a chart-link index, filters mainframe/type/parameter, supports range and multiple selection, and sends requests to selected links.

**Film:** An expansive, ordered index extends into depth. A mainframe filter removes irrelevant branches; a parameter search brings a small set of entries to the same focal plane. Select several—not just one. Their routes leave the index together in one coordinated dispatch. End by registering those selections back to the real Pathfinder interface.

**Decisive image:** Several precise destinations are reached from one selection, without repeatedly navigating the index.

**Inspection:** Change the filter or selection set. Do not simulate SPC calculations or depict this widget as a chart-rendering engine. If destination imagery is used later, it must be an approved real chart and identified as an external destination.

### 07 — GaN Met Compiler: build the report from its measurements

**Verified:** `metro_widget.py:505`, `:718`, `:2773`, `:3331`, `:4870`, `:5475`. Handles PL/Plato, LayTec, XRR and XRD inputs, grouped values, configurable calculations/specification tables, plots and workbook generation/append.

**Film:** Start inside one measurement group. Pull back to expose four different source structures with a shared group/slot relationship. Do not send anonymous dots down four pipes. Actual fields move to their corresponding report regions. A small group of values resolves into its configured mean/uniformity; its chart grows directly from those values. Workbook sheets settle into an ordered document while retaining source identity.

**Decisive image:** The report's organisation and calculations emerge from identifiable measurements.

**Inspection:** Select one output region to retrace its inputs. A labelled illustrative fixture may reproduce a verified configured calculation; no invented yield or saved-time metrics.

### 08 — GaN Temp Diagnoser: the same symptom can mean different things

**Verified:** `pyra.py:2117`, `:2140`, `:2168`, `:2199`. Matches selected process/clean observations against paired diagnostic-master rows. Guidance begins with Process TFB Correction, then Process Ceiling Temperature and Source, followed by Clean EpiTrueTemp and Clean Ceiling Temperature. Results include likely root causes and recommended checks; a match does not prove a physical cause.

**Film:** Replace the generic branching web with a restrained reactor section and two distinct observation histories: process and clean. A process TFB symptom appears first. Add the ceiling-temperature observation; several interpretations remain plausible. The ceiling source changes which part of the instrument deserves attention. The clean observations provide the discriminating context. Earlier possibilities withdraw only when the selected observations exclude them. The final candidate components remain attached to recommended checks.

**Decisive image:** Similar-looking process symptoms become distinguishable when the clean context arrives.

**Inspection:** Change one supported observation and watch the applicable case change. Drive the demonstrated case from the real diagnostic master; do not invent sensor locations, a physical root cause or universal three-check ending.

### 09 — AIX ΔT Assistant: make the exchange make sense

**Verified:** `dt.py:1460`, `:1744`, `:1900`. Supports weight-based initial assignment and temperature-offset reassignment. Weight mode ranks heavier plates against colder bare pockets; temperature mode subtracts bare-pocket temperature from with-plate temperature and evaluates a new assignment. It also has baseline/outlier/no-action checks.

**Film:** Preserve the BP3/BP5 exchange in the existing illustrated case, but earn it. Start with the bare-pocket temperature distribution. Introduce the actual selected mode: either plate-weight ranking or measured thermal offsets. Trace why the two selected positions are mismatched. Lift only the selected plates; the original seats remain faintly visible. Exchange on separated depth paths, seat and settle.

**Decisive image:** The visitor understands why those plates move, rather than merely admiring a swap.

**Inspection:** Recall original/reassigned positions. Show computed ΔT improvement only for a verified temperature-mode fixture; do not infer a numerical improvement from weights. Keep “no useful reassignment” as a legitimate alternate outcome.

### 10 — LT Zone Assistant: show where the measurement is taken

**Verified:** `laytec.py:1270`, `:1410`, `:2277`, `:2360`. A five-slot susceptor, separate inner/outer anchor selection, inner half-angle and outer minimum/maximum angular windows. The current website's two-space registration metaphor is incorrect.

**Film:** A deliberately composed five-wafer susceptor emerges at an oblique angle. Show the angular sampling path. Select the inner anchor: its symmetric window locates a short part of the path. Select the outer anchor: two separated outer windows appear. Slowly advance the assembly so the visitor sees which wafer regions pass through those windows. Finish overhead with the physical relationship unmistakable.

**Decisive image:** Abstract angle settings become visible measurement locations on the wafers.

**Inspection:** Adjust inner width, outer bounds and anchors; the sampled regions respond. Do not invent temperature fields, optical beam positions or coordinate registration.

### 11 — GaN XML Assistant: find the changed setting and its address

**Verified:** `xmlll_widget.py:57`, `:116`, `:368`, `:1564`. Named NODE/DEVICE and PROPERTY comparisons include additions, removals, attributes and changed values. Normalisation treats supported boolean equivalents consistently. Output is a navigable, exportable difference report.

**Film:** Begin with a pair of device structures at architectural scale. Match named blocks before opening their properties. Equivalent boolean representations settle as equal rather than flashing a false difference. Unchanged blocks close. One changed setting remains with its full device/block/property address. That address folds directly into the corresponding report entry.

**Decisive image:** A small meaningful change remains visible inside its exact structural context.

**Inspection:** Move among changed, added and removed entries. Keep the hierarchy faithful to the implemented NODE/DEVICE/PROPERTY structure; do not invent a general recursive dependency analyser.

### 12 — Magus SPC (GaN): show the basis of the status

**Verified:** `dnd_widget.py:2770`, `:2827`, `:2935`, `:4634`, `:8153`. Builds chart/parameter summaries, groups sample context, evaluates mean/sigma/range/raw checks where configured, identifies failure reasons and reports release-critical chart coverage. Final output requests review.

**Film:** Move along actual grouped sample structure. One apparently ordinary mean trace draws attention. Separate its mean, spread/range and underlying raw observations in shallow depth. A selected raw observation or configured statistic crosses its applicable boundary. The failure reason remains attached to that evidence. Pull back into the review field: routine charts quiet down while the failed release-critical item and coverage remain legible.

**Decisive image:** A status is explained by a specific check, not painted onto a chart.

**Inspection:** Select the check to see its contributing points. Use a verified fixture so a passing mean/failing raw case is internally consistent. The film may show calculated pass/fail; it must not imply autonomous equipment release.

### 13 — Magus SPC (Legacy): the review window matters

**Verified:** `dnd2_widget.py:291`, `:2391`, `:2685`, `:2844`, `:2952`, `:8259`. Uses legacy equipment/channel configuration and a configured recent-group count for checks. It shares much of the GaN status engine; it is not a normaliser of heterogeneous source files.

**Film:** Give this film a longitudinal composition rather than another chart field. Pass through earlier sample groups toward the recent review population. A bracket gathers exactly the configured number of groups. Older excursions remain in history but are visibly outside the current review window. The retained groups resolve into parameter checks and a named reason/status. Pull back just far enough to show both the decision population and its history.

**Decisive image:** The visitor sees precisely which samples the current review is based on.

**Inspection:** Select a parameter and inspect the retained population. The visual distinction is editorial emphasis on a verified configuration difference, not a claim of an unrelated algorithm.

### 14 — ANKO Helper: a date must be earned

**Verified:** `ankohelper_widget.py:703`, `:1020`, `:1121`, `:1136`, `:1241`. Evaluates configured parameter checks and derives the next ANKO date from the last sample date plus its cycle only when the checks pass. Failed or missing results do not receive the same valid next-date path.

**Film:** Begin with a reactor and its relevant checks, not a calendar. Reveal the latest eligible sample and its mean/spread/raw evidence. On a passing case, the configured interval extends from the sample date to the renewal date. A failing case remains attached to the offending parameter and does not produce a reassuring date. Only now introduce the current-time plane and show urgency across reactors.

**Decisive image:** Status determines whether there is a usable next date.

**Inspection:** Select the result to expose the parameter evidence and date calculation. This makes it distinct from Altus ANKO Viewer's recipe/history-based dates.

### 15 — LT Report Compiler: keep the context as the format changes

**Verified:** `sapsap.py:206`, `:261`, `:391`, `:568`. Parses HTML or pipe text using a workbook-defined schema, carries step/zone/analysis context, maps wavelength and statistics, sorts output and appends matching columns beneath existing workbook data while preserving formatting.

**Film:** An HTML report opens in close-up around a few readable rows. A value looks isolated until the inherited step, satellite/zone and analysis context locks to it. The schema establishes destination columns. Several contextualised values become a structured output row. Travel along the header alignment to the workbook, where the new rows occupy the continuation beneath existing data. Existing rows stay physically still.

**Decisive image:** The data changes format without losing what each value belongs to.

**Inspection:** Select a destination cell to reveal its report context and mapping. This is substantially more than moving a generic row between two tables.

### 16 — Metria SPC: carry the investigation across every trace

**Verified:** `plessey_spc_widget.py:829`, `:870`, `:881`, `:910`, `:2364`, `:6414`, `:6852`, `:6862`, `:6956`, `:6986`. File/sample data, multiple parameters, configurable SPC rules and limits, capability, common ranges, linked hover, identity-aware pinning with explicit nearest-time fallback, and compatible equipment comparisons. Database access is unconfigured in this source copy.

**Film:** Start with one suspicious point. Select it. Related traces come into view already retaining that investigation context. Pin the point; matching identities register across the field. Open a shared interval, and every chart expands around it together. One trace reveals a run or trend rule; another provides contemporaneous context. Pull back to the aligned multi-parameter environment with the selected evidence still held.

**Decisive image:** The investigation stays intact while the field of evidence expands.

**Inspection:** Linked cursor, interval selection and one pinned observation. An identity match must look different from nearest-time correspondence. A shared time does not establish a shared wafer or a causal relationship. This is the final film because it supports sustained examination, not because it has the most moving lines.

## Origin proposal — the result leaves; the reasoning stays

### Why the current version feels weak

`js/starting-over.js` draws four small motifs in a mainly flat coordinate field. Their relationships remain a four-part arrangement through most beats. Retention is represented chiefly by rectangular outlines. The handoff interpolates those outlines toward `collectionPosition()`, then a separate DOM collection supplies the interface planes. Matching positions helps, but does not create the perception of one object acquiring depth and becoming software. The viewer sees a diagram being rearranged before a new visual system takes over.

### One continuous shot with a consequential event

Keep the approved opening and the three existing statements. Replace the origin's device and camera choreography. The drama is the loss of useful reasoning, then the moment that loss stops.

1. **Enter through the approved hero.** At its existing exit, carry one illuminated registration element into the next scene. The camera follows it into a pale working space; the dark-to-light change is a continuous change of exposure and surroundings. Do not rebuild the first-screen composition.
2. **Reconstruct one task at close range.** Evidence has readable roles—an observation, its reference, an interval, a paired sequence—but no application names or invented machine records. Correspondence is physically missing. A reference arrives, observations register, and the relation becomes understandable. The camera stays with a single act of reasoning rather than surveying four icons. “The answer was only part of the work.”
3. **Lose the work.** The resolved answer moves away. The arrangement supporting it clears too. Hold a deliberate absence. Different evidence arrives, and the same expensive camera/registration movement begins again. The visual rhyme should be recognisable before “Again.” appears. Use a short recurrence, not a second full-length explanation.
4. **Break the recurrence.** At the point where the supporting structure previously disappeared, it holds its position. New evidence moves through the retained relation. It fits, compares and produces a result without reconstructing the relation. The camera moves around the persistent structure for the first time; its depth becomes clear. “Good reasoning should outlive the task.”
5. **Give the retained operation working form.** Inputs enter, a state changes, an output departs; the structure survives. Additional distinct operations take positions behind it, one at a time. These are bounded working surfaces, not connected hardware blocks or an invented app-to-app data pipeline. The field becomes ordered through use rather than by decorative multiplication.
6. **Cross into the real software without a cut.** The retained foreground surface turns toward the viewer as the ARTIFACTS homepage resolves on that same plane. Surface dimensions, perspective, edge, position and camera all persist. Its shadowed reverse introduces the darker environment. The camera pulls back, the homepage recedes, and the actual application planes resolve progressively into the surrounding retained positions. “What the work demanded.” lands after the software is recognisable. Continue to the first film with one plane advancing into the full-interface view.

### How the transition earns its impact

The homepage is the optical bridge. Do not fade out sixteen outline rectangles and fade in sixteen screenshots. Retain one dominant surface through both representations and reveal the collection from that surface's depth. There must be a moment of recognition: the object we watched become durable is now real software. The pullback supplies scale; the smaller app labels remain quiet. No particle explosion, orbiting catalogue or generic tunnel is required.

### Construction constraints for the next pass

- Use one scene coordinate system and camera projection for the origin's final surfaces and collection entry. Reuse object identities across that boundary. If the DOM owns readable screens, project their transforms from the same camera rather than running a separate arrival animation.
- Reuse the existing shared render clock and material renderer where useful. One camera-led scene does not require a new renderer for every film.
- Stage anticipation, action and a short settle; do not achieve drama by slowing everything. A useful target is 25–32 seconds at authored playback speed, but native scroll remains direct and freely reversible.
- Let dominant silhouettes change: macro evidence, a registered task, absence, retained structure, deep working field, complete software collection.
- Mobile follows the same causal events with fewer simultaneous evidence objects and a shallower camera route. Reduced motion presents reconstruction, retained reasoning and the real collection in a clear reading order.
- Do not repeat the thesis in extra copy. Do not turn source-code discoveries into dense visitor-facing documentation.
- The approved hero and exact Gene wording remain protected. No new motion has been implemented as part of this review; the next implementation should follow the functional corrections above instead of the older metaphor list.
