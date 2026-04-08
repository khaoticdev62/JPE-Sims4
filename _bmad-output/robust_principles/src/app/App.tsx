import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AutoSaveProvider } from "./components/jpe-auto-save";
import { BrowserCompatibilityCheck } from "./components/BrowserCompatibility";

export default function App() {
  return (
    <BrowserCompatibilityCheck>
      <ErrorBoundary level="app" onError={(error, info) => {
        // Log to external error tracking service in production
        console.error("[App Crash]", error, info);
      }}>
        <AutoSaveProvider autoSaveInterval={30000}>
          <RouterProvider router={router} />
        </AutoSaveProvider>
      </ErrorBoundary>
    </BrowserCompatibilityCheck>
  );
}