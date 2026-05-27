import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Layers,
  Move,
  AlertTriangle,
  Copy,
  Check,
  BookOpen,
  Info,
  Maximize2,
  RefreshCw,
  HelpCircle,
  Code,
  Sparkles,
  Sliders,
  Anchor,
  Minimize2,
  ListFilter
} from "lucide-react";

type ActiveTab = "boxModelFlat" | "positioning" | "wrapping";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("boxModelFlat");

  // --- UI feedback states ---
  const [copied, setCopied] = useState(false);

  // --- STATE FOR SECTION 1: Box Model Duel ---
  const [boxWidth, setBoxWidth] = useState(130);
  const [boxHeight, setBoxHeight] = useState(110);
  const [boxPadding, setBoxPadding] = useState(24);
  const [boxBorder, setBoxBorder] = useState(6);
  const [boxMargin, setBoxMargin] = useState(16);

  // Calculated dimensions for content-box:
  const contentBoxTotalWidth = boxWidth + boxPadding * 2 + boxBorder * 2;
  const contentBoxTotalHeight = boxHeight + boxPadding * 2 + boxBorder * 2;

  // Calculated dimensions for border-box:
  const borderBoxTotalWidth = boxWidth;
  const borderBoxTotalHeight = boxHeight;
  // In border-box, the actual content width is clamped at 0
  const borderBoxContentWidth = Math.max(0, boxWidth - (boxPadding * 2 + boxBorder * 2));
  const borderBoxContentHeight = Math.max(0, boxHeight - (boxPadding * 2 + boxBorder * 2));

  // --- STATE FOR SECTION 2: Positioning ---
  const [parentPosition, setParentPosition] = useState<"static" | "relative" | "absolute">("relative");
  const [childPosition, setChildPosition] = useState<"static" | "relative" | "absolute" | "fixed">("absolute");
  const [childTop, setChildTop] = useState(15);
  const [childLeft, setChildLeft] = useState(35);

  // Connection layout elements
  const gpRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const [positioningReport, setPositioningReport] = useState({
    anchorName: "Grandparent Box",
    reason: "Because Parent is 'static', it does not establish a positioning context.",
    topOffsetPx: 0,
    leftOffsetPx: 0,
    isParentAnchor: false,
    lineData: { x1: 0, y1: 0, x2: 0, y2: 0, px1: 0, py1: 0, px2: 0, py2: 0, showLines: false }
  });

  // --- STATE FOR SECTION 3: Layout Wrapping ---
  const [wrapItemWidth, setWrapItemWidth] = useState(120);
  const [wrapPadding, setWrapPadding] = useState(12);
  const [wrapBorder, setWrapBorder] = useState(2);
  const [wrapMargin, setWrapMargin] = useState(16);

  const block1Ref = useRef<HTMLDivElement>(null);
  const block3Ref = useRef<HTMLDivElement>(null);
  const [physicalWrapOccurred, setPhysicalWrapOccurred] = useState(false);

  // Single items arithmetic sum: outer space it needs
  const wrapItemTotalSpace = wrapItemWidth + wrapPadding * 2 + wrapBorder * 2 + wrapMargin * 2;
  const totalWrapCombinedWidth = wrapItemTotalSpace * 3;
  const wrappingThreshold = 500;

  // Track physical drop
  useEffect(() => {
    if (activeTab === "wrapping") {
      const checkWrap = () => {
        if (block1Ref.current && block3Ref.current) {
          const b1 = block1Ref.current.getBoundingClientRect();
          const b3 = block3Ref.current.getBoundingClientRect();
          setPhysicalWrapOccurred(b3.top > b1.top + 10);
        }
      };

      checkWrap();
      const timer = setTimeout(checkWrap, 100);
      window.addEventListener("resize", checkWrap);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", checkWrap);
      };
    }
  }, [wrapItemWidth, wrapPadding, wrapBorder, wrapMargin, activeTab]);

  // Positioning system math anchor calculation
  const updatePositioningLines = () => {
    if (!gpRef.current || !parentRef.current || !childRef.current) return;

    const gpRect = gpRef.current.getBoundingClientRect();
    const parentRect = parentRef.current.getBoundingClientRect();
    const childRect = childRef.current.getBoundingClientRect();

    let anchorName = "Grandparent Frame";
    let isParentAnchor = false;
    let reason = "The child is in static flow and adheres to natural document distribution.";

    if (childPosition === "absolute") {
      if (parentPosition !== "static") {
        anchorName = "Parent Box";
        isParentAnchor = true;
        reason = "The Parent has positioned styling ('" + parentPosition + "'), locking the absolute coordinates onto its boundaries.";
      } else {
        anchorName = "Grandparent Container";
        isParentAnchor = false;
        reason = "The Parent is 'static' (default), so the absolute child skips it entirely and anchors to the nearest positioned ancestor (Grandparent Frame).";
      }
    } else if (childPosition === "fixed") {
      anchorName = "Grandparent Viewport";
      isParentAnchor = false;
      reason = "Viewport simulator locks the item relative to the outermost viewport grid, completely bypassing Parent's flow.";
    } else if (childPosition === "relative") {
      reason = "The child is shifted relative to its original flow position. The original layout footprint remains locked in place.";
    }

    // Coordinates calculation relative to Grandparent
    const cLeft = childRect.left - gpRect.left;
    const cTop = childRect.top - gpRect.top;
    const cWidth = childRect.width;
    const cHeight = childRect.height;

    // Anchor edges
    const anchorRect = isParentAnchor ? parentRect : gpRect;
    const aLeft = anchorRect.left - gpRect.left;
    const aTop = anchorRect.top - gpRect.top;

    const showLines = childPosition === "absolute" || childPosition === "fixed";

    setPositioningReport({
      anchorName,
      isParentAnchor,
      reason,
      topOffsetPx: childRect.top - anchorRect.top,
      leftOffsetPx: childRect.left - anchorRect.left,
      lineData: {
        x1: cLeft,
        y1: cTop + cHeight / 2,
        x2: aLeft,
        y2: cTop + cHeight / 2,

        px1: cLeft + cWidth / 2,
        py1: cTop,
        px2: cLeft + cWidth / 2,
        py2: aTop,
        showLines
      }
    });
  };

  useLayoutEffect(() => {
    updatePositioningLines();
    const timer = setTimeout(updatePositioningLines, 100);
    window.addEventListener("resize", updatePositioningLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositioningLines);
    };
  }, [parentPosition, childPosition, childTop, childLeft, activeTab]);

  // Generate CSS output dynamically based on active tab
  const getGeneratedCss = () => {
    if (activeTab === "boxModelFlat") {
      return `/* Box Model Configuration Duel */

/* ======= BOX A: content-box (Explosive Layout) ======= */
.box-content-sizing {
  box-sizing: content-box;
  width: ${boxWidth}px;
  height: ${boxHeight}px;
  padding: ${boxPadding}px;
  border: ${boxBorder}px solid #f59e0b;
  margin: ${boxMargin}px;
  background-color: rgba(56, 189, 248, 0.15);
}

/* TOTAL physical space taken on screen:
   Width  = width (${boxWidth}px) + padding*2 (${boxPadding * 2}px) + border*2 (${boxBorder * 2}px) = ${contentBoxTotalWidth}px
   Height = height (${boxHeight}px) + padding*2 (${boxPadding * 2}px) + border*2 (${boxBorder * 2}px) = ${contentBoxTotalHeight}px
*/


/* ======= BOX B: border-box (Safe / Modern) ======= */
.box-border-sizing {
  box-sizing: border-box;
  width: ${boxWidth}px;
  height: ${boxHeight}px;
  padding: ${boxPadding}px;
  border: ${boxBorder}px solid #10b981;
  margin: ${boxMargin}px;
  background-color: rgba(56, 189, 248, 0.15);
}

/* TOTAL physical space taken on screen:
   Width  = Locked at precisely ${boxWidth}px
   Height = Locked at precisely ${boxHeight}px
   Content area compresses to: ${borderBoxContentWidth}px × ${borderBoxContentHeight}px
*/`;
    } else if (activeTab === "positioning") {
      return `/* CSS Absolute Positioning Vectors */

.grandparent-container {
  position: relative; /* All absolute coordinates fall back to this grid boundary */
}

.parent-element {
  position: ${parentPosition};
  width: 90%;
  height: 150px;
}

.child-element {
  position: ${childPosition};
  top: ${childTop}px;
  left: ${childLeft}px;
  width: 64px;
  height: 56px;
  background-color: #ec4899; /* Radiant Pink */
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
}`;
    } else {
      return `/* Flexbox Wrapping Arithmetic Sandbox */

.wrapping-container {
  display: flex;
  flex-wrap: wrap; 
  width: 500px; /* Locked Container Outer Bounds */
  padding: 12px;
  box-sizing: border-box;
}

.layout-item {
  box-sizing: content-box; 
  width: ${wrapItemWidth}px;
  padding: ${wrapPadding}px;
  border: ${wrapBorder}px solid #3b82f6;
  margin: ${wrapMargin}px;
}

/* 
  Arithmetic check per block:
  Outer size = width(${wrapItemWidth}) + padding(${wrapPadding * 2}) + border(${wrapBorder * 2}) + margin(${wrapMargin * 2})
             = ${wrapItemTotalSpace}px

  3 items total spacing = 3 × ${wrapItemTotalSpace}px = ${totalWrapCombinedWidth}px
  Available track width: 500px

  ${
    totalWrapCombinedWidth > wrappingThreshold
      ? `🚨 OVERFLOW WARNING! ${totalWrapCombinedWidth}px exceeds container limits. Layout wrapping wraps the 3rd block.`
      : `✓ STABLE LAYOUT! ${totalWrapCombinedWidth}px fits perfectly within container constraints.`
  }
*/`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getGeneratedCss());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset parameters
  const handleReset = () => {
    if (activeTab === "boxModelFlat") {
      setBoxWidth(130);
      setBoxHeight(110);
      setBoxPadding(24);
      setBoxBorder(6);
      setBoxMargin(16);
    } else if (activeTab === "positioning") {
      setParentPosition("relative");
      setChildPosition("absolute");
      setChildTop(15);
      setChildLeft(35);
    } else {
      setWrapItemWidth(120);
      setWrapPadding(12);
      setWrapBorder(2);
      setWrapMargin(16);
    }
  };

  return (
    <div id="high_density_workbench" className="w-full h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* 1. Header Portion */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-slate-950 font-bold shadow-[0_0_10px_rgba(14,165,233,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M3 9h18"/>
              <path d="M9 21V9"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-white flex items-center gap-2">
              CSS Layout Sandbox &amp; Debugger
              <span className="text-[10px] bg-slate-800 text-slate-400 font-medium px-1.5 py-0.5 rounded font-mono border border-slate-700">
                v1.1.2
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono -mt-0.5">HIGH DENSITY INTERACTIVE BENCHMARK</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-500">LIVE_PREVIEW_ACTIVE</span>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded font-mono transition-colors border border-slate-700 cursor-pointer"
            title="Reset active tab variables to default baseline properties"
          >
            <RefreshCw className="w-3 h-3" />
            Reset lab
          </button>
        </div>
      </header>

      {/* 2. Main content area structured with sidebars split layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR: Controls & Tabs selector */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
          
          {/* Micro Tab controllers for layout sandboxes */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/40">
            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1.5">Sandbox Modules</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("boxModelFlat")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-all text-left text-xs font-medium cursor-pointer ${
                  activeTab === "boxModelFlat"
                    ? "bg-slate-800 text-white border-l-2 border-sky-500"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${activeTab === "boxModelFlat" ? "text-sky-400" : "text-slate-500"}`} />
                <div>
                  <div className="text-[11px] font-semibold leading-tight">Box Model Duel</div>
                  <div className="text-[9px] text-slate-500 leading-none">content-box vs border-box</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("positioning")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-all text-left text-xs font-medium cursor-pointer ${
                  activeTab === "positioning"
                    ? "bg-slate-800 text-white border-l-2 border-sky-500"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <Move className={`w-3.5 h-3.5 ${activeTab === "positioning" ? "text-sky-400" : "text-slate-500"}`} />
                <div>
                  <div className="text-[11px] font-semibold leading-tight">Absolute Vectors</div>
                  <div className="text-[9px] text-slate-500 leading-none">Relative/Static scopes</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("wrapping")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-all text-left text-xs font-medium cursor-pointer ${
                  activeTab === "wrapping"
                    ? "bg-slate-800 text-white border-l-2 border-sky-500"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${activeTab === "wrapping" ? "text-sky-400" : "text-slate-500"}`} />
                <div>
                  <div className="text-[11px] font-semibold leading-tight">Layout Wrap Warning</div>
                  <div className="text-[9px] text-slate-500 leading-none">500px flex overflow math</div>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Scrollable Slider Forms */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* BOX MODEL CONTROLS */}
            {activeTab === "boxModelFlat" && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-sky-400" />
                  Box Model Calibration
                </h3>

                {/* Width */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-slate-400">Box Width (<code className="text-sky-400">width</code>)</label>
                    <span className="text-sky-400 font-semibold">{boxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={boxWidth}
                    onChange={(e) => setBoxWidth(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-sky-450"
                  />
                </div>

                {/* Height */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-slate-400">Box Height (<code className="text-sky-400">height</code>)</label>
                    <span className="text-sky-400 font-semibold">{boxHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={boxHeight}
                    onChange={(e) => setBoxHeight(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-sky-450"
                  />
                </div>

                {/* Padding */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-emerald-400">Padding (<code className="text-emerald-400">padding</code>)</label>
                    <span className="text-emerald-400 font-semibold">{boxPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={boxPadding}
                    onChange={(e) => setBoxPadding(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Border */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-amber-450 border-amber-500/20">Border (<code className="text-amber-400">border-width</code>)</label>
                    <span className="text-amber-400 font-semibold">{boxBorder}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={boxBorder}
                    onChange={(e) => setBoxBorder(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Margin */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-orange-400">Margin (<code className="text-orange-400">margin</code>)</label>
                    <span className="text-orange-400 font-semibold">{boxMargin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={boxMargin}
                    onChange={(e) => setBoxMargin(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </section>
            )}

            {/* POSITIONING CONTROLS */}
            {activeTab === "positioning" && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-sky-400" />
                  Positioning Core
                </h3>

                <div className="p-3 bg-slate-850/50 rounded-lg border border-slate-800">
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Parent Strategy</label>
                  <select
                    value={parentPosition}
                    onChange={(e) => setParentPosition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 outline-none focus:border-sky-500"
                  >
                    <option value="static">position: static</option>
                    <option value="relative">position: relative</option>
                    <option value="absolute">position: absolute</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-850/50 rounded-lg border border-slate-800">
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Child Strategy</label>
                  <select
                    value={childPosition}
                    onChange={(e) => setChildPosition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 outline-none focus:border-sky-500"
                  >
                    <option value="static">position: static</option>
                    <option value="relative">position: relative</option>
                    <option value="absolute">position: absolute</option>
                    <option value="fixed">position: fixed</option>
                  </select>
                </div>

                {childPosition !== "static" ? (
                  <div className="space-y-3.5 pt-2">
                    {/* Top offset slider */}
                    <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/10">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <label className="text-pink-400">offset top (<code className="text-pink-400">top</code>)</label>
                        <span className="text-pink-400 font-semibold">{childTop}px</span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="110"
                        value={childTop}
                        onChange={(e) => setChildTop(Number(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    {/* Left offset slider */}
                    <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/10">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <label className="text-pink-400">offset left (<code className="text-pink-400">left</code>)</label>
                        <span className="text-pink-400 font-semibold">{childLeft}px</span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="150"
                        value={childLeft}
                        onChange={(e) => setChildLeft(Number(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/40 rounded border border-slate-800/50 text-[10.5px] text-slate-500 leading-normal">
                    💡 Static elements ignore layout offsets (<code className="text-slate-400">top</code>/<code className="text-slate-400">left</code>). Toggle child flow to absolute/relative to inspect coordinates math!
                  </div>
                )}
              </section>
            )}

            {/* WRAPPING CONTROLS */}
            {activeTab === "wrapping" && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-sky-400" />
                  Element Box Slices
                </h3>

                {/* Base Width */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-slate-400">Base Width (<code className="text-sky-450">width</code>)</label>
                    <span className="text-sky-400 font-semibold">{wrapItemWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="190"
                    value={wrapItemWidth}
                    onChange={(e) => setWrapItemWidth(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Padding */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-emerald-400">Padding (<code className="text-emerald-450">padding</code>)</label>
                    <span className="text-emerald-400 font-semibold">{wrapPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={wrapPadding}
                    onChange={(e) => setWrapPadding(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Border */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-amber-400 font-semibold">Border thickness</label>
                    <span className="text-amber-400 font-semibold">{wrapBorder}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={wrapBorder}
                    onChange={(e) => setWrapBorder(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Margin */}
                <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2 rounded border border-slate-800/50">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label className="text-orange-400">Margin gutter</label>
                    <span className="text-orange-400 font-semibold">{wrapMargin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={wrapMargin}
                    onChange={(e) => setWrapMargin(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar micro status indicator at base */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            {activeTab === "boxModelFlat" && (
              <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-0.5">
                <div>SIZING_DIAL_MATH: <span className="text-sky-400">ACTIVE</span></div>
                <div>BOX_A_TOTAL: <span className="text-amber-500">{contentBoxTotalWidth}x{contentBoxTotalHeight}px</span></div>
                <div>BOX_B_TOTAL: <span className="text-emerald-500">{borderBoxTotalWidth}x{borderBoxTotalHeight}px</span></div>
              </div>
            )}
            {activeTab === "positioning" && (
              <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-0.5">
                <div>ATTACHED ANCESTOR: <span className="text-sky-400">{positioningReport.anchorName}</span></div>
                <div>GHOST_LINE_LOCK: <span className="text-pink-500 font-bold">{positioningReport.lineData.showLines ? "TRUE ⚡" : "FALSE"}</span></div>
              </div>
            )}
            {activeTab === "wrapping" && (
              <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-0.5">
                <div>GRID_CONSTRAINT: <span className="text-rose-400">500px rigid bounds</span></div>
                <div>CUMULATIVE_WIDTH: <span className="text-sky-400">{totalWrapCombinedWidth}px</span></div>
                <div>FORCE_WRAP: <span className={physicalWrapOccurred ? "text-rose-500 font-bold" : "text-emerald-500"}>{physicalWrapOccurred ? "TRUE 🚨" : "FALSE"}</span></div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PREVIEW WORKSPACE */}
        <section className="flex-1 bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Box Slices Grid for Duel View */}
          {activeTab === "boxModelFlat" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
              
              {/* Box A Preview card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col shadow-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Box A: content-box</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                    Explosive Scale
                  </span>
                </div>
                
                <div className="flex-1 min-h-[220px] flex items-center justify-center relative p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                  
                  {/* content-box simulation element */}
                  <div className="relative overflow-visible">
                    
                    {/* Visual box rendering */}
                    <div
                      style={{
                        boxSizing: "content-box",
                        width: `${boxWidth}px`,
                        height: `${boxHeight}px`,
                        padding: `${boxPadding}px`,
                        borderWidth: `${boxBorder}px`,
                        borderColor: "#e0a96d", // Golden Amber
                        borderStyle: "solid",
                        margin: `${boxMargin}px`,
                        backgroundColor: "rgba(14, 165, 233, 0.12)"
                      }}
                      className="relative border-slate-700/80 shadow-md mr-10"
                    >
                      {/* Interactive area overlays */}
                      {/* Margin tracker */}
                      <div 
                        style={{ margin: `-${boxMargin + boxBorder + boxPadding}px` }} 
                        className="absolute inset-0 pointer-events-none rounded opacity-30 bg-orange-400/10 border border-orange-400/20"
                        title="Outer margin envelope boundary"
                      />
                      
                      {/* Box Content boundary indicators */}
                      <div className="absolute inset-0 bg-sky-500/25 border border-dashed border-sky-400/50 flex flex-col items-center justify-center font-mono text-[10px] text-sky-300 pointer-events-none select-none">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-sky-200">Content</span>
                        <span>{boxWidth}w × {boxHeight}h</span>
                      </div>
                    </div>

                    {/* Dimensions Badge values directly printed inside card view */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Total Envelope: <strong className="text-amber-400">{contentBoxTotalWidth}px × {contentBoxTotalHeight}px</strong>
                    </div>

                  </div>
                </div>
              </div>

              {/* Box B Preview card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col shadow-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Box B: border-box</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                    Safe Boundary
                  </span>
                </div>
                
                <div className="flex-1 min-h-[220px] flex items-center justify-center relative p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                  
                  {/* border-box simulation element */}
                  <div className="relative overflow-visible">

                    <div
                      style={{
                        boxSizing: "border-box",
                        width: `${boxWidth}px`,
                        height: `${boxHeight}px`,
                        padding: `${boxPadding}px`,
                        borderWidth: `${boxBorder}px`,
                        borderColor: "#10b981", // Emerald GREEN
                        borderStyle: "solid",
                        margin: `${boxMargin}px`,
                        backgroundColor: "rgba(14, 165, 233, 0.12)"
                      }}
                      className="relative border-slate-700/80 shadow-md mr-10"
                    >
                      {/* Internal custom content container representing real scaled content dimensions */}
                      <div 
                        style={{
                          width: `${borderBoxContentWidth}px`,
                          height: `${borderBoxContentHeight}px`
                        }}
                        className="absolute inset-x-0 inset-y-0 m-auto bg-sky-500/25 border border-dashed border-sky-400/50 flex flex-col items-center justify-center font-mono text-[10px] text-sky-300 pointer-events-none select-none overflow-hidden"
                      >
                        {borderBoxContentWidth > 24 && borderBoxContentHeight > 20 ? (
                          <>
                            <span className="font-bold uppercase tracking-wider text-[9px] text-sky-200">Content</span>
                            <span className="text-[9px]">{borderBoxContentWidth}w × {borderBoxContentHeight}h</span>
                          </>
                        ) : (
                          <span className="text-[8px] text-sky-300 font-bold">CRUSHED</span>
                        )}
                      </div>
                    </div>

                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Total Envelope: <strong className="text-emerald-400">{borderBoxTotalWidth}px × {borderBoxTotalHeight}px</strong>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Positioning Simulator Tab inside Main Stage */}
          {activeTab === "positioning" && (
            <div className="col-span-12 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-lg shrink-0">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Positioning Simulator Radar</span>
                <span className="text-[10px] text-pink-400 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping"></span>
                  GHOST_LINE_LOCK: {positioningReport.lineData.showLines ? "ACTIVE" : "OFFLINE"}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center p-6 min-h-[280px] relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Grandparent relative anchoring boundary block */}
                <div 
                  id="grandparent_radar_frame"
                  ref={gpRef}
                  className="relative w-11/12 h-[220px] bg-slate-950/80 rounded-xl border border-slate-800 p-3 overflow-hidden select-none"
                >
                  <span className="absolute top-1.5 right-2.5 text-[8.5px] font-mono text-slate-600 uppercase tracking-widest font-semibold">
                    .grandparent-container
                  </span>

                  {/* Parent level box inside radar */}
                  <div
                    ref={parentRef}
                    style={{ position: parentPosition }}
                    className={`w-10/12 h-[130px] mx-auto mt-6 rounded-lg border-2 border-dashed p-3 transition-colors duration-200 flex items-start justify-start ${
                      parentPosition !== "static"
                        ? "bg-slate-800/50 border-amber-500/50"
                        : "bg-slate-950/20 border-slate-800"
                    }`}
                  >
                    <span className="absolute top-1 left-2 text-[8.5px] font-mono text-slate-500 uppercase">
                      .parent-box ({parentPosition})
                    </span>

                    {/* Positioning Child Block */}
                    <div
                      ref={childRef}
                      style={{
                        position: childPosition,
                        top: childPosition !== "static" ? `${childTop}px` : undefined,
                        left: childPosition !== "static" ? `${childLeft}px` : undefined
                      }}
                      className={`w-14 h-12 bg-pink-500 rounded flex flex-col items-center justify-center font-bold text-white text-[11px] shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95 cursor-pointer select-none ${
                        childPosition === "static" ? "relative m-auto" : ""
                      }`}
                    >
                      <span className="leading-tight">Child</span>
                      <span className="text-[9px] font-mono font-medium text-pink-100 uppercase tracking-wide leading-none mt-0.5">
                        {childPosition}
                      </span>
                    </div>

                  </div>

                  {/* Positioning Coordinate Laser Paths (Dotted vector coordinates indicator system) */}
                  {positioningReport.lineData.showLines && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                        </marker>
                      </defs>

                      {/* Horizontal Laser path line vector trace */}
                      <line
                        x1={positioningReport.lineData.x1}
                        y1={positioningReport.lineData.y1}
                        x2={positioningReport.lineData.x2}
                        y2={positioningReport.lineData.y2}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        markerEnd="url(#arrow)"
                      />
                      <circle cx={positioningReport.lineData.x2} cy={positioningReport.lineData.y2} r="3" fill="#38bdf8" />

                      {/* Vertical Laser path line vector trace */}
                      <line
                        x1={positioningReport.lineData.px1}
                        y1={positioningReport.lineData.py1}
                        x2={positioningReport.lineData.px2}
                        y2={positioningReport.lineData.py2}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        markerEnd="url(#arrow)"
                      />
                      <circle cx={positioningReport.lineData.px2} cy={positioningReport.lineData.py2} r="3" fill="#38bdf8" />

                      {/* Pill box overlay trackers */}
                      <g transform={`translate(${(positioningReport.lineData.x1 + positioningReport.lineData.x2) / 2}, ${positioningReport.lineData.y1 - 6})`}>
                        <rect x="-18" y="-7" width="36" height="12" rx="2" fill="#020617" stroke="#334155" strokeWidth="0.5" />
                        <text fill="#38bdf8" fontSize="8px" fontFamily="monospace" textAnchor="middle" y="2">
                          L:{childLeft}px
                        </text>
                      </g>

                      <g transform={`translate(${positioningReport.lineData.px1 + 10}, ${(positioningReport.lineData.py1 + positioningReport.lineData.py2) / 2})`}>
                        <rect x="-18" y="-6" width="36" height="12" rx="2" fill="#020617" stroke="#334155" strokeWidth="0.5" />
                        <text fill="#38bdf8" fontSize="8px" fontFamily="monospace" textAnchor="middle" y="3">
                          T:{childTop}px
                        </text>
                      </g>
                    </svg>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Layout Wrapping Tab inside Main Stage */}
          {activeTab === "wrapping" && (
            <div className="col-span-12 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-lg shrink-0">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Row Wrapping Space Simulator</span>
                <span className={`text-[10px] font-mono flex items-center gap-1.5 font-bold ${physicalWrapOccurred ? "text-rose-400" : "text-emerald-400"}`}>
                  {physicalWrapOccurred ? "🚨 OVERFLOW DETECTION: WRAPPED" : "✓ FLOW: STABLE"}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[280px] gap-6 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* 500px flex sandbox container layout wrapper */}
                <div
                  className="flex flex-wrap border-2 p-2 rounded-xl border-slate-800 transition-all duration-300 relative content-start"
                  style={{
                    width: "500px",
                    height: "170px",
                    backgroundColor: physicalWrapOccurred ? "rgba(239, 68, 68, 0.05)" : "rgba(30, 41, 59, 0.15)",
                    borderColor: physicalWrapOccurred ? "#ef4444" : "#1e293b"
                  }}
                >
                  {/* Top limits overlay indicator label */}
                  <div className="absolute top-1.5 left-2.5 text-[8px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                    FLEX_CONTAINER_WIDTH: 500PX
                  </div>

                  {/* Nest three elements */}
                  {/* Block 1 */}
                  <div
                    ref={block1Ref}
                    style={{
                      boxSizing: "content-box",
                      width: `${wrapItemWidth}px`,
                      padding: `${wrapPadding}px`,
                      borderWidth: `${wrapBorder}px`,
                      borderColor: "#10b981",
                      borderStyle: "solid",
                      margin: `${wrapMargin}px`
                    }}
                    className="bg-emerald-500/10 text-emerald-400 flex flex-col items-center justify-center min-h-[60px] rounded border-emerald-400/80 transition-all duration-150"
                  >
                    <span className="text-[11px] font-bold">Block 1</span>
                    <span className="text-[9px] font-mono mt-0.5">{wrapItemTotalSpace}px</span>
                  </div>

                  {/* Block 2 */}
                  <div
                    style={{
                      boxSizing: "content-box",
                      width: `${wrapItemWidth}px`,
                      padding: `${wrapPadding}px`,
                      borderWidth: `${wrapBorder}px`,
                      borderColor: "#3b82f6",
                      borderStyle: "solid",
                      margin: `${wrapMargin}px`
                    }}
                    className="bg-blue-500/10 text-blue-400 flex flex-col items-center justify-center min-h-[60px] rounded border-blue-400/80 transition-all duration-150"
                  >
                    <span className="text-[11px] font-bold">Block 2</span>
                    <span className="text-[9px] font-mono mt-0.5">{wrapItemTotalSpace}px</span>
                  </div>

                  {/* Block 3 */}
                  <div
                    ref={block3Ref}
                    style={{
                      boxSizing: "content-box",
                      width: `${wrapItemWidth}px`,
                      padding: `${wrapPadding}px`,
                      borderWidth: `${wrapBorder}px`,
                      borderColor: physicalWrapOccurred ? "#ef4444" : "#10b981",
                      borderStyle: "solid",
                      margin: `${wrapMargin}px`
                    }}
                    className={`flex flex-col items-center justify-center min-h-[60px] rounded transition-all duration-150 ${
                      physicalWrapOccurred
                        ? "bg-rose-500/20 text-rose-300 animate-pulse border-2"
                        : "bg-emerald-500/10 text-emerald-400 border"
                    }`}
                  >
                    <span className="text-[11px] font-bold">Block 3</span>
                    <span className="text-[9px] font-mono mt-0.5">{wrapItemTotalSpace}px</span>
                  </div>

                  {/* Overflow simulation block indicators */}
                  {physicalWrapOccurred && (
                    <div className="absolute top-[28px] right-2 border border-dashed border-rose-500/30 text-[8px] text-rose-400 bg-rose-950/20 py-1.5 px-2 rounded h-[62px] w-[130px] flex items-center justify-center text-center">
                      Not enough room! Block 3 falls below.
                    </div>
                  )}

                </div>

                {/* Warning message card context */}
                {physicalWrapOccurred ? (
                  <div className="w-11/12 bg-rose-550/10 border border-rose-500/50 p-3 rounded-lg flex items-center gap-3 animate-pulse">
                    <span className="text-rose-400 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <p className="text-[10.5px] text-rose-300 leading-normal">
                      <strong>LAYOUT WRAPPED!</strong> Container width is <strong className="text-white font-mono">500px</strong>, but element demands total <strong className="text-white font-mono">{totalWrapCombinedWidth}px</strong> ({wrapItemTotalSpace}px × 3). Reduce Base Width or Margin to align them!
                    </p>
                  </div>
                ) : (
                  <div className="w-11/12 bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span>
                    <p className="text-[10.5px] text-slate-450 leading-normal font-mono">
                      Stable horizontal flow footprint: <strong className="text-slate-350">{totalWrapCombinedWidth}px</strong> fits in <strong className="text-slate-350">500px</strong> boundaries.
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}

        </section>
      </main>

      {/* 3. Bottom Layout Footer Frame */}
      <footer className="h-44 bg-slate-950 border-t border-slate-800 flex shrink-0 z-50">
        
        {/* Footer dynamic explanation box (Left aligned width 80 matching sidebar) */}
        <div className="w-80 border-r border-slate-800 p-4 flex flex-col overflow-y-auto shrink-0 bg-slate-900/10">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Logic Explanation</h4>
          
          {activeTab === "boxModelFlat" && (
            <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px]">
              Box A (<code className="text-amber-400">content-box</code>) expands. High-contrast padding and borders are added to the outside of the configured width. 
              Box B (<code className="text-emerald-400">border-box</code>) absorbs them inside, keeping layout fully preserved while scaling down internal area content.
            </p>
          )}

          {activeTab === "positioning" && (
            <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px]">
              Absolute elements look upwards for the nearest ancestor with <code className="text-sky-400">position: relative</code>, <code className="text-indigo-400">absolute</code>, or <code className="text-purple-400">fixed</code>. 
              If none is defined, coordinates snap directly to the main outermost Body frame.
            </p>
          )}

          {activeTab === "wrapping" && (
            <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px]">
              Flex rows automatically wrap elements when the combined total horizontal outer track widths (<code className="text-emerald-400">width + margin*2 + padding*2 + border*2</code>) exceeds parent box limits.
            </p>
          )}
        </div>

        {/* CSS Code box (Right aligned filling remaining area) */}
        <div className="flex-1 bg-slate-900/30 p-4 flex flex-col relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Generated CSS Code Block</span>
            
            <button
              id="copy_output_code"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-[10px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-sky-400" />
                  <span>Copy Styles</span>
                </>
              )}
            </button>
          </div>

          {/* Dynamic styled visual layout code code blocks */}
          <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded border border-slate-900 p-3 relative select-text font-mono text-[11px] leading-relaxed text-slate-300 max-h-[110px]">
            <pre className="whitespace-pre">
              {getGeneratedCss()}
            </pre>
          </div>

          {/* Absolute bottom visual context lights */}
          <div className="absolute bottom-2 right-4 flex gap-1">
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-1 h-1 bg-sky-500 rounded-full"></div>
          </div>
        </div>

      </footer>

    </div>
  );
}
