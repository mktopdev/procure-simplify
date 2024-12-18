import { ShoppingCart, FileText, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const FileMenu = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { name: "Demande d'Achat", href: "/expressions/submissions", icon: ShoppingCart },
    { name: "Suivi des Soumissions", href: "/expressions/submissions", icon: FileText },
  ];

  return (
    <div className="relative group">
      <button
        className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 hover:text-[#E16C31]"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        Fichier
        <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:text-[#E16C31]" />
      </button>
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 w-56 mt-1 rounded-md shadow-lg bg-gradient-to-br from-[#276955] to-[#E16C31] overflow-hidden"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="py-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/10 ${
                      isActive ? "bg-white/20 text-white" : "text-white"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};