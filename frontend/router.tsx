import { createBrowserRouter } from "react-router";
import { Layout } from "@/app/Layout";
import { LandingPage } from "@/features/landing/containers/LandingPage";
import { SetupContainer } from "@/features/setup/containers/SetupContainer";
import { TemplatesContainer } from "@/features/templates/containers/TemplatesContainer";
import { PlaygroundContainer } from "@/features/playground/containers/PlaygroundContainer";
import { NotFound } from "@/app/NotFound";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/setup", element: <SetupContainer /> },
      { path: "/templates", element: <TemplatesContainer /> },
      { path: "/playground/:templateId?", element: <PlaygroundContainer /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
