import { useEffect, useRef } from "react";

type Elem = "C" | "N" | "O";

// Creatine (C4H9N3O2) skeleton: H2N-C(=NH)-N(CH3)-CH2-COOH, rough 3D coords
const ATOMS: { el: Elem; p: [number, number, number] }[] = [
  { el: "C", p: [0, 0, 0] }, // 0 guanidine C
  { el: "N", p: [-1.25, -0.75, 0.35] }, // 1 NH2
  { el: "N", p: [0, 1.45, -0.35] }, // 2 =NH
  { el: "N", p: [1.25, -0.75, 0.2] }, // 3 N-CH3
  { el: "C", p: [1.3, -2.2, 0.85] }, // 4 CH3
  { el: "C", p: [2.55, 0.0, -0.55] }, // 5 CH2
  { el: "C", p: [3.85, -0.75, 0.1] }, // 6 carboxyl C
  { el: "O", p: [4.05, -2.15, 0.65] }, // 7 =O
  { el: "O", p: [4.95, 0.2, -0.45] }, // 8 OH
];

const BONDS: [number, number, 1 | 2][] = [
  [0, 1, 1],
  [0, 2, 2],
  [0, 3, 1],
  [3, 4, 1],
  [3, 5, 1],
  [5, 6, 1],
  [6, 7, 2],
  [6, 8, 1],
];

// Black and white only; elements differ by shade: carbon dark, nitrogen light
// grey, oxygen white. Each is a lit sphere (highlight top-left) for depth.
const SHADE: Record<Elem, [string, string]> = {
  C: ["#6b6b6b", "#050505"],
  N: ["#f0f0f0", "#6e6e6e"],
  O: ["#ffffff", "#b9b9b9"],
};
const RING_R = 2.8;
const RING_PTS = 72;
const RINGS: [number, number][] = [
  [1.15, 0.3],
  [-0.55, -0.9],
];

// Functional groups named next to the atom they are attached to
const LABELS: { atom: number; name: string }[] = [
  { atom: 0, name: "Guanidino" },
  { atom: 1, name: "Amino" },
  { atom: 4, name: "Methyl" },
  { atom: 6, name: "Carboxyl" },
];
const SYMBOL_FILL: Record<Elem, string> = { C: "#fff", N: "#000", O: "#000" };
const RADIUS: Record<Elem, number> = { C: 0.3, N: 0.34, O: 0.32 };

const CX = ATOMS.reduce((a, b) => a + b.p[0], 0) / ATOMS.length;
const CY = ATOMS.reduce((a, b) => a + b.p[1], 0) / ATOMS.length;
const CZ = ATOMS.reduce((a, b) => a + b.p[2], 0) / ATOMS.length;
const depth = (z: number) => 0.4 + 0.6 * Math.min(1, Math.max(0, (z + 3) / 6));
const SCALE = 50; // px per unit in the 400x400 viewBox
const TILT = 0.32;

// Rotating ball-and-stick creatine molecule, pure SVG: no network request.
export default function CreatineMolecule() {
  const svgRef = useRef<SVGSVGElement>(null);
  // each atom is a <g>: opaque lit sphere + black disc on top for the depth fade
  const atomRefs = useRef<(SVGGElement | null)[]>([]);
  const bondRefs = useRef<(SVGLineElement | null)[][]>([]);
  const ringRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const labelRefs = useRef<
    { line: SVGLineElement | null; text: SVGTextElement | null }[]
  >([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let angle = 0.6;
    let raf = 0;
    let visible = true;
    let last = 0;

    const draw = () => {
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const pts = ATOMS.map(({ p }) => {
        const x0 = p[0] - CX;
        const y0 = p[1] - CY;
        const z0 = p[2] - CZ;
        // rotate around Y, then tilt around X
        const x1 = x0 * ca + z0 * sa;
        const z1 = -x0 * sa + z0 * ca;
        const y2 = y0 * ct - z1 * st;
        const z2 = y0 * st + z1 * ct;
        const persp = 1 / (1 - z2 * 0.07);
        return {
          x: 200 + x1 * SCALE * persp,
          y: 200 + y2 * SCALE * persp,
          z: z2,
          s: persp,
        };
      });
      atomRefs.current.forEach((g, i) => {
        if (!g) return;
        const q = pts[i];
        const r = (RADIUS[ATOMS[i].el] * SCALE * q.s).toFixed(2);
        g.querySelectorAll("circle").forEach((c, k) => {
          c.setAttribute("cx", q.x.toFixed(2));
          c.setAttribute("cy", q.y.toFixed(2));
          c.setAttribute("r", r);
          // far atoms darken (never see-through); near ones stay full strength
          if (k === 1) c.setAttribute("opacity", (1 - depth(q.z)).toFixed(2));
        });
        const sym = g.querySelector("text");
        if (sym) {
          sym.setAttribute("x", q.x.toFixed(2));
          sym.setAttribute("y", q.y.toFixed(2));
          sym.setAttribute("font-size", (Number(r) * 1.05).toFixed(1));
          sym.setAttribute("opacity", depth(q.z).toFixed(2));
        }
      });
      BONDS.forEach(([a, b, order], i) => {
        const A = pts[a];
        const B = pts[b];
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        // stop bonds at the atom edge so they don't show through the spheres
        const ra = RADIUS[ATOMS[a].el] * SCALE * A.s;
        const rb = RADIUS[ATOMS[b].el] * SCALE * B.s;
        const hide = len <= ra + rb;
        const nx = -uy * 3.2;
        const ny = ux * 3.2;
        const lines = bondRefs.current[i] || [];
        lines.forEach((l, k) => {
          if (!l) return;
          const off = order === 2 ? (k === 0 ? 1 : -1) : 0;
          l.style.display = hide ? "none" : "";
          l.setAttribute("opacity", depth((A.z + B.z) / 2).toFixed(2));
          l.setAttribute("x1", (A.x + ux * ra + nx * off).toFixed(2));
          l.setAttribute("y1", (A.y + uy * ra + ny * off).toFixed(2));
          l.setAttribute("x2", (B.x - ux * rb + nx * off).toFixed(2));
          l.setAttribute("y2", (B.y - uy * rb + ny * off).toFixed(2));
        });
      });
      // Name tags: leader line + text pushed outward from the molecule centre
      LABELS.forEach(({ atom }, li) => {
        const ref = labelRefs.current[li];
        if (!ref?.line || !ref.text) return;
        const q = pts[atom];
        let dx = q.x - 200;
        let dy = q.y - 200;
        const l = Math.hypot(dx, dy) || 1;
        dx /= l;
        dy /= l;
        const r = RADIUS[ATOMS[atom].el] * SCALE * q.s;
        const x1 = q.x + dx * (r + 3);
        const y1 = q.y + dy * (r + 3);
        const x2 = q.x + dx * (r + 26);
        const y2 = q.y + dy * (r + 26);
        const o = depth(q.z).toFixed(2);
        ref.line.setAttribute("x1", x1.toFixed(1));
        ref.line.setAttribute("y1", y1.toFixed(1));
        ref.line.setAttribute("x2", x2.toFixed(1));
        ref.line.setAttribute("y2", y2.toFixed(1));
        ref.line.setAttribute("opacity", o);
        ref.text.setAttribute(
          "x",
          (x2 + (dx > 0.2 ? 5 : dx < -0.2 ? -5 : 0)).toFixed(1),
        );
        ref.text.setAttribute("y", y2.toFixed(1));
        ref.text.setAttribute(
          "text-anchor",
          dx > 0.2 ? "start" : dx < -0.2 ? "end" : "middle",
        );
        ref.text.setAttribute("opacity", o);
      });
      // Orbit rings share the rotation, so they spin around the molecule
      RINGS.forEach(([ax, az], r) => {
        const el = ringRefs.current[r];
        if (!el) return;
        const out: string[] = [];
        for (let k = 0; k < RING_PTS; k++) {
          const th = (k / RING_PTS) * Math.PI * 2;
          let x0 = Math.cos(th) * RING_R;
          let y0 = 0;
          let z0 = Math.sin(th) * RING_R;
          const y1 = y0 * Math.cos(ax) - z0 * Math.sin(ax);
          z0 = y0 * Math.sin(ax) + z0 * Math.cos(ax);
          y0 = y1;
          const x1 = x0 * Math.cos(az) - y0 * Math.sin(az);
          y0 = x0 * Math.sin(az) + y0 * Math.cos(az);
          x0 = x1;
          const xr = x0 * ca + z0 * sa;
          const zr = -x0 * sa + z0 * ca;
          const yr = y0 * ct - zr * st;
          const zz = y0 * st + zr * ct;
          const pp = 1 / (1 - zz * 0.07);
          out.push(
            `${(200 + xr * SCALE * pp).toFixed(1)},${(200 + yr * SCALE * pp).toFixed(1)}`,
          );
        }
        el.setAttribute("points", out.join(" "));
      });
      // SVG has no z-index: reorder nodes back-to-front
      const g = svg.querySelector("#atoms");
      if (g) {
        const order = ATOMS.map((_, i) => i).sort(
          (i, j) => pts[i].z - pts[j].z,
        );
        order.forEach((i) => {
          const c = atomRefs.current[i];
          if (c) g.appendChild(c);
        });
      }
    };

    draw();
    if (reduce) return; // static pose

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      // ~30fps is plenty and keeps low-end phones cool
      if (now - last < 33) return;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      angle += dt * 0.55;
      draw();
    };
    raf = requestAnimationFrame(tick);

    // Stop animating when scrolled out of view
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "50px" },
    );
    io.observe(svg);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      overflow="visible"
      className="w-full h-auto"
      role="img"
      aria-label="Creatine molecule"
    >
      <defs>
        {(Object.keys(SHADE) as Elem[]).map((el) => (
          <radialGradient key={el} id={`mol-${el}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={SHADE[el][0]} />
            <stop offset="100%" stopColor={SHADE[el][1]} />
          </radialGradient>
        ))}
      </defs>
      <g fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
        {RINGS.map((_, r) => (
          <polyline
            key={r}
            ref={(el) => {
              ringRefs.current[r] = el;
            }}
          />
        ))}
      </g>
      <g stroke="rgba(255,255,255,0.6)" strokeLinecap="round">
        {BONDS.map(([, , order], i) => (
          <g key={i}>
            {Array.from({ length: order }).map((_, k) => (
              <line
                key={k}
                strokeWidth={order === 2 ? 1.2 : 1.6}
                ref={(el) => {
                  (bondRefs.current[i] ||= [])[k] = el;
                }}
              />
            ))}
          </g>
        ))}
      </g>
      <g id="atoms">
        {ATOMS.map(({ el }, i) => (
          <g
            key={i}
            ref={(g) => {
              atomRefs.current[i] = g;
            }}
          >
            <circle fill={`url(#mol-${el})`} />
            <circle fill="#000" />
            <circle
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.4"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontWeight="600"
              fill={SYMBOL_FILL[el]}
              style={{ fontFamily: "inherit", pointerEvents: "none" }}
            >
              {el}
            </text>
          </g>
        ))}
      </g>
      <g
        fill="rgba(255,255,255,0.85)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1"
        style={{ fontFamily: "inherit" }}
      >
        {LABELS.map(({ name }, li) => (
          <g key={name}>
            <line
              ref={(el) => {
                (labelRefs.current[li] ||= { line: null, text: null }).line =
                  el;
              }}
            />
            <text
              stroke="none"
              fontSize="11"
              letterSpacing="1.4"
              dominantBaseline="central"
              style={{ textTransform: "uppercase" }}
              ref={(el) => {
                (labelRefs.current[li] ||= { line: null, text: null }).text =
                  el;
              }}
            >
              {name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
