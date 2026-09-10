import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { ArrowRightLeft } from "lucide-react";

interface UnitConverterProps {
  tool: ToolDefinition;
}

type CategoryKey = "length" | "mass" | "storage" | "temp" | "speed" | "area";

interface UnitDef {
  id: string;
  name: string;
  toBase: (val: number) => number;
  fromBase: (base: number) => number;
}

const CATEGORIES: Record<CategoryKey, { name: string; baseUnit: string; units: UnitDef[] }> = {
  length: {
    name: "Length",
    baseUnit: "meters",
    units: [
      { id: "m", name: "Meters (m)", toBase: (v) => v, fromBase: (b) => b },
      { id: "km", name: "Kilometers (km)", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: "cm", name: "Centimeters (cm)", toBase: (v) => v / 100, fromBase: (b) => b * 100 },
      { id: "mm", name: "Millimeters (mm)", toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: "mi", name: "Miles (mi)", toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      { id: "yd", name: "Yards (yd)", toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: "ft", name: "Feet (ft)", toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: "in", name: "Inches (in)", toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
    ],
  },
  mass: {
    name: "Mass & Weight",
    baseUnit: "kilograms",
    units: [
      { id: "kg", name: "Kilograms (kg)", toBase: (v) => v, fromBase: (b) => b },
      { id: "g", name: "Grams (g)", toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      { id: "mg", name: "Milligrams (mg)", toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      { id: "lb", name: "Pounds (lb)", toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      { id: "oz", name: "Ounces (oz)", toBase: (v) => v * 0.028349523, fromBase: (b) => b / 0.028349523 },
      { id: "ton", name: "Metric Ton (t)", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    ],
  },
  storage: {
    name: "Digital Storage",
    baseUnit: "bytes",
    units: [
      { id: "B", name: "Bytes (B)", toBase: (v) => v, fromBase: (b) => b },
      { id: "KB", name: "Kilobytes (KB)", toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      { id: "MB", name: "Megabytes (MB)", toBase: (v) => v * 1024 ** 2, fromBase: (b) => b / 1024 ** 2 },
      { id: "GB", name: "Gigabytes (GB)", toBase: (v) => v * 1024 ** 3, fromBase: (b) => b / 1024 ** 3 },
      { id: "TB", name: "Terabytes (TB)", toBase: (v) => v * 1024 ** 4, fromBase: (b) => b / 1024 ** 4 },
      { id: "bit", name: "Bits (b)", toBase: (v) => v / 8, fromBase: (b) => b * 8 },
    ],
  },
  temp: {
    name: "Temperature",
    baseUnit: "celsius",
    units: [
      { id: "C", name: "Celsius (°C)", toBase: (v) => v, fromBase: (b) => b },
      { id: "F", name: "Fahrenheit (°F)", toBase: (v) => (v - 32) * (5 / 9), fromBase: (b) => b * (9 / 5) + 32 },
      { id: "K", name: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    ],
  },
  speed: {
    name: "Speed",
    baseUnit: "m/s",
    units: [
      { id: "mps", name: "Meters per second (m/s)", toBase: (v) => v, fromBase: (b) => b },
      { id: "kph", name: "Kilometers per hour (km/h)", toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: "mph", name: "Miles per hour (mph)", toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: "knot", name: "Knots (kn)", toBase: (v) => v * 0.514444, fromBase: (b) => b / 0.514444 },
    ],
  },
  area: {
    name: "Area",
    baseUnit: "sq meters",
    units: [
      { id: "sqm", name: "Square Meters (m²)", toBase: (v) => v, fromBase: (b) => b },
      { id: "sqkm", name: "Square Kilometers (km²)", toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: "sqft", name: "Square Feet (ft²)", toBase: (v) => v * 0.092903, fromBase: (b) => b / 0.092903 },
      { id: "acre", name: "Acres (ac)", toBase: (v) => v * 4046.86, fromBase: (b) => b / 4046.86 },
      { id: "ha", name: "Hectares (ha)", toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
    ],
  },
};

export const UnitConverter: React.FC<UnitConverterProps> = ({ tool }) => {
  const [category, setCategory] = useState<CategoryKey>("length");
  const currentCat = CATEGORIES[category];

  const [fromUnitId, setFromUnitId] = useState<string>(currentCat.units[0].id);
  const [toUnitId, setToUnitId] = useState<string>(currentCat.units[1].id);
  const [fromVal, setFromVal] = useState<number>(1);

  const fromUnit = currentCat.units.find((u) => u.id === fromUnitId) || currentCat.units[0];
  const toUnit = currentCat.units.find((u) => u.id === toUnitId) || currentCat.units[1];

  const baseVal = fromUnit.toBase(fromVal || 0);
  const toVal = toUnit.fromBase(baseVal);

  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-medium">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((catKey) => (
            <button
              key={catKey}
              onClick={() => {
                setCategory(catKey);
                setFromUnitId(CATEGORIES[catKey].units[0].id);
                setToUnitId(CATEGORIES[catKey].units[1].id);
              }}
              className={`px-4 py-2 rounded-xl transition ${
                category === catKey ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {CATEGORIES[catKey].name}
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
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
              >
                {currentCat.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={fromVal}
                onChange={(e) => setFromVal(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xl text-zinc-100 focus:border-emerald-500"
              />
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center pt-6">
              <button
                onClick={handleSwap}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Swap Units"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs text-zinc-400">To</label>
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
              >
                {currentCat.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <div className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xl text-emerald-400 select-all overflow-x-auto">
                {parseFloat(toVal.toFixed(8)).toString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference Table for All Units in this category */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400">
            {fromVal} {fromUnit.name} in all other {currentCat.name.toLowerCase()} units:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentCat.units.map((u) => {
              const val = u.fromBase(baseVal);
              return (
                <div key={u.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                  <span className="text-[11px] text-zinc-500 block">{u.name}</span>
                  <span className="text-sm font-bold font-mono text-zinc-200">
                    {parseFloat(val.toFixed(6)).toString()}
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

export default UnitConverter;
