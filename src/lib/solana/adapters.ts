import "server-only";

import { jitoStakeAdapter } from "./jito";
import { kaminoUsdcSupplyAdapter } from "./kamino";
import { registerAdapter } from "./registry";

let registered = false;

export function registerAllAdapters(): void {
  if (registered) return;
  registerAdapter(jitoStakeAdapter);
  registerAdapter(kaminoUsdcSupplyAdapter);
  registered = true;
}
