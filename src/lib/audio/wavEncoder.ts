/**
 * Pure TypeScript WAV encoder and Web Audio utility functions.
 * Encodes AudioBuffer into standard 16-bit PCM WAV blobs.
 */

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const dataByteLength = numSamples * blockAlign;
  const bufferLength = 44 + dataByteLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF chunk descriptor
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, "WAVE");

  // "fmt " sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // "data" sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataByteLength, true);

  // Interleave channels & write samples
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

let sharedAudioContext: AudioContext | null = null;
export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

export async function decodeAudioFile(file: File | Blob): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

export function sliceAudioBuffer(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number,
  fadeInSec = 0,
  fadeOutSec = 0,
): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = buffer.sampleRate;
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(buffer.length, Math.floor(endSec * sampleRate));
  const frameCount = Math.max(1, endSample - startSample);

  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    frameCount,
    sampleRate,
  );

  const fadeInSamples = Math.floor(fadeInSec * sampleRate);
  const fadeOutSamples = Math.floor(fadeOutSec * sampleRate);

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const destData = newBuffer.getChannelData(c);

    for (let i = 0; i < frameCount; i++) {
      let val = srcData[startSample + i] || 0;

      // Apply fade in
      if (fadeInSamples > 0 && i < fadeInSamples) {
        val *= i / fadeInSamples;
      }
      // Apply fade out
      if (fadeOutSamples > 0 && i > frameCount - fadeOutSamples) {
        val *= (frameCount - i) / fadeOutSamples;
      }

      destData[i] = val;
    }
  }

  return newBuffer;
}

export function normaliseAudioBuffer(
  buffer: AudioBuffer,
  targetPeakDb = -0.5,
): AudioBuffer {
  const ctx = getAudioContext();
  let maxPeak = 0;

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > maxPeak) maxPeak = abs;
    }
  }

  const targetLinear = Math.pow(10, targetPeakDb / 20);
  const gain = maxPeak > 0 ? targetLinear / maxPeak : 1;

  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate,
  );

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const destData = newBuffer.getChannelData(c);
    for (let i = 0; i < buffer.length; i++) {
      destData[i] = Math.max(-1, Math.min(1, srcData[i] * gain));
    }
  }

  return newBuffer;
}

export function reverseAudioBuffer(buffer: AudioBuffer): AudioBuffer {
  const ctx = getAudioContext();
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate,
  );

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const destData = newBuffer.getChannelData(c);
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      destData[i] = srcData[len - 1 - i];
    }
  }

  return newBuffer;
}

export function changeAudioSpeed(
  buffer: AudioBuffer,
  speedFactor: number,
): AudioBuffer {
  const ctx = getAudioContext();
  const newLength = Math.max(1, Math.floor(buffer.length / speedFactor));
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    newLength,
    buffer.sampleRate,
  );

  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const destData = newBuffer.getChannelData(c);

    for (let i = 0; i < newLength; i++) {
      const origPos = i * speedFactor;
      const index0 = Math.floor(origPos);
      const index1 = Math.min(index0 + 1, buffer.length - 1);
      const frac = origPos - index0;

      // Linear interpolation
      destData[i] =
        (srcData[index0] || 0) * (1 - frac) + (srcData[index1] || 0) * frac;
    }
  }

  return newBuffer;
}

export interface WaveformRenderOptions {
  color?: string;
  backgroundColor?: string;
  barWidth?: number;
  barGap?: number;
  rounded?: boolean;
}

export function renderWaveformToCanvas(
  canvas: HTMLCanvasElement,
  buffer: AudioBuffer,
  options: WaveformRenderOptions = {},
) {
  const {
    color = "#10b981",
    backgroundColor = "#18181b",
    barWidth = 3,
    barGap = 1,
    rounded = true,
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const totalBarWidth = barWidth + barGap;
  const barCount = Math.floor(width / totalBarWidth);
  const data = buffer.getChannelData(0);
  const step = Math.floor(data.length / barCount);
  const amp = height / 2;

  ctx.fillStyle = color;

  for (let i = 0; i < barCount; i++) {
    let min = 1.0;
    let max = -1.0;
    const start = i * step;
    for (let j = 0; j < step; j += 10) {
      const datum = data[start + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    if (min > max) {
      min = 0;
      max = 0;
    }

    const barHeight = Math.max(2, (max - min) * amp * 0.9);
    const x = i * totalBarWidth;
    const y = amp - barHeight / 2;

    if (rounded) {
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}
