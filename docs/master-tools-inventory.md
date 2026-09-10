# Eureka Dev Tools Master Inventory & Specification

This inventory represents the **authoritative master checklist and specification** of all 98 developer utilities implemented in Eureka Dev Tools.

**Audit Summary**:
* Total Items Inventoried: **98**
* Standard Browser Tools (`/tools/*`): **95**
* Standalone Interactive Editor (`/editor`): **1** (`substrata`)
* Total Browser-Executable Utilities: **96**
* Standard Core Utilities (excluding `/editor` and 2 experiments): **93**
* External Ecosystem Links (`elsewhere`): **2** (`ios-app`, `cli`)
* Predefined Multi-Tool Pipelines (`/workflows`): **17**
* Processing Model: **100% Client-Side** (Privacy-first; no user data leaves the browser)

---

## Tool Breakdown by Category

### Social Media (4 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Matte Generator** | `/tools/matte-genny` | undefined | image/* | image/png | image/* | Yes |
| 2 | **Seamless Scroll Generator** | `/tools/scroll-genny` | undefined | image/* | image/png | image/* | Yes |
| 3 | **Social Media Cropper** | `/tools/social-cropper` | undefined | image/* | image/png | image/* | Yes |
| 4 | **Watermarker** | `/tools/watermarker` | undefined | image/* | image/png | image/* | Yes |

### Colour (11 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Colour Atlas** | `/tools/colour-atlas` | undefined | Color value in Hex, RGB, HSL, or color picker | All color representations (Hex, RGB, HSL, HSV, OKLAB, OKLCH, CMYK), nearest named color, WCAG contrast against black & white, tints, shades, complementary, harmonies | text/plain, CSS color | Yes |
| 2 | **Colour Blindness Simulator** | `/tools/colorblind-sim` | undefined | Image file or selected color swatch | Simulated visual view for Protanopia, Deuteranopia, Tritanopia, and Achromatopsia | image/png, image/jpeg, image/webp | Yes |
| 3 | **Colour Converter** | `/tools/colour-converter` | undefined | Color string in any format (HEX, RGB, HSL, HSV, OKLAB, OKLCH, CMYK) | Live conversions to all other formats with 1-click copy | CSS color strings | Yes |
| 4 | **Contrast Checker** | `/tools/contrast-checker` | undefined | Foreground color and Background color | Contrast ratio (e.g. 4.82:1), WCAG 2.1 Pass/Fail status for AA Normal, AA Large, AAA Normal, AAA Large, Graphical Objects | None | Yes |
| 5 | **Gradient Generator** | `/tools/gradient-genny` | undefined | Color stops, angle/direction, gradient type | CSS gradient code (linear-gradient, radial-gradient, conic-gradient), downloadable PNG image | image/png, text/css | Yes |
| 6 | **Harmony Generator** | `/tools/harmony-genny` | undefined | Base color | Harmonious palettes: Complementary, Monochromatic, Analogous, Split-Complementary, Triadic, Tetradic | text/plain, CSS | Yes |
| 7 | **Palette Collection** | `/tools/palette-collection` | undefined | Keyword search or category filter | Curated color palette cards with click-to-copy hex swatches | text/css, application/json | Yes |
| 8 | **Palette Extractor** | `/tools/palette-extractor` | undefined | Image upload, paste from clipboard, or drag-and-drop | Dominant color palette (5–10 colors) extracted from the image, pixel color frequency | image/png, image/jpeg, image/webp, image/gif | Yes |
| 9 | **Palette Generator** | `/tools/palette-genny` | undefined | Interactive palette generator (spacebar to regenerate unlocked colors) | 5-color cohesive palette, downloadable PNG swatch card, CSS code, JSON | image/png, text/css, application/json | Yes |
| 10 | **Pixel Picker** | `/tools/pixel-picker` | undefined | Image upload or paste | Sampled color under crosshair / loupe in HEX, RGB, HSL with 1-click copy | image/png, image/jpeg, image/webp | Yes |
| 11 | **Tailwind Shade Generator** | `/tools/tailwind-shades` | undefined | Base color (hex or picker) or preset brand color | Complete 11-step Tailwind color scale (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950) | text/javascript, text/css | Yes |

### Images & Assets (18 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Image Atlas** | `/tools/image-atlas` | undefined | image/* | Processed data / copy / download | image/* | Yes |
| 2 | **Substrata** | `/editor` | undefined | image/* | Processed data / copy / download | image/* | Yes |
| 3 | **Artwork Enhancer** | `/tools/artwork-enhancer` | undefined | image/* | image/png | image/* | Yes |
| 4 | **Background Remover** | `/tools/background-remover` | undefined | image/* | image/png | image/* | Yes |
| 5 | **Favicon Generator** | `/tools/favicon-genny` | undefined | image/* | image/png, image/x-icon, application/zip | image/* | Yes |
| 6 | **Image Clipper** | `/tools/image-clipper` | undefined | .png | image/png | .png | Yes |
| 7 | **Image Compressor** | `/tools/image-compressor` | undefined | image/* | image/webp, image/jpeg, image/png, image/avif | image/* | Yes |
| 8 | **Image Converter** | `/tools/image-converter` | undefined | image/*, .jxl | image/png, image/jpeg, image/webp, image/gif, image/tiff, image/x-icon, application/zip | image/*, .jxl | Yes |
| 9 | **Image De-skewer** | `/tools/image-deskewer` | undefined | image/* | image/png | image/* | Yes |
| 10 | **Image Masker** | `/tools/image-masker` | undefined | image/* | image/png | image/* | Yes |
| 11 | **Image Splitter** | `/tools/image-splitter` | undefined | image/* | image/png | image/* | Yes |
| 12 | **Image Stitcher** | `/tools/image-stitcher` | undefined | image/* | image/png, image/jpeg, image/webp, image/jxl | image/* | Yes |
| 13 | **Image Tracer** | `/tools/image-tracer` | undefined | image/* | image/svg+xml | image/* | Yes |
| 14 | **Metadata Stripper** | `/tools/metadata-stripper` | undefined | image/* | image/jpeg, image/png, image/webp, image/gif | image/* | Yes |
| 15 | **Paste Image** | `/tools/paste-image` | undefined | image/* | image/png | image/* | Yes |
| 16 | **Placeholder Generator** | `/tools/placeholder-genny` | undefined | User input / text / parameters | image/png, image/svg+xml | None | Yes |
| 17 | **SVG Optimiser** | `/tools/svg-optimiser` | undefined | .svg | image/svg+xml | .svg | Yes |
| 18 | **Base64 Image Encoder** | `/tools/base64-image-encoder` | undefined | image/* | Processed data / copy / download | image/* | Yes |

### Audio & Video (16 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Audio Atlas** | `/tools/audio-atlas` | undefined | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | Processed data / copy / download | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | Yes |
| 2 | **Video Atlas** | `/tools/video-atlas` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Processed data / copy / download | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 3 | **Audio Extractor** | `/tools/audio-extractor` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | audio/wav, audio/mp4, audio/ogg, audio/flac | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 4 | **Audio Normaliser** | `/tools/audio-normaliser` | undefined | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | audio/wav | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | Yes |
| 5 | **Audio Trimmer** | `/tools/audio-trimmer` | undefined | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | audio/wav | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | Yes |
| 6 | **Auto Subtitle** | `/tools/auto-subtitle` | undefined | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf, video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | .srt, .vtt | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf, video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 7 | **Frame Extractor** | `/tools/frame-extractor` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | image/png, application/zip | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 8 | **Screen Recorder** | `/tools/screen-recorder` | undefined | User input / text / parameters | video/webm | None | Yes |
| 9 | **Subtitle Converter** | `/tools/subtitle-converter` | undefined | .srt, .vtt | .srt, .vtt | .srt, .vtt | Yes |
| 10 | **Subtitle Studio** | `/tools/subtitle-studio` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi, .srt, .vtt | video/webm | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi, .srt, .vtt | Yes |
| 11 | **Timecode Calculator** | `/tools/timecode-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 12 | **Video Muter** | `/tools/video-muter` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | video/mp4, video/webm | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 13 | **Video to GIF** | `/tools/video-to-gif` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | image/gif | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 14 | **Video Trimmer** | `/tools/video-trimmer` | undefined | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | video/mp4, video/webm | video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi | Yes |
| 15 | **Voice Recorder** | `/tools/voice-recorder` | undefined | User input / text / parameters | audio/webm | None | Yes |
| 16 | **Waveform Generator** | `/tools/waveform-genny` | undefined | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | image/png, image/svg+xml | audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf | Yes |

### Typography & Text (11 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Document Converter** | `/tools/doc-converter` | undefined | .md, .html, .docx, .tex, .epub | .md, .html, .docx, .epub, .txt | .md, .html, .docx, .tex, .epub | Yes |
| 2 | **Text Editor** | `/tools/text-editor` | undefined | .md, .txt, text/markdown, text/plain | Processed data / copy / download | .md, .txt, text/markdown, text/plain | Yes |
| 3 | **Font File Explorer** | `/tools/font-explorer` | undefined | .ttf, .otf, .woff, .woff2 | Processed data / copy / download | .ttf, .otf, .woff, .woff2 | Yes |
| 4 | **Glyph Browser** | `/tools/glyph-browser` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 5 | **Large Type** | `/tools/large-type` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 6 | **Line Height Calculator** | `/tools/line-height-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 7 | **Paper Sizes** | `/tools/paper-sizes` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 8 | **PX to REM** | `/tools/px-to-rem` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 9 | **Text Diff** | `/tools/text-diff` | undefined | text/*, .txt, .md | Processed data / copy / download | text/*, .txt, .md | Yes |
| 10 | **Typography Calculator** | `/tools/typo-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 11 | **Word Counter** | `/tools/word-counter` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |

### PDF (6 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **PDF Preflight** | `/tools/pdf-preflight` | undefined | .pdf | Processed data / copy / download | .pdf | Yes |
| 2 | **PDF Organiser** | `/tools/pdf-organiser` | undefined | .pdf | application/pdf, application/zip | .pdf | Yes |
| 3 | **Images to PDF** | `/tools/image-to-pdf` | undefined | image/*, .pdf | application/pdf, image/png, application/zip | image/*, .pdf | Yes |
| 4 | **PDF Rotate & Crop** | `/tools/pdf-rotate-crop` | undefined | .pdf | application/pdf | .pdf | Yes |
| 5 | **PDF Page Numbers** | `/tools/pdf-page-numberer` | undefined | .pdf | application/pdf | .pdf | Yes |
| 6 | **PDF Compressor** | `/tools/pdf-compressor` | undefined | .pdf | application/pdf | .pdf | Yes |

### Print & Production (2 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Print Imposer** | `/tools/imposer` | undefined | .pdf | application/pdf | .pdf | Yes |
| 2 | **Zine Imposer** | `/tools/zine-imposer` | undefined | .pdf | application/pdf | .pdf | Yes |

### Dev Tools (9 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Cron Builder** | `/tools/cron-builder` | undefined | Visual schedule selector (minute, hour, day, month, weekday) or raw 5-field cron string | 5-part cron expression string, natural language explanation, next 5 scheduled run times | text/plain | Yes |
| 2 | **HTTP Status** | `/tools/http-status` | undefined | Search query (status code e.g. 404, status name e.g. Not Found, or keyword) | Cards displaying code, official status name, category (1xx-5xx), RFC spec citation, explanation, mock HTTP response snippet | None | Yes |
| 3 | **JSON Formatter** | `/tools/json-formatter` | undefined | Raw JSON text or .json file upload / drag-and-drop | Formatted JSON string, minified JSON, JSON file download | .json, text/plain | Yes |
| 4 | **JWT Decoder** | `/tools/jwt-decoder` | undefined | Encoded JSON Web Token (JWT) string | Decoded Header JSON, Payload JSON, Signature hex/bytes, Expiry status | text/plain | Yes |
| 5 | **Meta Tag Generator** | `/tools/meta-tag-genny` | undefined | Website URL, page title, description, author, social image URL, Twitter handle, robots directives, theme color | Complete HTML meta tags (<title>, <meta>, OpenGraph, Twitter Cards), live social sharing cards preview (Google search snippet, Facebook card, X/Twitter summary large image) | text/html | Yes |
| 6 | **Regex Tester** | `/tools/regex-tester` | undefined | Regular expression pattern, flags, and test string | Visual match highlights, match count, capture groups breakdown table, substitution output | text/plain | Yes |
| 7 | **Request Builder** | `/tools/request-builder` | undefined | HTTP method, target URL, query params, headers key-values, request body | Formatted cURL command, JavaScript fetch() snippet, Python requests code, raw HTTP/1.1 payload | text/plain, application/json | Yes |
| 8 | **Tailwind Cheat Sheet** | `/tools/tailwind-cheatsheet` | undefined | Search query for utility class or CSS property name | Class table showing Tailwind class name, generated CSS properties, visual preview swatch/box, 1-click copy | None | Yes |
| 9 | **UUID Generator** | `/tools/uuid-genny` | undefined | Configuration parameters (version, count, formatting) | List of generated UUIDs or Nano IDs, copyable text, download as .txt | text/plain | Yes |

### Other Tools (5 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Barcode Generator** | `/tools/code-genny` | undefined | User input / text / parameters | image/png, application/zip | None | Yes |
| 2 | **Cipher Decoder** | `/tools/decoder` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 3 | **Password Generator** | `/tools/password-genny` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 4 | **QR Generator** | `/tools/qr-genny` | undefined | User input / text / parameters | image/png, image/svg+xml, application/zip | None | Yes |
| 5 | **Text Scratchpad** | `/tools/markdown-writer` | undefined | .md, .txt, text/markdown, text/plain | text/plain | .md, .txt, text/markdown, text/plain | Yes |

### Calculators (7 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Algebra Calculator** | `/tools/algebra-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 2 | **Base Converter** | `/tools/base-converter` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 3 | **Encoding Tools** | `/tools/encoder` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 4 | **Graph Calculator** | `/tools/graph-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 5 | **Scientific Calculator** | `/tools/sci-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 6 | **Time Calculator** | `/tools/time-calc` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 7 | **Unit Converter** | `/tools/unit-converter` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |

### Turbo-nerd Shit (5 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Shavian Transliterator** | `/tools/shavian-transliterator` | undefined | User input / text / parameters | image/png | None | Yes |
| 2 | **Morse Code** | `/tools/morse-code` | undefined | User input / text / parameters | text/plain | None | Yes |
| 3 | **Braille Converter** | `/tools/braille-converter` | undefined | User input / text / parameters | text/plain | None | Yes |
| 4 | **IPA Transcription** | `/tools/ipa-transcriber` | undefined | User input / text / parameters | text/plain | None | Yes |
| 5 | **NATO Phonetic** | `/tools/nato-phonetic` | undefined | User input / text / parameters | text/plain | None | Yes |

### Elsewhere (2 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Eureka Mobile Companion** | `/tools/ios-app` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 2 | **Eureka Dev Tools CLI** | `/tools/cli` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |

### Experiments (2 tools)

| # | Tool Name | Slug / Route | Purpose | Inputs | Outputs | Formats | Client-Side |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Stupid Units** | `/tools/stupid-units` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |
| 2 | **Recipe Table** | `/tools/recipe-table` | undefined | User input / text / parameters | Processed data / copy / download | None | Yes |

---

## Detailed Tool Specifications (All 96 Browser Tools)

### 1. Matte Generator (`matte-genny`)

* **Category**: Social Media (`social-media`)
* **Route**: `/tools/matte-genny`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 2. Seamless Scroll Generator (`scroll-genny`)

* **Category**: Social Media (`social-media`)
* **Route**: `/tools/scroll-genny`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 3. Social Media Cropper (`social-cropper`)

* **Category**: Social Media (`social-media`)
* **Route**: `/tools/social-cropper`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 4. Watermarker (`watermarker`)

* **Category**: Social Media (`social-media`)
* **Route**: `/tools/watermarker`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 5. Colour Atlas (`colour-atlas`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/colour-atlas`
* **Purpose**: undefined
* **Inputs**: Color value in Hex, RGB, HSL, or color picker
* **Outputs**: All color representations (Hex, RGB, HSL, HSV, OKLAB, OKLCH, CMYK), nearest named color, WCAG contrast against black & white, tints, shades, complementary, harmonies
* **Important Options**: Carry color query param handoff to other color tools
* **Supported Formats**: text/plain, CSS color
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Color math (sRGB, OKLCH, OKLAB, HSL conversion)

### 6. Colour Blindness Simulator (`colorblind-sim`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/colorblind-sim`
* **Purpose**: undefined
* **Inputs**: Image file or selected color swatch
* **Outputs**: Simulated visual view for Protanopia, Deuteranopia, Tritanopia, and Achromatopsia
* **Important Options**: Side-by-side comparison, color deficiency intensity slider (0-100%)
* **Supported Formats**: image/png, image/jpeg, image/webp
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Canvas 2D color matrix transformation

### 7. Colour Converter (`colour-converter`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/colour-converter`
* **Purpose**: undefined
* **Inputs**: Color string in any format (HEX, RGB, HSL, HSV, OKLAB, OKLCH, CMYK)
* **Outputs**: Live conversions to all other formats with 1-click copy
* **Important Options**: Decimal precision (0 to 4 digits), CSS syntax vs raw numbers
* **Supported Formats**: CSS color strings
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Color math routines

### 8. Contrast Checker (`contrast-checker`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/contrast-checker`
* **Purpose**: undefined
* **Inputs**: Foreground color and Background color
* **Outputs**: Contrast ratio (e.g. 4.82:1), WCAG 2.1 Pass/Fail status for AA Normal, AA Large, AAA Normal, AAA Large, Graphical Objects
* **Important Options**: Swap colors, lightness fine-tuning slider to reach AA/AAA threshold, preview text and UI components
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: WCAG 2.1 relative luminance calculation

### 9. Gradient Generator (`gradient-genny`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/gradient-genny`
* **Purpose**: undefined
* **Inputs**: Color stops, angle/direction, gradient type
* **Outputs**: CSS gradient code (linear-gradient, radial-gradient, conic-gradient), downloadable PNG image
* **Important Options**: Color interpolation space (sRGB, OKLCH), random gradient generator, stop positions, canvas resolution
* **Supported Formats**: image/png, text/css
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Canvas 2D gradient renderer

### 10. Harmony Generator (`harmony-genny`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/harmony-genny`
* **Purpose**: undefined
* **Inputs**: Base color
* **Outputs**: Harmonious palettes: Complementary, Monochromatic, Analogous, Split-Complementary, Triadic, Tetradic
* **Important Options**: Copy palette CSS / Hex array, export swatches, carry color
* **Supported Formats**: text/plain, CSS
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Color wheel angle calculations

### 11. Palette Collection (`palette-collection`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/palette-collection`
* **Purpose**: undefined
* **Inputs**: Keyword search or category filter
* **Outputs**: Curated color palette cards with click-to-copy hex swatches
* **Important Options**: Filter by tags (vintage, pastel, dark, neon, nature, tech), export palette as CSS variables, Tailwind theme, or SVG
* **Supported Formats**: text/css, application/json
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Curated color palette database

### 12. Palette Extractor (`palette-extractor`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/palette-extractor`
* **Purpose**: undefined
* **Inputs**: Image upload, paste from clipboard, or drag-and-drop
* **Outputs**: Dominant color palette (5–10 colors) extracted from the image, pixel color frequency
* **Important Options**: Palette size (3 to 12 colors), quantization algorithm (K-means / Median Cut), copy all hex codes
* **Supported Formats**: image/png, image/jpeg, image/webp, image/gif
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Canvas 2D pixel quantization / color clustering

### 13. Palette Generator (`palette-genny`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/palette-genny`
* **Purpose**: undefined
* **Inputs**: Interactive palette generator (spacebar to regenerate unlocked colors)
* **Outputs**: 5-color cohesive palette, downloadable PNG swatch card, CSS code, JSON
* **Important Options**: Lock/unlock individual slots, adjust lightness/saturation, harmony rules (cool, warm, pastel, deep)
* **Supported Formats**: image/png, text/css, application/json
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Color harmony generation algorithms

### 14. Pixel Picker (`pixel-picker`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/pixel-picker`
* **Purpose**: undefined
* **Inputs**: Image upload or paste
* **Outputs**: Sampled color under crosshair / loupe in HEX, RGB, HSL with 1-click copy
* **Important Options**: Loupe zoom level (2x, 4x, 8x, 16x), grid lines toggle, native EyeDropper API where supported with canvas fallback
* **Supported Formats**: image/png, image/jpeg, image/webp
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: HTML5 Canvas getImageData / EyeDropper API

### 15. Tailwind Shade Generator (`tailwind-shades`)

* **Category**: Colour (`colour`)
* **Route**: `/tools/tailwind-shades`
* **Purpose**: undefined
* **Inputs**: Base color (hex or picker) or preset brand color
* **Outputs**: Complete 11-step Tailwind color scale (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
* **Important Options**: Tailwind config JavaScript / CSS variables export, OKLCH perceptual lightness distribution, contrast rating check on each shade
* **Supported Formats**: text/javascript, text/css
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: OKLCH / HSL color shade interpolation

### 16. Image Atlas (`image-atlas`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-atlas`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 17. Substrata (`substrata`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/editor`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 18. Artwork Enhancer (`artwork-enhancer`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/artwork-enhancer`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 19. Background Remover (`background-remover`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/background-remover`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 20. Favicon Generator (`favicon-genny`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/favicon-genny`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png, image/x-icon, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 21. Image Clipper (`image-clipper`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-clipper`
* **Purpose**: undefined
* **Inputs**: .png
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .png
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 22. Image Compressor (`image-compressor`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-compressor`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/webp, image/jpeg, image/png, image/avif
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 23. Image Converter (`image-converter`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-converter`
* **Purpose**: undefined
* **Inputs**: image/*, .jxl
* **Outputs**: image/png, image/jpeg, image/webp, image/gif, image/tiff, image/x-icon, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*, .jxl
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 24. Image De-skewer (`image-deskewer`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-deskewer`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 25. Image Masker (`image-masker`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-masker`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 26. Image Splitter (`image-splitter`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-splitter`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 27. Image Stitcher (`image-stitcher`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-stitcher`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png, image/jpeg, image/webp, image/jxl
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 28. Image Tracer (`image-tracer`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/image-tracer`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/svg+xml
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 29. Metadata Stripper (`metadata-stripper`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/metadata-stripper`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/jpeg, image/png, image/webp, image/gif
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 30. Paste Image (`paste-image`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/paste-image`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 31. Placeholder Generator (`placeholder-genny`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/placeholder-genny`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: image/png, image/svg+xml
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 32. SVG Optimiser (`svg-optimiser`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/svg-optimiser`
* **Purpose**: undefined
* **Inputs**: .svg
* **Outputs**: image/svg+xml
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .svg
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 33. Base64 Image Encoder (`base64-image-encoder`)

* **Category**: Images & Assets (`img-assets`)
* **Route**: `/tools/base64-image-encoder`
* **Purpose**: undefined
* **Inputs**: image/*
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 34. Audio Atlas (`audio-atlas`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/audio-atlas`
* **Purpose**: undefined
* **Inputs**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 35. Video Atlas (`video-atlas`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/video-atlas`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 36. Audio Extractor (`audio-extractor`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/audio-extractor`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: audio/wav, audio/mp4, audio/ogg, audio/flac
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 37. Audio Normaliser (`audio-normaliser`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/audio-normaliser`
* **Purpose**: undefined
* **Inputs**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Outputs**: audio/wav
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 38. Audio Trimmer (`audio-trimmer`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/audio-trimmer`
* **Purpose**: undefined
* **Inputs**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Outputs**: audio/wav
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 39. Auto Subtitle (`auto-subtitle`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/auto-subtitle`
* **Purpose**: undefined
* **Inputs**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf, video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: .srt, .vtt
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf, video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 40. Frame Extractor (`frame-extractor`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/frame-extractor`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: image/png, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 41. Screen Recorder (`screen-recorder`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/screen-recorder`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: video/webm
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 42. Subtitle Converter (`subtitle-converter`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/subtitle-converter`
* **Purpose**: undefined
* **Inputs**: .srt, .vtt
* **Outputs**: .srt, .vtt
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .srt, .vtt
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 43. Subtitle Studio (`subtitle-studio`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/subtitle-studio`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi, .srt, .vtt
* **Outputs**: video/webm
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi, .srt, .vtt
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 44. Timecode Calculator (`timecode-calc`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/timecode-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 45. Video Muter (`video-muter`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/video-muter`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: video/mp4, video/webm
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 46. Video to GIF (`video-to-gif`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/video-to-gif`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: image/gif
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 47. Video Trimmer (`video-trimmer`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/video-trimmer`
* **Purpose**: undefined
* **Inputs**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Outputs**: video/mp4, video/webm
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: video/*, .mp4, .m4v, .mov, .webm, .mkv, .avi
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 48. Voice Recorder (`voice-recorder`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/voice-recorder`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: audio/webm
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 49. Waveform Generator (`waveform-genny`)

* **Category**: Audio & Video (`audio-video`)
* **Route**: `/tools/waveform-genny`
* **Purpose**: undefined
* **Inputs**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Outputs**: image/png, image/svg+xml
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: audio/*, .mp3, .m4a, .wav, .aac, .flac, .ogg, .oga, .opus, .aiff, .caf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 50. Document Converter (`doc-converter`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/doc-converter`
* **Purpose**: undefined
* **Inputs**: .md, .html, .docx, .tex, .epub
* **Outputs**: .md, .html, .docx, .epub, .txt
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .md, .html, .docx, .tex, .epub
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 51. Text Editor (`text-editor`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/text-editor`
* **Purpose**: undefined
* **Inputs**: .md, .txt, text/markdown, text/plain
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .md, .txt, text/markdown, text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 52. Font File Explorer (`font-explorer`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/font-explorer`
* **Purpose**: undefined
* **Inputs**: .ttf, .otf, .woff, .woff2
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .ttf, .otf, .woff, .woff2
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 53. Glyph Browser (`glyph-browser`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/glyph-browser`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 54. Large Type (`large-type`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/large-type`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 55. Line Height Calculator (`line-height-calc`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/line-height-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 56. Paper Sizes (`paper-sizes`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/paper-sizes`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 57. PX to REM (`px-to-rem`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/px-to-rem`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 58. Text Diff (`text-diff`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/text-diff`
* **Purpose**: undefined
* **Inputs**: text/*, .txt, .md
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: text/*, .txt, .md
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 59. Typography Calculator (`typo-calc`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/typo-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 60. Word Counter (`word-counter`)

* **Category**: Typography & Text (`typo-text`)
* **Route**: `/tools/word-counter`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 61. PDF Preflight (`pdf-preflight`)

* **Category**: PDF (`pdf`)
* **Route**: `/tools/pdf-preflight`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 62. PDF Organiser (`pdf-organiser`)

* **Category**: PDF (`pdf`)
* **Route**: `/tools/pdf-organiser`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: application/pdf, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 63. Images to PDF (`image-to-pdf`)

* **Category**: PDF (`pdf`)
* **Route**: `/tools/image-to-pdf`
* **Purpose**: undefined
* **Inputs**: image/*, .pdf
* **Outputs**: application/pdf, image/png, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: image/*, .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 64. PDF Rotate & Crop (`pdf-rotate-crop`)

* **Category**: PDF (`pdf`)
* **Route**: `/tools/pdf-rotate-crop`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: application/pdf
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 65. PDF Page Numbers (`pdf-page-numberer`)

* **Category**: PDF (`pdf`)
* **Route**: `/tools/pdf-page-numberer`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: application/pdf
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 66. PDF Compressor (`pdf-compressor`)

* **Category**: PDF (`pdf`)
* **Route**: `/tools/pdf-compressor`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: application/pdf
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 67. Print Imposer (`imposer`)

* **Category**: Print & Production (`print-production`)
* **Route**: `/tools/imposer`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: application/pdf
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 68. Zine Imposer (`zine-imposer`)

* **Category**: Print & Production (`print-production`)
* **Route**: `/tools/zine-imposer`
* **Purpose**: undefined
* **Inputs**: .pdf
* **Outputs**: application/pdf
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .pdf
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 69. Cron Builder (`cron-builder`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/cron-builder`
* **Purpose**: undefined
* **Inputs**: Visual schedule selector (minute, hour, day, month, weekday) or raw 5-field cron string
* **Outputs**: 5-part cron expression string, natural language explanation, next 5 scheduled run times
* **Important Options**: Common presets (every 5 min, hourly, daily at midnight, weekly, monthly)
* **Supported Formats**: text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Cron expression parser / cronstrue logic

### 70. HTTP Status (`http-status`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/http-status`
* **Purpose**: undefined
* **Inputs**: Search query (status code e.g. 404, status name e.g. Not Found, or keyword)
* **Outputs**: Cards displaying code, official status name, category (1xx-5xx), RFC spec citation, explanation, mock HTTP response snippet
* **Important Options**: Category filter (1xx Informational, 2xx Success, 3xx Redirection, 4xx Client Error, 5xx Server Error)
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Curated HTTP RFC database

### 71. JSON Formatter (`json-formatter`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/json-formatter`
* **Purpose**: undefined
* **Inputs**: Raw JSON text or .json file upload / drag-and-drop
* **Outputs**: Formatted JSON string, minified JSON, JSON file download
* **Important Options**: Indentation (2 spaces, 4 spaces, Tab, Minify), View mode (Text editor or interactive collapsible Tree view)
* **Supported Formats**: .json, text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Native JSON parser with custom line/column error locator

### 72. JWT Decoder (`jwt-decoder`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/jwt-decoder`
* **Purpose**: undefined
* **Inputs**: Encoded JSON Web Token (JWT) string
* **Outputs**: Decoded Header JSON, Payload JSON, Signature hex/bytes, Expiry status
* **Important Options**: Copy header/payload, human-readable date formatting (iat, nbf, exp) with past/future expiry indicator
* **Supported Formats**: text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Native Base64URL decoder, Web Crypto / atob

### 73. Meta Tag Generator (`meta-tag-genny`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/meta-tag-genny`
* **Purpose**: undefined
* **Inputs**: Website URL, page title, description, author, social image URL, Twitter handle, robots directives, theme color
* **Outputs**: Complete HTML meta tags (<title>, <meta>, OpenGraph, Twitter Cards), live social sharing cards preview (Google search snippet, Facebook card, X/Twitter summary large image)
* **Important Options**: Presets for article, website, profile; image dimensions guidance
* **Supported Formats**: text/html
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: HTML template generator

### 74. Regex Tester (`regex-tester`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/regex-tester`
* **Purpose**: undefined
* **Inputs**: Regular expression pattern, flags, and test string
* **Outputs**: Visual match highlights, match count, capture groups breakdown table, substitution output
* **Important Options**: Flags (g, i, m, s, u), replace template ($1, $2, etc.), invert match
* **Supported Formats**: text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: JavaScript RegExp engine

### 75. Request Builder (`request-builder`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/request-builder`
* **Purpose**: undefined
* **Inputs**: HTTP method, target URL, query params, headers key-values, request body
* **Outputs**: Formatted cURL command, JavaScript fetch() snippet, Python requests code, raw HTTP/1.1 payload
* **Important Options**: Body type (raw JSON, form-data, urlencoded, text), auth headers (Bearer, Basic), 1-click copy snippet
* **Supported Formats**: text/plain, application/json
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: HTTP syntax serializer

### 76. Tailwind Cheat Sheet (`tailwind-cheatsheet`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/tailwind-cheatsheet`
* **Purpose**: undefined
* **Inputs**: Search query for utility class or CSS property name
* **Outputs**: Class table showing Tailwind class name, generated CSS properties, visual preview swatch/box, 1-click copy
* **Important Options**: Category tabs (Layout, Flexbox & Grid, Spacing, Sizing, Typography, Backgrounds, Borders, Effects, Filters, Transitions)
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Tailwind CSS utility dictionary

### 77. UUID Generator (`uuid-genny`)

* **Category**: Dev Tools (`dev-tools`)
* **Route**: `/tools/uuid-genny`
* **Purpose**: undefined
* **Inputs**: Configuration parameters (version, count, formatting)
* **Outputs**: List of generated UUIDs or Nano IDs, copyable text, download as .txt
* **Important Options**: Type (UUID v4 random, UUID v7 timestamp-ordered, NanoID), Quantity (1 to 1000), Case (lowercase, uppercase), Hyphen toggle
* **Supported Formats**: text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Web Crypto API (crypto.randomUUID, crypto.getRandomValues)

### 78. Barcode Generator (`code-genny`)

* **Category**: Other Tools (`other-tools`)
* **Route**: `/tools/code-genny`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: image/png, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 79. Cipher Decoder (`decoder`)

* **Category**: Other Tools (`other-tools`)
* **Route**: `/tools/decoder`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 80. Password Generator (`password-genny`)

* **Category**: Other Tools (`other-tools`)
* **Route**: `/tools/password-genny`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 81. QR Generator (`qr-genny`)

* **Category**: Other Tools (`other-tools`)
* **Route**: `/tools/qr-genny`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: image/png, image/svg+xml, application/zip
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 82. Text Scratchpad (`markdown-writer`)

* **Category**: Other Tools (`other-tools`)
* **Route**: `/tools/markdown-writer`
* **Purpose**: undefined
* **Inputs**: .md, .txt, text/markdown, text/plain
* **Outputs**: text/plain
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: .md, .txt, text/markdown, text/plain
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 83. Algebra Calculator (`algebra-calc`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/algebra-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 84. Base Converter (`base-converter`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/base-converter`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 85. Encoding Tools (`encoder`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/encoder`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 86. Graph Calculator (`graph-calc`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/graph-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 87. Scientific Calculator (`sci-calc`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/sci-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 88. Time Calculator (`time-calc`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/time-calc`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 89. Unit Converter (`unit-converter`)

* **Category**: Calculators (`calculators`)
* **Route**: `/tools/unit-converter`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 90. Shavian Transliterator (`shavian-transliterator`)

* **Category**: Turbo-nerd Shit (`turbo-nerd`)
* **Route**: `/tools/shavian-transliterator`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: image/png
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 91. Morse Code (`morse-code`)

* **Category**: Turbo-nerd Shit (`turbo-nerd`)
* **Route**: `/tools/morse-code`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: text/plain
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 92. Braille Converter (`braille-converter`)

* **Category**: Turbo-nerd Shit (`turbo-nerd`)
* **Route**: `/tools/braille-converter`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: text/plain
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 93. IPA Transcription (`ipa-transcriber`)

* **Category**: Turbo-nerd Shit (`turbo-nerd`)
* **Route**: `/tools/ipa-transcriber`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: text/plain
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 94. NATO Phonetic (`nato-phonetic`)

* **Category**: Turbo-nerd Shit (`turbo-nerd`)
* **Route**: `/tools/nato-phonetic`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: text/plain
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 95. Eureka Mobile Companion (`ios-app`)

* **Category**: Elsewhere (`elsewhere`)
* **Route**: `/tools/ios-app`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: No (External Link)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 96. Eureka Dev Tools CLI (`cli`)

* **Category**: Elsewhere (`elsewhere`)
* **Route**: `/tools/cli`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: No (External Link)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 97. Stupid Units (`stupid-units`)

* **Category**: Experiments (`experiments`)
* **Route**: `/tools/stupid-units`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

### 98. Recipe Table (`recipe-table`)

* **Category**: Experiments (`experiments`)
* **Route**: `/tools/recipe-table`
* **Purpose**: undefined
* **Inputs**: User input / text / parameters
* **Outputs**: Processed data / copy / download
* **Important Options**: Customization parameters, file download, copy to clipboard
* **Supported Formats**: None
* **Execution**: Yes (100% Client-side)
* **Identifiable Libraries & APIs**: Browser Web APIs (DOM, Canvas, Web Audio, Web Crypto, File)

---

## Multi-Tool Workflows Inventory

In addition to individual tools, planned chained workflows include:

1. **Trim, caption, burn**: `video-trimmer` -> `auto-subtitle` -> `subtitle-studio`
2. **Record, trim, GIF**: `screen-recorder` -> `video-trimmer` -> `video-to-gif`
3. **Trim and mute**: `video-trimmer` -> `video-muter`
4. **Frame, cut out**: `frame-extractor` -> `background-remover`
5. **Audio to subtitles**: `audio-extractor` -> `audio-trimmer` -> `auto-subtitle`
6. **Extract and normalise**: `audio-extractor` -> `audio-normaliser`
7. **Record, level, transcribe**: `voice-recorder` -> `audio-normaliser` -> `auto-subtitle`
8. **Paste and strip**: `paste-image` -> `metadata-stripper`
9. **Cut out, crop, compress**: `background-remover` -> `social-cropper` -> `image-compressor`
10. **Watermark and compress**: `watermarker` -> `image-compressor`
11. **Trace and optimise**: `image-tracer` -> `svg-optimiser`
12. **Straighten, then PDF**: `image-deskewer` -> `image-to-pdf` -> `pdf-compressor`
13. **Images to PDF**: `image-to-pdf` -> `pdf-compressor`
14. **Organise, number, compress**: `pdf-organiser` -> `pdf-page-numberer` -> `pdf-compressor`
15. **Crop and impose**: `pdf-rotate-crop` -> `zine-imposer`
16. **Colour to gradient**: `colour-converter` -> `gradient-genny`
17. **Pick, then gradient**: `pixel-picker` -> `gradient-genny`

---

## Planned Implementation Batches

* **Batch 1 — Core Developer Tools** (9 tools): `json-formatter`, `jwt-decoder`, `uuid-genny`, `regex-tester`, `cron-builder`, `http-status`, `request-builder`, `meta-tag-genny`, `tailwind-cheatsheet`
* **Batch 2 — Colour** (11 tools): `colour-atlas`, `colorblind-sim`, `colour-converter`, `contrast-checker`, `gradient-genny`, `harmony-genny`, `palette-collection`, `palette-extractor`, `palette-genny`, `pixel-picker`, `tailwind-shades`
* **Batch 3 — Images & Assets** (22 tools): `image-atlas`, `substrata`, `artwork-enhancer`, `background-remover`, `favicon-genny`, `image-clipper`, `image-compressor`, `image-converter`, `image-deskewer`, `image-masker`, `image-splitter`, `image-stitcher`, `image-tracer`, `metadata-stripper`, `paste-image`, `placeholder-genny`, `svg-optimiser`, `base64-image-encoder`, `matte-genny`, `scroll-genny`, `social-cropper`, `watermarker`
* **Batch 4 — Typography & Text** (11 tools): `doc-converter`, `text-editor`, `font-explorer`, `glyph-browser`, `large-type`, `line-height-calc`, `paper-sizes`, `px-to-rem`, `text-diff`, `typo-calc`, `word-counter`
* **Batch 5 — PDF & Print** (8 tools): `pdf-preflight`, `pdf-organiser`, `image-to-pdf`, `pdf-rotate-crop`, `pdf-page-numberer`, `pdf-compressor`, `imposer`, `zine-imposer`
* **Batch 6 — Audio & Video** (16 tools): `audio-atlas`, `video-atlas`, `audio-extractor`, `audio-normaliser`, `audio-trimmer`, `auto-subtitle`, `frame-extractor`, `screen-recorder`, `subtitle-converter`, `subtitle-studio`, `timecode-calc`, `video-muter`, `video-to-gif`, `video-trimmer`, `voice-recorder`, `waveform-genny`
* **Batch 7 — Calculators, Other Tools, Turbo Nerd & Experiments** (19 tools): `algebra-calc`, `base-converter`, `encoder`, `graph-calc`, `sci-calc`, `time-calc`, `unit-converter`, `code-genny`, `decoder`, `password-genny`, `qr-genny`, `markdown-writer`, `shavian-transliterator`, `morse-code`, `braille-converter`, `ipa-transcriber`, `nato-phonetic`, `stupid-units`, `recipe-table`
