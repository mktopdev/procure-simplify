import { Search } from "lucide-react";

interface SubmissionsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string | null;
}

export const SubmissionsHeader = ({ searchTerm, setSearchTerm, statusFilter }: SubmissionsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Suivi des Soumissions</h1>
        {statusFilter && (
          <p className="text-sm text-gray-500 mt-1">
            Filtré par statut: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </p>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#276955] focus:border-transparent"
        />
      </div>
    </div>
  );
};