import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import authService from '../services/authService';

const TestFirebase: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    const logs: string[] = [];

    try {
      // Test 1: Check if user is authenticated
      const user = authService.getCurrentUser();
      logs.push(`User authenticated: ${user ? user.email : 'No user'}`);

      if (!user) {
        logs.push('❌ No authenticated user found');
        setResults(logs);
        setLoading(false);
        return;
      }

      // Test 2: Try to fetch users collection
      logs.push('🔄 Attempting to fetch users collection...');
      const usersQuery = query(collection(db, 'users'), limit(5));
      const usersSnapshot = await getDocs(usersQuery);
      
      logs.push(`✅ Users collection found. Count: ${usersSnapshot.size}`);
      
      if (!usersSnapshot.empty) {
        usersSnapshot.forEach((doc) => {
          logs.push(`User doc ID: ${doc.id}, email: ${doc.data().email || 'no email'}`);
        });
      }

      // Test 3: Try to find current user
      logs.push('🔄 Looking for current user document...');
      const userQuery = query(
        collection(db, 'users'),
        limit(10) // Get more docs to find user
      );
      const userSnapshot = await getDocs(userQuery);
      
      let foundCurrentUser = false;
      userSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === user.email) {
          foundCurrentUser = true;
          logs.push(`✅ Found current user document: ${doc.id}`);
          logs.push(`Organizations list: ${data.organizations_list ? data.organizations_list.length : 'none'}`);
        }
      });

      if (!foundCurrentUser) {
        logs.push(`❌ Current user (${user.email}) not found in users collection`);
      }

      // Test 4: Try to fetch sessions/organizations collection
      logs.push('🔄 Attempting to fetch sessions collection...');
      const sessionsQuery = query(collection(db, 'sessions'), limit(5));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      logs.push(`Sessions collection found. Count: ${sessionsSnapshot.size}`);

      logs.push('🔄 Attempting to fetch organizations collection...');
      const orgsQuery = query(collection(db, 'organizations'), limit(5));
      const orgsSnapshot = await getDocs(orgsQuery);
      logs.push(`Organizations collection found. Count: ${orgsSnapshot.size}`);

    } catch (error: any) {
      logs.push(`❌ Error: ${error.message}`);
      console.error('Firebase test error:', error);
    }

    setResults(logs);
    setLoading(false);
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Test Results</h2>
            <button
              onClick={testFirebaseConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Retest'}
            </button>
          </div>

          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="font-mono text-sm p-2 bg-gray-50 rounded">
                {result}
              </div>
            ))}
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestFirebase;