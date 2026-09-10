import React from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Map kebab-case or pascal-case to Lucide component
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  // Explicit overrides for custom icon names
  const iconMap: Record<string, keyof typeof Icons> = {
    "swatch-book": "Palette",
    "pen-line": "PenLine",
    square: "Square",
    "gallery-vertical": "GalleryVertical",
    crop: "Crop",
    stamp: "Stamp",
    eye: "Eye",
    pipette: "Pipette",
    contrast: "Contrast",
    blend: "Blend",
    rainbow: "Rainbow",
    library: "Library",
    palette: "Palette",
    crosshair: "Crosshair",
    wind: "Wind",
    image: "Image",
    brush: "Brush",
    sparkles: "Sparkles",
    eraser: "Eraser",
    shrink: "Shrink",
    "refresh-cw": "RefreshCw",
    "vector-square": "Maximize",
    shapes: "Shapes",
    scissors: "Scissors",
    combine: "Combine",
    "scan-line": "ScanLine",
    "shield-check": "ShieldCheck",
    "clipboard-paste": "ClipboardPaste",
    "layout-grid": "LayoutGrid",
    "file-image": "FileImage",
    "file-code": "FileCode",
    "audio-lines": "AudioLines",
    clapperboard: "Clapperboard",
    "file-audio": "FileAudio",
    gauge: "Gauge",
    captions: "Captions",
    film: "Film",
    "monitor-up": "MonitorUp",
    subtitles: "Subtitles",
    clock: "Clock",
    "volume-x": "VolumeX",
    mic: "Mic",
    "audio-waveform": "Activity",
    "file-type-2": "FileType2",
    "file-type": "FileType",
    type: "Type",
    "case-upper": "CaseUpper",
    "file-text": "FileText",
    ruler: "Ruler",
    "git-compare": "GitCompare",
    hash: "Hash",
    "book-open": "BookOpen",
    "file-search": "FileSearch",
    "file-stack": "FileStack",
    "file-digit": "Binary",
    layers: "Layers",
    "calendar-clock": "CalendarClock",
    server: "Server",
    braces: "Braces",
    "key-square": "KeySquare",
    tag: "Tag",
    regex: "Regex",
    terminal: "Terminal",
    fingerprint: "Fingerprint",
    barcode: "Barcode",
    "key-round": "KeyRound",
    "qr-code": "QrCode",
    variable: "Variable",
    binary: "Binary",
    "line-chart": "LineChart",
    calculator: "Calculator",
    scale: "Scale",
    languages: "Languages",
    radio: "Radio",
    "grip-vertical": "GripVertical",
    ear: "Ear",
    "radio-tower": "RadioTower",
    banana: "Banana",
    "chef-hat": "ChefHat",
  };

  const resolvedName =
    iconMap[name] ||
    (pascalName in Icons ? (pascalName as keyof typeof Icons) : "Wrench");
  const IconComponent =
    (Icons[resolvedName] as React.FC<LucideProps>) || Icons.Wrench;

  return <IconComponent {...props} />;
};
