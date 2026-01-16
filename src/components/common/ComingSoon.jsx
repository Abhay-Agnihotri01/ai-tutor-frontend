import { Clock, Wrench } from 'lucide-react';

const ComingSoon = ({ feature = "This feature" }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Clock className="w-20 h-20 theme-text-primary opacity-20" />
            <Wrench className="w-10 h-10 theme-text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <h2 className="text-3xl font-bold theme-text-primary mb-4">
          Coming Soon
        </h2>
        <p className="theme-text-secondary text-lg mb-2">
          {feature} is currently under development
        </p>
        <p className="theme-text-muted text-sm">
          We're working hard to bring you this feature. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
