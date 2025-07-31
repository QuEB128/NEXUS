import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ActivitySquare, ChevronLeft, ChevronRight, FolderOpen, Home, LogOut, Settings, UserRound, MessageSquare, Video, Users, UserCog, FlaskConical } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  isCollapsed: boolean;
}

const SidebarItem = ({ icon, title, to, isCollapsed }: SidebarItemProps) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center py-3 px-3 rounded-md transition-all",
        isCollapsed ? "justify-center px-2" : "justify-start px-4",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <div className="mr-2 text-lg">{icon}</div>
      {!isCollapsed && <span className="font-medium">{title}</span>}
    </NavLink>
  );
};

export const SidebarNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 border-r border-sidebar-border fixed z-50", 
        collapsed ? "w-16" : "w-64"
      )}
      style={{ backgroundColor: '#1a202c' }} // ensure opaque background
    >
      <div className="flex items-center p-4 border-b border-sidebar-border">
        <ActivitySquare className="text-white mr-2" size={collapsed ? 24 : 28} />
        {!collapsed && <span className="text-white font-semibold text-xl">Nexus Medic</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-2">
          <SidebarItem 
            icon={<Home />} 
            title="Dashboard" 
            to="/dashboard" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Video />} 
            title="Manual Control" 
            to="/manual-control" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<UserRound />} 
            title="Patients Details" 
            to="/patients" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<FolderOpen />} 
            title="Patient Folders" 
            to="/folders" 
            isCollapsed={collapsed} 
          />
          {/* Test sidebar item, only for Lab Technician or admin */}
          {user && (user.role === 'Lab Technician' || user.role === 'admin') && (
            <SidebarItem 
              icon={<FlaskConical />} 
              title="Tests" 
              to="/tests" 
              isCollapsed={collapsed} 
            />
          )}
          <SidebarItem 
            icon={<MessageSquare />} 
            title="Response" 
            to="/responses" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Users />} 
            title="Manage Staff" 
            to="/manage-staff" 
            isCollapsed={collapsed} 
          />
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        <div className={cn(
          "flex items-center", 
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-medium">
                {user?.name.charAt(0)}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                  {user?.name}
                </p>
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 h-6 w-6 rounded-full bg-medical-500 text-white hover:bg-medical-600 border border-white"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>
    </div>
  );
};
