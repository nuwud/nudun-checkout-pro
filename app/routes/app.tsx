import type { CSSProperties } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <div style={appNavStyle}>
        <s-link href="/app" style={navLinkStyle}>
          🏠 Home
        </s-link>
        <s-link href="/app/additional" style={navLinkStyle}>
          📊 Analytics
        </s-link>
      </div>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

const appNavStyle: CSSProperties = {
  display: "flex",
  gap: "2rem",
  padding: "1rem 1.5rem",
  borderBottom: "1px solid var(--p-color-border-subdued, #e5e7eb)",
  background: "var(--p-color-bg-surface, #ffffff)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
};

const navLinkStyle: CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: "500",
  letterSpacing: "-0.01em",
  color: "var(--p-color-text, #202223)",
  transition: "color 0.2s ease, background-color 0.2s ease",
  textDecoration: "none",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  display: "inline-block",
  cursor: "pointer",
};
