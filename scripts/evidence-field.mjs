// Schematic evidence, deliberately independent of application interfaces or claims.
export function evidenceField() {
  const labels = [
    "Process trace",
    "Recipe revision",
    "Run context",
    "Measurement field",
    "Investigation",
    "Report structure",
  ];
  const drawings = [
    '<path class="ev-reference" d="M0 105H210M0 25V105M0 70C25 70 35 28 65 43S105 92 135 55S180 45 210 60"/><path class="ev-accent" d="M0 76C25 76 35 34 65 49S105 98 135 61S180 51 210 66"/><text y="130">reference / observed</text>',
    [0, 1, 2, 3]
      .map(
        (i) =>
          '<path d="M0 ' +
          (35 + i * 23) +
          "H" +
          [130, 190, 155, 175][i] +
          '"/><text x="0" y="' +
          (29 + i * 23) +
          '">0' +
          (i + 1) +
          "</text>",
      )
      .join("") +
      '<path class="ev-accent" d="M162 69H210M186 60L195 69 186 78"/><text y="140">step / change / consequence</text>',
    '<path d="M0 75H210"/>' +
      [0, 1, 2, 3, 4]
        .map(
          (i) =>
            '<circle cx="' +
            i * 50 +
            '" cy="75" r="3"/><path d="M' +
            i * 50 +
            " 57V" +
            (92 + (i % 2) * 12) +
            '"/>',
        )
        .join("") +
      '<text y="40">RUN / EVENT / REVIEW</text><text y="130">context reconstructed</text>',
    '<ellipse cx="105" cy="72" rx="89" ry="49"/><path d="M16 72H194M105 23V121"/>' +
      Array.from(
        { length: 15 },
        (_, i) =>
          '<circle cx="' +
          (45 + (i % 5) * 30) +
          '" cy="' +
          (45 + Math.floor(i / 5) * 27) +
          '" r="2"/>',
      ).join("") +
      '<text y="146">position / variation</text>',
    '<text y="40">observation → question</text><path d="M0 54H190M0 94H155M0 134H170"/><text y="80">reference → comparison</text><text y="120">check → evidence</text><path class="ev-accent" d="M199 84L206 91 220 72"/>',
    '<text y="35">finding / supporting evidence</text><path d="M0 50H210M0 73H165M0 86H187M0 109H145M0 122H200"/><text y="148">conclusion / retained context</text>',
  ];
  const fragment = (i) =>
    '<text class="ev-title" y="0">' + labels[i] + "</text>" + drawings[i];
  return (
    '<svg class="evidence-svg" viewBox="0 0 800 680" fill="none" xmlns="http://www.w3.org/2000/svg"><g class="ev-links"><path d="M145 290H745V465H45V640H650" pathLength="1"/><path class="ev-return" d="M650 640H765V105H45V290H145" pathLength="1"/></g>' +
    labels
      .map(
        (_, i) =>
          '<g class="ev-fragment" data-fragment="' +
          i +
          '"><g class="ev-echo">' +
          [1, 2]
            .map(
              (n) =>
                '<g transform="translate(' +
                n * 13 +
                " " +
                -n * 18 +
                ')">' +
                drawings[i].replace(/<text[\s\S]*?<\/text>/g, "") +
                "</g>",
            )
            .join("") +
          "</g>" +
          fragment(i) +
          "</g>",
      )
      .join("") +
    '<g class="ev-method"><text x="60" y="70">RECONSTRUCT</text><text x="320" y="70">COMPARE / CHECK</text><text x="595" y="70">RETAIN</text><path d="M60 90H720"/></g><g class="ev-resolution"><text x="400" y="305" text-anchor="middle">ARTIFACTS</text><text x="400" y="343" text-anchor="middle">Engineering methods. Given working form.</text></g></svg>'
  );
}
