import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClassroomProvider } from "@/contexts/ClassroomContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DemoDashboard from "./pages/DemoDashboard";
import DemoClassPage from "./pages/DemoClassPage";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import ClassPage from "./pages/ClassPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ClassroomProvider>
            <Routes>
              {/* Landing page */}
              <Route path="/" element={<Index />} />
              
              {/* Demo routes (no auth required) */}
              <Route path="/dashboard" element={<DemoDashboard />} />
              <Route path="/demo/class/:classId" element={<DemoClassPage />} />
              
              {/* Auth routes (original) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/select-role" element={<RoleSelection />} />
              <Route path="/class/:classId" element={<ClassPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClassroomProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
