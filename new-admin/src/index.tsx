import { TanstackQuery } from "#src/components";
import { setupI18n } from "#src/locales";
import { setupLoading } from "#src/plugins";

// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import { ToastContainer } from "./components/toast";
import "./styles/index.css";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

async function setupApp() {
  /**
   * @zh 初始化国际化，必须放在第一位，loading 中引用了国际化
   * @en Initialize internationalization, must be placed first. Loading refer to internationalization
   */
  setupI18n();

  // App Loading
  setupLoading();

  // Register ChartJS components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
  );

  const rootElement = document.getElementById("root");
  if (!rootElement) return;
  const root = createRoot(rootElement);

  if (process.env.NODE_ENV !== "production") {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes("findDOMNode")) return; // Chặn warning findDOMNode
      originalConsoleError(...args); // Hiển thị các warning khác
    };
  }

  root.render(
    // <StrictMode>
    <TanstackQuery>
      <App />
      <ToastContainer />
    </TanstackQuery>
    // </StrictMode>,
  );
}

setupApp();
