import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Filter
} from 'lucide-react';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import { cn } from '@/lib/utils';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';

type FilterType = 'all' | 'overdue' | 'upcoming' | 'completed';

interface TodoItem {
  id: string;
  title: string;
  classId: string;
  className: string;
  classColor: string;
  dueDate: string;
  points: number | null;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const TodoPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const todoItems: TodoItem[] = useMemo(() => {
    return MOCK_ASSIGNMENTS.map(assignment => {
      const cls = MOCK_CLASSES.find(c => c.id === assignment.class_id);
      const dueDate = new Date(assignment.due_date);
      const daysUntilDue = differenceInDays(dueDate, new Date());
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (isPast(dueDate) && !isToday(dueDate)) priority = 'high';
      else if (daysUntilDue <= 2) priority = 'high';
      else if (daysUntilDue <= 5) priority = 'medium';

      return {
        id: assignment.id,
        title: assignment.title,
        classId: assignment.class_id,
        className: cls?.title || 'Unknown Class',
        classColor: cls?.banner_color || '#1967d2',
        dueDate: assignment.due_date,
        points: assignment.points,
        completed: completedItems.has(assignment.id),
        priority,
      };
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [completedItems]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'overdue':
        return todoItems.filter(item => 
          !item.completed && isPast(new Date(item.dueDate)) && !isToday(new Date(item.dueDate))
        );
      case 'upcoming':
        return todoItems.filter(item => 
          !item.completed && !isPast(new Date(item.dueDate))
        );
      case 'completed':
        return todoItems.filter(item => item.completed);
      default:
        return todoItems;
    }
  }, [todoItems, filter]);

  const toggleComplete = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDueDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Due today';
    if (isTomorrow(date)) return 'Due tomorrow';
    if (isPast(date)) return `Overdue by ${Math.abs(differenceInDays(date, new Date()))} days`;
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `Due in ${days} days`;
    return format(date, 'MMM d, yyyy');
  };

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: todoItems.length },
    { value: 'overdue', label: 'Overdue', count: todoItems.filter(i => !i.completed && isPast(new Date(i.dueDate)) && !isToday(new Date(i.dueDate))).length },
    { value: 'upcoming', label: 'Upcoming', count: todoItems.filter(i => !i.completed && !isPast(new Date(i.dueDate))).length },
    { value: 'completed', label: 'Completed', count: todoItems.filter(i => i.completed).length },
  ];

  return (
    <div className="min-h-screen bg-surface-container transition-colors duration-300">
      <DemoHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => {}}
        onJoinClick={() => {}}
      />
      
      <DemoSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        classes={MOCK_CLASSES}
      />

      <main className="pt-16 lg:pl-72 animate-fade-in">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-google-sans text-foreground">To-do</h1>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-on-surface-variant shrink-0" />
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  filter === option.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-accent/50'
                )}
              >
                {option.label}
                <span className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  filter === option.value
                    ? 'bg-white/20'
                    : 'bg-border'
                )}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          {/* Todo list */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="gc-card p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
                <p className="text-on-surface-variant">
                  {filter === 'completed' 
                    ? 'No completed assignments yet'
                    : filter === 'overdue'
                    ? 'No overdue assignments!'
                    : 'No assignments to show'}
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isOverdue = isPast(new Date(item.dueDate)) && !isToday(new Date(item.dueDate));
                
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'gc-card p-4 transition-all duration-300 hover:shadow-lg',
                      item.completed && 'opacity-60'
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fade-in 0.3s ease-out forwards',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className="mt-1 shrink-0 transition-transform duration-200 hover:scale-110"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-on-surface-variant" />
                        )}
                      </button>

                      {/* Content */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/demo/class/${item.classId}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium text-foreground',
                              item.completed && 'line-through'
                            )}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ 
                                  backgroundColor: `${item.classColor}20`,
                                  color: item.classColor
                                }}
                              >
                                {item.className}
                              </span>
                              {item.points && (
                                <span className="text-xs text-on-surface-variant">
                                  {item.points} points
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Due date */}
                          <div className={cn(
                            'flex items-center gap-1 text-sm shrink-0',
                            isOverdue && !item.completed 
                              ? 'text-destructive' 
                              : 'text-on-surface-variant'
                          )}>
                            {isOverdue && !item.completed ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                            <span>{getDueDateLabel(item.dueDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Priority indicator */}
                      {!item.completed && (
                        <div className={cn(
                          'w-1 h-12 rounded-full shrink-0',
                          item.priority === 'high' && 'bg-destructive',
                          item.priority === 'medium' && 'bg-amber-500',
                          item.priority === 'low' && 'bg-green-500'
                        )} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TodoPage;
