import { Bell, Search, Menu, FileText, ShoppingCart, Package, BarChart, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const Header = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { name: "Expression de Besoin", href: "/expressions", icon: FileText },
    { name: "Demande d'Achat", href: "/requests", icon: ShoppingCart },
    { name: "Bon de Commande", href: "/orders", icon: Package },
    { name: "Rapport", href: "/reports", icon: BarChart },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-[#276955]">Procurement</h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <div className="relative">
              <button
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 hover:text-[#E16C31]"
              >
                Fichier
                <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:text-[#E16C31]" />
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-gradient-to-br from-[#276955] to-[#E16C31] overflow-hidden"
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <div className="py-1">
                        {menuItems.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/10 ${
                                isActive ? "bg-white/20 text-white" : "text-white"
                              }`}
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
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