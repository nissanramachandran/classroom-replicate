import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClassroomProvider } from "@/contexts/ClassroomContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RequireAuth from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DemoDashboard from "./pages/DemoDashboard";
import DemoClassPage from "./pages/DemoClassPage";
import CalendarPage from "./pages/CalendarPage";
import TodoPage from "./pages/TodoPage";
import SettingsPage from "./pages/SettingsPage";
import ArchivedPage from "./pages/ArchivedPage";
import ProfilePage from "./pages/ProfilePage";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import ClassPage from "./pages/ClassPage";
import AiCenter from "./pages/ai/AiCenter";
import AiToolPage from "./pages/ai/AiToolPage";
import AnswerEvaluator from "./pages/ai/AnswerEvaluator";
import ChatPage from "./pages/ChatPage";
import HodDashboard from "./pages/HodDashboard";
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
                
                {/* Classroom routes — require login */}
                <Route path="/dashboard" element={<RequireAuth><DemoDashboard /></RequireAuth>} />
                <Route path="/demo/class/:classId" element={<RequireAuth><DemoClassPage /></RequireAuth>} />
                <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
                <Route path="/todo" element={<RequireAuth><TodoPage /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                <Route path="/archived" element={<RequireAuth><ArchivedPage /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
                <Route path="/hod" element={<RequireAuth><HodDashboard /></RequireAuth>} />

                {/* AI Center */}
                <Route path="/ai" element={<RequireAuth><AiCenter /></RequireAuth>} />
                <Route path="/ai/answer-evaluator" element={<RequireAuth><AnswerEvaluator /></RequireAuth>} />
                <Route path="/ai/:toolId" element={<RequireAuth><AiToolPage /></RequireAuth>} />

                
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
