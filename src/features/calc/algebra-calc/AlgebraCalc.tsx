import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";

interface AlgebraCalcProps {
  tool: ToolDefinition;
}

export const AlgebraCalc: React.FC<AlgebraCalcProps> = ({ tool }) => {
  const [operation, setOperation] = useState<"solve_quad" | "derivative" | "integral" | "expand">("solve_quad");

  // Quadratic equation inputs: ax^2 + bx + c = 0
  const [quadA, setQuadA] = useState("1");
  const [quadB, setQuadB] = useState("-5");
  const [quadC, setQuadC] = useState("6");

  // Polynomial expression for calculus / expand
  const [polyExpr, setPolyExpr] = useState("3x^3 - 4x^2 + 5x - 7");

  // Quadratic solver
  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) return null;
    if (a === 0) {
      if (b === 0) return { roots: "No solution or infinite solutions", steps: ["0 = 0"] };
      const root = -c / b;
      return {
        roots: `Linear root: x = ${root.toFixed(4)}`,
        steps: [`${b}x + ${c} = 0`, `${b}x = ${-c}`, `x = ${-c}/${b} = ${root.toFixed(4)}`],
      };
    }

    const discriminant = b * b - 4 * a * c;
    const steps: string[] = [
      `Standard form: (${a})x² + (${b})x + (${c}) = 0`,
      `Discriminant Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${discriminant}`,
    ];

    if (discriminant > 0) {
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      steps.push(`Δ > 0: Two distinct real roots.`);
      steps.push(`x₁ = (-(${b}) + √${discriminant}) / (2 · ${a}) = ${x1.toFixed(4)}`);
      steps.push(`x₂ = (-(${b}) - √${discriminant}) / (2 · ${a}) = ${x2.toFixed(4)}`);
      return { roots: `x₁ = ${x1.toFixed(4)},  x₂ = ${x2.toFixed(4)}`, steps };
    } else if (discriminant === 0) {
      const x = -b / (2 * a);
      steps.push(`Δ = 0: One repeated real root.`);
      steps.push(`x = -(${b}) / (2 · ${a}) = ${x.toFixed(4)}`);
      return { roots: `x = ${x.toFixed(4)} (multiplicity 2)`, steps };
    } else {
      const real = (-b / (2 * a)).toFixed(4);
      const imag = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
      steps.push(`Δ < 0: Complex conjugate roots.`);
      steps.push(`x = ${real} ± ${imag}i`);
      return { roots: `x = ${real} ± ${imag}i`, steps };
    }
  };

  // Polynomial power rule derivative
  const computeDerivative = (expr: string) => {
    // Parse terms like 3x^3, -4x^2, +5x, -7
    const terms = expr.replace(/\s+/g, "").match(/[+-]?[^-+]+/g) || [];
    const derivTerms: string[] = [];
    const steps: string[] = [`Original function f(x) = ${expr}`];

    for (const t of terms) {
      const match = t.match(/^([+-]?\d*\.?\d*)?(?:x(?:\^([+-]?\d+))?)?$/);
      if (!match) continue;

      let coeffStr = match[1];
      const hasX = t.includes("x");
      const powerStr = match[2];

      let coeff = 1;
      if (coeffStr === "" || coeffStr === "+") coeff = 1;
      else if (coeffStr === "-") coeff = -1;
      else if (coeffStr) coeff = parseFloat(coeffStr);

      let power = 0;
      if (hasX) {
        power = powerStr !== undefined ? parseInt(powerStr, 10) : 1;
      }

      if (power === 0) {
        steps.push(`d/dx(${t}) = 0 (constant)`);
      } else {
        const newCoeff = coeff * power;
        const newPower = power - 1;
        let termStr = "";
        if (newPower === 0) termStr = `${newCoeff}`;
        else if (newPower === 1) termStr = `${newCoeff}x`;
        else termStr = `${newCoeff}x^${newPower}`;

        if (newCoeff > 0 && derivTerms.length > 0) termStr = `+${termStr}`;
        derivTerms.push(termStr);
        steps.push(`d/dx(${t}) = (${coeff} · ${power})x^(${power}-1) = ${termStr}`);
      }
    }

    const result = derivTerms.join(" ") || "0";
    return { result: `f'(x) = ${result}`, steps };
  };

  // Antiderivative
  const computeIntegral = (expr: string) => {
    const terms = expr.replace(/\s+/g, "").match(/[+-]?[^-+]+/g) || [];
    const integTerms: string[] = [];
    const steps: string[] = [`Integrating ∫ (${expr}) dx`];

    for (const t of terms) {
      const match = t.match(/^([+-]?\d*\.?\d*)?(?:x(?:\^([+-]?\d+))?)?$/);
      if (!match) continue;

      let coeffStr = match[1];
      const hasX = t.includes("x");
      const powerStr = match[2];

      let coeff = 1;
      if (coeffStr === "" || coeffStr === "+") coeff = 1;
      else if (coeffStr === "-") coeff = -1;
      else if (coeffStr) coeff = parseFloat(coeffStr);

      let power = 0;
      if (hasX) {
        power = powerStr !== undefined ? parseInt(powerStr, 10) : 1;
      }

      const newPower = power + 1;
      const newCoeff = (coeff / newPower).toFixed(2).replace(/\.00$/, "");
      let termStr = "";
      if (newPower === 1) termStr = `${newCoeff}x`;
      else termStr = `${newCoeff}x^${newPower}`;

      if (parseFloat(newCoeff) > 0 && integTerms.length > 0) termStr = `+${termStr}`;
      integTerms.push(termStr);
      steps.push(`∫ (${t}) dx = (${coeff}/${newPower})x^${newPower} = ${termStr}`);
    }

    const result = (integTerms.join(" ") || "0") + " + C";
    return { result: `F(x) = ${result}`, steps };
  };

  const quadResult = solveQuadratic();
  const derivResult = computeDerivative(polyExpr);
  const integResult = computeIntegral(polyExpr);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs w-fit">
          {[
            { id: "solve_quad", label: "Quadratic Equation (ax² + bx + c = 0)" },
            { id: "derivative", label: "Derivative d/dx" },
            { id: "integral", label: "Indefinite Integral ∫ dx" },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id as typeof operation)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                operation === op.id ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        {operation === "solve_quad" ? (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-200">Solve ax² + bx + c = 0</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Coefficient a (x²)</label>
                <input
                  type="number"
                  value={quadA}
                  onChange={(e) => setQuadA(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Coefficient b (x)</label>
                <input
                  type="number"
                  value={quadB}
                  onChange={(e) => setQuadB(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Constant c</label>
                <input
                  type="number"
                  value={quadC}
                  onChange={(e) => setQuadC(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-100"
                />
              </div>
            </div>

            {quadResult && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Roots</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {quadResult.roots}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">Step-by-Step Derivation</span>
                  <div className="space-y-1 text-xs font-mono text-zinc-400">
                    {quadResult.steps.map((step, idx) => (
                      <p key={idx}>{step}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-200">
              {operation === "derivative" ? "Compute Symbolic Derivative" : "Compute Symbolic Integral"}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Polynomial Function f(x)</label>
              <input
                type="text"
                value={polyExpr}
                onChange={(e) => setPolyExpr(e.target.value)}
                placeholder="e.g. 4x^3 - 5x^2 + 2x - 9"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-100 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Calculus Result</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {operation === "derivative" ? derivResult.result : integResult.result}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-zinc-300 block">Term-by-Term Calculus Steps</span>
                <div className="space-y-1 text-xs font-mono text-zinc-400">
                  {(operation === "derivative" ? derivResult.steps : integResult.steps).map((s, i) => (
                    <p key={i}>{s}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default AlgebraCalc;
