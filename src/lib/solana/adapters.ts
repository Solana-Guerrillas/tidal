import "server-only";

import { jitoStakeAdapter } from "./jito";
import { jupiterSolUsdcSwapAdapter } from "./jupiter-swap";
import { kaminoUsdcSupplyAdapter } from "./kamino";
import { kaminoSupplyAndBorrowAdapter } from "./kamino-borrow";
import { kaminoUsdcWithdrawAdapter } from "./kamino-withdraw";
import { registerAdapter } from "./registry";

let registered = false;

export function registerAllAdapters(): void {
  if (registered) return;
  registerAdapter(jitoStakeAdapter);
  registerAdapter(kaminoUsdcSupplyAdapter);
  registerAdapter(kaminoUsdcWithdrawAdapter);
  registerAdapter(kaminoSupplyAndBorrowAdapter);
  registerAdapter(jupiterSolUsdcSwapAdapter);
  registered = true;
}
