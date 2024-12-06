import { Bell, Search, Menu, Home, FileText, ShoppingCart, Package, BarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const Header = () => {
  const location = useLocation();

  const navigation = [
    { name: "Tableau de Bord", href: "/", icon: Home },
    { name: "Expressions de Besoin", href: "/expressions", icon: FileText },
    { name: "Demandes d'Achat", href: "/requests", icon: ShoppingCart },
    { name: "Bons de Commande", href: "/orders", icon: Package },
    { name: "Rapports", href: "/reports", icon: BarChart },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-[#276955]">Procurement</h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? "text-[#276955] bg-[#27695522]"
                      : "text-gray-700 hover:text-[#E16C31]"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-[#276955]" : "text-gray-400 group-hover:text-[#E16C31]"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="h-10 w-full rounded-md border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#276955]"
              />
            </div>
            <button className="rounded-full p-2 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <button className="md:hidden rounded-md bg-[#276955] p-2 text-white">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};