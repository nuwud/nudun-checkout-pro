import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import { authenticate } from "../shopify.server";
import {
  getMessagingConfig,
  resetMessagingConfig,
  upsertMessagingConfig,
} from "../services/messaging.server";
import { validateMessagingConfig } from "../utils/validation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const snapshot = await getMessagingConfig(session.shop);
  return Response.json(snapshot, { status: 200 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const method = request.method.toUpperCase();
  const { session } = await authenticate.admin(request);

  switch (method) {
    case "PUT": {
      const payload = await request.json().catch(() => null);
      const parsed = validateMessagingConfig(payload);
      if (!parsed.success) {
        return Response.json(
          {
            status: "error",
            errors: parsed.error.flatten(),
          },
          { status: 400 },
        );
      }

      const snapshot = await upsertMessagingConfig(session.shop, parsed.data);
      return Response.json(
        {
          status: "ok",
          lastPublishedAt: snapshot.lastPublishedAt,
          config: snapshot,
        },
        { status: 200 },
      );
    }
    case "POST": {
      // Placeholder for reset endpoint (POST /reset)
      const { intent } = await request.json().catch(() => ({ intent: "" }));
      if (intent === "reset") {
        const snapshot = await resetMessagingConfig(session.shop);
        return Response.json(
          { status: "ok", config: snapshot },
          { status: 200 },
        );
      }
      return Response.json({ error: "Unsupported intent" }, { status: 400 });
    }
    default:
      return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
};
