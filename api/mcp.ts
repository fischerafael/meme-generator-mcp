import { createMcpHandler } from "../backend/adapters/inbound/mcp/handler.js";
import { container } from "../backend/composition-root.js";

const handle = createMcpHandler(container);
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
