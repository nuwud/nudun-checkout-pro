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
