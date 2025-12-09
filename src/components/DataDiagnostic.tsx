import React from 'react';
import { StatsRecord, PitchData, OrganizationData } from '../types/dashboard';

interface DataDiagnosticProps {
  organization: OrganizationData | null;
  pitches: PitchData[];
  stats: StatsRecord[];
}

const DataDiagnostic: React.FC<DataDiagnosticProps> = ({ organization, pitches, stats }) => {
  const totalDayStats = stats.reduce((sum, record) => sum + record.days_stats.length, 0);
  const totalSessions = stats.reduce((sum, record) => 
    sum + record.days_stats.reduce((daySum, day) => daySum + (day.totalNoOfSessions || 0), 0), 0
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Data Diagnostic</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Organization</h4>
          <div className="bg-gray-50 p-2 rounded">
            <p>Name: {organization?.name || 'Not loaded'}</p>
            <p>ID: {organization?.id || 'Not loaded'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Pitches ({pitches.length})</h4>
          <div className="bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
            {pitches.length === 0 ? (
              <p className="text-gray-500">No pitches found</p>
            ) : (
              pitches.map((pitch, index) => (
                <p key={pitch.id} className="text-xs">
                  {index + 1}. {pitch.name} ({pitch.id})
                </p>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Stats ({stats.length} records)</h4>
          <div className="bg-gray-50 p-2 rounded">
            <p>Total day stats: {totalDayStats}</p>
            <p>Total sessions: {totalSessions}</p>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">📊 Raw Stats Data</h4>
          <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-700">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default DataDiagnostic;