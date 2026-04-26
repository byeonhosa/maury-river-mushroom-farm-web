import { Modules } from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  listShippingOptionsForCartWithPricingWorkflow,
  listShippingOptionsForCartWorkflow
} from "@medusajs/medusa/core-flows";
import type { FulfillmentMode } from "@mrmf/shared";

import {
  buildMrmfShippingOptionsContext,
  normalizeFulfillmentMode
} from "../../lib/mrmf-shipping-context";

interface WorkflowCartItem {
  variant_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface WorkflowCart {
  items?: WorkflowCartItem[];
}

interface ProductVariantRecord {
  id: string;
  metadata?: Record<string, unknown> | null;
}

interface ProductModuleService {
  listProductVariants(
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<ProductVariantRecord[]>;
}

interface WorkflowHookInput {
  cart: WorkflowCart;
}

interface WorkflowHookContext {
  container: {
    resolve<TService>(key: string): TService;
  };
}

function modeFromLineMetadata(line: WorkflowCartItem) {
  return normalizeFulfillmentMode(line.metadata?.fulfillment_mode);
}

async function fetchModesFromVariants(
  variantIds: string[],
  { container }: WorkflowHookContext
) {
  if (variantIds.length === 0) {
    return new Map<string, FulfillmentMode>();
  }

  const productModule = container.resolve<ProductModuleService>(Modules.PRODUCT);
  const variants = await productModule.listProductVariants(
    {
      id: variantIds
    },
    {
      select: ["id", "metadata"],
      take: variantIds.length + 10
    }
  );

  return new Map(
    variants.flatMap((variant) => {
      const mode = normalizeFulfillmentMode(variant.metadata?.fulfillment_mode);

      return mode ? [[variant.id, mode]] : [];
    })
  );
}

async function setMrmfShippingOptionsContext(
  { cart }: WorkflowHookInput,
  hookContext: WorkflowHookContext
) {
  const lines = cart.items ?? [];
  const lineModes = lines.map(modeFromLineMetadata);
  const missingVariantIds = lines
    .filter((line, index) => !lineModes[index] && typeof line.variant_id === "string")
    .map((line) => line.variant_id as string);
  const variantModeById = await fetchModesFromVariants(missingVariantIds, hookContext);
  const modes = lines.map((line, index) => {
    const lineMode = lineModes[index];

    return lineMode ?? (line.variant_id ? variantModeById.get(line.variant_id) : undefined);
  });

  return new StepResponse(buildMrmfShippingOptionsContext(modes));
}

listShippingOptionsForCartWorkflow.hooks.setShippingOptionsContext(setMrmfShippingOptionsContext);
listShippingOptionsForCartWithPricingWorkflow.hooks.setShippingOptionsContext(
  setMrmfShippingOptionsContext
);

