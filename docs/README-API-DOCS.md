import type { CSSProperties } from "react";

export default function AnalyticsDashboard() {
  // Mock data for demonstration (will be replaced with real API data in Phase 4)
  const mockData = {
    totalMessagesShown: 2_847,
    conversionRate: "3.2%",
    averageOrderValue: "$156.32",
    uniqueCustomers: 456,
    commonSubscriptions: [
      { type: "Annual", count: 1_203, percentage: 42 },
      { type: "Quarterly", count: 845, percentage: 30 },
      { type: "Monthly", count: 799, percentage: 28 },
    ],
    recentActivity: [
      { timestamp: "2 hours ago", action: "Page viewed by 34 customers", type: "view" },
      { timestamp: "4 hours ago", action: "Glassware added to 12 carts", type: "add" },
      { timestamp: "6 hours ago", action: "Message shown 89 times", type: "message" },
      { timestamp: "1 day ago", action: "Configuration updated", type: "config" },
    ],
    trendData: {
      thisWeek: "$892",
      lastWeek: "$724",
      change: "+23%",
    },
  };

  return (
    <s-page heading="Analytics Dashboard">
      {/* Key Metrics Section */}
      <s-section heading="Performance Metrics">
        <div style={metricsGridStyle}>
          <MetricCard
            label="Messages Shown"
            value={mockData.totalMessagesShown.toLocaleString()}
            icon="📊"
          />
          <MetricCard
            label="Conversion Rate"
            value={mockData.conversionRate}
            icon="📈"
            highlight="positive"
          />
          <MetricCard
            label="Avg Order Value"
            value={mockData.averageOrderValue}
            icon="💰"
          />
          <MetricCard
            label="Unique Customers"
            value={mockData.uniqueCustomers.toLocaleString()}
            icon="👥"
          />
          <MetricCard
            label="This Week Revenue"
            value={mockData.trendData.thisWeek}
            icon="📉"
            trend={mockData.trendData.change}
          />
        </div>
      </s-section>

      {/* Subscription Intelligence */}
      <s-section heading="Subscription Breakdown">
        <div style={subscriptionGridStyle}>
          {mockData.commonSubscriptions.map((sub) => (
            <div key={sub.type} style={subscriptionCardStyle}>
              <div style={subscriptionHeaderStyle}>
                <s-text style={subscriptionLabelStyle}>{sub.type}</s-text>
                <s-text style={subscriptionCountStyle}>{sub.count}</s-text>
              </div>
              <div style={progressBarContainerStyle}>
                <div
                  style={{
                    ...progressBarStyle,
                    width: `${sub.percentage}%`,
                    backgroundColor: getSubscriptionColor(sub.type),
                  }}
                />
              </div>
              <s-text style={subscriptionPercentStyle}>{sub.percentage}% of total</s-text>
            </div>
          ))}
        </div>
      </s-section>

      {/* Recent Activity */}
      <s-section heading="Recent Activity">
        <div style={activityListStyle}>
          {mockData.recentActivity.map((activity, index) => (
            <div key={index} style={activityItemStyle}>
              <div style={activityLeftStyle}>
                <s-text style={activityLabelStyle}>{activity.action}</s-text>
                <s-text style={activityTimestampStyle}>{activity.timestamp}</s-text>
              </div>
              <s-badge status={getActivityBadgeStatus(activity.type)}>
                {activity.type.toUpperCase()}
              </s-badge>
            </div>
          ))}
        </div>
      </s-section>

      {/* Quick Actions */}
      <s-section heading="Quick Actions">
        <div style={actionsGridStyle}>
          <button style={actionButtonStyle} onClick={() => alert("Sync initiated!")}>
            🔄 Sync Product Data
          </button>
          <button style={actionButtonStyle} onClick={() => alert("Cache cleared!")}>
            🧹 Clear Cache
          </button>
          <button style={actionButtonStyle} onClick={() => alert("Report downloading...")}>
            📥 Download Report
          </button>
          <button style={actionButtonStyle} onClick={() => alert("Settings opening...")}>
            ⚙️ Configure Analytics
          </button>
        </div>
      </s-section>

      {/* Info Banner */}
      <s-banner tone="info">
        <s-heading>Real-time Analytics Coming Soon</s-heading>
        <s-text>
          This dashboard will automatically populate with live data from your checkout extension.
          Once the GlasswareMessage extension is deployed, you&apos;ll see customer interactions,
          conversion metrics, and subscription intelligence in real-time.
        </s-text>
      </s-banner>
    </s-page>
  );
}

// Helper component for metric cards
function MetricCard({
  label,
  value,
  icon,
  highlight,
  trend,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: "positive" | "negative";
  trend?: string;
}) {
  return (
    <div style={metricCardStyle}>
      <div style={metricIconStyle}>{icon}</div>
      <s-text style={metricLabelStyle}>{label}</s-text>
      <s-text style={metricValueStyle}>{value}</s-text>
      {trend && <s-text style={metricTrendStyle(highlight)}>{trend}</s-text>}
    </div>
  );
}

// Styles
const metricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
};

const metricCardStyle: CSSProperties = {
  padding: "1.5rem",
  borderRadius: "8px",
  border: "1px solid var(--p-color-border-subdued, #e5e7eb)",
  backgroundColor: "var(--p-color-bg-surface, #ffffff)",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s ease",
};

const metricIconStyle: CSSProperties = {
  fontSize: "2rem",
  marginBottom: "0.75rem",
};

const metricLabelStyle: CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--p-color-text-subdued, #626e7c)",
  fontWeight: "500",
  letterSpacing: "0.02em",
  marginBottom: "0.5rem",
  display: "block",
};

const metricValueStyle: CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: "700",
  color: "var(--p-color-text, #202223)",
  letterSpacing: "-0.02em",
  display: "block",
};

const metricTrendStyle = (highlight?: "positive" | "negative"): CSSProperties => ({
  fontSize: "0.85rem",
  fontWeight: "600",
  color:
    highlight === "positive"
      ? "var(--p-color-success, #137752)"
      : highlight === "negative"
        ? "var(--p-color-critical, #d92c0d)"
        : "var(--p-color-text-subdued, #626e7c)",
  marginTop: "0.5rem",
  display: "block",
});

const subscriptionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const subscriptionCardStyle: CSSProperties = {
  padding: "1.5rem",
  borderRadius: "8px",
  border: "1px solid var(--p-color-border-subdued, #e5e7eb)",
  backgroundColor: "var(--p-color-bg-fill, #f6f6f7)",
  transition: "all 0.2s ease",
};

const subscriptionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const subscriptionLabelStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "var(--p-color-text, #202223)",
};

const subscriptionCountStyle: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: "700",
  color: "var(--p-color-text, #202223)",
};

const progressBarContainerStyle: CSSProperties = {
  width: "100%",
  height: "8px",
  borderRadius: "4px",
  backgroundColor: "var(--p-color-border-subdued, #e5e7eb)",
  overflow: "hidden",
  marginBottom: "0.75rem",
};

const progressBarStyle: CSSProperties = {
  height: "100%",
  transition: "width 0.3s ease",
  borderRadius: "4px",
};

const subscriptionPercentStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--p-color-text-subdued, #626e7c)",
  fontWeight: "500",
};

const activityListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const activityItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem",
  borderRadius: "6px",
  backgroundColor: "var(--p-color-bg-fill, #f6f6f7)",
  border: "1px solid var(--p-color-border-subdued, #e5e7eb)",
  transition: "all 0.2s ease",
};

const activityLeftStyle: CSSProperties = {
  flex: 1,
};

const activityLabelStyle: CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: "500",
  color: "var(--p-color-text, #202223)",
  display: "block",
  marginBottom: "0.25rem",
};

const activityTimestampStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--p-color-text-subdued, #626e7c)",
};

const actionsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
};

const actionButtonStyle: CSSProperties = {
  padding: "0.75rem 1.5rem",
  borderRadius: "6px",
  border: "1px solid var(--p-color-border-subdued, #e5e7eb)",
  backgroundColor: "var(--p-color-bg-surface, #ffffff)",
  color: "var(--p-color-text, #202223)",
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  fontSize: "0.95rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
};

// Helper function to get subscription color
function getSubscriptionColor(type: string): string {
  const colors: Record<string, string> = {
    Annual: "#137752",
    Quarterly: "#0c5ff7",
    Monthly: "#ff6b00",
  };
  return colors[type] || "#626e7c";
}

// Helper function to get activity badge status
function getActivityBadgeStatus(type: string): "info" | "success" | "warning" | "critical" {
  const statusMap: Record<string, "info" | "success" | "warning" | "critical"> = {
    view: "info",
    add: "success",
    message: "info",
    config: "warning",
  };
  return statusMap[type] || "info";
}
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
