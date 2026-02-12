import type { GoalResponse } from '../../../lib/api';
import { MacCard } from './MacUI';

interface GoalKanbanProps {
  goals: GoalResponse[];
}

export function GoalKanban({ goals }: GoalKanbanProps) {
  const columns = [
    { id: 'todo', label: 'To Do', statuses: ['paused'] },
    { id: 'doing', label: 'In Progress', statuses: ['active'] },
    { id: 'done', label: 'Completed', statuses: ['completed', 'failed', 'abandoned'] },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {columns.map(col => {
        const colGoals = goals.filter(g => col.statuses.includes(g.status));

        return (
          <div key={col.id} className="flex flex-col bg-[#1C1C1E] rounded-xl border border-[#38383A] p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-sm font-semibold text-white">{col.label}</h4>
              <span className="text-xs text-[#8E8E93] bg-[#2C2C2E] px-2 py-0.5 rounded-md">
                {colGoals.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar min-h-[200px]">
              {colGoals.length === 0 ? (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-[#2C2C2E] rounded-lg">
                  <span className="text-xs text-[#48484A]">Empty</span>
                </div>
              ) : (
                colGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="bg-[#2C2C2E] p-3 rounded-lg border border-[#38383A] hover:border-[#05b6f8]/50 transition-colors shadow-sm"
                  >
                    <h5 className="text-sm font-medium text-white mb-1">{goal.title}</h5>
                    {goal.success_criteria.length > 0 && (
                      <p className="text-xs text-[#8E8E93] line-clamp-2 mb-3">
                        {goal.success_criteria.join(', ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#8E8E93] uppercase">{goal.goal_type}</span>
                      <span className="text-[10px] text-[#8E8E93]">{Math.round(goal.progress * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#1C1C1E] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          goal.status === 'completed' ? 'bg-[#34C759]' :
                          goal.status === 'failed' || goal.status === 'abandoned' ? 'bg-[#FF453A]' :
                          goal.status === 'paused' ? 'bg-[#FF9F0A]' : 'bg-[#05b6f8]'
                        }`}
                        style={{ width: `${goal.progress * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
