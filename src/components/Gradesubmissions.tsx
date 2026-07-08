// Locație: src/components/GradeSubmissions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { gradeSubmission } from '@/lib/actions';

type Submission = {
  id: number;
  fileUrl: string;
  fileName: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  student: { id: string; name: string; surname: string };
};

const SubmissionRow = ({ sub }: { sub: Submission }) => {
  const router = useRouter();
  const [grade, setGrade] = useState(sub.grade?.toString() ?? '');
  const [feedback, setFeedback] = useState(sub.feedback ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (grade === '' || isNaN(Number(grade))) {
      toast('Please enter a valid grade.');
      return;
    }
    setSaving(true);
    const res = await gradeSubmission({
      submissionId: sub.id,
      grade: Number(grade),
      feedback,
    });
    setSaving(false);
    if (res.success) {
      toast('Grade saved!');
      router.refresh();
    } else {
      toast(res.message || 'Could not save grade.');
    }
  };

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-sm">
          {sub.student.name} {sub.student.surname}
        </span>
        <a
          href={sub.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-100"
        >
          📄 {sub.fileName || 'file.pdf'}
        </a>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm w-20"
        />
        <input
          type="text"
          placeholder="Feedback (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="ring-[1.5px] ring-gray-300 p-1.5 rounded-md text-sm flex-1 min-w-[150px]"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-400 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

const GradeSubmissions = ({ submissions }: { submissions: Submission[] }) => {
  return (
    <div className="bg-white rounded-md p-6 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">
        Submissions ({submissions.length})
      </h2>
      {submissions.length === 0 ? (
        <p className="text-sm text-gray-400">No submissions yet.</p>
      ) : (
        <div className="flex flex-col">
          {submissions.map((sub) => (
            <SubmissionRow key={sub.id} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeSubmissions;
