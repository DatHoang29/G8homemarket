import { createBrowserRouter } from "react-router-dom";
import AuthPage from "@/pages/auth";
import { getBasePath } from "@/utils/zma";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AuthPage />,
    },
  ],
  { basename: getBasePath() }
);

export default router;
