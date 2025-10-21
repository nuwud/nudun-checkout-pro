#!/usr/bin/env node
import "dotenv/config";

import prisma from "../app/db.server";
import {
  loadDefaultBonusAttachments,
  replaceBonusAttachments,
} from "../app/services/messaging-bonus.server";

async function main() {
  const shopDomain = process.argv[2];

  if (!shopDomain) {
    console.error(
      "Usage: npm run seed:bonus-attachments -- <shop-domain>",
    );
    process.exit(1);
  }

  const config = await prisma.merchantMessagingConfig.findUnique({
    where: { shopDomain },
    select: { id: true },
  });

  if (!config) {
    console.error(
      `No messaging config found for shop "${shopDomain}". Run the admin once to create it before seeding attachments.`,
    );
    process.exit(1);
  }

  const defaults = loadDefaultBonusAttachments();
  if (defaults.length === 0) {
    console.warn(
      "No default bonus attachment environment variables are set. Nothing to seed.",
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    await replaceBonusAttachments(config.id, defaults, {
      updatedBy: shopDomain,
      tx,
    });
  });

  console.log(
    `Seeded ${defaults.length} bonus attachment(s) for shop ${shopDomain}.`,
  );
}

await main()
  .catch((error) => {
    console.error("Failed to seed bonus attachments", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
