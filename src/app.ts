// React core
import { createElement, Fragment } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Router
import router from "@/router";

// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/css/tailwind.scss";
// Your stylesheet
import "@/css/app.scss";

import { Toaster } from "react-hot-toast";

// Expose app configuration
import appConfig from "../app-config.json";

// vConsole for mobile debugging (show console on device)
if (process.env.NODE_ENV !== "production" || appConfig.template?.enableVConsole) {
  import("vconsole").then((VConsole) => {
    new VConsole.default();
  });
}

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig;
}

import { App } from "zmp-ui";

// Mount the app
const root = createRoot(document.getElementById("app")!);
root.render(
  createElement(
    App,
    null,
    createElement(
      Fragment,
      null,
      createElement(RouterProvider, { router }),
      createElement(Toaster, {
        position: "bottom-center",
        toastOptions: {
          className: "mb-20", // Tránh đè lên Bottom Navigation nếu có
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            fontSize: "14px",
          },
        },
      })
    )
  )
);
