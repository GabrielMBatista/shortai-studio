// WebCodecs API Types
// These are not yet fully standardized in TypeScript's lib.dom.d.ts

declare class AudioData {
    constructor(init: AudioDataInit);
    readonly format: AudioSampleFormat | null;
    readonly sampleRate: number;
    readonly numberOfFrames: number;
    readonly numberOfChannels: number;
    readonly duration: number;
    readonly timestamp: number;
    allocationSize(options: AudioDataCopyToOptions): number;
    copyTo(destination: AllowSharedBufferSource, options: AudioDataCopyToOptions): void;
    clone(): AudioData;
    close(): void;
}

interface AudioDataInit {
    format: AudioSampleFormat;
    sampleRate: number;
    numberOfFrames: number;
    numberOfChannels: number;
    timestamp: number;
    data: AllowSharedBufferSource;
    transfer?: ArrayBuffer[];
}

interface AudioDataCopyToOptions {
    planeIndex: number;
    format?: AudioSampleFormat;
}

type AudioSampleFormat = "u8" | "s16" | "s32" | "f32" | "u8-planar" | "s16-planar" | "s32-planar" | "f32-planar";

declare class VideoFrame {
    constructor(image: CanvasImageSource, init?: VideoFrameInit);
    constructor(data: AllowSharedBufferSource, init: VideoFrameBufferInit);
    readonly format: VideoPixelFormat | null;
    readonly codedWidth: number;
    readonly codedHeight: number;
    readonly displayWidth: number;
    readonly displayHeight: number;
    readonly duration: number | null;
    readonly timestamp: number;
    readonly colorSpace: VideoColorSpace;
    allocationSize(options?: VideoFrameCopyToOptions): number;
    copyTo(destination: AllowSharedBufferSource, options?: VideoFrameCopyToOptions): Promise<Layout[]>;
    clone(): VideoFrame;
    close(): void;
}

interface VideoFrameInit {
    timestamp?: number;
    duration?: number;
    alpha?: AlphaOption;
}

interface VideoFrameBufferInit {
    format: VideoPixelFormat;
    codedWidth: number;
    codedHeight: number;
    timestamp: number;
    duration?: number;
    layout?: PlaneLayout[];
}

interface VideoFrameCopyToOptions {
    rect?: DOMRectInit;
    layout?: PlaneLayout[];
}

type VideoPixelFormat = "I420" | "I420A" | "I422" | "I444" | "NV12" | "RGBA" | "RGBX" | "BGRA" | "BGRX";
type AlphaOption = "keep" | "discard";

interface PlaneLayout {
    offset: number;
    stride: number;
}

interface Layout {
    offset: number;
    stride: number;
}

interface VideoColorSpace {
    primaries: VideoColorPrimaries | null;
    transfer: VideoTransferCharacteristics | null;
    matrix: VideoMatrixCoefficients | null;
    fullRange: boolean | null;
}

type VideoColorPrimaries = "bt709" | "bt470bg" | "smpte170m";
type VideoTransferCharacteristics = "bt709" | "smpte170m" | "iec61966-2-1";
type VideoMatrixCoefficients = "bt709" | "smpte170m" | "bt470bg";

declare class VideoEncoder {
    constructor(init: VideoEncoderInit);
    readonly state: CodecState;
    readonly encodeQueueSize: number;
    configure(config: VideoEncoderConfig): void;
    encode(frame: VideoFrame, options?: VideoEncoderEncodeOptions): void;
    flush(): Promise<void>;
    reset(): void;
    close(): void;
    static isConfigSupported(config: VideoEncoderConfig): Promise<VideoEncoderSupport>;
}

interface VideoEncoderInit {
    output: (chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata) => void;
    error: (error: DOMException) => void;
}

interface VideoEncoderConfig {
    codec: string;
    width: number;
    height: number;
    bitrate?: number;
    framerate?: number;
    hardwareAcceleration?: HardwareAcceleration;
    alpha?: AlphaOption;
    bitrateMode?: VideoEncoderBitrateMode;
    latencyMode?: LatencyMode;
    scalabilityMode?: string;
}

interface VideoEncoderEncodeOptions {
    keyFrame?: boolean;
}

interface EncodedVideoChunk {
    readonly type: EncodedVideoChunkType;
    readonly timestamp: number;
    readonly duration: number | null;
    readonly byteLength: number;
    copyTo(destination: AllowSharedBufferSource): void;
}

interface EncodedVideoChunkMetadata {
    decoderConfig?: VideoDecoderConfig;
    svc?: SvcOutputMetadata;
}

interface SvcOutputMetadata {
    temporalLayerId: number;
}

interface VideoDecoderConfig {
    codec: string;
    codedWidth?: number;
    codedHeight?: number;
    displayAspectWidth?: number;
    displayAspectHeight?: number;
    colorSpace?: VideoColorSpaceInit;
    hardwareAcceleration?: HardwareAcceleration;
    optimizeForLatency?: boolean;
    description?: AllowSharedBufferSource;
}

interface VideoColorSpaceInit {
    primaries?: VideoColorPrimaries;
    transfer?: VideoTransferCharacteristics;
    matrix?: VideoMatrixCoefficients;
    fullRange?: boolean;
}

interface VideoEncoderSupport {
    supported: boolean;
    config?: VideoEncoderConfig;
}

type EncodedVideoChunkType = "key" | "delta";
type CodecState = "unconfigured" | "configured" | "closed";
type HardwareAcceleration = "no-preference" | "prefer-hardware" | "prefer-software";
type VideoEncoderBitrateMode = "constant" | "variable";
type LatencyMode = "quality" | "realtime";

declare class AudioEncoder {
    constructor(init: AudioEncoderInit);
    readonly state: CodecState;
    readonly encodeQueueSize: number;
    configure(config: AudioEncoderConfig): void;
    encode(data: AudioData): void;
    flush(): Promise<void>;
    reset(): void;
    close(): void;
    static isConfigSupported(config: AudioEncoderConfig): Promise<AudioEncoderSupport>;
}

interface AudioEncoderInit {
    output: (chunk: EncodedAudioChunk, metadata?: EncodedAudioChunkMetadata) => void;
    error: (error: DOMException) => void;
}

interface AudioEncoderConfig {
    codec: string;
    sampleRate?: number;
    numberOfChannels?: number;
    bitrate?: number;
}

interface EncodedAudioChunk {
    readonly type: EncodedAudioChunkType;
    readonly timestamp: number;
    readonly duration: number | null;
    readonly byteLength: number;
    copyTo(destination: AllowSharedBufferSource): void;
}

interface EncodedAudioChunkMetadata {
    decoderConfig?: AudioDecoderConfig;
}

interface AudioDecoderConfig {
    codec: string;
    sampleRate: number;
    numberOfChannels: number;
    description?: AllowSharedBufferSource;
}

interface AudioEncoderSupport {
    supported: boolean;
    config?: AudioEncoderConfig;
}

type EncodedAudioChunkType = "key" | "delta";
