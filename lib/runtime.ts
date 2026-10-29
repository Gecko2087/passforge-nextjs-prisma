import { getCloudflareContext } from "@opennextjs/cloudflare";
export function getRuntimeEnv() { return getCloudflareContext().env; }
