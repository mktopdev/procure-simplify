import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageTransition } from "@/components/ui/PageTransition";
import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold text-white"
            >
              Bienvenue sur la Gestion des Achats
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-white/80"
            >
              Soumettez une nouvelle expression de besoin ou gérez les demandes existantes
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Demandes en Attente", value: "12" },
              { title: "Commandes Actives", value: "8" },
              { title: "Complétées ce Mois", value: "45" }
            ].map((widget, index) => (
              <motion.div
                key={widget.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <h3 className="text-lg font-medium text-[#276955]">{widget.title}</h3>
                <p className="text-3xl font-semibold mt-2 text-[#E16C31]">{widget.value}</p>
              </motion.div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Nouvelle Expression de Besoin</h2>
            <ExpressionOfNeedForm />
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Index;