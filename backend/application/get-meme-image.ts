import type { Meme } from "../domain/meme.js";
import type { ImageLoaderPort, LoadedImage } from "../ports/image-loader.port.js";

export class GetMemeImage {
  constructor(private readonly loader: ImageLoaderPort) {}

  execute(meme: Meme): Promise<LoadedImage | null> {
    return this.loader.load(meme.url);
  }
}
