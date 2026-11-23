export interface LoadedImage {
  /** base64-encoded bytes */
  data: string;
  mimeType: string;
}

export interface ImageLoaderPort {
  /** Returns null when the image can't be loaded (never throws). */
  load(url: string): Promise<LoadedImage | null>;
}
