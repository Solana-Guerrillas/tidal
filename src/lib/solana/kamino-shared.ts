import "server-only";

import {
  KaminoMarket,
  PROGRAM_ID,
} from "@kamino-finance/klend-sdk";
import { address } from "@solana/kit";
import {
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { getSolanaRpc } from "./connection";
import type { ProtocolMetadata } from "./types";

export const USDC_MINT_ADDRESS =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const SOL_MINT_ADDRESS =
  "So11111111111111111111111111111111111111112";

// Kamino main market (primary USDC/SOL lending market on Solana mainnet).
export const KAMINO_MAIN_MARKET_ADDRESS =
  "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";

// Typical Solana mainnet slot time is ~400-450ms. Kamino uses this to
// annualize accrued interest for APR/APY calculations.
const RECENT_SLOT_DURATION_MS = 450;

export const KAMINO_PROTOCOL_METADATA: ProtocolMetadata = {
  id: "kamino",
  name: "Kamino",
  auditCount: 3,
  tvlUsd: 3_000_000_000,
  ageMonths: 30,
  riskTier: "shallows",
};

export async function loadKaminoMainMarket(): Promise<KaminoMarket> {
  const rpc = getSolanaRpc();
  // Kamino's klend-sdk bundles @solana/kit v2; our app uses v6 via Privy's
  // peer dep. Runtime RPC shape is compatible (JSON-RPC is JSON-RPC) but
  // the branded types diverge. The casts here pin types at the SDK
  // boundary so downstream callers don't have to repeat them.
  const market = await KaminoMarket.load(
    rpc as unknown as Parameters<typeof KaminoMarket.load>[0],
    address(KAMINO_MAIN_MARKET_ADDRESS) as unknown as Parameters<
      typeof KaminoMarket.load
    >[1],
    RECENT_SLOT_DURATION_MS,
    PROGRAM_ID,
    true,
  );
  if (!market) {
    throw new Error(
      `Kamino main market not found at ${KAMINO_MAIN_MARKET_ADDRESS}`,
    );
  }
  return market;
}

export type KitInstruction = {
  programAddress: string;
  accounts?: ReadonlyArray<{ address: string; role: number }>;
  data?: Uint8Array;
};

// @solana/instructions AccountRole is a 2-bit field: bit 0 = writable,
// bit 1 = signer. Using bit math sidesteps the kit v2/v6 enum mismatch.
export function kitIxToWeb3Ix(ix: KitInstruction): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programAddress),
    keys: (ix.accounts ?? []).map((acc) => ({
      pubkey: new PublicKey(acc.address),
      isSigner: (acc.role & 0b10) !== 0,
      isWritable: (acc.role & 0b01) !== 0,
    })),
    data: Buffer.from(ix.data ?? new Uint8Array()),
  });
}
