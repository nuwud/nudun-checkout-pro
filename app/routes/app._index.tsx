import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import type { ConfigAuditLog } from "@prisma/client";

import { authenticate } from "../shopify.server";
import {
  getMessagingConfig,
  listAuditEntries,
  type MessagingConfigResponse,
} from "../services/messaging.server";
import type { BonusAttachmentsByRule } from "../services/messaging-bonus.server";
import type { BonusAttachmentInput } from "../utils/messaging-bonus.validation";
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
  bonusAttachments: BonusAttachmentsByRule;
};

const DEFAULT_TONE_OPTIONS = [
  { value: "info", label: "Information" },
  { value: "success", label: "Positive" },
  { value: "highlight", label: "Highlight" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const pageContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const pageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
  flexWrap: "wrap",
};

const pageTitleStyle: CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 600,
  margin: 0,
};

const actionBarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const primaryActionStyle: CSSProperties = {
  padding: "0.6rem 1.4rem",
  borderRadius: "0.75rem",
  border: "1px solid transparent",
  background: "var(--p-color-bg-fill-primary, #008060)",
  color: "var(--p-color-text-on-primary, #ffffff)",
  fontWeight: 600,
  cursor: "pointer",
};

const criticalActionStyle: CSSProperties = {
  ...primaryActionStyle,
  background: "var(--p-color-bg-fill-critical, #bf0711)",
};

const layoutStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const infoBannerStyle: CSSProperties = {
  borderRadius: "16px",
  border: "1px solid var(--p-color-border, #d6d8db)",
  background: "var(--p-color-bg-surface-secondary, #f4f6f8)",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const infoBannerTitleStyle: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 600,
  margin: 0,
};

const errorBannerStyle: CSSProperties = {
  borderRadius: "16px",
  border: "1px solid var(--p-color-border-critical, #de3618)",
  background: "var(--p-color-bg-critical-subdued, #fff4f0)",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const successBannerStyle: CSSProperties = {
  borderRadius: "16px",
  border: "1px solid var(--p-color-border-success, #6f9b64)",
  background: "var(--p-color-bg-success-subdued, #f1f8f0)",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const cardStyle: CSSProperties = {
  background: "var(--p-color-bg-surface, #ffffff)",
  border: "1px solid var(--p-color-border, #dfe3e8)",
  borderRadius: "16px",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const subCardStyle: CSSProperties = {
  border: "1px solid var(--p-color-border, #e3e5e8)",
  borderRadius: "12px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  background: "var(--p-color-bg-surface-secondary, #f9fafb)",
};

const cardHeadingStyle: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 600,
  margin: 0,
};

const subHeadingStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  margin: 0,
};

const helpTextStyle: CSSProperties = {
  margin: 0,
  color: "var(--p-color-text-secondary, #5c5f62)",
  fontSize: "0.95rem",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  fontWeight: 500,
  fontSize: "0.93rem",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 500,
  fontSize: "0.93rem",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem 0.65rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--p-color-border, #dfe3e8)",
  fontSize: "0.95rem",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "3.5rem",
  resize: "vertical",
};

const metaTextStyle: CSSProperties = {
  margin: 0,
  color: "var(--p-color-text-secondary, #5c5f62)",
  fontSize: "0.85rem",
};

const listStyle: CSSProperties = {
  listStyle: "disc",
  paddingLeft: "1.5rem",
  display: "grid",
  gap: "0.5rem",
};

const twoColumnStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const thresholdHeaderRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.75rem",
  alignItems: "center",
};

const buttonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "0.4rem 0.9rem",
  borderRadius: "999px",
  border: "1px solid var(--p-color-border, #dfe3e8)",
  background: "var(--p-color-bg-surface, #ffffff)",
  cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  borderColor: "var(--p-color-border-critical, #de3618)",
  color: "var(--p-color-text-critical, #bf0711)",
};

const auditRowStyle: CSSProperties = {
  display: "grid",
  gap: "0.25rem",
  padding: "0.75rem 0",
  borderBottom: "1px solid var(--p-color-border, #e1e3e6)",
};

const badgeStyle = (isActive: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "0.15rem 0.6rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  backgroundColor: isActive
    ? "var(--p-color-bg-success, #e3f1df)"
    : "var(--p-color-bg-secondary, #f6f6f7)",
  color: isActive
    ? "var(--p-color-text-success, #1a7f37)"
    : "var(--p-color-text-secondary, #5c5f62)",
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [config, audits] = await Promise.all([
    getMessagingConfig(session.shop),
    listAuditEntries(session.shop),
  ]);

  return { config, audits } satisfies LoaderData;
};

export default function MessagingConsole() {
  const { config, audits } = useLoaderData<typeof loader>();
  const saveFetcher = useFetcher();
  const resetFetcher = useFetcher();

  const initialState = useMemo<FormState>(() => mapConfigToForm(config), [
    config,
  ]);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
      setSuccessMessage("Messaging settings saved");
      setFormState(mapConfigToForm(data.config));
      setErrors([]);
    } else if (data.status === "error") {
      const rawErrors = Object.values(data.errors.fieldErrors ?? {}) as string[][];
      const fieldErrors = rawErrors.flat();
      setErrors(fieldErrors.length ? fieldErrors : ["Unable to save settings"]);
      setSuccessMessage(null);
    }
  }, [saveFetcher.data]);

  useEffect(() => {
    const data = resetFetcher.data as
      | { status: "ok"; config: MessagingConfigResponse }
      | undefined;
    if (data?.status === "ok") {
      setSuccessMessage("Settings reset to defaults");
      setFormState(mapConfigToForm(data.config));
      setErrors([]);
    }
  }, [resetFetcher.data]);

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
          id: createClientId(),
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
      setSuccessMessage(null);
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
    <div style={pageContainerStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={pageTitleStyle}>Messaging Console</h1>
          <p style={helpTextStyle}>
            Manage checkout hero copy, thresholds, and upsell configuration.
          </p>
        </div>
        <div style={actionBarStyle}>
          <button
            type="button"
            style={{
              ...primaryActionStyle,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? "default" : "pointer",
            }}
            onClick={submitForm}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save settings"}
          </button>
          <button
            type="button"
            style={{
              ...criticalActionStyle,
              opacity: isResetting ? 0.7 : 1,
              cursor: isResetting ? "default" : "pointer",
            }}
            onClick={resetToDefaults}
            disabled={isResetting}
          >
            {isResetting ? "Resetting…" : "Reset to defaults"}
          </button>
        </div>
      </div>

      <div style={infoBannerStyle}>
        <h2 style={infoBannerTitleStyle}>Live checkout messaging</h2>
        <p style={helpTextStyle}>
          Adjust hero copy, thresholds, and upsell messaging. Changes go live
          once saved and sync to the extension automatically.
        </p>
        <p style={metaTextStyle}>
          Last published: {formatTimestamp(config.lastPublishedAt)}
        </p>
      </div>

      {successMessage && (
        <div style={successBannerStyle}>
          <strong>{successMessage}</strong>
        </div>
      )}

      {errors.length > 0 && (
        <div style={errorBannerStyle}>
          <strong>Unable to save</strong>
          <ul style={listStyle}>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={layoutStyle}>
        <HeroCard formState={formState} onChange={handleHeroChange} />

        <div style={cardStyle}>
          <h2 style={cardHeadingStyle}>Threshold banners</h2>
          <p style={helpTextStyle}>
            Configure spend tiers, copy, and order. Amounts are stored in
            {" "}
            {formState.currencyCode} and synced to checkout in cents.
          </p>
          <div style={{ display: "grid", gap: "1rem" }}>
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
                currencyCode={formState.currencyCode}
              />
            ))}
          </div>
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={addThreshold}
          >
            Add threshold
          </button>
        </div>

        <UpsellCard
          formState={formState}
          onChange={handleUpsellChange}
          onCopyChange={handleUpsellCopyChange}
        />

        <AuditLog audits={audits} />
      </div>
    </div>
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
    <div style={cardStyle}>
      <h2 style={cardHeadingStyle}>Hero message</h2>
      <p style={helpTextStyle}>
        Set the headline and supporting copy displayed above banners.
      </p>
      <label style={labelStyle}>
        Headline
        <input
          style={inputStyle}
          type="text"
          value={formState.hero.headline}
          maxLength={255}
          onChange={(event) => onChange("headline", event.currentTarget.value)}
        />
      </label>
      <label style={labelStyle}>
        Body
        <textarea
          style={textareaStyle}
          value={formState.hero.body}
          maxLength={2000}
          rows={4}
          onChange={(event) => onChange("body", event.currentTarget.value)}
        />
      </label>
      <label style={labelStyle}>
        Default tone
        <select
          style={inputStyle}
          value={formState.hero.tone}
          onChange={(event) => onChange("tone", event.currentTarget.value)}
        >
          {DEFAULT_TONE_OPTIONS.map((tone) => (
            <option key={tone.value} value={tone.value}>
              {tone.label}
            </option>
          ))}
        </select>
      </label>
    </div>
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
  currencyCode,
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
  currencyCode: string;
}) {
  return (
    <div style={subCardStyle}>
      <div style={thresholdHeaderRowStyle}>
        <div>
          <h3 style={subHeadingStyle}>{threshold.labelKey || "New tier"}</h3>
          <span style={badgeStyle(threshold.isActive)}>
            {threshold.isActive ? "Active" : "Paused"}
          </span>
        </div>
        <div style={buttonGroupStyle}>
          <button
            type="button"
            style={secondaryButtonStyle}
            disabled={isFirst}
            onClick={() => onReorder(index, "up")}
          >
            Move up
          </button>
          <button
            type="button"
            style={secondaryButtonStyle}
            disabled={isLast}
            onClick={() => onReorder(index, "down")}
          >
            Move down
          </button>
          <button
            type="button"
            style={dangerButtonStyle}
            onClick={() => onDelete(index)}
          >
            Remove
          </button>
        </div>
      </div>

      <label style={labelStyle}>
        Reference key
        <input
          style={inputStyle}
          type="text"
          value={threshold.labelKey}
          maxLength={64}
          onChange={(event) =>
            onChange(index, { labelKey: event.currentTarget.value })
          }
        />
      </label>

      <div style={twoColumnStyle}>
        <label style={labelStyle}>
          Amount ({currencyCode})
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="0.01"
            value={threshold.amount}
            onChange={(event) =>
              onChange(index, { amount: event.currentTarget.value })
            }
          />
        </label>
        <label style={labelStyle}>
          Tone
          <select
            style={inputStyle}
            value={threshold.tone}
            onChange={(event) =>
              onChange(index, { tone: event.currentTarget.value })
            }
          >
            {DEFAULT_TONE_OPTIONS.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={threshold.isActive}
            onChange={(event) =>
              onChange(index, { isActive: event.currentTarget.checked })
            }
          />
          Active
        </label>
      </div>

      <div style={twoColumnStyle}>
        <label style={labelStyle}>
          Message (EN)
          <textarea
            style={textareaStyle}
            value={threshold.message.en ?? ""}
            rows={3}
            onChange={(event) =>
              onMessageChange(index, "en", event.currentTarget.value)
            }
          />
        </label>
        <label style={labelStyle}>
          Message (FR)
          <textarea
            style={textareaStyle}
            value={threshold.message.fr ?? ""}
            rows={3}
            onChange={(event) =>
              onMessageChange(index, "fr", event.currentTarget.value)
            }
          />
        </label>
      </div>

      <p style={metaTextStyle}>
        Priority {threshold.priority + 1} · Higher rows render first in
        checkout
      </p>
    </div>
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
    <div style={cardStyle}>
      <h2 style={cardHeadingStyle}>Strategic upsells</h2>
      <p style={helpTextStyle}>
        Enable and customize upgrade messaging. Copy supports multiple locales
        and feeds directly into the checkout extension.
      </p>
      <label style={checkboxLabelStyle}>
        <input
          type="checkbox"
          checked={formState.upsell.isEnabled}
          onChange={(event) =>
            onChange("isEnabled", event.currentTarget.checked)
          }
        />
        Upsell banners enabled
      </label>

      <div style={twoColumnStyle}>
        <label style={labelStyle}>
          Title (EN)
          <input
            style={inputStyle}
            type="text"
            value={formState.upsell.title.en ?? ""}
            onChange={(event) =>
              onCopyChange("title", "en", event.currentTarget.value)
            }
          />
        </label>
        <label style={labelStyle}>
          Title (FR)
          <input
            style={inputStyle}
            type="text"
            value={formState.upsell.title.fr ?? ""}
            onChange={(event) =>
              onCopyChange("title", "fr", event.currentTarget.value)
            }
          />
        </label>
      </div>
      <div style={twoColumnStyle}>
        <label style={labelStyle}>
          Body (EN)
          <textarea
            style={textareaStyle}
            value={formState.upsell.body.en ?? ""}
            rows={3}
            onChange={(event) =>
              onCopyChange("body", "en", event.currentTarget.value)
            }
          />
        </label>
        <label style={labelStyle}>
          Body (FR)
          <textarea
            style={textareaStyle}
            value={formState.upsell.body.fr ?? ""}
            rows={3}
            onChange={(event) =>
              onCopyChange("body", "fr", event.currentTarget.value)
            }
          />
        </label>
      </div>

      <div style={twoColumnStyle}>
        <label style={labelStyle}>
          Target product handle
          <input
            style={inputStyle}
            type="text"
            value={formState.upsell.targetProduct}
            onChange={(event) =>
              onChange("targetProduct", event.currentTarget.value)
            }
            placeholder="e.g. annual-plan"
          />
        </label>
        <label style={labelStyle}>
          Discount code
          <input
            style={inputStyle}
            type="text"
            maxLength={32}
            value={formState.upsell.discountCode}
            onChange={(event) =>
              onChange("discountCode", event.currentTarget.value)
            }
            placeholder="Optional"
          />
        </label>
      </div>
    </div>
  );
}

function AuditLog({ audits }: { audits: ConfigAuditLog[] }) {
  return (
    <div style={cardStyle}>
      <h2 style={cardHeadingStyle}>Recent activity</h2>
      {audits.length === 0 ? (
        <p style={metaTextStyle}>No audit entries recorded yet.</p>
      ) : (
        <ul style={{ ...listStyle, marginTop: "0.75rem" }}>
          {audits.map((audit) => (
            <li key={audit.id} style={auditRowStyle}>
              <div>
                <strong>{audit.action}</strong> ·{" "}
                {new Date(audit.createdAt).toLocaleString()} · {audit.actorShop}
              </div>
              <div style={metaTextStyle}>
                Snapshot: {truncateDiff(audit.diff)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
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
    bonusAttachments: { ...config.bonusAttachments },
  };
}

function mapFormToPayload(state: FormState): MessagingConfigInput {
  const attachments = mapFormAttachmentsToPayload(state.bonusAttachments);

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
    bonusAttachments: attachments,
  };
}

function mapFormAttachmentsToPayload(
  attachmentsByRule: BonusAttachmentsByRule,
): BonusAttachmentInput[] {
  return Object.values(attachmentsByRule ?? {})
    .filter((attachment): attachment is NonNullable<typeof attachment> => Boolean(attachment))
    .map((attachment) => ({
      id: attachment.id,
      ruleKey: attachment.ruleKey,
      productId: attachment.productId,
      variantId: attachment.variantId ?? undefined,
      quantity: attachment.quantity,
      valueSource: attachment.valueSource,
      customValueCents: attachment.customValueCents ?? undefined,
      locales: attachment.locales,
      imageUrl: attachment.imageUrl ?? undefined,
    }));
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

  if (payload.bonusAttachments && payload.bonusAttachments.length > 4) {
    errors.push("Maximum of four bonus attachments supported in current release");
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

function createClientId(): string {
  const globalCrypto =
    typeof globalThis !== "undefined" && "crypto" in globalThis
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;

  if (globalCrypto && typeof globalCrypto.randomUUID === "function") {
    return globalCrypto.randomUUID();
  }

  return `threshold-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
