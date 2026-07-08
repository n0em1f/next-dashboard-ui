// Locație: src/components/SubmitAssignment.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { submitAssignment } from '@/lib/actions';

type ExistingSubmission = {
  fileUrl: string;
  fileName: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
} | null;

const SubmitAssignment = ({
  assignmentId,
  existing,
}: {
  assignmentId: number;
  existing: ExistingSubmission;
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Upload failed.');
        return;
      }

      const saved = await submitAssignment({
        assignmentId,
        fileUrl: result.url,
        fileName: result.fileName,
      });

      if (saved.success) {
        toast('Assignment submitted!');
        router.refresh();
      } else {
        setError(saved.message || 'Could not save submission.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-md p-6 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Your Submission</h2>

      {existing ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <a
              href={existing.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-100"
            >
              📄 {existing.fileName || 'submission.pdf'}
            </a>
            <span className="text-xs text-gray-400">
              Submitted{' '}
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(existing.submittedAt))}
            </span>
          </div>

          {existing.grade != null ? (
            <div className="flex flex-col gap-1 mt-2 p-3 rounded-md bg-green-50">
              <span className="text-sm font-medium text-green-700">
                Grade: {existing.grade}
              </span>
              {existing.feedback && (
                <span className="text-xs text-gray-600">
                  Feedback: {existing.feedback}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400 mt-1">Not graded yet.</span>
          )}

          <p className="text-xs text-gray-400 mt-2">
            You can replace your submission by uploading a new file.
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          You haven&apos;t submitted anything yet.
        </p>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="*"
          onChange={handleUpload}
          disabled={uploading}
          className="text-sm"
        />
        {uploading && <p className="text-xs text-blue-500 mt-1">Uploading…</p>}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default SubmitAssignment;
