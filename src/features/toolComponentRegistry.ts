import React from "react";
import { GenericToolView } from "./GenericToolView";
import { ToolDefinition } from "@/types/tool";

// Registry of custom implemented tool components
const customRegistry: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<{ tool: ToolDefinition }>>
> = {
  // Batch 1: Core Developer Tools
  "json-formatter": React.lazy(
    () => import("./dev/json-formatter/JsonFormatter"),
  ),
  "jwt-decoder": React.lazy(() => import("./dev/jwt-decoder/JwtDecoder")),
  "uuid-genny": React.lazy(() => import("./dev/uuid-genny/UuidGenny")),
  "regex-tester": React.lazy(() => import("./dev/regex-tester/RegexTester")),
  "cron-builder": React.lazy(() => import("./dev/cron-builder/CronBuilder")),
  "http-status": React.lazy(() => import("./dev/http-status/HttpStatus")),
  "request-builder": React.lazy(
    () => import("./dev/request-builder/RequestBuilder"),
  ),
  "meta-tag-genny": React.lazy(
    () => import("./dev/meta-tag-genny/MetaTagGenny"),
  ),
  "tailwind-cheatsheet": React.lazy(
    () => import("./dev/tailwind-cheatsheet/TailwindCheatsheet"),
  ),
  // Batch 3: Images & Assets
  "background-remover": React.lazy(
    () => import("./images/background-remover/BackgroundRemover"),
  ),
  "image-compressor": React.lazy(
    () => import("./images/image-compressor/ImageCompressor"),
  ),
  "image-converter": React.lazy(
    () => import("./images/image-converter/ImageConverter"),
  ),
  "favicon-genny": React.lazy(
    () => import("./images/favicon-genny/FaviconGenny"),
  ),
  "image-masker": React.lazy(() => import("./images/image-masker/ImageMasker")),
  "image-splitter": React.lazy(
    () => import("./images/image-splitter/ImageSplitter"),
  ),
  "image-stitcher": React.lazy(
    () => import("./images/image-stitcher/ImageStitcher"),
  ),
  "image-clipper": React.lazy(
    () => import("./images/image-clipper/ImageClipper"),
  ),
  "paste-image": React.lazy(
    () => import("./images/paste-image/PasteImage"),
  ),
  "placeholder-genny": React.lazy(
    () => import("./images/placeholder-genny/PlaceholderGenny"),
  ),
  "base64-image-encoder": React.lazy(
    () => import("./images/base64-image-encoder/Base64ImageEncoder"),
  ),
  "metadata-stripper": React.lazy(
    () => import("./images/metadata-stripper/MetadataStripper"),
  ),
  "svg-optimiser": React.lazy(
    () => import("./images/svg-optimiser/SvgOptimiser"),
  ),
  "image-deskewer": React.lazy(
    () => import("./images/image-deskewer/ImageDeskewer"),
  ),
  "image-tracer": React.lazy(
    () => import("./images/image-tracer/ImageTracer"),
  ),
  "artwork-enhancer": React.lazy(
    () => import("./images/artwork-enhancer/ArtworkEnhancer"),
  ),
  "image-atlas": React.lazy(
    () => import("./images/image-atlas/ImageAtlas"),
  ),
  "substrata": React.lazy(
    () => import("./images/substrata/SubstrataEditor"),
  ),
  // Batch: Social Media
  "matte-genny": React.lazy(
    () => import("./social/matte-genny/MatteGenny"),
  ),
  "scroll-genny": React.lazy(
    () => import("./social/scroll-genny/ScrollGenny"),
  ),
  "social-cropper": React.lazy(
    () => import("./social/social-cropper/SocialCropper"),
  ),
  "watermarker": React.lazy(
    () => import("./social/watermarker/Watermarker"),
  ),
  // Batch: Colour Tools
  "colour-converter": React.lazy(
    () => import("./colour/colour-converter/ColourConverter"),
  ),
  "contrast-checker": React.lazy(
    () => import("./colour/contrast-checker/ContrastChecker"),
  ),
  "colour-atlas": React.lazy(
    () => import("./colour/colour-atlas/ColourAtlas"),
  ),
  "colorblind-sim": React.lazy(
    () => import("./colour/colorblind-sim/ColorblindSim"),
  ),
  "gradient-genny": React.lazy(
    () => import("./colour/gradient-genny/GradientGenny"),
  ),
  "harmony-genny": React.lazy(
    () => import("./colour/harmony-genny/HarmonyGenny"),
  ),
  "palette-collection": React.lazy(
    () => import("./colour/palette-collection/PaletteCollection"),
  ),
  "palette-extractor": React.lazy(
    () => import("./colour/palette-extractor/PaletteExtractor"),
  ),
  "palette-genny": React.lazy(
    () => import("./colour/palette-genny/PaletteGenny"),
  ),
  "pixel-picker": React.lazy(
    () => import("./colour/pixel-picker/PixelPicker"),
  ),
  "tailwind-shades": React.lazy(
    () => import("./colour/tailwind-shades/TailwindShades"),
  ),
  // Batch: Typography & Text
  "text-diff": React.lazy(
    () => import("./text/text-diff/TextDiff"),
  ),
  "word-counter": React.lazy(
    () => import("./text/word-counter/WordCounter"),
  ),
  "px-to-rem": React.lazy(
    () => import("./text/px-to-rem/PxToRem"),
  ),
  "typo-calc": React.lazy(
    () => import("./text/typo-calc/TypoCalc"),
  ),
  "line-height-calc": React.lazy(
    () => import("./text/line-height-calc/LineHeightCalc"),
  ),
  "paper-sizes": React.lazy(
    () => import("./text/paper-sizes/PaperSizes"),
  ),
  "font-explorer": React.lazy(
    () => import("./text/font-explorer/FontExplorer"),
  ),
  "glyph-browser": React.lazy(
    () => import("./text/glyph-browser/GlyphBrowser"),
  ),
  "large-type": React.lazy(
    () => import("./text/large-type/LargeType"),
  ),
  "text-editor": React.lazy(
    () => import("./text/text-editor/TextEditor"),
  ),
  "doc-converter": React.lazy(
    () => import("./text/doc-converter/DocConverter"),
  ),
  // Batch: PDF & Print
  "image-to-pdf": React.lazy(
    () => import("./pdf/image-to-pdf/ImageToPdf"),
  ),
  "pdf-organiser": React.lazy(
    () => import("./pdf/pdf-organiser/PdfOrganiser"),
  ),
  "pdf-rotate-crop": React.lazy(
    () => import("./pdf/pdf-rotate-crop/PdfRotateCrop"),
  ),
  "pdf-page-numberer": React.lazy(
    () => import("./pdf/pdf-page-numberer/PdfPageNumberer"),
  ),
  "pdf-compressor": React.lazy(
    () => import("./pdf/pdf-compressor/PdfCompressor"),
  ),
  "pdf-preflight": React.lazy(
    () => import("./pdf/pdf-preflight/PdfPreflight"),
  ),
  "imposer": React.lazy(
    () => import("./pdf/imposer/PdfImposer"),
  ),
  "zine-imposer": React.lazy(
    () => import("./pdf/zine-imposer/ZineImposer"),
  ),
  // Batch: Audio & Video
  "waveform-genny": React.lazy(
    () => import("./audio/waveform-genny/WaveformGenny"),
  ),
  "audio-trimmer": React.lazy(
    () => import("./audio/audio-trimmer/AudioTrimmer"),
  ),
  "audio-normaliser": React.lazy(
    () => import("./audio/audio-normaliser/AudioNormaliser"),
  ),
  "voice-recorder": React.lazy(
    () => import("./audio/voice-recorder/VoiceRecorder"),
  ),
  "screen-recorder": React.lazy(
    () => import("./audio/screen-recorder/ScreenRecorder"),
  ),
  "video-to-gif": React.lazy(
    () => import("./audio/video-to-gif/VideoToGif"),
  ),
  "video-muter": React.lazy(
    () => import("./audio/video-muter/VideoMuter"),
  ),
  "video-trimmer": React.lazy(
    () => import("./audio/video-trimmer/VideoTrimmer"),
  ),
  "audio-atlas": React.lazy(
    () => import("./audio/audio-atlas/AudioAtlas"),
  ),
  "video-atlas": React.lazy(
    () => import("./audio/video-atlas/VideoAtlas"),
  ),
  "audio-extractor": React.lazy(
    () => import("./audio/audio-extractor/AudioExtractor"),
  ),
  "frame-extractor": React.lazy(
    () => import("./audio/frame-extractor/FrameExtractor"),
  ),
  "timecode-calc": React.lazy(
    () => import("./audio/timecode-calc/TimecodeCalc"),
  ),
  "subtitle-converter": React.lazy(
    () => import("./audio/subtitle-converter/SubtitleConverter"),
  ),
  "subtitle-studio": React.lazy(
    () => import("./audio/subtitle-studio/SubtitleStudio"),
  ),
  "auto-subtitle": React.lazy(
    () => import("./audio/auto-subtitle/AutoSubtitle"),
  ),
  // Batch: Other Tools
  "qr-genny": React.lazy(
    () => import("./other/qr-genny/QrGenny"),
  ),
  "code-genny": React.lazy(
    () => import("./other/code-genny/CodeGenny"),
  ),
  "password-genny": React.lazy(
    () => import("./other/password-genny/PasswordGenny"),
  ),
  "decoder": React.lazy(
    () => import("./other/decoder/Decoder"),
  ),
  "markdown-writer": React.lazy(
    () => import("./other/markdown-writer/MarkdownWriter"),
  ),
  // Batch: Calculators
  "sci-calc": React.lazy(
    () => import("./calc/sci-calc/SciCalc"),
  ),
  "graph-calc": React.lazy(
    () => import("./calc/graph-calc/GraphCalc"),
  ),
  "algebra-calc": React.lazy(
    () => import("./calc/algebra-calc/AlgebraCalc"),
  ),
  "unit-converter": React.lazy(
    () => import("./calc/unit-converter/UnitConverter"),
  ),
  "base-converter": React.lazy(
    () => import("./calc/base-converter/BaseConverter"),
  ),
  "time-calc": React.lazy(
    () => import("./calc/time-calc/TimeCalc"),
  ),
  "encoder": React.lazy(
    () => import("./calc/encoder/Encoder"),
  ),
  // Batch: Turbo-Nerd
  "morse-code": React.lazy(
    () => import("./nerd/morse-code/MorseCode"),
  ),
  "braille-converter": React.lazy(
    () => import("./nerd/braille-converter/BrailleConverter"),
  ),
  "ipa-transcriber": React.lazy(
    () => import("./nerd/ipa-transcriber/IpaTranscriber"),
  ),
  "nato-phonetic": React.lazy(
    () => import("./nerd/nato-phonetic/NatoPhonetic"),
  ),
  "shavian-transliterator": React.lazy(
    () => import("./nerd/shavian-transliterator/ShavianTransliterator"),
  ),
  // Batch: Experiments
  "stupid-units": React.lazy(
    () => import("./experiments/stupid-units/StupidUnits"),
  ),
  "recipe-table": React.lazy(
    () => import("./experiments/recipe-table/RecipeTable"),
  ),
  // Batch: Elsewhere
  "ios-app": React.lazy(
    () => import("./elsewhere/ios-app/IosApp"),
  ),
  "cli": React.lazy(
    () => import("./elsewhere/cli/CliView"),
  ),
};

export function getToolComponent(
  toolId: string,
): React.ComponentType<{ tool: ToolDefinition }> {
  if (customRegistry[toolId]) {
    return customRegistry[toolId];
  }
  return GenericToolView;
}

export function registerToolComponent(
  toolId: string,
  component: React.LazyExoticComponent<
    React.ComponentType<{ tool: ToolDefinition }>
  >,
) {
  customRegistry[toolId] = component;
}
