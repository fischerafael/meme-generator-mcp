import { createTokenHandler } from "../backend/adapters/inbound/http/token.handler.js";
import { container } from "../backend/composition-root.js";

export const POST = createTokenHandler(container);
