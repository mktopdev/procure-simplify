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
            <Route path="/orders" element={<ExpressionSubmissions />} />
            <Route path="/reports" element={<ExpressionSubmissions />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;