import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { File } from "lucide-react";

export const FileMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    {
      label: "Nouvelle Demande d'Achat",
      path: "/expressions/new",
    },
    {
      label: "Suivi des Soumissions",
      path: "/expressions/submissions",
    },
  ];

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <File className="w-4 h-4" />
        <span>Fichier</span>
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 w-56 mt-1 rounded-md shadow-lg bg-gradient-to-br from-[#276955] to-[#E16C31] overflow-hidden z-50"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="py-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="block px-4 py-2 text-sm text-white hover:bg-white/10"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};