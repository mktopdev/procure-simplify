import { CheckCircle2, Circle, Clock } from "lucide-react";

interface WorkflowProgressProps {
  currentStage: string;
}

export const WorkflowProgress = ({ currentStage }: WorkflowProgressProps) => {
  const stages = [
    { id: 'demande', label: 'Demande' },
    { id: 'en_attente', label: 'En Attente' },
    { id: 'approbation', label: 'Approbation' },
    { id: 'paiement', label: 'Paiement' },
    { id: 'livraison', label: 'Livraison' },
    { id: 'termine', label: 'Terminé' }
  ];

  const getStageStatus = (stageId: string) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center flex-1">
            <div className="relative flex items-center justify-center">
              {getStageStatus(stage.id) === 'completed' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : getStageStatus(stage.id) === 'current' ? (
                <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
              ) : (
                <Circle className="w-8 h-8 text-gray-300" />
              )}
              {index < stages.length - 1 && (
                <div 
                  className={`absolute left-full w-full h-1 top-1/2 transform -translate-y-1/2 ${
                    getStageStatus(stage.id) === 'completed' 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <span className={`mt-2 text-sm font-medium ${
              getStageStatus(stage.id) === 'current' 
                ? 'text-blue-500' 
                : getStageStatus(stage.id) === 'completed'
                  ? 'text-green-500'
                  : 'text-gray-500'
            }`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};