import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeekNavigationControlsProps {
  weekLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  isCurrentWeek?: boolean;
}

export const WeekNavigationControls: React.FC<WeekNavigationControlsProps> = ({
  weekLabel,
  onPrevious,
  onNext,
  onToday,
  isCurrentWeek = false
}) => {
  return (
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-green-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: '#2C6E49' }} />
        </Button>
        
        {onToday && (
          <Button
            onClick={onToday}
            variant={isCurrentWeek ? "default" : "outline"}
            className="h-10 px-4 font-medium"
            style={isCurrentWeek ? { backgroundColor: '#2C6E49' } : {}}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold" style={{ color: '#2C6E49' }}>
          {weekLabel}
        </h3>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onNext}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-green-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5" style={{ color: '#2C6E49' }} />
        </Button>
      </div>
    </div>
  );
};