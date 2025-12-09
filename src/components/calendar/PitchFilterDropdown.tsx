import React from 'react';
import { PitchRecord } from '@/types/calendar.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface PitchFilterDropdownProps {
  pitches: PitchRecord[];
  selectedPitch: string;
  onPitchChange: (pitch: string) => void;
}

export const PitchFilterDropdown: React.FC<PitchFilterDropdownProps> = ({
  pitches,
  selectedPitch,
  onPitchChange
}) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>Filter by Pitch:</span>
      </div>
      <Select value={selectedPitch} onValueChange={onPitchChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a pitch" />
        </SelectTrigger>
        <SelectContent>
          {pitches.map((pitch) => (
            <SelectItem key={pitch.id} value={pitch.name}>
              {pitch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};