import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';

export function useFetchDashboardData() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [adminSummary, setAdminSummary] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getToken();
        const userRole = user?.publicMetadata?.role as string;
        
        if (userRole === 'ADMIN' || userRole === 'OFFICER') {
          const summaryData = await fetchAPI('/dashboard/summary', { token }).catch(() => null);
          setAdminSummary(summaryData);
        } else {
          const [appsData, grievancesData, bookingsData] = await Promise.all([
            fetchAPI('/applications', { token }).catch(() => []),
            fetchAPI('/grievances', { token }).catch(() => []),
            fetchAPI('/amenities/bookings/my', { token }).catch(() => []),
          ]);
          setApplications(appsData);
          setGrievances(grievancesData);
          setBookings(bookingsData);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [getToken, user]);

  return {
    loading,
    applications,
    grievances,
    bookings,
    adminSummary
  };
}
