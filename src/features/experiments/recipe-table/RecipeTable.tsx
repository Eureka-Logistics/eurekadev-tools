import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  ChefHat,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
} from "lucide-react";

interface RecipeTableProps {
  tool: ToolDefinition;
}

interface RecipeStep {
  id: string;
  ingredients: { name: string; amount: string }[];
  instruction: string;
}

export const RecipeTable: React.FC<RecipeTableProps> = ({ tool }) => {
  const [recipeTitle, setRecipeTitle] = useState("Engineer's Fluffy Pancakes");
  const [steps, setSteps] = useState<RecipeStep[]>([
    {
      id: "1",
      ingredients: [
        { name: "All-purpose flour", amount: "200 g" },
        { name: "Baking powder", amount: "2 tsp" },
        { name: "Granulated sugar", amount: "2 tbsp" },
        { name: "Salt", amount: "1/2 tsp" },
      ],
      instruction: "Whisk dry ingredients together in large bowl",
    },
    {
      id: "2",
      ingredients: [
        { name: "Whole milk", amount: "250 ml" },
        { name: "Large egg", amount: "1 pc" },
        { name: "Melted butter", amount: "30 g" },
        { name: "Vanilla extract", amount: "1 tsp" },
      ],
      instruction: "Whisk wet ingredients in separate bowl, then combine with dry bowl",
    },
    {
      id: "3",
      ingredients: [
        { name: "Vegetable oil / Butter", amount: "for pan" },
      ],
      instruction: "Cook on skillet at 180°C (medium heat) for 2 min per side until golden",
    },
  ]);

  const [copied, setCopied] = useState(false);

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ingredients: [{ name: "New ingredient", amount: "100 g" }],
        instruction: "Mix and combine",
      },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const addIngredient = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, ingredients: [...s.ingredients, { name: "Ingredient", amount: "1 unit" }] }
          : s
      )
    );
  };

  const removeIngredient = (stepId: string, idx: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, ingredients: s.ingredients.filter((_, i) => i !== idx) }
          : s
      )
    );
  };

  const generateHtmlTable = (): string => {
    let rows = "";
    steps.forEach((s) => {
      s.ingredients.forEach((ing, i) => {
        rows += `  <tr>\n`;
        rows += `    <td style="border:1px solid #3f3f46;padding:8px;font-family:monospace;">${ing.amount}</td>\n`;
        rows += `    <td style="border:1px solid #3f3f46;padding:8px;">${ing.name}</td>\n`;
        if (i === 0) {
          rows += `    <td rowspan="${s.ingredients.length}" style="border:1px solid #3f3f46;padding:8px;background:#18181b;color:#10b981;font-weight:bold;vertical-align:middle;">${s.instruction}</td>\n`;
        }
        rows += `  </tr>\n`;
      });
    });

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${recipeTitle} - Cooking for Engineers Table</title>
<style>
body { font-family: sans-serif; background: #09090b; color: #f4f4f5; padding: 24px; }
table { border-collapse: collapse; width: 100%; max-width: 800px; margin: 0 auto; background: #18181b; }
th { background: #27272a; border: 1px solid #3f3f46; padding: 10px; text-align: left; }
</style>
</head>
<body>
<h1>${recipeTitle}</h1>
<table>
  <thead>
    <tr><th>Amount</th><th>Ingredient</th><th>Assembly Instruction</th></tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>
</body>
</html>`;
  };

  const handleDownload = () => {
    const html = generateHtmlTable();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `${recipeTitle.toLowerCase().replace(/\s+/g, "-")}.html`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateHtmlTable());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <ChefHat className="w-6 h-6 text-emerald-400" />
            <input
              type="text"
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
              className="text-base font-bold text-zinc-100 bg-transparent border-b border-zinc-700 focus:border-emerald-500 focus:outline-none flex-1 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addStep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stage</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export HTML</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Copy HTML"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Engineer's Recipe Flow Chart Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                <th className="p-3 w-32">Amount</th>
                <th className="p-3 w-64">Ingredient</th>
                <th className="p-3">Assembly & Cooking Instruction</th>
                <th className="p-3 w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {steps.map((step) =>
                step.ingredients.map((ing, i) => (
                  <tr key={`${step.id}-${i}`} className="hover:bg-zinc-850/40">
                    <td className="p-3 border-r border-zinc-800/60 font-mono">
                      <input
                        type="text"
                        value={ing.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSteps((prev) =>
                            prev.map((s) =>
                              s.id === step.id
                                ? {
                                    ...s,
                                    ingredients: s.ingredients.map((item, idx) =>
                                      idx === i ? { ...item, amount: val } : item
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                        className="w-full bg-transparent text-emerald-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-3 border-r border-zinc-800/60">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSteps((prev) =>
                              prev.map((s) =>
                                s.id === step.id
                                ? {
                                    ...s,
                                    ingredients: s.ingredients.map((item, idx) =>
                                      idx === i ? { ...item, name: val } : item
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                          className="w-full bg-transparent text-zinc-200 focus:outline-none"
                        />
                        {step.ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredient(step.id, i)}
                            className="text-zinc-600 hover:text-rose-400 p-0.5"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </td>
                    {i === 0 && (
                      <td
                        rowSpan={step.ingredients.length}
                        className="p-4 border-r border-zinc-800/60 bg-zinc-950/40 align-middle"
                      >
                        <div className="space-y-2">
                          <textarea
                            value={step.instruction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSteps((prev) =>
                                prev.map((s) => (s.id === step.id ? { ...s, instruction: val } : s))
                              );
                            }}
                            rows={2}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 font-medium focus:border-emerald-500 focus:outline-none resize-none"
                          />
                          <button
                            onClick={() => addIngredient(step.id)}
                            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Ingredient to this stage
                          </button>
                        </div>
                      </td>
                    )}
                    {i === 0 && (
                      <td
                        rowSpan={step.ingredients.length}
                        className="p-3 text-right align-middle"
                      >
                        {steps.length > 1 && (
                          <button
                            onClick={() => removeStep(step.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition"
                            title="Remove Stage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ToolShell>
  );
};

export default RecipeTable;
