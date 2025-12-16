import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import ServicesOverview from "../pages/ServicesOverview";
import SelfStoragePage from "../pages/SelfStorage";
import ShareWarehousePage from "../pages/ShareWarehouse";
import StorageSize from "../pages/StorageSize";
import ProcessPage from "../pages/Process";
import PartnerPage from "../pages/Partner";
import ThreeDTour from "../pages/3DTour";
import Booking from "../pages/Booking";
import { ContactPage, DashboardPage, Layout,  OrdersPage, SettingsPage, UserInfoPage } from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import PaymentHistoryPage from "../pages/Dashboard/PaymentHistoryPage";
import OrderScanPage from "../pages/Dashboard/components/OrderScanPage";
import CustomerContactsPage from "../pages/Dashboard/CustomerContactsPage";
import { TermsPage } from "../pages/TermsPage";
import { WarehouseContractPage } from "../pages/Contract";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/services/types" element={<ServicesOverview />} />
      <Route path="/services/self-storage" element={<SelfStoragePage />} />
      <Route path="/services/shared-storage" element={<ShareWarehousePage />} />
      <Route path="/services/size-guide" element={<StorageSize />} />
      <Route path="/services/process" element={<ProcessPage />} />
      <Route path="/partner" element={<PartnerPage />} />
      <Route path="/3d-tour" element={<ThreeDTour />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/terms" element={<TermsPage  />} />
      <Route path="/contract/warehouse/:orderCode" element={<WarehouseContractPage  />} />
      <Route path="/orders/scan/:orderCode" element={<OrderScanPage />}/>
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Layout /></ProtectedRoute> }>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="userinfo" element={<UserInfoPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="paymentHistorys" element={<PaymentHistoryPage />} />
        <Route path="contacts" element={<CustomerContactsPage />} />
      </Route>
    </Routes>

  );
}
