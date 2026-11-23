import { createListTemplatesHandler } from "../../backend/adapters/inbound/http/templates.handler.js";
import { container } from "../../backend/composition-root.js";

export const GET = createListTemplatesHandler(container);
