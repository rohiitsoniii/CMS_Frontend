import React, { useEffect, useState } from 'react';

export const StatusPage: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const url = import.meta.env.VITE_API_URL 
          ? `${import.meta.env.VITE_API_URL}/api/v1/status`
          : '/api/v1/status';
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch status', err);
        setStatus({
           status: 'unknown',
           components: { api: 'unknown', database: 'unknown', cache: 'unknown', cdn: 'unknown' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Retrieving system status...</div>;
  }

  const isOperational = status?.status === 'operational';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Status</h1>
          <p className="mt-2 text-lg text-gray-500">Live service availability updates and system SLA</p>
        </div>

        <div className={`rounded-lg p-6 shadow-sm border ${isOperational ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isOperational ? 'bg-green-500' : 'bg-yellow-500'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="ml-4">
              <h2 className={`text-xl font-bold ${isOperational ? 'text-green-800' : 'text-yellow-800'}`}>
                {isOperational ? 'All Systems Operational' : 'Partial System Outage'}
              </h2>
              <p className={`mt-1 text-sm ${isOperational ? 'text-green-600' : 'text-yellow-600'}`}>
                Checked at {new Date(status?.timestamp || Date.now()).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Platform Components</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {Object.entries(status?.components || {}).map(([key, state]) => (
              <li key={key} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <span className="capitalize font-medium text-gray-700">{key}</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  state === 'operational' ? 'bg-green-100 text-green-800' : 
                  state === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {String(state)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Past 90-day Uptime: <span className="font-bold text-gray-700">{status?.uptimePersentage}%</span></p>
        </div>

      </div>
    </div>
  );
};
