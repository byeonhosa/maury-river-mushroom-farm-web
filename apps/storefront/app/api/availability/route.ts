import { availabilityInquirySchema } from "@mrmf/shared";
import { parseFormData, validationResponse } from "../../../lib/form-response";

export async function POST(request: Request) {
  return validationResponse(availabilityInquirySchema, await parseFormData(request));
}
