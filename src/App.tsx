import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClassroomProvider } from "@/contexts/ClassroomContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DemoDashboard from "./pages/DemoDashboard";
import DemoClassPage from "./pages/DemoClassPage";
import CalendarPage from "./pages/CalendarPage";
import TodoPage from "./pages/TodoPage";
import SettingsPage from "./pages/SettingsPage";
import ArchivedPage from "./pages/ArchivedPage";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import ClassPage from "./pages/ClassPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
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
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/todo" element={<TodoPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/archived" element={<ArchivedPage />} />
                
                {/* Auth routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/select-role" element={<RoleSelection />} />
                
                {/* Protected routes (require authentication) */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/class/:classId" element={
                  <ProtectedRoute>
                    <ClassPage />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ClassroomProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
