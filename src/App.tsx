import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import NewExpression from "@/pages/NewExpression";
import ExpressionSubmissions from "@/pages/ExpressionSubmissions";
import EditSubmission from "@/pages/EditSubmission";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/expressions"
          element={
            <RequireAuth>
              <ExpressionSubmissions />
            </RequireAuth>
          }
        />
        <Route
          path="/expressions/new"
          element={
            <RequireAuth>
              <NewExpression />
            </RequireAuth>
          }
        />
        <Route
          path="/expressions/edit/:id"
          element={
            <RequireAuth>
              <EditSubmission />
            </RequireAuth>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;