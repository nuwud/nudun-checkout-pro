import { z } from "zod";

const shopifyGidPattern = /^gid:\/\/shopify\//;
const cuidPattern = /^c[a-z0-9]{24}$/i;

const trimmedString = (minimum: number, message: string, maximum = 240) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= minimum, message)
    .refine(
      (value) => value.length <= maximum,
      `Must be ${maximum} characters or fewer`,
    );

const localeCopySchema = z.object({
  title: trimmedString(1, "Title is required", 120),
  body: trimmedString(1, "Body copy is required", 400),
});

const localeKeySchema = z
  .string()
  .regex(/^([a-z]{2})(-[A-Z]{2})?$/, "Locale keys must follow ll or ll-CC pattern");

export const localesSchema = z
  .object({
    default: localeCopySchema,
  })
  .catchall(localeCopySchema)
  .superRefine((value, ctx) => {
    if (!value.default) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["default"],
        message: "Default locale content is required",
      });
    }

    for (const key of Object.keys(value)) {
      if (key !== "default" && !localeKeySchema.safeParse(key).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "Locale keys must follow ll or ll-CC pattern",
        });
      }
    }
  });

export const attachmentRuleKeySchema = z.enum([
  "annual",
  "quarterly",
  "hero",
  "upsell",
]);

export const attachmentValueSourceSchema = z.enum(["price", "custom"]);

export type AttachmentRuleKey = z.infer<typeof attachmentRuleKeySchema>;
export type AttachmentValueSource = z.infer<typeof attachmentValueSourceSchema>;
export type AttachmentLocales = z.infer<typeof localesSchema>;

export const shopifyGidSchema = z
  .string()
  .trim()
  .min(1, "Shopify resource id is required")
  .regex(shopifyGidPattern, "Value must be a Shopify gid:// identifier");

export const nullableShopifyGidSchema = z
  .union([
    shopifyGidSchema,
    z
      .string()
      .trim()
      .length(0)
      .transform(() => undefined),
  ])
  .optional();

const optionalCurrencyMinorUnitsSchema = z
  .union([
    z.coerce
      .number()
      .int("Custom value must be an integer")
      .min(0, "Custom value must be zero or greater")
      .max(1_000_000, "Custom value must be less than $10,000"),
    z
      .string()
      .trim()
      .length(0)
      .transform(() => undefined),
  ])
  .optional();

export const bonusAttachmentIdSchema = z
  .string()
  .trim()
  .regex(cuidPattern, "Attachment id must be a valid CUID")
  .optional();

export const bonusAttachmentSchema = z
  .object({
    id: bonusAttachmentIdSchema,
    ruleKey: attachmentRuleKeySchema,
    productId: shopifyGidSchema,
    variantId: nullableShopifyGidSchema,
    quantity: z.coerce
      .number()
      .refine((value) => !Number.isNaN(value), "Quantity is required")
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(99, "Quantity must be less than 100"),
    valueSource: attachmentValueSourceSchema,
    customValueCents: optionalCurrencyMinorUnitsSchema,
    locales: localesSchema,
    imageUrl: z
      .string()
      .trim()
      .url("Image URL must be valid")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.valueSource === "custom" && data.customValueCents == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customValueCents"],
        message: "Custom value is required when value source is custom",
      });
    }

    if (data.valueSource === "price" && data.customValueCents != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customValueCents"],
        message: "Remove custom value when using product price",
      });
    }

    if (data.variantId == null || data.variantId === "") {
      return;
    }

    const variantResult = shopifyGidSchema.safeParse(data.variantId);
    if (!variantResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantId"],
        message: "Variant id must be a Shopify gid:// identifier",
      });
    }
  });

export const bonusAttachmentCollectionSchema = z
  .array(bonusAttachmentSchema)
  .max(4, "Maximum of four attachments supported in current release");

export const bonusAttachmentSavePayloadSchema = z.object({
  attachments: bonusAttachmentCollectionSchema,
});

export type BonusAttachmentInput = z.infer<typeof bonusAttachmentSchema>;
export type BonusAttachmentSavePayload = z.infer<
  typeof bonusAttachmentSavePayloadSchema
>;
