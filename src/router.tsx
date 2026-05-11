import { createBrowserRouter } from "react-router-dom";
import AuthPage from "@/pages/auth";
import HomePage from "@/pages/index";
import { getBasePath } from "@/utils/zma";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/auth",
      element: <AuthPage />,
    },
  ],
  { basename: getBasePath() }
);

export default router;
