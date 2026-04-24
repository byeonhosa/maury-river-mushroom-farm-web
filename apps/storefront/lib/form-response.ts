import type { z } from "zod";

export async function parseFormData(request: Request) {
  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

export function validationResponse<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    return Response.json(
      {
        ok: false,
        errors: result.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  return Response.json({
    ok: true,
    message:
      "Thanks. This scaffold validated your request server-side. Email/CRM delivery will be connected before launch."
  });
}
