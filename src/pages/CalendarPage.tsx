import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList,
  Calendar as CalendarIcon 
} from 'lucide-react';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES } from '@/data/mockData';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAssignmentsForDate = (date: Date) => {
    return MOCK_ASSIGNMENTS.filter(assignment => {
      const dueDate = new Date(assignment.due_date);
      return isSameDay(dueDate, date);
    });
  };

  const getClassForAssignment = (classId: string) => {
    return MOCK_CLASSES.find(c => c.id === classId);
  };

  const selectedDateAssignments = selectedDate 
    ? getAssignmentsForDate(selectedDate) 
    : [];

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
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-google-sans text-foreground">Calendar</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 gc-card p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="gc-btn-icon"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-google-sans text-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="gc-btn-icon"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-on-surface-variant py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayAssignments = getAssignmentsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'min-h-[80px] p-2 rounded-lg text-left transition-all duration-200 hover:bg-accent/50',
                        !isCurrentMonth && 'opacity-40',
                        isSelected && 'ring-2 ring-primary bg-primary/10',
                        isTodayDate && !isSelected && 'bg-primary/5'
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm',
                        isTodayDate && 'bg-primary text-white font-medium',
                        !isTodayDate && 'text-foreground'
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Assignment indicators */}
                      <div className="mt-1 space-y-1">
                        {dayAssignments.slice(0, 2).map(assignment => {
                          const cls = getClassForAssignment(assignment.class_id);
                          return (
                            <div
                              key={assignment.id}
                              className="text-xs truncate px-1 py-0.5 rounded"
                              style={{ 
                                backgroundColor: `${cls?.banner_color}20`,
                                color: cls?.banner_color
                              }}
                            >
                              {assignment.title}
                            </div>
                          );
                        })}
                        {dayAssignments.length > 2 && (
                          <div className="text-xs text-on-surface-variant">
                            +{dayAssignments.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected date details */}
            <div className="gc-card p-6">
              <h3 className="font-google-sans text-lg text-foreground mb-4">
                {selectedDate 
                  ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                  : 'Select a date'}
              </h3>

              {selectedDate && (
                <div className="space-y-3">
                  {selectedDateAssignments.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">
                      No assignments due on this date
                    </p>
                  ) : (
                    selectedDateAssignments.map(assignment => {
                      const cls = getClassForAssignment(assignment.class_id);
                      return (
                        <div
                          key={assignment.id}
                          onClick={() => navigate(`/demo/class/${assignment.class_id}`)}
                          className="p-4 rounded-lg border border-border hover:bg-accent/30 cursor-pointer transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: cls?.banner_color }}
                            >
                              <ClipboardList className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {assignment.title}
                              </p>
                              <p className="text-sm text-on-surface-variant truncate">
                                {cls?.title}
                              </p>
                              {assignment.points && (
                                <p className="text-xs text-on-surface-variant mt-1">
                                  {assignment.points} points
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
