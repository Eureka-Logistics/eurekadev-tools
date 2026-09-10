import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { ArrowRightLeft, Sparkles } from "lucide-react";

interface StupidUnitsProps {
  tool: ToolDefinition;
}

type StupidCat = "length" | "area" | "volume" | "mass" | "time";

interface Unit {
  id: string;
  name: string;
  emoji: string;
  factor: number; // in standard SI base
  fact: string;
}

const STUPID_DATA: Record<StupidCat, { title: string; baseUnit: string; units: Unit[] }> = {
  length: {
    title: "Length & Height",
    baseUnit: "meters",
    units: [
      { id: "banana", name: "Bananas", emoji: "🍌", factor: 0.18, fact: "Average Cavendish banana length (~18 cm)" },
      { id: "bus", name: "Double-Decker Buses", emoji: "🚌", factor: 11.23, fact: "Standard London Routemaster bus length (11.23m)" },
      { id: "whale", name: "Blue Whales", emoji: "🐋", factor: 30, fact: "Adult blue whale length (~30m)" },
      { id: "football_p", name: "Football Pitches", emoji: "⚽", factor: 105, fact: "Standard FIFA pitch length (105m)" },
      { id: "eiffel", name: "Eiffel Towers", emoji: "🗼", factor: 330, fact: "Height of Eiffel Tower to tip (330m)" },
      { id: "burj", name: "Burj Khalifas", emoji: "🏙️", factor: 828, fact: "Tallest building on Earth (828m)" },
      { id: "meter", name: "Meters (Boring)", emoji: "📏", factor: 1, fact: "Standard metric meter" },
    ],
  },
  area: {
    title: "Surface Area",
    baseUnit: "sq meters",
    units: [
      { id: "wales", name: "Waleses", emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", factor: 20_779_000_000, fact: "The definitive British news unit of area (20,779 km²)" },
      { id: "vatican", name: "Vatican Cities", emoji: "🇻🇦", factor: 490_000, fact: "Smallest independent state (0.49 km²)" },
      { id: "pitch", name: "Football Pitches", emoji: "🏟️", factor: 7_140, fact: "105m x 68m FIFA pitch (7,140 m²)" },
      { id: "belgium", name: "Belgiums", emoji: "🇧🇪", factor: 30_689_000_000, fact: "The European media standard comparison (30,689 km²)" },
      { id: "wight", name: "Isles of Wight", emoji: "🏝️", factor: 380_000_000, fact: "Classic tabloid area unit (380 km²)" },
      { id: "sqm", name: "Square Meters", emoji: "📐", factor: 1, fact: "1 square meter" },
    ],
  },
  volume: {
    title: "Volume",
    baseUnit: "liters",
    units: [
      { id: "pool", name: "Olympic Swimming Pools", emoji: "🏊", factor: 2_500_000, fact: "50m x 25m x 2m pool (2.5 million liters)" },
      { id: "bathtub", name: "Bathtubs", emoji: "🛁", factor: 150, fact: "Average filled domestic bath (150 L)" },
      { id: "teaspoon", name: "Teaspoons", emoji: "🥄", factor: 0.005, fact: "Metric cooking teaspoon (5 mL)" },
      { id: "pint", name: "British Pints", emoji: "🍺", factor: 0.568261, fact: "1 Imperial pint of ale (568 mL)" },
      { id: "liter", name: "Liters", emoji: "🥛", factor: 1, fact: "1 metric liter" },
    ],
  },
  mass: {
    title: "Mass & Heaviness",
    baseUnit: "kilograms",
    units: [
      { id: "elephant", name: "African Elephants", emoji: "🐘", factor: 6000, fact: "Adult male bush elephant (~6,000 kg)" },
      { id: "grand_piano", name: "Concert Grand Pianos", emoji: "🎹", factor: 450, fact: "Steinway Model D piano (~450 kg)" },
      { id: "baguette", name: "Baguettes", emoji: "🥖", factor: 0.25, fact: "Standard French tradition baguette (250g)" },
      { id: "bus_weight", name: "London Buses", emoji: "🚌", factor: 12000, fact: "Double-decker kerb weight (~12 tonnes)" },
      { id: "kg", name: "Kilograms", emoji: "⚖️", factor: 1, fact: "1 kilogram" },
    ],
  },
  time: {
    title: "Time & Duration",
    baseUnit: "seconds",
    units: [
      { id: "warhol", name: "Warhols", emoji: "🎨", factor: 900, fact: "Andy Warhol's promised 15 minutes of fame (900s)" },
      { id: "scaramucci", name: "Scaramuccis (Mooches)", emoji: "💼", factor: 950400, fact: "Anthony Scaramucci's tenure as White House Comm Dir (11 days)" },
      { id: "microfortnight", name: "Microfortnights", emoji: "⏱️", factor: 1.2096, fact: "One millionth of 14 days (~1.21 seconds)" },
      { id: "dog_year", name: "Dog Years", emoji: "🐶", factor: 4505142, fact: "Approximately 52.14 human days per dog year" },
      { id: "sec", name: "Seconds", emoji: "⏳", factor: 1, fact: "1 SI second" },
    ],
  },
};

export const StupidUnits: React.FC<StupidUnitsProps> = ({ tool }) => {
  const [cat, setCat] = useState<StupidCat>("length");
  const currentData = STUPID_DATA[cat];

  const [fromId, setFromId] = useState(currentData.units[0].id);
  const [toId, setToId] = useState(currentData.units[1].id);
  const [amount, setAmount] = useState(1);

  const fromUnit = currentData.units.find((u) => u.id === fromId) || currentData.units[0];
  const toUnit = currentData.units.find((u) => u.id === toId) || currentData.units[1];

  const baseVal = amount * fromUnit.factor;
  const converted = baseVal / toUnit.factor;

  const handleSwap = () => {
    const tmp = fromId;
    setFromId(toId);
    setToId(tmp);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium">
          {(Object.keys(STUPID_DATA) as StupidCat[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setCat(key);
                setFromId(STUPID_DATA[key].units[0].id);
                setToId(STUPID_DATA[key].units[1].id);
              }}
              className={`px-4 py-2 rounded-xl transition ${
                cat === key ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {STUPID_DATA[key].title}
            </button>
          ))}
        </div>

        {/* Converter Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* From */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs text-zinc-400">From</label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
              >
                {currentData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.emoji} {u.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xl text-zinc-100 focus:border-emerald-500"
              />
              <p className="text-[11px] text-zinc-500">{fromUnit.fact}</p>
            </div>

            {/* Swap */}
            <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
              <button
                onClick={handleSwap}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Swap"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs text-zinc-400">To</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
              >
                {currentData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.emoji} {u.name}
                  </option>
                ))}
              </select>
              <div className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xl text-emerald-400 select-all overflow-x-auto">
                {parseFloat(converted.toFixed(6)).toString()}
              </div>
              <p className="text-[11px] text-zinc-500">{toUnit.fact}</p>
            </div>
          </div>
        </div>

        {/* Fun equivalence grid */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Equivalencies for {amount} {fromUnit.name}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentData.units.map((u) => {
              const eq = baseVal / u.factor;
              return (
                <div key={u.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{u.emoji}</span>
                    <span className="text-xs font-medium text-zinc-300">{u.name}</span>
                  </div>
                  <span className="text-base font-bold font-mono text-emerald-400 block">
                    {parseFloat(eq.toFixed(4)).toString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default StupidUnits;
