import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminNav from '../../../components/AdminNav';
import React from 'react';
import SimulationWorkflow from '../../../components/SimulationWorkflow/index';

export default function SimulationLabPage() {
  const router = useRouter();
  const [labContent, setLabContent] = useState('');
  const [labMetadata, setLabMetadata] = useState<{
    subject: string;
    gradeLevel: string;
  } | null>(null);

  // Get lab content from query params or localStorage
  useEffect(() => {
    if (router.query.labId) {
      // TODO: Fetch lab content from API using labId
      const savedLab = localStorage.getItem(`lab_${router.query.labId}`);
      if (savedLab) {
        const lab = JSON.parse(savedLab);
        setLabContent(lab.content);
        setLabMetadata({
          subject: lab.subject,
          gradeLevel: lab.gradeLevel
        });
      }
    }
  }, [router.query.labId]);

  if (!labContent || !labMetadata) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Interactive Simulation Generator
              </h1>
              <p className="text-gray-600">
                Please select a lab from the labs page to generate a simulation.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                  Interactive Simulation Generator
                </h1>
                <button
                  onClick={() => router.push('/admin/labs')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 
                           rounded-md shadow-sm text-sm font-medium text-gray-700 
                           bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Labs
                </button>
              </div>

              <SimulationWorkflow
                markdownContent={labContent}
                subject={labMetadata.subject}
                gradeLevel={labMetadata.gradeLevel}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
