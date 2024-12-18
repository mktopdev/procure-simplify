import { Search, LogOut, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileMenu } from "./header/FileMenu";
import { NotificationsDropdown } from "./header/NotificationsDropdown";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  isRead: boolean;
}

export const Header = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
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
            <FileMenu />
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
            
            <NotificationsDropdown 
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllAsRead={markAllAsRead}
            />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-[#E16C31] transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};