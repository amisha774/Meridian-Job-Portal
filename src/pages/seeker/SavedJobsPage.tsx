import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/EmptyState';
import { JobCard } from '../../components/JobCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { savedJobsApi } from '../../services/api';
import { SavedJobItem } from '../../types';
import { extractErrorMessage } from '../../utils/formatters';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedJobsApi
      .list()
      .then(({ data }) => setSavedJobs(data.savedJobs))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId: string) => {
    try {
      await savedJobsApi.remove(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job._id !== jobId));
      toast.success('Removed from saved jobs.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Saved Jobs
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Roles you bookmarked to review and apply to later.
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Click the bookmark icon on any role while browsing to keep a shortlist here."
          actionLabel="Explore Open Jobs"
          actionTo="/jobs"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {savedJobs.map((item) => (
            <JobCard
              key={item._id}
              job={item.job}
              isSaved
              onToggleSave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
