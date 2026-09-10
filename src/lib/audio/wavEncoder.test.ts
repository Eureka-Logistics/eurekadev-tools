import { describe, it, expect } from "vitest";
import { audioBufferToWav } from "./wavEncoder";

describe("wavEncoder", () => {
  it("encodes an AudioBuffer to a valid WAV blob with RIFF and WAVE headers", () => {
    const sampleRate = 44100;
    const numChannels = 1;
    const length = 44100; // 1 second

    // Mock AudioBuffer
    const channelData = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
    }

    const mockBuffer = {
      numberOfChannels: numChannels,
      sampleRate,
      length,
      duration: 1,
      getChannelData: () => channelData,
    } as unknown as AudioBuffer;

    const blob = audioBufferToWav(mockBuffer);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBe(44 + length * 2);
  });
});
