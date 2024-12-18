interface OrderDetailsSectionProps {
  formData: {
    quantity: number;
    supplier: string;
    priority: string;
  };
  onChange: (field: string, value: string | number) => void;
  isReadOnly?: boolean;
}

export const OrderDetailsSection = ({ formData, onChange, isReadOnly = false }: OrderDetailsSectionProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "basse":
        return "text-green-600";
      case "moyenne":
        return "text-yellow-600";
      case "elevee":
        return "text-orange-600";
      case "critique":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Commande</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quantité</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => onChange('quantity', parseInt(e.target.value) || 1)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
          min="1"
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fournisseur Recommandé</label>
        <input
          type="text"
          value={formData.supplier}
          onChange={(e) => onChange('supplier', e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="À déterminer si inconnu"
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Niveau d'Urgence</label>
        <select
          value={formData.priority}
          onChange={(e) => onChange('priority', e.target.value)}
          className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${getPriorityColor(formData.priority)}`}
          required
          disabled={isReadOnly}
        >
          <option value="">Sélectionner l'urgence</option>
          <option value="basse" className="text-green-600">Basse</option>
          <option value="moyenne" className="text-yellow-600">Moyenne</option>
          <option value="elevee" className="text-orange-600">Élevée</option>
          <option value="critique" className="text-red-600">Critique</option>
        </select>
      </div>
    </div>
  );
};