import { createBrowserRouter } from "react-router";
import { JPEStudio } from "./pages/JPEStudio";
import { JpeDesignSystemShowcase } from "./components/jpe-design-system";
import CrystalForgePage from "./pages/CrystalForgePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: JPEStudio,
  },
  {
    path: "/design-system",
    Component: JpeDesignSystemShowcase,
  },
  {
    path: "/crystal-forge",
    Component: CrystalForgePage,
  },
  {
    path: "*",
    Component: JPEStudio,
  },
]);