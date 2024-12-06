import { Home, FileText, ShoppingCart, Package, BarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Expressions of Need", href: "/expressions", icon: FileText },
    { name: "Purchase Requests", href: "/requests", icon: ShoppingCart },
    { name: "Purchase Orders", href: "/orders", icon: Package },
    { name: "Reports", href: "/reports", icon: BarChart },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-semibold">Procurement</h1>
      </div>
      <nav className="mt-6 px-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-muted text-primary"
                  : "text-gray-700 hover:bg-muted/50"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};