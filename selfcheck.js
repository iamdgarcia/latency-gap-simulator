// Self-check: extract window.GapSim (pure compute core) from index.html and assert
// hand-computed preset totals + slider propagation. Run: node selfcheck.js
const fs = require("fs");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");

// pull the IIFE block between "window.GapSim = (() => {" and the matching "})();"
const start = html.indexOf("window.GapSim = (() => {");
const end = html.indexOf("})();", start);
if (start < 0 || end < 0) { console.error("FAIL: GapSim core not found in index.html"); process.exit(1); }
const core = html.slice(start, end + 5);
const window = {};                       // node has no window; core assigns into it
new Function("window", core + "; return window.GapSim;")(window);
const GapSim = window.GapSim;

let fails = 0;
const check = (name, got, want) => {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: got ${got}, want ${want}`);
};

// --- hand-computed cases -----------------------------------------------------
// stages = tail(160) + hangover + minSpeech + asr + uplink(rtt) + llm + downlink(rtt) + tts
const P = GapSim.PRESETS;
check("DEFAULTS = Cascaded big-LLM", JSON.stringify(GapSim.DEFAULTS), JSON.stringify(P["Cascaded big-LLM"]));

// Snappy: 160 + 200 + 150 + 100 + 40 + 200 + 40 + 60 = 950
check("total(Snappy)", GapSim.total(P["Snappy"]), 950);
// Cascaded big-LLM: 160 + 400 + 250 + 200 + 60 + 1200 + 60 + 300 = 2630
check("total(Cascaded big-LLM)", GapSim.total(P["Cascaded big-LLM"]), 2630);
// Robust: 160 + 700 + 350 + 300 + 100 + 600 + 100 + 150 = 2460
check("total(Robust)", GapSim.total(P["Robust"]), 2460);
// S2S duplex: 160 + 0 + 250 + 0 + 80 + 300 + 80 + 0 = 870
check("total(S2S duplex)", GapSim.total(P["S2S duplex"]), 870);

// stages structure: 8 stages, fixed tail, rtt applied twice
const st = GapSim.stages(P["Snappy"]);
check("stages count = 8", st.length, 8);
check("stage order", st.map((s) => s[0]).join(","),
  "tail,hangover,minSilence,asr,uplink,llm,downlink,tts");
check("tail is fixed 160", st[0][1], GapSim.FIXED.tail);
check("rtt applied twice (up+down)", st.filter((s) => s[0] === "uplink" || s[0] === "downlink").map((s) => s[1]).join(","), "40,40");

// slider propagation: bump hangover by +100 -> total +100
const base = GapSim.total(P["Snappy"]);
const bumped = { ...P["Snappy"], hangover: P["Snappy"].hangover + 100 };
check("slider change propagates (+100ms hangover)", GapSim.total(bumped), base + 100);

// barge-in waste: minSpeech + round(hangover/2) + rtt
check("waste(Snappy) = 150+100+40", GapSim.waste(P["Snappy"]), 290);
check("waste grows with hangover", GapSim.waste({ ...P["Snappy"], hangover: 1500 }) > GapSim.waste(P["Snappy"]), true);

// S2S duplex must beat Snappy beats Cascaded (the whole pedagogical point)
check("S2S < Snappy < Cascaded",
  GapSim.total(P["S2S duplex"]) < GapSim.total(P["Snappy"]) && GapSim.total(P["Snappy"]) < GapSim.total(P["Cascaded big-LLM"]), true);

console.log(fails ? `\n${fails} CHECK(S) FAILED` : "\nALL CHECKS PASSED");
process.exit(fails ? 1 : 0);
