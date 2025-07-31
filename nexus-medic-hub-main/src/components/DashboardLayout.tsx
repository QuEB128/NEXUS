
import { ReactNode } from "react";
import { SidebarNav } from "@/components/SidebarNav";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ActivitySquare } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated } = useAuth();

  // If you have a different way to check loading state, update here.
  // Otherwise, you can remove the loading check entirely.

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 ml-16 transition-all duration-300">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
