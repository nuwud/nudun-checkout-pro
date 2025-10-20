import { useEffect, useMemo, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { json, useLoaderData } from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";

import type { ConfigAuditLog } from "@prisma/client";

import { authenticate } from "../shopify.server";
import {
  getMessagingConfig,
  listAuditEntries,
  type MessagingConfigResponse,
} from "../services/messaging.server";
import type { MessagingConfigInput } from "../utils/validation";

type LoaderData = {
  config: MessagingConfigResponse;
  audits: ConfigAuditLog[];
};

type LocalizedCopy = Record<string, string>;

type ThresholdFormState = {
  id: string;
  labelKey: string;
  amount: string;
  tone: string;
  priority: number;
  isActive: boolean;
  message: LocalizedCopy;
};

type FormState = {
  hero: {
    headline: string;
    body: string;
    tone: string;
  };
  currencyCode: string;
  thresholds: ThresholdFormState[];
  upsell: {
    isEnabled: boolean;
    title: LocalizedCopy;
    body: LocalizedCopy;
    targetProduct: string;
    discountCode: string;
  };
};

const DEFAULT_TONE_OPTIONS = [
  { value: "info", label: "Information" },
  { value: "success", label: "Positive" },
  { value: "highlight", label: "Highlight" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [config, audits] = await Promise.all([
    getMessagingConfig(session.shop),
    listAuditEntries(session.shop),
  ]);

  return json<LoaderData>({ config, audits });
};

export default function MessagingConsole() {
  const { config, audits } = useLoaderData<typeof loader>();
  const toast = useAppBridge();
  const saveFetcher = useFetcher();
  const resetFetcher = useFetcher();

  const initialState = useMemo<FormState>(() => mapConfigToForm(config), [
    config,
  ]);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const isSaving = saveFetcher.state === "submitting";
  const isResetting = resetFetcher.state === "submitting";

  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  useEffect(() => {
    const data = saveFetcher.data as
      | { status: "ok"; config: MessagingConfigResponse }
      | { status: "error"; errors: { fieldErrors: Record<string, string[]> } }
      | undefined;

    if (!data) {
      return;
    }

    if (data.status === "ok") {
      toast.toast.show("Messaging settings saved");
      setFormState(mapConfigToForm(data.config));
      setErrors([]);
    } else if (data.status === "error") {
      const fieldErrors = Object.values(data.errors.fieldErrors ?? {}).flat();
      setErrors(fieldErrors.length ? fieldErrors : ["Unable to save settings"]);
    }
  }, [saveFetcher.data, toast.toast]);

  useEffect(() => {
    const data = resetFetcher.data as
      | { status: "ok"; config: MessagingConfigResponse }
      | undefined;
    if (data?.status === "ok") {
      toast.toast.show("Settings reset to defaults");
      setFormState(mapConfigToForm(data.config));
      setErrors([]);
    }
  }, [resetFetcher.data, toast.toast]);

  const handleHeroChange = (field: keyof FormState["hero"], value: string) => {
    setFormState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  const updateThreshold = (
    index: number,
    update: Partial<Omit<ThresholdFormState, "priority">> & {
      priority?: number;
    },
  ) => {
    setFormState((prev) => {
      const next = [...prev.thresholds];
      next[index] = {
        ...next[index],
        ...update,
      };
      return { ...prev, thresholds: next };
    });
  };

  const handleThresholdMessageChange = (
    index: number,
    locale: string,
    value: string,
  ) => {
    updateThreshold(index, {
      message: {
        ...formState.thresholds[index]?.message,
        [locale]: value,
      },
    });
  };

  const handleThresholdReorder = (index: number, direction: "up" | "down") => {
    setFormState((prev) => {
      const next = [...prev.thresholds];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }
      const [current] = next.splice(index, 1);
      next.splice(targetIndex, 0, current);
      return {
        ...prev,
        thresholds: next.map((threshold, position) => ({
          ...threshold,
          priority: position,
        })),
      };
    });
  };

  const addThreshold = () => {
    setFormState((prev) => ({
      ...prev,
      thresholds: [
        ...prev.thresholds,
        {
          id: crypto.randomUUID(),
          labelKey: "new_threshold",
          amount: "0.00",
          tone: "info",
          priority: prev.thresholds.length,
          isActive: true,
          message: { en: "", fr: "" },
        },
      ],
    }));
  };

  const removeThreshold = (index: number) => {
    setFormState((prev) => {
      const next = prev.thresholds.filter((_, idx) => idx !== index);
      return {
        ...prev,
        thresholds: next.map((threshold, position) => ({
          ...threshold,
          priority: position,
        })),
      };
    });
  };

  const handleUpsellChange = (
    field: keyof FormState["upsell"],
    value: string | boolean,
  ) => {
    setFormState((prev) => ({
      ...prev,
      upsell: {
        ...prev.upsell,
        [field]: value,
      },
    }));
  };

  const handleUpsellCopyChange = (
    field: "title" | "body",
    locale: string,
    value: string,
  ) => {
    setFormState((prev) => ({
      ...prev,
      upsell: {
        ...prev.upsell,
        [field]: {
          ...prev.upsell[field],
          [locale]: value,
        },
      },
    }));
  };

  const submitForm = () => {
    const payload = mapFormToPayload(formState);
    const validationErrors = validateFormPayload(payload);

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    saveFetcher.submit(JSON.stringify(payload), {
      method: "PUT",
      encType: "application/json",
      action: "/api/messaging-settings",
    });
  };

  const resetToDefaults = () => {
    resetFetcher.submit(JSON.stringify({ intent: "reset" }), {
      method: "POST",
      encType: "application/json",
      action: "/api/messaging-settings",
    });
  };

  return (
    <s-page heading="Messaging Console">
      <s-button
        slot="primary-action"
        tone="primary"
        onClick={submitForm}
        loading={isSaving}
      >
        Save settings
      </s-button>
      <s-button
        slot="secondary-actions"
        tone="critical"
        onClick={resetToDefaults}
        loading={isResetting}
      >
        Reset to defaults
      </s-button>

      <s-stack direction="block" gap="loose">
        <s-banner tone="info">
          <s-heading>Live checkout messaging</s-heading>
          <s-text>
            Adjust hero copy, thresholds, and upsell messaging. Changes go live
            once saved and sync to the extension automatically.
          </s-text>
          <s-text>
            Last published: {formatTimestamp(config.lastPublishedAt)}
          </s-text>
        </s-banner>

        {errors.length > 0 && (
          <s-banner tone="critical">
            <s-heading>Unable to save</s-heading>
            <s-unordered-list>
              {errors.map((error) => (
                <s-list-item key={error}>{error}</s-list-item>
              ))}
            </s-unordered-list>
          </s-banner>
        )}

        <HeroCard formState={formState} onChange={handleHeroChange} />

        <s-card>
          <s-stack direction="block" gap="base">
            <s-heading>Threshold banners</s-heading>
            <s-text>
              Configure spend tiers, copy, and order. Amounts are stored in
              {" "}
              {formState.currencyCode} and synced to checkout in cents.
            </s-text>
            {formState.thresholds.map((threshold, index) => (
              <ThresholdEditor
                key={threshold.id}
                threshold={threshold}
                index={index}
                isFirst={index === 0}
                isLast={index === formState.thresholds.length - 1}
                onChange={updateThreshold}
                onMessageChange={handleThresholdMessageChange}
                onDelete={removeThreshold}
                onReorder={handleThresholdReorder}
              />
            ))}
            <s-button tone="secondary" onClick={addThreshold}>
              Add threshold
            </s-button>
          </s-card>
        </s-stack>

        <UpsellCard
          formState={formState}
          onChange={handleUpsellChange}
          onCopyChange={handleUpsellCopyChange}
        />

        <AuditLog audits={audits} />
      </s-stack>
    </s-page>
  );
}

function HeroCard({
  formState,
  onChange,
}: {
  formState: FormState;
  onChange: (field: keyof FormState["hero"], value: string) => void;
}) {
  return (
    <s-card>
      <s-heading>Hero message</s-heading>
      <s-stack direction="block" gap="base">
        <s-text>Set the headline and supporting copy displayed above banners.</s-text>
        <s-text-field
          label="Headline"
          value={formState.hero.headline}
          onInput={(event: Event) =>
            onChange("headline", (event.target as HTMLInputElement).value)
          }
          maxLength={255}
          required
        />
        <s-text-field
          label="Body"
          value={formState.hero.body}
          multiline
          maxLength={2000}
          onInput={(event: Event) =>
            onChange("body", (event.target as HTMLInputElement).value)
          }
          required
        />
        <s-select
          label="Default tone"
          value={formState.hero.tone}
          onInput={(event: Event) =>
            onChange("tone", (event.target as HTMLSelectElement).value)
          }
        >
          {DEFAULT_TONE_OPTIONS.map((tone) => (
            <option key={tone.value} value={tone.value}>
              {tone.label}
            </option>
          ))}
        </s-select>
      </s-stack>
    </s-card>
  );
}

function ThresholdEditor({
  threshold,
  index,
  isFirst,
  isLast,
  onChange,
  onMessageChange,
  onDelete,
  onReorder,
}: {
  threshold: ThresholdFormState;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (
    index: number,
    update: Partial<Omit<ThresholdFormState, "priority">> & {
      priority?: number;
    },
  ) => void;
  onMessageChange: (index: number, locale: string, value: string) => void;
  onDelete: (index: number) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
}) {
  return (
    <s-card subdued>
      <s-stack direction="block" gap="tight">
        <s-stack direction="inline" gap="tight" alignment="center">
          <s-heading>{threshold.labelKey}</s-heading>
          <s-badge tone={threshold.isActive ? "success" : "subdued"}>
            {threshold.isActive ? "Active" : "Paused"}
          </s-badge>
          <s-spacer />
          <s-button
            tone="secondary"
            variant="tertiary"
            disabled={isFirst}
            onClick={() => onReorder(index, "up")}
          >
            Move up
          </s-button>
          <s-button
            tone="secondary"
            variant="tertiary"
            disabled={isLast}
            onClick={() => onReorder(index, "down")}
          >
            Move down
          </s-button>
          <s-button
            tone="critical"
            variant="tertiary"
            onClick={() => onDelete(index)}
          >
            Remove
          </s-button>
        </s-stack>

        <s-text-field
          label="Reference key"
          value={threshold.labelKey}
          maxLength={64}
          onInput={(event: Event) =>
            onChange(index, {
              labelKey: (event.target as HTMLInputElement).value,
            })
          }
        />

        <s-stack direction="inline" gap="base">
          <s-text-field
            label="Amount"
            prefix="$"
            inputMode="decimal"
            value={threshold.amount}
            onInput={(event: Event) =>
              onChange(index, {
                amount: (event.target as HTMLInputElement).value,
              })
            }
          />
          <s-select
            label="Tone"
            value={threshold.tone}
            onInput={(event: Event) =>
              onChange(index, {
                tone: (event.target as HTMLSelectElement).value,
              })
            }
          >
            {DEFAULT_TONE_OPTIONS.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </s-select>
          <s-checkbox
            checked={threshold.isActive}
            onChange={(event: Event) =>
              onChange(index, {
                isActive: (event.target as HTMLInputElement).checked,
              })
            }
          >
            Active
          </s-checkbox>
        </s-stack>

        <s-stack direction="inline" gap="base">
          <s-text-field
            label="Message (EN)"
            value={threshold.message.en ?? ""}
            onInput={(event: Event) =>
              onMessageChange(index, "en", (event.target as HTMLInputElement).value)
            }
          />
          <s-text-field
            label="Message (FR)"
            value={threshold.message.fr ?? ""}
            onInput={(event: Event) =>
              onMessageChange(index, "fr", (event.target as HTMLInputElement).value)
            }
          />
        </s-stack>

        <s-text tone="subdued">
          Priority: {threshold.priority + 1} of {" "}
          {threshold.isActive ? "active tiers" : "all tiers"}
        </s-text>
      </s-stack>
    </s-card>
  );
}

function UpsellCard({
  formState,
  onChange,
  onCopyChange,
}: {
  formState: FormState;
  onChange: (
    field: keyof FormState["upsell"],
    value: string | boolean,
  ) => void;
  onCopyChange: (
    field: "title" | "body",
    locale: string,
    value: string,
  ) => void;
}) {
  return (
    <s-card>
      <s-heading>Strategic upsells</s-heading>
      <s-stack direction="block" gap="base">
        <s-text>
          Enable and customize upgrade messaging. Copy supports multiple locales
          and feeds directly into the checkout extension.
        </s-text>
        <s-checkbox
          checked={formState.upsell.isEnabled}
          onChange={(event: Event) =>
            onChange(
              "isEnabled",
              (event.target as HTMLInputElement).checked,
            )
          }
        >
          Upsell banners enabled
        </s-checkbox>

        <s-stack direction="inline" gap="base">
          <s-text-field
            label="Title (EN)"
            value={formState.upsell.title.en ?? ""}
            onInput={(event: Event) =>
              onCopyChange("title", "en", (event.target as HTMLInputElement).value)
            }
          />
          <s-text-field
            label="Title (FR)"
            value={formState.upsell.title.fr ?? ""}
            onInput={(event: Event) =>
              onCopyChange("title", "fr", (event.target as HTMLInputElement).value)
            }
          />
        </s-stack>
        <s-stack direction="inline" gap="base">
          <s-text-field
            label="Body (EN)"
            multiline
            value={formState.upsell.body.en ?? ""}
            onInput={(event: Event) =>
              onCopyChange("body", "en", (event.target as HTMLInputElement).value)
            }
          />
          <s-text-field
            label="Body (FR)"
            multiline
            value={formState.upsell.body.fr ?? ""}
            onInput={(event: Event) =>
              onCopyChange("body", "fr", (event.target as HTMLInputElement).value)
            }
          />
        </s-stack>

        <s-stack direction="inline" gap="base">
          <s-text-field
            label="Target product handle"
            value={formState.upsell.targetProduct}
            onInput={(event: Event) =>
              onChange(
                "targetProduct",
                (event.target as HTMLInputElement).value,
              )
            }
            placeholder="e.g. annual-plan"
          />
          <s-text-field
            label="Discount code"
            value={formState.upsell.discountCode}
            onInput={(event: Event) =>
              onChange(
                "discountCode",
                (event.target as HTMLInputElement).value,
              )
            }
            maxLength={32}
          />
        </s-stack>
      </s-stack>
    </s-card>
  );
}

function AuditLog({ audits }: { audits: ConfigAuditLog[] }) {
  return (
    <s-card>
      <s-heading>Recent activity</s-heading>
      {audits.length === 0 ? (
        <s-text tone="subdued">No audit entries recorded yet.</s-text>
      ) : (
        <s-stack direction="block" gap="tight">
          {audits.map((audit) => (
            <s-card key={audit.id} subdued>
              <s-stack direction="block" gap="tight">
                <s-stack direction="inline" gap="base" alignment="center">
                  <s-badge tone={audit.action === "RESET" ? "warning" : "info"}>
                    {audit.action}
                  </s-badge>
                  <s-text>
                    {new Date(audit.createdAt).toLocaleString()} — {audit.actorShop}
                  </s-text>
                </s-stack>
                <s-text tone="subdued">
                  Snapshot: {truncateDiff(audit.diff)}
                </s-text>
              </s-stack>
            </s-card>
          ))}
        </s-stack>
      )}
    </s-card>
  );
}

function mapConfigToForm(config: MessagingConfigResponse): FormState {
  return {
    hero: {
      headline: config.hero.headline,
      body: config.hero.body,
      tone: config.hero.tone,
    },
    currencyCode: config.currencyCode,
    thresholds: config.thresholds.map((threshold, index) => ({
      id: `${threshold.labelKey}-${index}`,
      labelKey: threshold.labelKey,
      amount: formatAmount(threshold.amountCents),
      tone: threshold.tone,
      priority: threshold.priority,
      isActive: threshold.isActive,
      message: { ...threshold.message },
    })),
    upsell: {
      isEnabled: config.upsell.isEnabled,
      title: { ...config.upsell.title },
      body: { ...config.upsell.body },
      targetProduct: config.upsell.targetProduct ?? "",
      discountCode: config.upsell.discountCode ?? "",
    },
  };
}

function mapFormToPayload(state: FormState): MessagingConfigInput {
  return {
    hero: {
      headline: state.hero.headline.trim(),
      body: state.hero.body.trim(),
      tone: state.hero.tone.trim(),
    },
    currencyCode: state.currencyCode,
    thresholds: state.thresholds.map((threshold, index) => ({
      labelKey: threshold.labelKey.trim(),
      amountCents: parseAmount(threshold.amount),
      tone: threshold.tone.trim(),
      priority: index,
      isActive: threshold.isActive,
      message: sanitizeLocalizedCopy(threshold.message),
    })),
    upsell: {
      isEnabled: state.upsell.isEnabled,
      title: sanitizeLocalizedCopy(state.upsell.title),
      body: sanitizeLocalizedCopy(state.upsell.body),
      targetProduct: state.upsell.targetProduct.trim() || null,
      discountCode: state.upsell.discountCode.trim() || null,
    },
  };
}

function sanitizeLocalizedCopy(copy: LocalizedCopy): LocalizedCopy {
  return Object.entries(copy).reduce<LocalizedCopy>((acc, [locale, value]) => {
    const trimmed = value.trim();
    if (trimmed) {
      acc[locale] = trimmed;
    }
    return acc;
  }, {});
}

function parseAmount(value: string): number {
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric) || numeric < 0) {
    return 0;
  }
  return Math.round(numeric * 100);
}

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function validateFormPayload(payload: MessagingConfigInput): string[] {
  const errors: string[] = [];

  if (!payload.hero.headline) {
    errors.push("Headline is required");
  }
  if (!payload.hero.body) {
    errors.push("Hero body is required");
  }

  payload.thresholds.forEach((threshold, index) => {
    if (!threshold.labelKey) {
      errors.push(`Threshold ${index + 1}: label key is required`);
    }
    if (threshold.amountCents <= 0) {
      errors.push(`Threshold ${index + 1}: amount must be greater than 0`);
    }
    if (Object.keys(threshold.message).length === 0) {
      errors.push(`Threshold ${index + 1}: at least one message is required`);
    }
  });

  if (payload.upsell.isEnabled) {
    if (Object.keys(payload.upsell.title).length === 0) {
      errors.push("Upsell title is required when enabled");
    }
    if (Object.keys(payload.upsell.body).length === 0) {
      errors.push("Upsell body is required when enabled");
    }
  }

  return errors;
}

function formatTimestamp(timestamp: Date | string | null | undefined): string {
  if (!timestamp) {
    return "Not published yet";
  }

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function truncateDiff(diff: string | null): string {
  if (!diff) {
    return "No diff recorded";
  }
  return diff.length > 140 ? `${diff.slice(0, 140)}…` : diff;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
