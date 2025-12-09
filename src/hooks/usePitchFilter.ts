import { useState, useEffect, useMemo } from 'react';
import { PitchRecord, SessionRecord } from '@/types/calendar.types';

export const usePitchFilter = (pitches: PitchRecord[] | undefined, sessions: SessionRecord[] | undefined) => {
  const [selectedPitch, setSelectedPitch] = useState<string>('');
  
  // Auto-select first pitch when data loads
  useEffect(() => {
    if (pitches && pitches.length > 0 && !selectedPitch) {
      setSelectedPitch(pitches[0].name);
    }
  }, [pitches, selectedPitch]);
  
  // Apply filtering logic
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    
    // Single pitch: show all sessions (no filtering needed)
    if (!pitches || pitches.length <= 1) {
      return sessions;
    }
    
    // Multiple pitches: filter by selected pitch
    if (!selectedPitch) return sessions;
    
    return sessions.filter(session => 
      session.pitch.pitchName === selectedPitch
    );
  }, [sessions, selectedPitch, pitches]);
  
  const showPitchFilter = pitches ? pitches.length > 1 : false;
  
  const clearFilter = () => {
    if (pitches && pitches.length > 0) {
      setSelectedPitch(pitches[0].name);
    }
  };
  
  return { 
    selectedPitch, 
    setSelectedPitch, 
    filteredSessions, 
    showPitchFilter,
    clearFilter,
    pitchCount: pitches?.length || 0
  };
};