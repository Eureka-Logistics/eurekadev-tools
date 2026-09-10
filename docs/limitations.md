# Client-Side Execution Limitations & Edge Cases

As **Eureka Dev Tools** processes all inputs 100% locally in the browser to maintain absolute security and privacy, certain browser-specific limitations exist:

---

## 1. Video & Audio Encoding Formats

* **Browser Codec Support**:
  * Chrome, Firefox, and Edge natively encode WebM (VP8/VP9, Opus).
  * Safari encodes MP4 (H.264, AAC).
  * Direct client-side export to MP4 on non-Safari browsers relies on either MediaRecorder with supported MIME types or WebAssembly decoders/muxers (such as `mp4box.js`).
* **Memory Constraints**:
  * Large video processing (e.g. 4K video files > 500MB) can exceed browser heap limits. Files under 250MB are recommended for client-side processing.

---

## 2. Color Sampling (EyeDropper API)

* **EyeDropper API**:
  * Available on Chromium-based desktop browsers (Chrome, Edge, Opera).
  * For Firefox and Safari, a fallback loupe is provided that samples colors directly from uploaded or pasted images rendered on an HTML5 `<canvas>`.

---

## 3. Optical Character Recognition & Speech Transcription

* **Auto Subtitle**:
  * Uses browser Web Speech Recognition API where available, or client-side lightweight Whisper WASM / ONNX runtime.
  * Larger speech models require downloading model weights into IndexedDB cache (~40MB to ~150MB) on first run.

---

## 4. Background Removal

* Automatic background removal uses client-side canvas segmentation or WebGL/WASM models (`@imgly/background-removal` or ONNX).
* First inference download caches weights (~30MB) locally in IndexedDB.

---

## 5. Mobile Responsive Differences

* Screen recording (`getDisplayMedia`) is supported exclusively on desktop operating systems (macOS, Windows, Linux) per browser security restrictions; on mobile devices, users are advised to record using native OS screen recording.

