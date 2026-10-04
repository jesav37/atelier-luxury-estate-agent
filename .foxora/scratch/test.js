const { makeFrame, composeFinalCut } = require("./out/frames.js");
const base = { shots:["slow cinematic push"], palette:{ink:"#0a0a0a",bone:"#f5f2ec",brass:"#b89b72"}, script:"A slow dolly across the glowing facade at dusk, the pool mirroring brass light.", task:"establish" };
const mk = (n,name,time) => makeFrame({ ...base, n, name, time, duration:8, model:"cinematic", brief:"Palm Crest dusk", credits:5 }, "Palm Crest Villa", "9:16");
const scenes = [
  { ...base, n:1, name:"Golden Hour Exterior", time:"00:00", duration:8, model:"cinematic", brief:"x", credits:5, status:"done", output: mk(1,"Golden Hour Exterior","00:00") },
  { ...base, n:2, name:"Interior Reveal", time:"00:08", duration:8, model:"cinematic", brief:"x", credits:5, status:"done", output: mk(2,"Interior Reveal","00:08") },
];
const cut = composeFinalCut(scenes, "Palm Crest Villa", "9:16");
console.log("svg length:", cut.svg.length);
console.log("opens <svg>, closes </svg>:", cut.svg.startsWith("<svg") && cut.svg.endsWith("</svg>"));
console.log("embeds scene1:", cut.svg.includes("Golden Hour"), "| scene2:", cut.svg.includes("Interior Reveal"));
console.log("manifest scenes:", cut.manifest.sequences.length);
require("fs").writeFileSync("final-cut.svg", cut.svg);
require("fs").writeFileSync("final-cut.json", JSON.stringify(cut.manifest,null,2));
console.log("wrote final-cut.svg + final-cut.json");
