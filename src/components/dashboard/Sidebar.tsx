import { Home, FileText, ShoppingCart, Package, BarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Expressions of Need", href: "/expressions", icon: FileText },
    { name: "Purchase Requests", href: "/requests", icon: ShoppingCart },
    { name: "Purchase Orders", href: "/orders", icon: Package },
    { name: "Reports", href: "/reports", icon: BarChart },
  ];

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-semibold">Procurement</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </ShadcnSidebar>
  );
};