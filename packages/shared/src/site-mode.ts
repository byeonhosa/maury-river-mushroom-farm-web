// Informational mode renders the full catalog with availability tiers and
// notify-me capture while disabling every cart and checkout path site-wide.
// The commerce code stays intact behind the flag; checkout returns in a later
// phase by flipping the flag off.

export interface SiteModeEnv {
  // Public flag is embedded in the browser bundle so client components can read
  // it. The non-public alias lets server-only scripts (e.g. the cart smoke)
  // honor the same mode without exposing a second public variable.
  NEXT_PUBLIC_INFORMATIONAL_MODE?: string;
  INFORMATIONAL_MODE?: string;
}

export function isInformationalMode(env: SiteModeEnv = {}): boolean {
  return (
    env.NEXT_PUBLIC_INFORMATIONAL_MODE === "true" || env.INFORMATIONAL_MODE === "true"
  );
}

export const informationalModeMessage =
  "Online ordering is paused right now. Browse the full catalog, sign up to be notified, or visit us at the Lexington (Wednesday) and Staunton (Saturday) farmers markets.";
