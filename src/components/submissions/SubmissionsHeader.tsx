import { Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SubmissionsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string | null;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
  onClearFilters: () => void;
}

export const SubmissionsHeader = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  dateFilter,
  setDateFilter,
  departmentFilter,
  setDepartmentFilter,
  priorityFilter,
  setPriorityFilter,
  onClearFilters,
}: SubmissionsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suivi des Soumissions</h1>
          {(statusFilter || dateFilter !== 'all' || departmentFilter !== 'all' || priorityFilter !== 'all') && (
            <p className="text-sm text-gray-500 mt-1">
              Filtres actifs
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#276955] focus:border-transparent"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Date</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={dateFilter} onValueChange={setDateFilter}>
                <DropdownMenuRadioItem value="all">Toutes les dates</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="today">Aujourd'hui</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="week">Cette semaine</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="month">Ce mois</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Département</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={departmentFilter} onValueChange={setDepartmentFilter}>
                <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="maintenance">Maintenance</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="production">Production</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="quality">Qualité</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Urgence</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                <DropdownMenuRadioItem value="all">Toutes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="high">Haute</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">Moyenne</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low">Basse</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {(statusFilter || dateFilter !== 'all' || departmentFilter !== 'all' || priorityFilter !== 'all') && (
            <Button variant="ghost" onClick={onClearFilters}>
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};