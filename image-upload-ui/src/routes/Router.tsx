import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import BulkUploadImages from "../pages/BulkUploadImages";
import UploadSingleCompanyImage from "../pages/UploadSingleCompanyImage";
import BulkUploadCompanies from "../pages/BulkUploadCompanies";

const router = createBrowserRouter([
  {
    path: "/",
    index: true,
    element: <Home />,
  },
  {
    path: "/bulk-insert-images",
    element: <BulkUploadImages />,
  },
  {
    path: "/upload-single-image",
    element: <UploadSingleCompanyImage />,
  },
  {
    path: "/bulk-insert-companies",
    element: <BulkUploadCompanies />,
  },
]);

export default router;
