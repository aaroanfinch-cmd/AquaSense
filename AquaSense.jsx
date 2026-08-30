import React, { useState, useMemo, useEffect, useRef } from "react";
import { Droplet, Beaker, Waves, ArrowRight, RotateCcw, ChevronRight, FlaskConical, CircleDot } from "lucide-react";

/* ------------------------------------------------------------------
   AquaSense — digital proof-of-concept simulation
   CaCO3 nanoparticle-stabilized Pickering emulsion, microplastic
   screening concept. All results are simulated, not experimental.
------------------------------------------------------------------- */

const CONCENTRATION = {
  Low: { value: 1, note: "Trace-level dosing" },
  Medium: { value: 2, note: "Moderate dosing" },
  High: { value: 3, note: "Elevated dosing" },
};

const TYPE = {
  PE: { factor: 1.0, full: "Polyethylene", note: "Low density, buoyant" },
  PP: { factor: 1.08, full: "Polypropylene", note: "Semi-rigid, buoyant" },
  PET: { factor: 1.3, full: "Polyethylene terephthalate", note: "Dense, rigid" },
};

const SIZE = {
  Small: { factor: 1.3, note: "< 100 μm — high surface area" },
  Medium: { factor: 1.0, note: "100 – 500 μm" },
  Large: { factor: 0.78, note: "> 500 μm — low surface area" },
};

function computeDisturbance(conc, type, size) {
  const raw =
    CONCENTRATION[conc].value * TYPE[type].factor * SIZE[size].factor;
  const min = 1 * TYPE.PE.factor * SIZE.Large.factor; // 0.78
  const max = 3 * TYPE.PET.factor * SIZE.Small.factor; // 5.07
  const pct = Math.max(0, Math.min(1, (raw - min) / (max - min)));
  let level, color, label;
  if (pct < 0.38) {
    level = "LOW";
    color = "var(--green)";
    label = "Low Interaction";
  } else if (pct < 0.68) {
    level = "MODERATE";
    color = "var(--amber)";
    label = "Moderate Interaction";
  } else {
    level = "HIGH";
    color = "var(--red)";
    label = "High Interaction";
  }
  return { pct, level, color, label, raw };
}

const PIPELINE = [
  { k: "nano", title: "CaCO₃ Nanoparticles", desc: "Nanoparticles disperse and prime the aqueous phase." },
  { k: "emulsion", title: "Pickering Emulsion Interface", desc: "Particles self-assemble at the oil–water boundary." },
  { k: "interaction", title: "Simulated Microplastic Interaction", desc: "Modelled microplastic units approach the stabilized interface." },
  { k: "disturbance", title: "Simulated Interface Disturbance", desc: "Interface packing is displaced in proportion to input parameters." },
];

const HOW_IT_WORKS = [
  "CaCO₃ Nanoparticles",
  "Pickering Emulsion Interface",
  "Simulated Microplastic Interaction",
  "Simulated Interface Disturbance",
  "Simulated Dye / Colour Response",
  "Digital Screening Output",
];

const DISCLAIMER =
  "This is a digital proof-of-concept simulation of a proposed sensing mechanism. The model is not experimentally validated and does not provide real microplastic detection results.";

/* ---------------------------- droplet visual ---------------------------- */

function EmulsionVisual({ pct = 0, animate = true, size = 300 }) {
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size * 0.28;
  const nParticles = 26;

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nParticles; i++) {
      const angle = (i / nParticles) * Math.PI * 2;
      const jitterSeed = Math.sin(i * 12.9898) * 43758.5453;
      const jitter = jitterSeed - Math.floor(jitterSeed);
      arr.push({ angle, jitter });
    }
    return arr;
  }, []);

  const scatter = pct * 14; // px scatter amplitude
  const wobble = 3 + pct * 10; // rim irregularity amplitude
  const ringColor =
    pct < 0.38 ? "#1FAA59" : pct < 0.68 ? "#E8A317" : "#E1472B";

  // build a wobbly path for the droplet rim
  const rimPoints = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const seed = Math.sin(a * 5 + pct * 9) * Math.cos(a * 3);
    const r = baseR + seed * wobble * 0.5;
    rimPoints.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  const rimPath =
    "M " + rimPoints.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" L ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="waterGrad" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#EAF8FA" />
          <stop offset="100%" stopColor="#CFEFF3" />
        </radialGradient>
        <radialGradient id="oilGrad" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#FFFDF3" />
          <stop offset="70%" stopColor={ringColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={ringColor} stopOpacity="0.32" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={size * 0.47} fill="url(#waterGrad)" />

      {/* subtle water ripples */}
      {[0.62, 0.72, 0.82].map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={size * r * 0.5}
          fill="none"
          stroke="#0E93A0"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
      ))}

      {/* the emulsion droplet, wobbling with disturbance */}
      <path
        d={rimPath}
        fill="url(#oilGrad)"
        stroke={ringColor}
        strokeWidth={2.5}
        strokeOpacity="0.85"
        style={{ transition: "stroke 0.6s ease" }}
      />

      {/* interfacial CaCO3 nanoparticles */}
      {particles.map((p, i) => {
        const scatterX = Math.cos(p.angle * 3.1 + i) * scatter * p.jitter;
        const scatterY = Math.sin(p.angle * 2.7 + i) * scatter * p.jitter;
        const r = baseR + (p.jitter - 0.5) * wobble;
        const x = cx + Math.cos(p.angle) * r + scatterX;
        const y = cy + Math.sin(p.angle) * r + scatterY;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={2.6 + p.jitter * 1.4}
            fill="#075E63"
            fillOpacity={0.55 + p.jitter * 0.35}
            className={animate ? "np-dot" : ""}
            style={{ animationDelay: `${(i % 7) * 0.15}s` }}
          />
        );
      })}

      <circle cx={cx} cy={cy} r={3.5} fill={ringColor} fillOpacity="0.9" />
    </svg>
  );
}

/* ------------------------------- UI atoms -------------------------------- */

function DisclaimerBar({ compact }) {
  return (
    <div className={`disclaimer-bar${compact ? " compact" : ""}`}>
      <FlaskConical size={compact ? 14 : 16} strokeWidth={2} />
      <span>{DISCLAIMER}</span>
    </div>
  );
}

function StepDots({ step }) {
  const labels = ["Sample", "Simulate", "Result"];
  return (
    <div className="step-dots" aria-hidden="true">
      {labels.map((l, i) => (
        <div key={l} className={`step-dot${i <= step ? " active" : ""}`}>
          <span className="dot" />
          <span className="dot-label">{l}</span>
        </div>
      ))}
    </div>
  );
}

function OptionGroup({ label, sublabel, options, value, onChange, meta }) {
  return (
    <div className="opt-group">
      <div className="opt-group-head">
        <span className="opt-label">{label}</span>
        <span className="opt-sublabel">{sublabel}</span>
      </div>
      <div className="opt-row">
        {Object.keys(options).map((key) => (
          <button
            key={key}
            type="button"
            className={`opt-chip${value === key ? " selected" : ""}`}
            onClick={() => onChange(key)}
          >
            <span className="opt-chip-key">{key}</span>
            <span className="opt-chip-meta">
              {meta ? meta(key) : ""}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Screens -------------------------------- */

function WelcomeScreen({ onStart, onHow }) {
  return (
    <div className="screen welcome">
      <div className="welcome-visual">
        <EmulsionVisual pct={0.12} size={340} />
      </div>
      <div className="welcome-copy">
        <div className="eyebrow">
          <Waves size={15} /> Digital proof-of-concept
        </div>
        <h1 className="brand">AquaSense</h1>
        <p className="tagline">
          Turning invisible microplastic interactions into visible signals.
        </p>
        <p className="lede">
          AquaSense simulates how a CaCO₃ nanoparticle–stabilized Pickering
          emulsion might respond to microplastic contact at the oil–water
          interface — rendered here as an interactive, parameter-driven
          model for demonstration.
        </p>
        <div className="cta-row">
          <button className="btn btn-primary" onClick={onStart}>
            Start Simulation <ArrowRight size={17} />
          </button>
          <button className="btn btn-ghost" onClick={onHow}>
            How it works
          </button>
        </div>
        <DisclaimerBar />
      </div>
    </div>
  );
}

function InputScreen({ params, setParams, onRun, onBack }) {
  return (
    <div className="screen input-screen">
      <StepDots step={0} />
      <div className="panel-head">
        <h2>Configure the sample</h2>
        <p>
          Choose simulated parameters for the microplastic sample. These
          values drive the model — they are not measured from a real
          sample.
        </p>
      </div>

      <div className="panel-card">
        <OptionGroup
          label="Microplastic concentration"
          sublabel="Simulated dosing level"
          options={CONCENTRATION}
          value={params.concentration}
          onChange={(v) => setParams((p) => ({ ...p, concentration: v }))}
          meta={(k) => CONCENTRATION[k].note}
        />
        <OptionGroup
          label="Microplastic type"
          sublabel="Polymer class"
          options={TYPE}
          value={params.type}
          onChange={(v) => setParams((p) => ({ ...p, type: v }))}
          meta={(k) => TYPE[k].full}
        />
        <OptionGroup
          label="Particle size"
          sublabel="Simulated size class"
          options={SIZE}
          value={params.size}
          onChange={(v) => setParams((p) => ({ ...p, size: v }))}
          meta={(k) => SIZE[k].note}
        />
      </div>

      <div className="cta-row">
        <button className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" onClick={onRun}>
          Run Simulation <ArrowRight size={17} />
        </button>
      </div>
      <DisclaimerBar compact />
    </div>
  );
}

function SimulationScreen({ params, result, onFinish }) {
  const [stage, setStage] = useState(0);
  const [revealResponse, setRevealResponse] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage(0);
    setRevealResponse(false);
    PIPELINE.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), i * 900 + 200));
    });
    timers.current.push(
      setTimeout(() => setRevealResponse(true), PIPELINE.length * 900 + 400)
    );
    return () => timers.current.forEach(clearTimeout);
  }, [params]);

  const livePct = Math.min(1, (result.pct * (stage + 1)) / PIPELINE.length);

  return (
    <div className="screen sim-screen">
      <StepDots step={1} />
      <div className="panel-head">
        <h2>Running the simulation</h2>
        <p>Modelling interface behaviour from your selected parameters.</p>
      </div>

      <div className="sim-grid">
        <div className="sim-visual-card">
          <EmulsionVisual pct={revealResponse ? result.pct : livePct} size={300} />
        </div>

        <div className="sim-pipeline">
          {PIPELINE.map((step, i) => (
            <div
              key={step.k}
              className={`pipe-step${i <= stage ? " active" : ""}${
                i === stage ? " current" : ""
              }`}
            >
              <div className="pipe-marker">
                <CircleDot size={16} />
              </div>
              <div className="pipe-text">
                <span className="pipe-title">{step.title}</span>
                <span className="pipe-desc">{step.desc}</span>
              </div>
              {i < PIPELINE.length - 1 && <div className="pipe-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className={`response-card${revealResponse ? " show" : ""}`}>
        <span className="response-eyebrow">Simulated Response</span>
        <div className="response-row">
          <span
            className="response-swatch"
            style={{ background: result.color }}
          />
          <span className="response-label">{result.label}</span>
        </div>
        <div className="response-bar">
          <div
            className="response-bar-fill"
            style={{
              width: `${result.pct * 100}%`,
              background: result.color,
            }}
          />
        </div>
      </div>

      <div className="cta-row">
        <button
          className="btn btn-primary"
          disabled={!revealResponse}
          onClick={onFinish}
        >
          View Full Result <ArrowRight size={17} />
        </button>
      </div>
      <DisclaimerBar compact />
    </div>
  );
}

function ResultScreen({ params, result, onRestart, onAdjust }) {
  return (
    <div className="screen result-screen">
      <StepDots step={2} />
      <div className="result-hero" style={{ "--accent": result.color }}>
        <span className="result-kicker">Simulated Screening Result</span>
        <div className="result-headline">
          <Droplet size={30} strokeWidth={2.2} />
          <span>
            Potential Microplastic Interaction:{" "}
            <strong style={{ color: result.color }}>{result.level}</strong>
          </span>
        </div>
        <EmulsionVisual pct={result.pct} size={220} animate={false} />
      </div>

      <div className="panel-card result-detail">
        <div className="result-params">
          <div>
            <span className="rp-label">Concentration</span>
            <span className="rp-value">{params.concentration}</span>
          </div>
          <div>
            <span className="rp-label">Type</span>
            <span className="rp-value">{params.type}</span>
          </div>
          <div>
            <span className="rp-label">Particle size</span>
            <span className="rp-value">{params.size}</span>
          </div>
        </div>

        <p className="result-explainer">
          This output is generated entirely from the simulation model based
          on the parameters you selected — it does not reflect a real
          water sample, sensor reading, or laboratory result. The model
          approximates how interface disturbance and a companion dye
          response might scale with concentration, polymer type, and
          particle size in a CaCO₃ nanoparticle–stabilized Pickering
          emulsion.
        </p>

        <DisclaimerBar />
      </div>

      <div className="cta-row">
        <button className="btn btn-ghost" onClick={onAdjust}>
          <RotateCcw size={16} /> Adjust parameters
        </button>
        <button className="btn btn-primary" onClick={onRestart}>
          Start Over
        </button>
      </div>
    </div>
  );
}

function HowItWorks({ onClose }) {
  return (
    <div className="how-overlay" onClick={onClose}>
      <div className="how-card" onClick={(e) => e.stopPropagation()}>
        <div className="how-head">
          <h3>How it works</h3>
          <button className="how-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <ol className="how-list">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step}>
              <span className="how-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="how-step">{step}</span>
              {i < HOW_IT_WORKS.length - 1 && (
                <ChevronRight size={16} className="how-arrow" />
              )}
            </li>
          ))}
        </ol>
        <p className="how-footnote">
          Every stage above is a modelled approximation, driven by the
          parameters you choose on the Sample Input screen — not a live
          chemical process.
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- App ---------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [showHow, setShowHow] = useState(false);
  const [params, setParams] = useState({
    concentration: "Medium",
    type: "PE",
    size: "Medium",
  });

  const result = useMemo(
    () => computeDisturbance(params.concentration, params.type, params.size),
    [params]
  );

  return (
    <div className="aquasense-root">
      <style>{CSS}</style>

      <header className="app-header">
        <div className="brand-mini" onClick={() => setScreen("welcome")}>
          <Beaker size={18} />
          <span>AquaSense</span>
        </div>
        <button className="how-link" onClick={() => setShowHow(true)}>
          How it works
        </button>
      </header>

      <main className="app-main">
        {screen === "welcome" && (
          <WelcomeScreen
            onStart={() => setScreen("input")}
            onHow={() => setShowHow(true)}
          />
        )}
        {screen === "input" && (
          <InputScreen
            params={params}
            setParams={setParams}
            onRun={() => setScreen("simulation")}
            onBack={() => setScreen("welcome")}
          />
        )}
        {screen === "simulation" && (
          <SimulationScreen
            params={params}
            result={result}
            onFinish={() => setScreen("result")}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            params={params}
            result={result}
            onAdjust={() => setScreen("input")}
            onRestart={() => setScreen("welcome")}
          />
        )}
      </main>

      {showHow && <HowItWorks onClose={() => setShowHow(false)} />}
    </div>
  );
}

/* --------------------------------- CSS ----------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

.aquasense-root {
  --bg: #F5FBFC;
  --white: #FFFFFF;
  --ink: #0B2530;
  --ink-soft: #4B6B74;
  --teal-deep: #075E63;
  --teal: #0E93A0;
  --blue: #1C6FD1;
  --aqua: #5FE0D6;
  --green: #1FAA59;
  --amber: #E8A317;
  --red: #E1472B;
  --line: #D9EEF1;

  min-height: 100%;
  width: 100%;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}

.aquasense-root * { box-sizing: border-box; }
.aquasense-root h1, .aquasense-root h2, .aquasense-root h3 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  margin: 0;
}

/* header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line);
  background: var(--white);
  position: sticky;
  top: 0;
  z-index: 5;
}
.brand-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: var(--teal-deep);
  cursor: pointer;
}
.how-link {
  background: none;
  border: none;
  color: var(--teal);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.how-link:hover { text-decoration: underline; }

.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px 20px 64px;
}

.screen {
  width: 100%;
  max-width: 880px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeUp 0.5s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* welcome */
.welcome {
  display: grid;
  grid-template-columns: 1.1fr 1.3fr;
  align-items: center;
  gap: 32px;
  max-width: 1020px;
}
.welcome-visual {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 12px 34px -18px rgba(7, 94, 99, 0.35);
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--teal);
  background: rgba(14, 147, 160, 0.08);
  padding: 5px 10px;
  border-radius: 999px;
  margin-bottom: 14px;
}
.brand {
  font-size: 44px;
  font-weight: 700;
  color: var(--teal-deep);
  letter-spacing: -0.01em;
  line-height: 1.05;
}
.tagline {
  font-size: 17px;
  font-weight: 600;
  color: var(--blue);
  margin: 10px 0 14px;
}
.lede {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--ink-soft);
  margin: 0 0 22px;
  max-width: 46ch;
}

/* buttons */
.cta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14.5px;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.btn:active { transform: translateY(1px); }
.btn-primary {
  background: linear-gradient(135deg, var(--teal), var(--blue));
  color: white;
  box-shadow: 0 10px 24px -10px rgba(28, 111, 209, 0.55);
}
.btn-primary:hover { box-shadow: 0 14px 28px -10px rgba(28, 111, 209, 0.65); }
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
.btn-ghost {
  background: var(--white);
  color: var(--teal-deep);
  border: 1px solid var(--line);
}
.btn-ghost:hover { border-color: var(--teal); }

/* disclaimer */
.disclaimer-bar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #FFF8EC;
  border: 1px solid #F1DDAF;
  color: #7A5A17;
  font-size: 12.5px;
  line-height: 1.5;
  padding: 10px 14px;
  border-radius: 10px;
  margin-top: 18px;
  max-width: 62ch;
}
.disclaimer-bar.compact {
  font-size: 11.5px;
  padding: 8px 12px;
  max-width: 100%;
}
.disclaimer-bar svg { flex-shrink: 0; margin-top: 1px; }

/* step dots */
.step-dots {
  display: flex;
  gap: 22px;
  align-items: center;
}
.step-dot {
  display: flex;
  align-items: center;
  gap: 7px;
  opacity: 0.4;
}
.step-dot.active { opacity: 1; }
.step-dot .dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--teal);
}
.step-dot .dot-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--teal-deep);
}

/* panel */
.panel-head h2 { font-size: 24px; color: var(--ink); }
.panel-head p {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--ink-soft);
  max-width: 60ch;
  line-height: 1.55;
}
.panel-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-shadow: 0 10px 30px -22px rgba(7, 94, 99, 0.3);
}

.opt-group-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}
.opt-label { font-weight: 600; font-size: 14.5px; color: var(--ink); }
.opt-sublabel {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
}
.opt-row { display: flex; gap: 10px; flex-wrap: wrap; }
.opt-chip {
  flex: 1;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  text-align: left;
}
.opt-chip:hover { border-color: var(--teal); }
.opt-chip.selected {
  border-color: var(--teal);
  background: rgba(14, 147, 160, 0.08);
}
.opt-chip-key {
  font-weight: 700;
  font-size: 14px;
  color: var(--teal-deep);
}
.opt-chip-meta {
  font-size: 11px;
  color: var(--ink-soft);
}

/* simulation screen */
.sim-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
}
.sim-visual-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sim-pipeline {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
}
.pipe-step {
  position: relative;
  display: flex;
  gap: 14px;
  padding-bottom: 22px;
  opacity: 0.35;
  transition: opacity 0.4s ease;
}
.pipe-step.active { opacity: 1; }
.pipe-marker {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--bg);
  border: 1.5px solid var(--line);
  display: flex; align-items: center; justify-content: center;
  color: var(--teal);
  flex-shrink: 0;
  z-index: 1;
  transition: border-color 0.3s ease, background 0.3s ease;
}
.pipe-step.active .pipe-marker {
  border-color: var(--teal);
  background: rgba(14, 147, 160, 0.12);
}
.pipe-step.current .pipe-marker {
  animation: pulse 1.1s ease infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(14,147,160,0.35); }
  50% { box-shadow: 0 0 0 6px rgba(14,147,160,0); }
}
.pipe-line {
  position: absolute;
  left: 13px;
  top: 28px;
  bottom: 0;
  width: 2px;
  background: var(--line);
}
.pipe-text { display: flex; flex-direction: column; gap: 2px; padding-top: 3px; }
.pipe-title { font-weight: 600; font-size: 14px; color: var(--ink); }
.pipe-desc { font-size: 12px; color: var(--ink-soft); }

/* response card */
.response-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px 24px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: none;
}
.response-card.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
.response-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.response-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 12px;
}
.response-swatch {
  width: 18px; height: 18px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.03);
}
.response-label { font-weight: 700; font-size: 17px; }
.response-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--bg);
  overflow: hidden;
}
.response-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1.1s cubic-bezier(.2,.8,.2,1);
}

/* result screen */
.result-hero {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  box-shadow: 0 14px 36px -22px rgba(7,94,99,0.35);
}
.result-kicker {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--teal);
}
.result-headline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  flex-wrap: wrap;
  justify-content: center;
}
.result-headline strong { font-family: 'Space Grotesk', sans-serif; font-size: 22px; }

.result-detail { gap: 18px; }
.result-params {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.result-params > div {
  flex: 1;
  min-width: 120px;
  background: var(--bg);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rp-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
}
.rp-value { font-weight: 700; color: var(--teal-deep); font-size: 15px; }
.result-explainer {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--ink-soft);
  margin: 0;
}

/* how it works overlay */
.how-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 37, 48, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
  animation: fadeUp 0.25s ease;
}
.how-card {
  background: var(--white);
  border-radius: 22px;
  padding: 28px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,0.35);
}
.how-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.how-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--ink-soft);
}
.how-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.how-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 14px;
}
.how-list li:last-child { border-bottom: none; }
.how-index {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--teal);
  width: 22px;
}
.how-step { flex: 1; font-weight: 500; color: var(--ink); }
.how-arrow { color: var(--line); display: none; }
.how-footnote {
  margin-top: 16px;
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.5;
}

/* nanoparticle jitter animation */
.np-dot {
  animation: jitter 1.8s ease-in-out infinite alternate;
  transform-origin: center;
}
@keyframes jitter {
  0% { transform: translate(0,0); }
  100% { transform: translate(1.2px, -1.2px); }
}

/* responsive */
@media (max-width: 820px) {
  .welcome { grid-template-columns: 1fr; }
  .welcome-visual { max-width: 260px; margin: 0 auto; }
  .sim-grid { grid-template-columns: 1fr; }
  .brand { font-size: 34px; }
}
@media (max-width: 520px) {
  .app-header { padding: 14px 16px; }
  .app-main { padding: 26px 14px 48px; }
  .opt-chip { min-width: 100%; }
  .result-headline { font-size: 17px; }
}

@media (prefers-reduced-motion: reduce) {
  .np-dot, .pipe-step.current .pipe-marker { animation: none !important; }
  .screen { animation: none !important; }
}
`;
