// Student Performance Dashboard - Shows stats, progress, performance status
import React from 'react';
import { BookOpen, ClipboardList, CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { MOCK_CLASSES, MOCK_ASSIGNMENTS } from '@/data/mockData';
import { cn } from '@/lib/utils';

const StudentPerformance: React.FC = () => {
  const totalClasses = MOCK_CLASSES.length;
  const totalAssignments = MOCK_ASSIGNMENTS.length;
  const completedAssignments = 6; // Simulated
  const pendingAssignments = totalAssignments - completedAssignments;
  const completionRate = Math.round((completedAssignments / totalAssignments) * 100);

  let performanceStatus: { label: string; color: string; icon: React.ElementType } = { label: 'Good', color: 'text-gc-green', icon: TrendingUp };
  if (completionRate < 50) performanceStatus = { label: 'Needs Improvement', color: 'text-destructive', icon: AlertCircle };
  else if (completionRate < 75) performanceStatus = { label: 'Average', color: 'text-amber-500', icon: Clock };

  const stats = [
    { label: 'Total Classes', value: totalClasses, icon: BookOpen, color: 'bg-primary/10 text-primary' },
    { label: 'Total Assignments', value: totalAssignments, icon: ClipboardList, color: 'bg-gc-purple/10 text-gc-purple' },
    { label: 'Completed', value: completedAssignments, icon: CheckCircle2, color: 'bg-gc-green/10 text-gc-green' },
    { label: 'Pending', value: pendingAssignments, icon: Clock, color: 'bg-gc-orange/10 text-gc-orange' },
  ];

  return (
    <div className="gc-card p-6 mb-6">
      <h2 className="font-google-sans text-lg text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        My Performance
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map(stat => (
          <div key={stat.label} className={cn("p-4 rounded-xl text-center", stat.color.split(' ')[0])}>
            <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color.split(' ')[1])} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Assignment Completion</span>
          <span className="text-sm font-bold text-primary">{completionRate}%</span>
        </div>
        <div className="gc-progress h-3 rounded-full">
          <div
            className={cn("gc-progress-bar rounded-full transition-all duration-1000",
              completionRate >= 75 ? 'bg-gc-green' : completionRate >= 50 ? 'bg-amber-500' : 'bg-destructive'
            )}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Performance Status */}
      <div className={cn("flex items-center gap-2 px-4 py-3 rounded-lg",
        completionRate >= 75 ? 'bg-gc-green/10' : completionRate >= 50 ? 'bg-amber-500/10' : 'bg-destructive/10'
      )}>
        <performanceStatus.icon className={cn("w-5 h-5", performanceStatus.color)} />
        <span className={cn("font-medium text-sm", performanceStatus.color)}>
          Performance: {performanceStatus.label}
        </span>
      </div>
    </div>
  );
};

export default StudentPerformance;
