import { createMemesHandler } from "../backend/adapters/inbound/http/memes.handler.js";
import { container } from "../backend/composition-root.js";

export const POST = createMemesHandler(container);
