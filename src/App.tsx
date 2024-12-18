import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <Index />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/expressions"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <ExpressionSubmissions />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/expressions/new"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <NewExpression />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/requests"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <ExpressionSubmissions />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <ExpressionSubmissions />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/reports"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <ExpressionSubmissions />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;