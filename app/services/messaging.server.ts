import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ConfigAuditLog, Prisma } from "@prisma/client";

import prisma from "../db.server";
import {
  messagingConfigSchema,
  type MessagingConfigInput,
} from "../utils/validation";

const DEFAULT_CONFIG_PATH = join(
  process.cwd(),
  "app",
  "data",
  "default-messaging.json",
);

const AUDIT_HISTORY_LIMIT = 20;

type TransactionClient = Prisma.TransactionClient;

type AuditAction = "UPDATE" | "RESET";

export type MessagingConfigResponse = MessagingConfigInput & {
  lastPublishedAt: Date | null;
};

export async function getMessagingConfig(
  shopDomain: string,
): Promise<MessagingConfigResponse> {
  const config = await prisma.merchantMessagingConfig.findUnique({
    where: { shopDomain },
    include: {
      thresholds: {
        orderBy: [{ priority: "asc" }, { id: "asc" }],
      },
      upsellSettings: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!config) {
    const defaults = await loadDefaultMessagingConfig();
    return {
      ...defaults,
      lastPublishedAt: null,
    };
  }

  let defaults: MessagingConfigInput | null = null;
  const ensureDefaults = async () => {
    if (!defaults) {
      defaults = await loadDefaultMessagingConfig();
    }
    return defaults;
  };

  const thresholds = config.thresholds.map((threshold) => ({
    labelKey: threshold.labelKey,
    amountCents: threshold.amountCents,
    tone: threshold.tone,
    message: parseLocalizedJson(threshold.messageJson),
    priority: threshold.priority,
    isActive: threshold.isActive,
  }));

  const upsellRow = config.upsellSettings[0];
  const upsell = upsellRow
    ? {
        isEnabled: upsellRow.isEnabled,
        title: parseLocalizedJson(upsellRow.titleJson),
        body: parseLocalizedJson(upsellRow.bodyJson),
        targetProduct: upsellRow.targetProduct ?? null,
        discountCode: upsellRow.discountCode ?? null,
      }
    : (await ensureDefaults()).upsell;

  return {
    hero: {
      headline: config.heroHeadline,
      body: config.heroBody,
      tone: config.defaultTone,
    },
    currencyCode: config.currencyCode,
    thresholds,
    upsell,
    lastPublishedAt: config.lastPublishedAt,
  };
}

export async function upsertMessagingConfig(
  shopDomain: string,
  payload: MessagingConfigInput,
): Promise<MessagingConfigResponse> {
  await prisma.$transaction(async (tx) => {
    const config = await upsertConfigHeader(tx, shopDomain, payload, {
      action: "UPDATE",
      lastPublishedAt: new Date(),
    });

    await replaceThresholds(tx, config.id, payload.thresholds);
    await replaceUpsellSettings(tx, config.id, payload.upsell);

    await logAuditEntry(tx, config.id, shopDomain, "UPDATE", payload);
  });

  return getMessagingConfig(shopDomain);
}

export async function resetMessagingConfig(
  shopDomain: string,
): Promise<MessagingConfigResponse> {
  const defaults = await loadDefaultMessagingConfig();

  await prisma.$transaction(async (tx) => {
    const config = await upsertConfigHeader(tx, shopDomain, defaults, {
      action: "RESET",
      lastPublishedAt: null,
    });

    await replaceThresholds(tx, config.id, defaults.thresholds);
    await replaceUpsellSettings(tx, config.id, defaults.upsell);

    await logAuditEntry(tx, config.id, shopDomain, "RESET", defaults);
  });

  return getMessagingConfig(shopDomain);
}

export async function listAuditEntries(
  shopDomain: string,
): Promise<ConfigAuditLog[]> {
  const config = await prisma.merchantMessagingConfig.findUnique({
    where: { shopDomain },
    select: {
      audits: {
        orderBy: { createdAt: "desc" },
        take: AUDIT_HISTORY_LIMIT,
      },
    },
  });

  return config?.audits ?? [];
}

async function loadDefaultMessagingConfig(): Promise<MessagingConfigInput> {
  const contents = await readFile(DEFAULT_CONFIG_PATH, "utf-8").catch(
    (error) => {
      throw new Error(`Unable to load default messaging config: ${error}`);
    },
  );

  const raw = JSON.parse(contents) as unknown;

  if (!raw || typeof raw !== "object") {
    throw new Error("Default messaging config is not a valid object");
  }

  return messagingConfigSchema.parse({
    hero: (raw as Record<string, unknown>).hero,
    currencyCode: (raw as Record<string, unknown>).currencyCode,
    thresholds: (raw as Record<string, unknown>).thresholds,
    upsell: (raw as Record<string, unknown>).upsell,
  });
}

async function upsertConfigHeader(
  tx: TransactionClient,
  shopDomain: string,
  payload: MessagingConfigInput,
  options: { action: AuditAction; lastPublishedAt: Date | null },
) {
  return tx.merchantMessagingConfig.upsert({
    where: { shopDomain },
    update: {
      heroHeadline: payload.hero.headline,
      heroBody: payload.hero.body,
      defaultTone: payload.hero.tone,
      currencyCode: payload.currencyCode,
      lastPublishedAt: options.lastPublishedAt,
    },
    create: {
      shopDomain,
      heroHeadline: payload.hero.headline,
      heroBody: payload.hero.body,
      defaultTone: payload.hero.tone,
      currencyCode: payload.currencyCode,
      lastPublishedAt: options.lastPublishedAt,
    },
  });
}

async function replaceThresholds(
  tx: TransactionClient,
  configId: number,
  thresholds: MessagingConfigInput["thresholds"],
) {
  await tx.thresholdSetting.deleteMany({ where: { configId } });

  for (const threshold of thresholds) {
    await tx.thresholdSetting.create({
      data: {
        configId,
        labelKey: threshold.labelKey,
        amountCents: threshold.amountCents,
        tone: threshold.tone,
        priority: threshold.priority,
        isActive: threshold.isActive,
        messageJson: JSON.stringify(threshold.message),
      },
    });
  }
}

async function replaceUpsellSettings(
  tx: TransactionClient,
  configId: number,
  upsell: MessagingConfigInput["upsell"],
) {
  await tx.upsellSetting.deleteMany({ where: { configId } });

  await tx.upsellSetting.create({
    data: {
      configId,
      title: pickDefaultLocaleCopy(upsell.title),
      body: pickDefaultLocaleCopy(upsell.body),
      titleJson: JSON.stringify(upsell.title),
      bodyJson: JSON.stringify(upsell.body),
      targetProduct: upsell.targetProduct ?? null,
      discountCode: upsell.discountCode ?? null,
      isEnabled: upsell.isEnabled,
    },
  });
}

async function logAuditEntry(
  tx: TransactionClient,
  configId: number,
  actorShop: string,
  action: AuditAction,
  snapshot: MessagingConfigInput,
) {
  await tx.configAuditLog.create({
    data: {
      configId,
      actorShop,
      action,
      diff: JSON.stringify(snapshot),
    },
  });

  await pruneAuditHistory(tx, configId);
}

async function pruneAuditHistory(tx: TransactionClient, configId: number) {
  const overflow = await tx.configAuditLog.findMany({
    where: { configId },
    orderBy: { createdAt: "desc" },
    skip: AUDIT_HISTORY_LIMIT,
    select: { id: true },
  });

  if (overflow.length === 0) {
    return;
  }

  await tx.configAuditLog.deleteMany({
    where: { id: { in: overflow.map((entry) => entry.id) } },
  });
}

function parseLocalizedJson(serialized: string | null): Record<string, string> {
  if (!serialized) {
    return {};
  }

  try {
    const parsed = JSON.parse(serialized);
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed as Record<string, unknown>).reduce<
        Record<string, string>
      >((acc, [key, value]) => {
        if (typeof value === "string") {
          acc[key] = value;
        }
        return acc;
      }, {});
    }
  } catch (error) {
    console.warn("Failed to parse localized JSON", error);
  }

  return {};
}

function pickDefaultLocaleCopy(record: Record<string, string>) {
  return record.en ?? Object.values(record)[0] ?? "";
}
