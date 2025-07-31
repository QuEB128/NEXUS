import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoutes from "@/components/ProtectedRoutes";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ManualControl from "@/pages/ManualControl";
import Patients from "@/pages/Patients";
import Folders from "@/pages/Folders";
import Responses from "@/pages/Responses";
import NotFound from "@/pages/NotFound";
import ManageStaff from "@/pages/ManageStaff";
import FolderView from "@/pages/FolderView";
import Test from "@/pages/Test";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                element={
                  <ProtectedRoutes>
                    <DashboardLayout>
                      <Outlet />
                    </DashboardLayout>
                  </ProtectedRoutes>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manual-control" element={<ManualControl />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/folders" element={<Folders />} />
                <Route path="/folders/:folder_id" element={<FolderView />} />
                <Route path="/tests" element={<Test />} />
                <Route path="/responses" element={<Responses />} />
                <Route 
                  path="/manage-staff" 
                  element={
                    <ProtectedRoutes requiredRoles={['admin']}>
                      <ManageStaff />
                    </ProtectedRoutes>
                  } 
                />
              </Route>
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
