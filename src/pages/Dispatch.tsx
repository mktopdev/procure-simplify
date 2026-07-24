import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simplified dispatch view: unassigned transport orders next to available
// vehicles/drivers. Clicking an order opens its detail page where the actual
// assignment happens (single source of truth for the assignment mutation).
// A full drag-and-drop, AI-assisted dispatch board (Ch.10.5) is a later
// enhancement.
const Dispatch = () => {
  const navigate = useNavigate();

  const { data: unassignedOrders } = useQuery({
    queryKey: ["transport_orders", "awaiting_assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_orders")
        .select("*, customers(name)")
        .eq("status", "awaiting_assignment")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: activeTrips } = useQuery({
    queryKey: ["trips", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*, vehicles(plate_number), drivers(name), transport_orders(order_number)")
        .in("status", ["assigned", "in_transit"]);
      if (error) throw error;
      return data;
    },
  });

  const { data: availableVehicles } = useQuery({
    queryKey: ["vehicles", "available"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("status", "available");
      if (error) throw error;
      return data;
    },
  });

  const { data: availableDrivers } = useQuery({
    queryKey: ["drivers", "available"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*").eq("status", "available");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de Répartition (Dispatch)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ordres à Assigner ({unassignedOrders?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(unassignedOrders ?? []).length === 0 && (
                <p className="text-sm text-gray-500">Aucun ordre en attente</p>
              )}
              {(unassignedOrders ?? []).map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/transport/orders/${order.id}`)}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{order.order_number}</span>
                    <Badge variant="outline">{order.priority}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.customers?.name} → {order.delivery_address || "—"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Véhicules Disponibles ({availableVehicles?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(availableVehicles ?? []).map((v) => (
                <div key={v.id} className="p-2 text-sm border border-gray-100 rounded-md">
                  {v.plate_number} <span className="text-gray-400">· {v.vehicle_type || "—"}</span>
                </div>
              ))}
              {(availableVehicles ?? []).length === 0 && <p className="text-sm text-gray-500">Aucun véhicule</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chauffeurs Disponibles ({availableDrivers?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(availableDrivers ?? []).map((d) => (
                <div key={d.id} className="p-2 text-sm border border-gray-100 rounded-md">
                  {d.name}
                </div>
              ))}
              {(availableDrivers ?? []).length === 0 && <p className="text-sm text-gray-500">Aucun chauffeur</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trajets Actifs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(activeTrips ?? []).length === 0 && <p className="text-sm text-gray-500">Aucun trajet actif</p>}
            {(activeTrips ?? []).map((trip) => (
              <button
                key={trip.id}
                onClick={() => navigate(`/transport/orders/${trip.transport_order_id}`)}
                className="w-full text-left flex justify-between items-center p-2 text-sm border border-gray-100 rounded-md hover:bg-gray-50"
              >
                <span>
                  {trip.transport_orders?.order_number} · {trip.vehicles?.plate_number} · {trip.drivers?.name}
                </span>
                <Badge variant="outline">{trip.status}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dispatch;
