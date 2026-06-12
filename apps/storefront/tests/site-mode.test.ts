import { afterEach, describe, expect, it } from "vitest";

import { informationalModeEnabled } from "../lib/site-mode";

const original = process.env.NEXT_PUBLIC_INFORMATIONAL_MODE;

afterEach(() => {
  if (original === undefined) {
    delete process.env.NEXT_PUBLIC_INFORMATIONAL_MODE;
  } else {
    process.env.NEXT_PUBLIC_INFORMATIONAL_MODE = original;
  }
});

describe("informationalModeEnabled", () => {
  it("reads the public informational-mode env flag", () => {
    process.env.NEXT_PUBLIC_INFORMATIONAL_MODE = "true";
    expect(informationalModeEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_INFORMATIONAL_MODE = "false";
    expect(informationalModeEnabled()).toBe(false);

    delete process.env.NEXT_PUBLIC_INFORMATIONAL_MODE;
    expect(informationalModeEnabled()).toBe(false);
  });
});
