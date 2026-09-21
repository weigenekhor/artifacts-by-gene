// Generated from the verified catalogue.
export const apps = [
  {
    "id": "altus-lotviewer",
    "index": 1,
    "name": "Altus LotViewer",
    "category": "Expedition I - Altus",
    "description": "Lot history analysis.",
    "purpose": "Bring process events into one readable history. Align timestamps. Review wafer states. Follow the lot through the work.",
    "headline": "Every event.\nIn context.",
    "evidence": {
      "src": "assets/evidence/altus-lotviewer/detail.webp",
      "full": "assets/evidence/altus-lotviewer/full.webp",
      "width": 1315,
      "height": 490,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Lot events, wafer states and durations"
    },
    "transformation": "Events → history",
    "visualConcept": "history",
    "relationships": [
      "topotracer",
      "spc-pathfinder",
      "gan-met-compiler"
    ]
  },
  {
    "id": "altus-anko-viewer",
    "index": 2,
    "name": "Altus ANKO Viewer",
    "category": "Expedition I - Altus",
    "description": "ANKO schedule retrieval.",
    "purpose": "Bring ANKO schedules into view across the Altus workflow. The next task starts with knowing what is due.",
    "headline": "Know what’s next.",
    "evidence": {
      "src": "assets/evidence/altus-anko-viewer/detail.webp",
      "full": "assets/evidence/altus-anko-viewer/full.webp",
      "width": 1310,
      "height": 630,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Reactor schedules in a common view"
    },
    "transformation": "Schedules → one view",
    "visualConcept": "schedule",
    "relationships": [
      "altus-wafercount",
      "magus-spc-gan",
      "magus-spc-legacy",
      "anko-helper",
      "lt-report-compiler",
      "metria-spc"
    ]
  },
  {
    "id": "altus-wafercount",
    "index": 3,
    "name": "Altus WaferCount",
    "category": "Expedition I - Altus",
    "description": "Chamber usage and wafer counts.",
    "purpose": "Turn wafer counts from equipment logs into a clearer basis for maintenance planning.",
    "headline": "Make usage\nvisible.",
    "evidence": {
      "src": "assets/evidence/altus-wafercount/detail.webp",
      "full": "assets/evidence/altus-wafercount/full.webp",
      "width": 1310,
      "height": 610,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Chamber usage counters"
    },
    "transformation": "Logs → chamber usage",
    "visualConcept": "usage",
    "relationships": [
      "altus-anko-viewer",
      "magus-spc-gan",
      "magus-spc-legacy",
      "anko-helper",
      "lt-report-compiler",
      "metria-spc"
    ]
  },
  {
    "id": "topotracer",
    "index": 4,
    "name": "TopoTracer",
    "category": "Expedition II - Interstice",
    "description": "Contour and topography plots.",
    "purpose": "Turn wafer measurements into contours. Spatial patterns become visible in a way a column of numbers cannot offer.",
    "headline": "See the shape\nof variation.",
    "evidence": {
      "src": "assets/evidence/topotracer/detail.webp",
      "full": "assets/evidence/topotracer/full.webp",
      "width": 1280,
      "height": 570,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Interpolated wafer surface and scale"
    },
    "transformation": "Measurements → contours",
    "visualConcept": "topology",
    "relationships": [
      "altus-lotviewer",
      "spc-pathfinder",
      "gan-met-compiler"
    ]
  },
  {
    "id": "papyrus-reader",
    "index": 5,
    "name": "Papyrus Reader",
    "category": "Expedition II - Interstice",
    "description": "Logical recipe and text comparison.",
    "purpose": "Match equivalent recipe steps, even when their order changes. Keep attention on the parameters that differ.",
    "headline": "Compare meaning.\nNot line numbers.",
    "evidence": {
      "src": "assets/evidence/papyrus-reader/detail.webp",
      "full": "assets/evidence/papyrus-reader/full.webp",
      "width": 1280,
      "height": 315,
      "fullWidth": 1531,
      "fullHeight": 1002,
      "label": "Actual paired recipe panes with marked changes"
    },
    "transformation": "Recipes → logical differences",
    "visualConcept": "comparison",
    "relationships": [
      "gan-xml-assistant"
    ]
  },
  {
    "id": "spc-pathfinder",
    "index": 6,
    "name": "SPC Pathfinder",
    "category": "Expedition II - Interstice",
    "description": "SPC chart finder.",
    "purpose": "Reach the SPC charts you need together, without repeating the same navigation for every parameter.",
    "headline": "Less searching.\nMore seeing.",
    "evidence": {
      "src": "assets/evidence/spc-pathfinder/detail.webp",
      "full": "assets/evidence/spc-pathfinder/full.webp",
      "width": 1310,
      "height": 630,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Grouped chart selection"
    },
    "transformation": "Parameters → charts",
    "visualConcept": "pathfinder",
    "relationships": [
      "altus-lotviewer",
      "topotracer",
      "gan-met-compiler"
    ]
  },
  {
    "id": "gan-met-compiler",
    "index": 7,
    "name": "GaN Met Compiler",
    "category": "Expedition III - GaN EPI",
    "description": "Metrology report compiler.",
    "purpose": "Bring metrology data together. Apply predefined calculations. Produce a consistent report from scattered inputs.",
    "headline": "From measurements\nto a report.",
    "evidence": {
      "src": "assets/evidence/gan-met-compiler/detail.webp",
      "full": "assets/evidence/gan-met-compiler/full.webp",
      "width": 1300,
      "height": 300,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Metrology processing log"
    },
    "transformation": "Measurements → report",
    "visualConcept": "compilation",
    "relationships": [
      "altus-lotviewer",
      "topotracer",
      "spc-pathfinder"
    ]
  },
  {
    "id": "gan-temp-diagnoser",
    "index": 8,
    "name": "GaN Temp Diagnoser",
    "category": "Expedition III - GaN EPI",
    "description": "Temperature drift diagnosis.",
    "purpose": "Use temperature behavior to guide diagnosis and identify the next checks. Give troubleshooting a starting point.",
    "headline": "Follow the drift.\nFind a direction.",
    "evidence": {
      "src": "assets/evidence/gan-temp-diagnoser/detail.webp",
      "full": "assets/evidence/gan-temp-diagnoser/full.webp",
      "width": 675,
      "height": 235,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Diagnostic summary and recommended checks"
    },
    "transformation": "Observations → likely causes",
    "visualConcept": "diagnosis",
    "relationships": [
      "aix-dt-assistant",
      "lt-zone-assistant"
    ]
  },
  {
    "id": "aix-dt-assistant",
    "index": 9,
    "name": "AIX ΔT Assistant",
    "category": "Expedition III - GaN EPI",
    "description": "Baseplate arrangement guidance.",
    "purpose": "Use weight and temperature inputs to guide baseplate arrangements. Put the basis for a decision in view.",
    "headline": "An arrangement\nwith reason.",
    "evidence": {
      "src": "assets/evidence/aix-dt-assistant/detail.webp",
      "full": "assets/evidence/aix-dt-assistant/full.webp",
      "width": 650,
      "height": 720,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Baseplate assignment visualization"
    },
    "transformation": "Offsets → arrangement",
    "visualConcept": "difference",
    "relationships": [
      "gan-temp-diagnoser",
      "lt-zone-assistant"
    ]
  },
  {
    "id": "lt-zone-assistant",
    "index": 10,
    "name": "LT Zone Assistant",
    "category": "Expedition III - GaN EPI",
    "description": "LayTec zone mapping.",
    "purpose": "Map LayTec zones in one spatial view. Understand where each region sits in relation to the whole.",
    "headline": "Every zone.\nA shared view.",
    "evidence": {
      "src": "assets/evidence/lt-zone-assistant/detail.webp",
      "full": "assets/evidence/lt-zone-assistant/full.webp",
      "width": 975,
      "height": 720,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Inner and outer zone geometry"
    },
    "transformation": "Zones → spatial context",
    "visualConcept": "zones",
    "relationships": [
      "gan-temp-diagnoser",
      "aix-dt-assistant"
    ]
  },
  {
    "id": "gan-xml-assistant",
    "index": 11,
    "name": "GaN XML Assistant",
    "category": "Expedition III - GaN EPI",
    "description": "Devices.XML comparison.",
    "purpose": "Compare configurations, settings and constants. Bring differences forward, without losing their context.",
    "headline": "Make changes\nunmistakable.",
    "evidence": {
      "src": "assets/evidence/gan-xml-assistant/detail.webp",
      "full": "assets/evidence/gan-xml-assistant/full.webp",
      "width": 1260,
      "height": 300,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Structured configuration differences"
    },
    "transformation": "Configuration → differences",
    "visualConcept": "configuration",
    "relationships": [
      "papyrus-reader"
    ]
  },
  {
    "id": "magus-spc-gan",
    "index": 12,
    "name": "Magus SPC (GaN)",
    "category": "Expedition IV - Planetfall",
    "description": "GaN SPC release review.",
    "purpose": "Review configured GaN SPC charts and parameter states together. Move from a signal to the context around it.",
    "headline": "Keep the process\nin perspective.",
    "evidence": {
      "src": "assets/evidence/magus-spc-gan/detail.webp",
      "full": "assets/evidence/magus-spc-gan/full.webp",
      "width": 1260,
      "height": 540,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "GaN parameter control charts"
    },
    "transformation": "Charts → review",
    "visualConcept": "observatory",
    "relationships": [
      "altus-anko-viewer",
      "altus-wafercount",
      "magus-spc-legacy",
      "anko-helper",
      "lt-report-compiler",
      "metria-spc"
    ]
  },
  {
    "id": "magus-spc-legacy",
    "index": 13,
    "name": "Magus SPC (Legacy)",
    "category": "Expedition IV - Planetfall",
    "description": "Legacy SPC release review.",
    "purpose": "Bring legacy SPC charts and parameter states into one review environment. Keep established workflows within reach.",
    "headline": "A familiar process.\nA clearer view.",
    "evidence": {
      "src": "assets/evidence/magus-spc-legacy/detail.webp",
      "full": "assets/evidence/magus-spc-legacy/full.webp",
      "width": 1300,
      "height": 465,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Legacy parameter review and statuses"
    },
    "transformation": "Legacy charts → review",
    "visualConcept": "legacy",
    "relationships": [
      "altus-anko-viewer",
      "altus-wafercount",
      "magus-spc-gan",
      "anko-helper",
      "lt-report-compiler",
      "metria-spc"
    ]
  },
  {
    "id": "anko-helper",
    "index": 14,
    "name": "ANKO Helper",
    "category": "Expedition IV - Planetfall",
    "description": "ANKO status and due dates.",
    "purpose": "Put ANKO status and due dates together. See what needs attention before planning what comes next.",
    "headline": "Plan with the\nwhole picture.",
    "evidence": {
      "src": "assets/evidence/anko-helper/detail.webp",
      "full": "assets/evidence/anko-helper/full.webp",
      "width": 1280,
      "height": 430,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Maintenance statuses and due dates"
    },
    "transformation": "Status → schedule",
    "visualConcept": "maintenance",
    "relationships": [
      "altus-anko-viewer",
      "altus-wafercount",
      "magus-spc-gan",
      "magus-spc-legacy",
      "lt-report-compiler",
      "metria-spc"
    ]
  },
  {
    "id": "lt-report-compiler",
    "index": 15,
    "name": "LT Report Compiler",
    "category": "Expedition IV - Planetfall",
    "description": "LayTec report compilation.",
    "purpose": "Assemble LayTec information into an engineering report. Give repeated reporting work a consistent structure.",
    "headline": "Bring the report\ntogether.",
    "evidence": {
      "src": "assets/evidence/lt-report-compiler/detail.webp",
      "full": "assets/evidence/lt-report-compiler/full.webp",
      "width": 1310,
      "height": 205,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Report compilation activity"
    },
    "transformation": "Inputs → report",
    "visualConcept": "report",
    "relationships": [
      "altus-anko-viewer",
      "altus-wafercount",
      "magus-spc-gan",
      "magus-spc-legacy",
      "anko-helper",
      "metria-spc"
    ]
  },
  {
    "id": "metria-spc",
    "index": 16,
    "name": "Metria SPC",
    "category": "Expedition IV - Planetfall",
    "description": "Interactive multi-parameter equipment SPC.",
    "purpose": "Explore equipment parameters through interactive SPC analysis. Bring related signals into the same field of view.",
    "headline": "Signals,\nseen together.",
    "evidence": {
      "src": "assets/evidence/metria-spc/detail.webp",
      "full": "assets/evidence/metria-spc/full.webp",
      "width": 1260,
      "height": 440,
      "fullWidth": 1425,
      "fullHeight": 950,
      "label": "Interactive parameter chart and range overview"
    },
    "transformation": "Parameters → shared visibility",
    "visualConcept": "signals",
    "relationships": [
      "altus-anko-viewer",
      "altus-wafercount",
      "magus-spc-gan",
      "magus-spc-legacy",
      "anko-helper",
      "lt-report-compiler"
    ]
  }
];
export const story = [
  {
    "id": "enter",
    "eyebrow": "An engineering environment",
    "title": "ARTIFACTS",
    "text": "Some engineering problems\nshould only be solved once.",
    "caption": "From a recurring problem to a body of work.",
    "layout": "opening"
  },
  {
    "id": "repetition",
    "eyebrow": "Before the tools",
    "title": "Again.\nAnd again.",
    "text": "A log to read. A recipe to check.\nAnother chart. Another manual step.",
    "caption": "Logs · recipes · measurements · signals · schedules",
    "layout": "left"
  },
  {
    "id": "realisation",
    "eyebrow": "The recurring problem",
    "title": "The problem wasn’t\nthe engineering.",
    "text": "It was doing the same work again.",
    "caption": "Repetition becomes something you can design out.",
    "layout": "statement"
  },
  {
    "id": "one-tool",
    "eyebrow": "A different starting point",
    "title": "One problem.\nOne tool.",
    "text": "Keep the method.\nLet software carry the repetition.",
    "caption": "A useful answer, made reusable.",
    "layout": "left"
  },
  {
    "id": "many",
    "eyebrow": "Then another",
    "title": "One tool became many.\nMany became a system.",
    "text": "ARTIFACTS.",
    "caption": "Sixteen applications. Four Expeditions.",
    "layout": "wide"
  },
  {
    "id": "recipes",
    "eyebrow": "Papyrus Reader / comparison",
    "title": "The order changed.\nDid the meaning?",
    "text": "Two recipes. Equivalent steps.\nDifferent places to look.",
    "caption": "Follow the steps, not their line numbers.",
    "layout": "left",
    "app": "papyrus-reader"
  },
  {
    "id": "comparison",
    "eyebrow": "Papyrus Reader / alignment",
    "title": "Let the differences\nspeak.",
    "text": "Equivalent steps find each other.\nChanged, added and missing values stay visible.",
    "caption": "Logical comparison, independent of line order.",
    "layout": "left",
    "app": "papyrus-reader",
    "proof": true
  },
  {
    "id": "measurements",
    "eyebrow": "TopoTracer / measurements",
    "title": "A set of points.\nA larger picture.",
    "text": "Every measurement has a place.\nThe pattern lives between them.",
    "caption": "The comparison guide becomes a measurement axis.",
    "layout": "left",
    "app": "topotracer"
  },
  {
    "id": "surface",
    "eyebrow": "TopoTracer / interpolation",
    "title": "See the shape\nof variation.",
    "text": "Wafer measurements become a contour map.\nSpatial variation comes into view.",
    "caption": "Samples → interpolation → wafer-scale context",
    "layout": "left",
    "app": "topotracer",
    "proof": true
  },
  {
    "id": "temperature",
    "eyebrow": "GaN Temp Diagnoser / observations",
    "title": "A drift is a signal.\nWhere does it lead?",
    "text": "Temperature behavior provides clues.\nThe next step is knowing what to check.",
    "caption": "A spatial field becomes a diagnostic question.",
    "layout": "left",
    "app": "gan-temp-diagnoser"
  },
  {
    "id": "diagnosis",
    "eyebrow": "GaN Temp Diagnoser / direction",
    "title": "Fewer possibilities.\nA clearer next step.",
    "text": "Observations guide likely causes\nand recommended checks.",
    "caption": "Observed behavior → guided diagnosis",
    "layout": "left",
    "app": "gan-temp-diagnoser",
    "proof": true
  },
  {
    "id": "context",
    "eyebrow": "Metria SPC / shared context",
    "title": "Bring the signals\ninto the same view.",
    "text": "Related parameters. Interactive charts.\nOne place to follow the equipment.",
    "caption": "Individual signals become a shared context.",
    "layout": "left",
    "app": "metria-spc",
    "proof": true
  },
  {
    "id": "environment",
    "eyebrow": "The whole body of work",
    "title": "16 applications.\nOne engineering environment.",
    "text": "Each solves something specific.\nTogether, they are ARTIFACTS.",
    "caption": "Choose an instrument to see its work and related tools.",
    "layout": "map"
  },
  {
    "id": "software",
    "eyebrow": "Inside ARTIFACTS",
    "title": "Real software.\nBuilt for real engineering work.",
    "text": "The interfaces behind the ideas.",
    "caption": "Original software captures. Actual interface detail.",
    "layout": "reel"
  }
];
