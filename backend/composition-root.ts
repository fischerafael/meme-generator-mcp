import { AesGcmCipher } from "./adapters/outbound/aesgcm.cipher.js";
import { ImgflipRenderer } from "./adapters/outbound/imgflip.renderer.js";
import { JsonCatalog } from "./adapters/outbound/json.catalog.js";
import { GenerateMeme } from "./application/generate-meme.js";
import { GetTemplate } from "./application/get-template.js";
import { IssueToken } from "./application/issue-token.js";
import { ListTemplates } from "./application/list-templates.js";
import type { TokenCipherPort } from "./ports/token-cipher.port.js";

export interface Container {
  cipher: TokenCipherPort;
  listTemplates: ListTemplates;
  getTemplate: GetTemplate;
  generateMeme: GenerateMeme;
  issueToken: IssueToken;
}

let catalog: JsonCatalog | undefined;
let cipher: TokenCipherPort | undefined;
const renderer = new ImgflipRenderer();

/** The only place that knows concrete adapters. Built lazily and memoized per function instance. */
export function container(): Container {
  catalog ??= new JsonCatalog();
  const c = catalog;
  return {
    get cipher() {
      cipher ??= AesGcmCipher.fromBase64Key(process.env.TOKEN_KEY);
      return cipher;
    },
    listTemplates: new ListTemplates(c),
    getTemplate: new GetTemplate(c),
    generateMeme: new GenerateMeme(c, renderer),
    get issueToken() {
      cipher ??= AesGcmCipher.fromBase64Key(process.env.TOKEN_KEY);
      return new IssueToken(renderer, cipher);
    },
  };
}
