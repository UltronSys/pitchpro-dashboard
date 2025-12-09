import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { CalendarView } from '@/components/calendar/CalendarView';
import { WeekNavigationControls } from '@/components/calendar/WeekNavigationControls';
import { PitchFilterDropdown } from '@/components/calendar/PitchFilterDropdown';
import { CalendarLoadingSkeleton } from '@/components/calendar/CalendarLoadingSkeleton';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { usePitchFilter } from '@/hooks/usePitchFilter';
import { SessionRecord, PitchRecord, Organization } from '@/types/calendar.types';
import { filterSessionsByWeek } from '@/utils/calendarTransformations';
// import { useAuth } from '@/contexts/AuthContextMock';
import { generateMockSessions, generateMockPitches, generateMockOrganization, mockOrganizations } from '@/services/mockCalendarData';
import { Search, Bell, Plus, RefreshCw, Building2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import '@/styles/calendar.css';

const CalendarPageMock: React.FC = () => {
  // const navigate = useNavigate();
  // const { user } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-001');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [pitches, setPitches] = useState<PitchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { 
    selectedWeekStart, 
    changeWeek, 
    weekLabel, 
    getWeekEnd,
    isCurrentWeek,
    goToToday 
  } = useWeekNavigation();

  const { 
    selectedPitch, 
    setSelectedPitch, 
    filteredSessions, 
    showPitchFilter 
  } = usePitchFilter(pitches, sessions);

  // Load mock data when organization changes
  useEffect(() => {
    const loadMockData = () => {
      setIsLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
        setOrganization(generateMockOrganization(selectedOrgId));
        setSessions(generateMockSessions(selectedOrgId));
        setPitches(generateMockPitches(selectedOrgId));
        setIsLoading(false);
      }, 500);
    };

    loadMockData();
  }, [selectedOrgId]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
    };

    if (showOrgDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOrgDropdown]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update a session status
      if (Math.random() > 0.95) {
        setSessions(prev => {
          const updatedSessions = [...prev];
          const randomIndex = Math.floor(Math.random() * updatedSessions.length);
          const session = updatedSessions[randomIndex];
          
          if (session && session.status === 'Confirmed') {
            updatedSessions[randomIndex] = {
              ...session,
              status: 'Completed'
            };
            toast.success(`Session for ${session.sessionOwner.name} marked as completed`);
          }
          
          return updatedSessions;
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter sessions by week and search query
  const weekFilteredSessions = useMemo(() => {
    const weekFiltered = filterSessionsByWeek(
      filteredSessions,
      selectedWeekStart,
      getWeekEnd()
    );

    if (!searchQuery) return weekFiltered;

    return weekFiltered.filter(session => {
      const searchLower = searchQuery.toLowerCase();
      return (
        session.sessionOwner?.name?.toLowerCase().includes(searchLower) ||
        session.pitch?.pitchName?.toLowerCase().includes(searchLower) ||
        session.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [filteredSessions, selectedWeekStart, getWeekEnd, searchQuery]);

  const handleSessionClick = (sessionId: string) => {
    toast.success(`Opening session ${sessionId}`);
    // In a real app, this would navigate to session details
    console.log('Navigate to session:', sessionId);
  };

  const handleCreateSession = () => {
    toast.success('Opening new session form');
    // In a real app, this would navigate to new session form
    console.log('Create new session');
  };

  const refreshData = () => {
    toast.success('Refreshing calendar data...');
    setSessions(generateMockSessions(selectedOrgId));
  };

  const handleOrganizationChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    setShowOrgDropdown(false);
    toast.success(`Switched to ${mockOrganizations.find(o => o.id === orgId)?.name}`);
  };

  // Removed auth check for demo purposes

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <CalendarLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="calendar-header">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  <Building2 className="w-6 h-6" />
                  {organization?.name || 'Calendar'}
                  <ChevronDown className="w-5 h-5" />
                </button>
                
                {showOrgDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 px-3 py-2">SWITCH ORGANIZATION</div>
                      {mockOrganizations.map(org => (
                        <button
                          key={org.id}
                          onClick={() => handleOrganizationChange(org.id)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            org.id === selectedOrgId 
                              ? 'bg-primary text-white' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{org.name}</div>
                          <div className={`text-xs ${org.id === selectedOrgId ? 'text-white/80' : 'text-gray-500'}`}>
                            {org.address}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Badge variant="outline" className="font-normal">
                {weekFilteredSessions.length} Sessions
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Manage your facility schedule and bookings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              className="relative"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            <Button onClick={handleCreateSession} className="gap-2">
              <Plus className="w-4 h-4" />
              New Session
            </Button>
          </div>
        </div>

        {/* Pitch Filter (conditional) */}
        {showPitchFilter && (
          <div className="pitch-filter-container">
            <PitchFilterDropdown
              pitches={pitches}
              selectedPitch={selectedPitch}
              onPitchChange={setSelectedPitch}
            />
            <div className="ml-auto text-sm text-gray-600">
              {pitches.length} {pitches.length === 1 ? 'pitch' : 'pitches'} available
            </div>
          </div>
        )}

        {/* Week Navigation */}
        <WeekNavigationControls
          weekLabel={weekLabel}
          onPrevious={() => changeWeek(-1)}
          onNext={() => changeWeek(1)}
          onToday={goToToday}
          isCurrentWeek={isCurrentWeek}
        />

        {/* Calendar View */}
        <CalendarView
          sessions={weekFilteredSessions}
          weekStart={selectedWeekStart}
          onSessionClick={handleSessionClick}
          onCreateSession={handleCreateSession}
          selectedPitch={selectedPitch}
        />

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-2xl font-bold text-gray-900">
              {weekFilteredSessions.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">This week</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-green-600">
              {weekFilteredSessions.filter((s: SessionRecord) => s.status === 'Confirmed').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active bookings</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-gray-600">
              {weekFilteredSessions.filter((s: SessionRecord) => s.status === 'Completed').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Finished sessions</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-2xl font-bold text-blue-600">
              Ksh {weekFilteredSessions.reduce((sum: number, s: SessionRecord) => sum + (s.collectedAmount || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Expected earnings</div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
              <div className="mt-1 text-sm text-blue-700">
                This calendar is displaying sample data. Sessions update automatically every 30 seconds to simulate real-time changes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPageMock;