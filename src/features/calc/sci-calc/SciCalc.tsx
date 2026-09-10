import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import {
  History,
  Trash2,
  Delete,
} from "lucide-react";

interface SciCalcProps {
  tool: ToolDefinition;
}

export const SciCalc: React.FC<SciCalcProps> = ({ tool }) => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<{ expr: string; res: string }[]>([]);
  const [isRad, setIsRad] = useState(true);

  const appendChar = (char: string) => {
    if (display === "0" && !isNaN(Number(char))) {
      setDisplay(char);
    } else {
      setDisplay((prev) => prev + char);
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setExpression("");
  };

  const backspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const calculateFactorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= Math.min(n, 100); i++) res *= i;
    return res;
  };

  const applyMathFunc = (fn: string) => {
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    const toRad = isRad ? val : (val * Math.PI) / 180;

    switch (fn) {
      case "sin": res = Math.sin(toRad); break;
      case "cos": res = Math.cos(toRad); break;
      case "tan": res = Math.tan(toRad); break;
      case "asin": res = isRad ? Math.asin(val) : (Math.asin(val) * 180) / Math.PI; break;
      case "acos": res = isRad ? Math.acos(val) : (Math.acos(val) * 180) / Math.PI; break;
      case "atan": res = isRad ? Math.atan(val) : (Math.atan(val) * 180) / Math.PI; break;
      case "ln": res = Math.log(val); break;
      case "log10": res = Math.log10(val); break;
      case "sqrt": res = Math.sqrt(val); break;
      case "sqr": res = val * val; break;
      case "inv": res = 1 / val; break;
      case "fact": res = calculateFactorial(Math.floor(val)); break;
      case "exp": res = Math.exp(val); break;
      case "neg": res = -val; break;
      default: return;
    }

    const formatted = parseFloat(res.toFixed(10)).toString();
    setHistory((prev) => [{ expr: `${fn}(${display})`, res: formatted }, ...prev.slice(0, 19)]);
    setDisplay(formatted);
  };

  const evaluate = () => {
    try {
      // Safe math expression evaluation
      let sanitized = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `${Math.PI}`)
        .replace(/e/g, `${Math.E}`)
        .replace(/\^/g, "**");

      // evaluate with Function sandbox for basic math
      const res = Function(`"use strict"; return (${sanitized})`)();
      const formatted = parseFloat(Number(res).toFixed(10)).toString();

      setHistory((prev) => [{ expr: display, res: formatted }, ...prev.slice(0, 19)]);
      setExpression(`${display} =`);
      setDisplay(formatted);
    } catch {
      setDisplay("Error");
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator main */}
          <div className="lg:col-span-2 space-y-4">
            {/* Display screen */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-right space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <button
                  onClick={() => setIsRad(!isRad)}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold hover:bg-zinc-700"
                >
                  {isRad ? "RAD" : "DEG"}
                </button>
                <span>{expression}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-100 overflow-x-auto tracking-wide">
                {display}
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-5 gap-2 text-sm font-medium">
              {/* Row 1 */}
              <button onClick={() => applyMathFunc("sin")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">sin</button>
              <button onClick={() => applyMathFunc("cos")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">cos</button>
              <button onClick={() => applyMathFunc("tan")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">tan</button>
              <button onClick={() => appendChar("π")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">π</button>
              <button onClick={clearAll} className="p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-bold">AC</button>

              {/* Row 2 */}
              <button onClick={() => applyMathFunc("ln")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">ln</button>
              <button onClick={() => applyMathFunc("log10")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">log</button>
              <button onClick={() => appendChar("^")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">x^y</button>
              <button onClick={() => appendChar("e")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">e</button>
              <button onClick={backspace} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center">
                <Delete className="w-4 h-4" />
              </button>

              {/* Row 3 */}
              <button onClick={() => applyMathFunc("sqrt")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">√x</button>
              <button onClick={() => appendChar("(")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">(</button>
              <button onClick={() => appendChar(")")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">)</button>
              <button onClick={() => applyMathFunc("fact")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">n!</button>
              <button onClick={() => appendChar("÷")} className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-lg">÷</button>

              {/* Row 4 */}
              <button onClick={() => applyMathFunc("sqr")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">x²</button>
              <button onClick={() => appendChar("7")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">7</button>
              <button onClick={() => appendChar("8")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">8</button>
              <button onClick={() => appendChar("9")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">9</button>
              <button onClick={() => appendChar("×")} className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-lg">×</button>

              {/* Row 5 */}
              <button onClick={() => applyMathFunc("inv")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">1/x</button>
              <button onClick={() => appendChar("4")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">4</button>
              <button onClick={() => appendChar("5")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">5</button>
              <button onClick={() => appendChar("6")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">6</button>
              <button onClick={() => appendChar("-")} className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-lg">-</button>

              {/* Row 6 */}
              <button onClick={() => applyMathFunc("neg")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">±</button>
              <button onClick={() => appendChar("1")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">1</button>
              <button onClick={() => appendChar("2")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">2</button>
              <button onClick={() => appendChar("3")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">3</button>
              <button onClick={() => appendChar("+")} className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-lg">+</button>

              {/* Row 7 */}
              <button onClick={() => applyMathFunc("exp")} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">eˣ</button>
              <button onClick={() => appendChar("0")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold col-span-2 text-center">0</button>
              <button onClick={() => appendChar(".")} className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold">.</button>
              <button onClick={evaluate} className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-900/30">=</button>
            </div>
          </div>

          {/* History sidebar */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                Calculation History
              </h4>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
              {history.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-8">
                  History is empty. Calculations will appear here.
                </p>
              ) : (
                history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setDisplay(h.res)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 cursor-pointer border border-zinc-850 text-right transition"
                  >
                    <span className="text-[11px] text-zinc-500 font-mono block">{h.expr} =</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">{h.res}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default SciCalc;
