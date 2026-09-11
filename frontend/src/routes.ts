import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import { equipmentLoader } from "./api/equipment";
import { cleaningRecordsLoader } from "./api/cleaning-record";
import { RouteErrorPage } from "./components/RouteErrorPage";
import EquipmentListPage from './pages/EquipmentListPage'
import EquipmentCleaningRecordsPage from "./pages/EquipmentCleaningRecordsPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: EquipmentListPage,
    loader: equipmentLoader,
    errorElement: createElement(RouteErrorPage),
  },
  {
    path: "/equipment/:equipmentId",
    Component: EquipmentCleaningRecordsPage,
    loader: cleaningRecordsLoader,
    errorElement: createElement(RouteErrorPage),
  },
]);

export default router
