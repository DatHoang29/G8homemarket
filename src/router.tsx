import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/index";
import { getBasePath } from "@/utils/zma";
import Layout from "@/components/layout";

const router = createBrowserRouter(
  [
    {
      // element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          handle: {
            title: "G8 Home Market",
            logo: true,
            search: true,
          },
        },
      ],
    },
  ],
  { basename: getBasePath() }
);

export default router;
