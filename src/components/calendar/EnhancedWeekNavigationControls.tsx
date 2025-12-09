import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedWeekNavigationControlsProps {
  weekLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
}

export const EnhancedWeekNavigationControls: React.FC<EnhancedWeekNavigationControlsProps> = ({
  weekLabel,
  onPrevious,
  onNext,
  onToday,
  isCurrentWeek
}) => {
  return (
    <div className="flex items-center justify-between py-4 px-6 bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          className="h-10 w-10 rounded-full hover:bg-gray-100"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          className="h-10 w-10 rounded-full hover:bg-gray-100"
          aria-label="Next week"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {weekLabel}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Week View
          </p>
        </div>

        {!isCurrentWeek && (
          <Button
            variant="outline"
            onClick={onToday}
            className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
          >
            <Calendar className="h-4 w-4" />
            Today
          </Button>
        )}
      </div>

      <div className="w-24" /> {/* Spacer for symmetry */}
    </div>
  );
};