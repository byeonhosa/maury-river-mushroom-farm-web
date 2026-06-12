import { isInformationalMode } from "@mrmf/shared";

// NEXT_PUBLIC_INFORMATIONAL_MODE is inlined into both server and client bundles
// at build time, so this helper works from server components, client
// components, and route handlers alike.
export function informationalModeEnabled(): boolean {
  return isInformationalMode({
    NEXT_PUBLIC_INFORMATIONAL_MODE: process.env.NEXT_PUBLIC_INFORMATIONAL_MODE,
    INFORMATIONAL_MODE: process.env.INFORMATIONAL_MODE,
  });
}
