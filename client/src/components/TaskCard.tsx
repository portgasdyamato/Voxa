import { Task } from '@/types/task';
import { useUpdateTask } from '@/hooks/useTasks';
import { Clock, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();

  const handleToggleComplete = async (checked: boolean) => {
    updateTask.mutate({
      id: task.id,
      updates: { completed: checked },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'medium':
        return 'bg-purple-100 text-purple-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueTime = (dueDate?: Date) => {
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffInHours = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return 'Overdue';
    } else if (diffInHours < 24) {
      return `Due in ${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `Due in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
    }
  };

  return (
    <div className="glass-effect rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100/50">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-medium ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
              }`}>
                {task.title}
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getPriorityColor(task.priority)
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center mt-2 text-xs">
              {task.completed ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDueTime(task.dueDate) || 'No due date'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
