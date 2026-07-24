import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NewExpression from "@/pages/NewExpression";
import ExpressionSubmissions from "@/pages/ExpressionSubmissions";
import Suppliers from "@/pages/Suppliers";
import NewSupplier from "@/pages/NewSupplier";
import SupplierDetail from "@/pages/SupplierDetail";
import PurchaseOrders from "@/pages/PurchaseOrders";
import NewPurchaseOrder from "@/pages/NewPurchaseOrder";
import PurchaseOrderDetail from "@/pages/PurchaseOrderDetail";
import RFQs from "@/pages/RFQs";
import NewRFQ from "@/pages/NewRFQ";
import RFQDetail from "@/pages/RFQDetail";
import SupplierInvoices from "@/pages/SupplierInvoices";
import NewSupplierInvoice from "@/pages/NewSupplierInvoice";
import SupplierInvoiceDetail from "@/pages/SupplierInvoiceDetail";
import JobCosting from "@/pages/JobCosting";
import Budgets from "@/pages/Budgets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route path="/" element={<Index />} />
            <Route path="/expressions" element={<ExpressionSubmissions />} />
            <Route path="/expressions/new" element={<NewExpression />} />
            <Route path="/requests" element={<ExpressionSubmissions />} />
            <Route path="/orders" element={<PurchaseOrders />} />
            <Route path="/reports" element={<ExpressionSubmissions />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/new" element={<NewSupplier />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="/procurement/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/procurement/purchase-orders/new" element={<NewPurchaseOrder />} />
            <Route path="/procurement/purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="/procurement/rfqs" element={<RFQs />} />
            <Route path="/procurement/rfqs/new" element={<NewRFQ />} />
            <Route path="/procurement/rfqs/:id" element={<RFQDetail />} />
            <Route path="/finance/supplier-invoices" element={<SupplierInvoices />} />
            <Route path="/finance/supplier-invoices/new" element={<NewSupplierInvoice />} />
            <Route path="/finance/supplier-invoices/:id" element={<SupplierInvoiceDetail />} />
            <Route path="/finance/job-costing" element={<JobCosting />} />
            <Route path="/finance/budgets" element={<Budgets />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;