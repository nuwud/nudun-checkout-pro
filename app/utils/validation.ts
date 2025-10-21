import { z } from "zod";

import { bonusAttachmentCollectionSchema } from "./messaging-bonus.validation";

export const heroMessagingSchema = z.object({
  headline: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  tone: z.string().min(2).max(32),
});

export const thresholdSchema = z.object({
  labelKey: z.string().min(1).max(64),
  amountCents: z.number().int().nonnegative(),
  tone: z.string().min(2).max(32),
  message: z.record(z.string().min(1), z.string().min(1).max(200)),
  priority: z.number().int().min(0).max(9),
  isActive: z.boolean().default(true),
});

export const upsellSchema = z.object({
  isEnabled: z.boolean(),
  title: z.record(z.string().min(2), z.string().min(1).max(255)),
  body: z.record(z.string().min(2), z.string().min(1).max(2000)),
  targetProduct: z.string().nullish(),
  discountCode: z.string().max(32).nullish(),
});

export const glasswatesSchema = z.object({
  selectedProductHandle: z.string().min(1).max(255),
  selectedProductImage: z.string().optional(),
  selectedProductTitle: z.string().optional(),
  selectedProductPrice: z.string().optional(),
});

export const messagingConfigSchema = z.object({
  hero: heroMessagingSchema,
  currencyCode: z.string().min(3).max(8),
  thresholds: z.array(thresholdSchema).max(10),
  upsell: upsellSchema,
  bonusAttachments: bonusAttachmentCollectionSchema.optional(),
  glasswares: glasswatesSchema.optional(),
});

export type MessagingConfigInput = z.infer<typeof messagingConfigSchema>;

export function validateMessagingConfig(input: unknown) {
  return messagingConfigSchema.safeParse(input);
}
