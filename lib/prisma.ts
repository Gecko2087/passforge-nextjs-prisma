import { PrismaClient } from "@prisma/client/wasm";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getRuntimeEnv } from "./runtime";

// Bindings belong to the request. Never cache clients across requests.
export function getPrisma() {
  return new PrismaClient({ adapter: new PrismaD1(getRuntimeEnv().DB) });
}
