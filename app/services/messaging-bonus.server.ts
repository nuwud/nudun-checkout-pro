import type { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "../db.server";
import {
  bonusAttachmentSavePayloadSchema,
  bonusAttachmentSchema,
  type AttachmentLocales,
  type AttachmentRuleKey,
  type AttachmentValueSource,
  type BonusAttachmentInput,
  localesSchema,
} from "../utils/messaging-bonus.validation";

type DefaultAttachmentOptions = {
  productId: string;
  variantId?: string | undefined;
  quantity: number;
  valueSource: AttachmentValueSource;
  customValueCents?: number | undefined;
  locales: AttachmentLocales;
  imageUrl?: string | undefined;
  ruleKey: AttachmentRuleKey;
};

export type BonusAttachmentDto = {
  id: string;
  configId: number;
  ruleKey: AttachmentRuleKey;
  productId: string;
  variantId: string | null;
  quantity: number;
  valueSource: AttachmentValueSource;
  customValueCents: number | null;
  locales: AttachmentLocales;
  imageUrl: string | null;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BonusAttachmentsByRule = Partial<
  Record<AttachmentRuleKey, BonusAttachmentDto>
>;

export function parseBonusAttachmentPayload(input: unknown) {
  return bonusAttachmentSavePayloadSchema.parse(input);
}

export function loadDefaultBonusAttachments(): BonusAttachmentInput[] {
  const attachments: BonusAttachmentInput[] = [];

  const annual = buildAttachmentFromEnv({
    ruleKey: "annual",
    productId: process.env.NUDUN_BONUS_ANNUAL_PRODUCT_GID,
    variantId: process.env.NUDUN_BONUS_ANNUAL_VARIANT_GID,
    quantityEnv: process.env.NUDUN_BONUS_ANNUAL_QUANTITY,
    imageUrl: process.env.NUDUN_BONUS_ANNUAL_IMAGE_URL,
    customValueEnv: process.env.NUDUN_BONUS_ANNUAL_CUSTOM_VALUE_CENTS,
    defaultLocales: {
      default: {
        title: "Included premium glass set",
        body: "Annual subscribers receive four premium glasses with their first shipment.",
      },
      fr: {
        title: "Ensemble de verres premium inclus",
        body: "Les abonnés annuels reçoivent quatre verres premium avec leur première livraison.",
      },
    },
  });

  if (annual) {
    attachments.push(annual);
  }

  const quarterly = buildAttachmentFromEnv({
    ruleKey: "quarterly",
    productId: process.env.NUDUN_BONUS_QUARTERLY_PRODUCT_GID,
    variantId: process.env.NUDUN_BONUS_QUARTERLY_VARIANT_GID,
    quantityEnv: process.env.NUDUN_BONUS_QUARTERLY_QUANTITY,
    imageUrl: process.env.NUDUN_BONUS_QUARTERLY_IMAGE_URL,
    customValueEnv: process.env.NUDUN_BONUS_QUARTERLY_CUSTOM_VALUE_CENTS,
    defaultLocales: {
      default: {
        title: "Included welcome gift",
        body: "Quarterly subscribers unlock a complimentary welcome gift in their first delivery.",
      },
      fr: {
        title: "Cadeau de bienvenue inclus",
        body: "Les abonnés trimestriels reçoivent un cadeau de bienvenue offert dans leur première livraison.",
      },
    },
  });

  if (quarterly) {
    attachments.push(quarterly);
  }

  return attachments;
}

type EnvAttachmentConfig = {
  ruleKey: AttachmentRuleKey;
  productId: string | undefined;
  variantId?: string | undefined;
  quantityEnv?: string | undefined;
  imageUrl?: string | undefined;
  customValueEnv?: string | undefined;
  defaultLocales: AttachmentLocales;
};

function buildAttachmentFromEnv(
  config: EnvAttachmentConfig,
): BonusAttachmentInput | null {
  if (!config.productId) {
    return null;
  }

  const quantity = coerceQuantity(
    config.quantityEnv,
    config.ruleKey === "annual" ? 4 : 1,
  );
  const customValue = coerceMinorUnits(config.customValueEnv);
  const valueSource: AttachmentValueSource =
    customValue != null ? "custom" : "price";

  const attachment: DefaultAttachmentOptions = {
    ruleKey: config.ruleKey,
    productId: config.productId,
    variantId: config.variantId || undefined,
    quantity,
    valueSource,
    customValueCents: customValue ?? undefined,
    locales: config.defaultLocales,
    imageUrl: config.imageUrl || undefined,
  };

  return bonusAttachmentSchema.parse(attachment);
}

function coerceQuantity(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

function coerceMinorUnits(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  return null;
}

export async function getBonusAttachmentsByShop(
  shopDomain: string,
): Promise<BonusAttachmentsByRule> {
  const config = await prisma.merchantMessagingConfig.findUnique({
    where: { shopDomain },
    select: {
      id: true,
      bonusAttachments: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!config) {
    return {};
  }

  return mapAttachmentsByRule(config.bonusAttachments);
}

export async function getBonusAttachmentsByConfigId(
  configId: number,
): Promise<BonusAttachmentsByRule> {
  const attachments = await prisma.messagingBonusAttachment.findMany({
    where: { configId },
    orderBy: { updatedAt: "desc" },
  });

  return mapAttachmentsByRule(attachments);
}

export async function replaceBonusAttachments(
  configId: number,
  attachments: BonusAttachmentInput[],
  options: { updatedBy: string; tx?: Prisma.TransactionClient } = {
    updatedBy: "system",
  },
): Promise<BonusAttachmentsByRule> {
  const client: Prisma.TransactionClient | typeof prisma = options.tx ?? prisma;

  await client.messagingBonusAttachment.deleteMany({ where: { configId } });

  if (attachments.length === 0) {
    return {};
  }

  const created: MessagingBonusAttachmentRecord[] = [];

  for (const attachment of attachments) {
    const locales = localesSchema.parse(attachment.locales);

    const record = await client.messagingBonusAttachment.create({
      data: {
        configId,
        ruleKey: attachment.ruleKey,
        productId: attachment.productId,
        variantId: attachment.variantId ?? null,
        quantity: attachment.quantity,
        valueSource: attachment.valueSource,
        customValueCents: attachment.customValueCents ?? null,
        locales,
        imageUrl: attachment.imageUrl ?? null,
        updatedBy: options.updatedBy,
      },
      select: attachmentSelect,
    });

    created.push(record);
  }

  return mapAttachmentsByRule(created);
}

const attachmentSelect = {
  id: true,
  configId: true,
  ruleKey: true,
  productId: true,
  variantId: true,
  quantity: true,
  valueSource: true,
  customValueCents: true,
  locales: true,
  imageUrl: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MessagingBonusAttachmentSelect;

type MessagingBonusAttachmentRecord = Prisma.MessagingBonusAttachmentGetPayload<{
  select: typeof attachmentSelect;
}>;

function mapAttachmentsByRule(
  records: MessagingBonusAttachmentRecord[],
): BonusAttachmentsByRule {
  return records.reduce<BonusAttachmentsByRule>((acc, record) => {
    const mapped = mapAttachmentRecord(record);
    acc[mapped.ruleKey] = mapped;
    return acc;
  }, {});
}

function mapAttachmentRecord(
  record: MessagingBonusAttachmentRecord,
): BonusAttachmentDto {
  const locales = parseLocales(record.locales);

  return {
    id: record.id,
    configId: record.configId,
    ruleKey: record.ruleKey,
    productId: record.productId,
    variantId: record.variantId ?? null,
    quantity: record.quantity,
    valueSource: record.valueSource,
    customValueCents: record.customValueCents ?? null,
    locales,
    imageUrl: record.imageUrl ?? null,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function parseLocales(raw: unknown): AttachmentLocales {
  const parsed = localesSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  console.warn("Invalid attachment locales payload", parsed.error);
  return {
    default: {
      title: "",
      body: "",
    },
  };
}

// Shopify Admin GraphQL ---------------------------------------------------

export const ATTACHMENT_PRODUCT_PICKER_QUERY = `#graphql
  query AttachmentProductPicker($query: String!, $first: Int = 10) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          media(first: 1) {
            nodes {
              ... on MediaImage {
                id
                image {
                  url
                  altText
                }
              }
            }
          }
          variants(first: 25) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

const attachmentVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string().nullable().optional(),
  compareAtPrice: z.string().nullable().optional(),
  inventoryQuantity: z.number().int().nullable().optional(),
});

const attachmentVariantEdgeSchema = z.object({
  node: attachmentVariantSchema,
});

const attachmentMediaNodeSchema = z.object({
  image: z
    .object({
      url: z.string(),
      altText: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const attachmentProductNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  media: z
    .object({
      nodes: z.array(attachmentMediaNodeSchema).default([]),
    })
    .nullish(),
  variants: z
    .object({
      edges: z.array(attachmentVariantEdgeSchema).default([]),
    })
    .nullish(),
});

const attachmentProductEdgeSchema = z.object({
  node: attachmentProductNodeSchema,
});

const attachmentProductPickerResponseSchema = z.object({
  data: z.object({
    products: z
      .object({
        edges: z.array(attachmentProductEdgeSchema).default([]),
      })
      .nullish(),
  }),
  errors: z
    .array(
      z.object({
        message: z.string(),
      }),
    )
    .optional(),
});

export type AttachmentProductVariant = {
  id: string;
  title: string;
  price: string | null;
  compareAtPrice: string | null;
  inventoryQuantity: number | null;
};

export type AttachmentProduct = {
  id: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  variants: AttachmentProductVariant[];
};

export type AdminGraphqlClient = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
};

type AttachmentProductNode = z.infer<typeof attachmentProductNodeSchema>;

type AttachmentProductPickerResponse = z.infer<
  typeof attachmentProductPickerResponseSchema
>;

export async function fetchAttachmentProductOptions(
  admin: AdminGraphqlClient,
  searchQuery: string,
  first = 10,
): Promise<AttachmentProduct[]> {
  const trimmedQuery = searchQuery.trim();
  if (!trimmedQuery) {
    return [];
  }

  const pageSize = Math.min(Math.max(first, 1), 25);
  const response = await admin.graphql(ATTACHMENT_PRODUCT_PICKER_QUERY, {
    variables: { query: trimmedQuery, first: pageSize },
  });

  const payload = (await response.json()) as AttachmentProductPickerResponse;
  const parsed = attachmentProductPickerResponseSchema.parse(payload);

  if (parsed.errors?.length) {
    const errorMessage = parsed.errors
      .map((error) => error.message)
      .join("; ");
    throw new Error(`Shopify Admin API error: ${errorMessage}`);
  }

  const productEdges = parsed.data.products?.edges ?? [];
  return productEdges.map(({ node }) => mapAttachmentProductNode(node));
}

function mapAttachmentProductNode(
  node: AttachmentProductNode,
): AttachmentProduct {
  const mediaNodes = node.media?.nodes ?? [];
  const firstImage = mediaNodes.find((media) => media.image?.url);
  const variants = node.variants?.edges ?? [];

  return {
    id: node.id,
    title: node.title,
    imageUrl: firstImage?.image?.url ?? null,
    imageAlt: firstImage?.image?.altText ?? null,
    variants: variants.map(({ node: variant }) => ({
      id: variant.id,
      title: variant.title,
      price: variant.price ?? null,
      compareAtPrice: variant.compareAtPrice ?? null,
      inventoryQuantity:
        typeof variant.inventoryQuantity === "number"
          ? variant.inventoryQuantity
          : null,
    })),
  };
}
