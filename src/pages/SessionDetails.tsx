import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionRecord } from '@/types/calendar.types';
import { formatTime } from '@/utils/calendarTransformations';

const SessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from Firebase using the sessionId
        // For now, we'll create mock data
        const mockSession: SessionRecord = {
          id: sessionId || 'session-1',
          sessionDate: new Date(),
          sessionTime: {
            startTime: { hour: 10, minute: 0 },
            endTime: { hour: 12, minute: 0 }
          },
          sessionOwner: {
            name: 'John Doe',
            userRef: 'user-123'
          },
          pitch: {
            pitchName: 'Main Field',
            organization_ref: 'org-001'
          },
          sessionType: 'PermanentSession',
          status: 'Confirmed',
          collectedAmount: 5000,
          reference: { id: sessionId || 'session-1' }
        };
        
        setSession(mockSession);
      } catch (error) {
        console.error('Error loading session:', error);
        toast.error('Failed to load session details');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session not found</h2>
          <Button onClick={() => navigate('/calendar')}>
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  const startDateTime = new Date(session.sessionDate);
  startDateTime.setHours(session.sessionTime.startTime.hour, session.sessionTime.startTime.minute);
  const endDateTime = new Date(session.sessionDate);
  endDateTime.setHours(session.sessionTime.endTime.hour, session.sessionTime.endTime.minute);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/calendar')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
              <p className="text-gray-600 mt-1">View and manage session information</p>
            </div>
            <Badge className={`${getStatusColor(session.status)} text-sm px-3 py-1`}>
              {session.status}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Core details about this session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-medium">{session.sessionOwner.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Pitch</p>
                  <p className="font-medium">{session.pitch.pitchName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{session.sessionDate.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">
                    {formatTime(startDateTime)} - {formatTime(endDateTime)}
                  </p>
                </div>
              </div>

              {session.collectedAmount && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">Ksh {session.collectedAmount.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Type */}
          <Card>
            <CardHeader>
              <CardTitle>Session Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline">
                  {session.sessionType === 'PermanentSession' ? 'Permanent Session' :
                   session.sessionType === 'PermanentWeekly' ? 'Weekly Recurring' :
                   session.sessionType === 'Monthly' ? 'Monthly Recurring' : 'One-time Session'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;