import "server-only";

import { jitoStakeAdapter } from "./jito";
import { registerAdapter } from "./registry";

let registered = false;

export function registerAllAdapters(): void {
  if (registered) return;
  registerAdapter(jitoStakeAdapter);
  registered = true;
}
