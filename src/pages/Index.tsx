import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Organize Classes',
    description: 'Create and manage multiple classes with customizable sections, subjects, and schedules.',
  },
  {
    icon: ClipboardList,
    title: 'Assignments & Grading',
    description: 'Create assignments, set due dates, collect submissions, and provide grades with feedback.',
  },
  {
    icon: MessageSquare,
    title: 'Class Stream',
    description: 'Post announcements, share materials, and communicate with your entire class instantly.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Invite students and co-teachers, manage class rosters, and foster student engagement.',
  },
  {
    icon: Calendar,
    title: 'Schedule & Deadlines',
    description: 'Keep track of assignments, due dates, and class schedules all in one place.',
  },
  {
    icon: CheckCircle,
    title: 'Track Progress',
    description: 'Monitor student submissions, grades, and overall class performance.',
  },
];

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                <rect width="24" height="24" rx="4" fill="#1967d2"/>
                <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="white"/>
              </svg>
              <span className="text-2xl font-google-sans text-foreground">Classroom</span>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => navigate('/dashboard')}
              className="gc-btn-primary"
            >
              Go to Classroom
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-google-sans font-medium text-foreground mb-6">
              Where teaching and learning{' '}
              <span className="text-primary">come together</span>
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Classroom helps educators create engaging learning experiences they can personalize, 
              manage, and measure. It's free and easy to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="gc-btn-primary px-8 py-6 text-lg"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Go to Classroom
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10"
                size="lg"
              >
                Learn more
              </Button>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="bg-card rounded-2xl shadow-gc-3 overflow-hidden max-w-5xl mx-auto">
              <div className="bg-primary h-2" />
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock class cards */}
                  {[
                    { title: 'Mathematics 101', section: 'Section A', color: '#1967d2' },
                    { title: 'English Literature', section: 'Advanced', color: '#129eaf' },
                    { title: 'Physics', section: 'Section C', color: '#e8710a' },
                  ].map((cls, idx) => (
                    <div 
                      key={idx}
                      className="rounded-lg overflow-hidden border border-border shadow-sm"
                    >
                      <div 
                        className="h-20 p-4 relative"
                        style={{ backgroundColor: cls.color }}
                      >
                        <p className="text-white font-google-sans text-lg truncate">{cls.title}</p>
                        <p className="text-white/80 text-sm">{cls.section}</p>
                      </div>
                      <div className="bg-card p-4 h-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-google-sans font-medium text-foreground mb-4">
              Everything you need to teach
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Classroom integrates all the tools you need to create, organize, and manage 
              your classes in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="gc-card p-6 hover:shadow-gc-2 transition-shadow"
              >
                <div 
                  className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-google-sans font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-google-sans font-medium text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Join millions of educators and students who use Classroom every day 
            to teach and learn together.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-google-sans"
            size="lg"
          >
            Go to Classroom
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <rect width="24" height="24" rx="4" fill="#1967d2"/>
              <path d="M12 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1.5c-2 0-6 1-6 3v1.5h12v-1.5c0-2-4-3-6-3z" fill="white"/>
            </svg>
            <span className="font-google-sans text-foreground">Classroom</span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Demo Mode • No authentication required
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
