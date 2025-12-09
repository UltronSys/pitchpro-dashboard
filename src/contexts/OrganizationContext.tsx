import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import authService from '../services/authService';

interface Organization {
  id: string;
  name: string;
  ref?: any;
}

interface OrganizationContextType {
  selectedOrgId: string | null;
  setSelectedOrgId: (id: string) => void;
  availableOrganizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  currentUser: any;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user: any) => {
      console.log('🔐 [Context] Auth state changed:', user?.email || 'No user');
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch organizations when user is authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const fetchOrganizations = async () => {
      try {
        console.log('📋 [Context] Fetching organizations for:', currentUser.email);
        const userQuery = query(
          collection(db, 'users'),
          where('email', '==', currentUser.email)
        );

        const userSnapshot = await getDocs(userQuery);
        console.log('👤 [Context] User docs found:', userSnapshot.size);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const userOrgs = userData.organizations_list || [];
          console.log('🏢 [Context] Organizations list:', userOrgs);

          const processedOrgs: Organization[] = [];

          for (const orgEntry of userOrgs) {
            try {
              // Handle different reference formats
              let orgId: string | null = null;

              if (orgEntry.ref) {
                // Extract org ID from DocumentReference or path
                if (typeof orgEntry.ref === 'string') {
                  orgId = orgEntry.ref.split('/').pop() || null;
                } else if (orgEntry.ref.id) {
                  orgId = orgEntry.ref.id;
                } else if (orgEntry.ref.path) {
                  orgId = orgEntry.ref.path.split('/').pop() || null;
                }
              } else if (orgEntry.id) {
                orgId = orgEntry.id;
              }

              if (orgId) {
                // Use Firebase v9 modular SDK to fetch the organization
                const orgDocRef = doc(db, 'organizations', orgId);
                const orgDoc = await getDoc(orgDocRef);

                if (orgDoc.exists()) {
                  const orgData = orgDoc.data();
                  processedOrgs.push({
                    id: orgDoc.id,
                    name: orgData.name || 'Unknown Organization',
                    ref: orgDocRef
                  });
                } else {
                  // Org document doesn't exist, use fallback name
                  processedOrgs.push({
                    id: orgId,
                    name: orgEntry.name || `Organization ${orgId}`,
                    ref: orgDocRef
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching organization:', error);
            }
          }

          console.log('✅ [Context] Processed organizations:', processedOrgs);
          setAvailableOrganizations(processedOrgs);

          // Auto-select first organization if none selected
          if (processedOrgs.length > 0 && !selectedOrgId) {
            setSelectedOrgId(processedOrgs[0].id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [authLoading, currentUser]);

  const currentOrganization = availableOrganizations.find(org => org.id === selectedOrgId) || null;

  return (
    <OrganizationContext.Provider
      value={{
        selectedOrgId,
        setSelectedOrgId,
        availableOrganizations,
        currentOrganization,
        loading: loading || authLoading,
        currentUser
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
