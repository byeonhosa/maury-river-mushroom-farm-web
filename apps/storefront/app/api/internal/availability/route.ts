import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  isDevAvailabilityAdminEnabled,
  listDevAvailabilityRecords,
  updateDevAvailabilityRecord
} from "../../../../lib/dev-availability-store";
import { resetProductCatalogCache } from "../../../../lib/products";

function disabledResponse() {
  return NextResponse.json(
    {
      error:
        "Development availability admin is disabled. It is only available outside production."
    },
    { status: 404 }
  );
}

export async function GET() {
  if (!isDevAvailabilityAdminEnabled()) {
    return disabledResponse();
  }

  return NextResponse.json({ records: listDevAvailabilityRecords() });
}

export async function PATCH(request: Request) {
  if (!isDevAvailabilityAdminEnabled()) {
    return disabledResponse();
  }

  try {
    const record = updateDevAvailabilityRecord(await request.json());
    resetProductCatalogCache();

    return NextResponse.json({ record, records: listDevAvailabilityRecords() });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(" ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Availability update failed." },
      { status: 400 }
    );
  }
}
