// Generated from content/apps.json.
export const apps = [
  {
    "id": "altus-lotviewer",
    "name": "Altus LotViewer",
    "index": 1,
    "category": "Expedition I - Altus",
    "workflow": "observe",
    "purpose": "Parse lot histories, align timestamps and review wafer states.",
    "visualConcept": "history",
    "shortNarrative": "Process events become a readable history.",
    "transformation": "Events → history",
    "accent": "#d89b75",
    "relationships": [
      "topotracer",
      "spc-pathfinder",
      "gan-met-compiler"
    ]
  },
  {
    "id": "altus-anko-viewer",
    "name": "Altus ANKO Viewer",
    "index": 2,
    "category": "Expedition I - Altus",
    "workflow": "coordinate",
    "purpose": "Retrieve ANKO schedules across the Altus workflow.",
    "visualConcept": "schedule",
    "shortNarrative": "Schedules become visible together.",
    "transformation": "Schedules → one view",
    "accent": "#d89b75",
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
    "name": "Altus WaferCount",
    "index": 3,
    "category": "Expedition I - Altus",
    "workflow": "coordinate",
    "purpose": "Aggregate wafer counts from logs for maintenance planning.",
    "visualConcept": "usage",
    "shortNarrative": "Chamber usage becomes visible together.",
    "transformation": "Logs → chamber usage",
    "accent": "#d89b75",
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
    "name": "TopoTracer",
    "index": 4,
    "category": "Expedition II - Interstice",
    "workflow": "observe",
    "purpose": "Reveal spatial non-uniformity with wafer-level contour plots.",
    "visualConcept": "topology",
    "shortNarrative": "Measurements become a surface.",
    "transformation": "Measurements → contours",
    "accent": "#d89b75",
    "relationships": [
      "altus-lotviewer",
      "spc-pathfinder",
      "gan-met-compiler"
    ]
  },
  {
    "id": "papyrus-reader",
    "name": "Papyrus Reader",
    "index": 5,
    "category": "Expedition II - Interstice",
    "workflow": "compare",
    "purpose": "Match equivalent recipe steps and reveal parameter differences independently of line order.",
    "visualConcept": "comparison",
    "shortNarrative": "Order changes. Meaning stays aligned.",
    "transformation": "Recipes → logical differences",
    "accent": "#d89b75",
    "relationships": [
      "gan-xml-assistant"
    ]
  },
  {
    "id": "spc-pathfinder",
    "name": "SPC Pathfinder",
    "index": 6,
    "category": "Expedition II - Interstice",
    "workflow": "observe",
    "purpose": "Reach SPC charts directly and open multiple charts without repeated navigation.",
    "visualConcept": "pathfinder",
    "shortNarrative": "The chart is one connection away.",
    "transformation": "Parameters → charts",
    "accent": "#d89b75",
    "relationships": [
      "altus-lotviewer",
      "topotracer",
      "gan-met-compiler"
    ]
  },
  {
    "id": "gan-met-compiler",
    "name": "GaN Met Compiler",
    "index": 7,
    "category": "Expedition III - GaN EPI",
    "workflow": "observe",
    "purpose": "Compile metrology data with predefined calculations into consistent reports.",
    "visualConcept": "compilation",
    "shortNarrative": "Raw measurements become usable information.",
    "transformation": "Measurements → report",
    "accent": "#d89b75",
    "relationships": [
      "altus-lotviewer",
      "topotracer",
      "spc-pathfinder"
    ]
  },
  {
    "id": "gan-temp-diagnoser",
    "name": "GaN Temp Diagnoser",
    "index": 8,
    "category": "Expedition III - GaN EPI",
    "workflow": "diagnose",
    "purpose": "Use observed temperature behaviour to guide drift diagnosis and recommendations.",
    "visualConcept": "diagnosis",
    "shortNarrative": "Behaviour narrows the possibilities.",
    "transformation": "Observations → likely causes",
    "accent": "#d89b75",
    "relationships": [
      "aix-dt-assistant",
      "lt-zone-assistant"
    ]
  },
  {
    "id": "aix-dt-assistant",
    "name": "AIX ΔT Assistant",
    "index": 9,
    "category": "Expedition III - GaN EPI",
    "workflow": "diagnose",
    "purpose": "Compare input temperatures and guide baseplate arrangements.",
    "visualConcept": "difference",
    "shortNarrative": "Temperature differences become an arrangement.",
    "transformation": "Offsets → arrangement",
    "accent": "#d89b75",
    "relationships": [
      "gan-temp-diagnoser",
      "lt-zone-assistant"
    ]
  },
  {
    "id": "lt-zone-assistant",
    "name": "LT Zone Assistant",
    "index": 10,
    "category": "Expedition III - GaN EPI",
    "workflow": "diagnose",
    "purpose": "Map LayTec zones in a shared spatial view.",
    "visualConcept": "zones",
    "shortNarrative": "See the relationship between zones.",
    "transformation": "Zones → spatial context",
    "accent": "#d89b75",
    "relationships": [
      "gan-temp-diagnoser",
      "aix-dt-assistant"
    ]
  },
  {
    "id": "gan-xml-assistant",
    "name": "GaN XML Assistant",
    "index": 11,
    "category": "Expedition III - GaN EPI",
    "workflow": "compare",
    "purpose": "Compare configuration files and highlight changes in settings and constants.",
    "visualConcept": "configuration",
    "shortNarrative": "Differences emerge from structure.",
    "transformation": "Configuration → differences",
    "accent": "#d89b75",
    "relationships": [
      "papyrus-reader"
    ]
  },
  {
    "id": "magus-spc-gan",
    "name": "Magus SPC (GaN)",
    "index": 12,
    "category": "Expedition IV - Planetfall",
    "workflow": "coordinate",
    "purpose": "Review configured GaN SPC charts and their parameter states together.",
    "visualConcept": "observatory",
    "shortNarrative": "Separate charts become a shared view.",
    "transformation": "Charts → review",
    "accent": "#d89b75",
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
    "name": "Magus SPC (Legacy)",
    "index": 13,
    "category": "Expedition IV - Planetfall",
    "workflow": "coordinate",
    "purpose": "Review legacy SPC charts and parameter states in one workflow.",
    "visualConcept": "legacy",
    "shortNarrative": "Legacy monitoring, brought together.",
    "transformation": "Legacy charts → review",
    "accent": "#d89b75",
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
    "name": "ANKO Helper",
    "index": 14,
    "category": "Expedition IV - Planetfall",
    "workflow": "coordinate",
    "purpose": "Bring ANKO status and due dates into one view for planning.",
    "visualConcept": "maintenance",
    "shortNarrative": "Upcoming work becomes visible.",
    "transformation": "Status → schedule",
    "accent": "#d89b75",
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
    "name": "LT Report Compiler",
    "index": 15,
    "category": "Expedition IV - Planetfall",
    "workflow": "coordinate",
    "purpose": "Compile LayTec information into engineering reports.",
    "visualConcept": "report",
    "shortNarrative": "Fragments resolve into an output.",
    "transformation": "Inputs → report",
    "accent": "#d89b75",
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
    "name": "Metria SPC",
    "index": 16,
    "category": "Expedition IV - Planetfall",
    "workflow": "coordinate",
    "purpose": "Explore multiple equipment parameters with interactive SPC analysis.",
    "visualConcept": "signals",
    "shortNarrative": "Signals become a common field of view.",
    "transformation": "Parameters → shared visibility",
    "accent": "#d89b75",
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
