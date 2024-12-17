import { Bell, Search, Menu, FileText, ShoppingCart, Package, BarChart, ChevronDown, Home, ClipboardList, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  isRead: boolean;
}

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const menuItems = [
    { name: "Expression de Besoin", href: "/expressions", icon: FileText },
    { name: "Demande d'Achat", href: "/requests", icon: ShoppingCart },
    { name: "Bon de Commande", href: "/orders", icon: Package },
    { name: "Rapport", href: "/reports", icon: BarChart },
  ];

  useEffect(() => {
    // Subscribe to real-time updates for expressions_of_need table
    const channel = supabase
      .channel('expressions-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expressions_of_need'
        },
        (payload) => {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            message: getNotificationMessage(payload),
            created_at: new Date().toISOString(),
            isRead: false
          };
          setNotifications(prev => [newNotification, ...prev].slice(0, 5));
          
          toast({
            title: "Nouvelle notification",
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const getNotificationMessage = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        return `Nouvelle expression de besoin créée pour ${newRecord.part_name}`;
      case 'UPDATE':
        if (oldRecord.status !== newRecord.status) {
          return `Statut mis à jour: ${newRecord.part_name} est maintenant "${newRecord.status}"`;
        }
        return `Expression de besoin mise à jour: ${newRecord.part_name}`;
      case 'DELETE':
        return `Expression de besoin supprimée: ${oldRecord.part_name}`;
      default:
        return 'Nouvelle mise à jour';
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate("/auth");
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-[#276955] hover:text-[#E16C31] transition-colors duration-200"
            >
              <img 
                src="/lovable-uploads/52995933-69cf-4d4e-a3b0-1d5fea816533.png" 
                alt="Groupe Guiter" 
                className="h-8"
              />
              <Home className="h-5 w-5 ml-2" />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
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
            </div>

            <Link
              to="/expressions/submissions"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 hover:text-[#E16C31] ${
                location.pathname === '/expressions/submissions' ? 'text-[#E16C31]' : 'text-gray-700'
              }`}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Suivi des Soumissions
            </Link>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-full p-2 hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuGroup>
                  <div className="flex items-center justify-between px-2 py-2 border-b">
                    <span className="font-medium">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#276955] hover:text-[#E16C31] transition-colors"
                      >
                        Marquer tout comme lu
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`px-4 py-2 cursor-default ${!notification.isRead ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">{notification.message}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-[#E16C31] transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
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
