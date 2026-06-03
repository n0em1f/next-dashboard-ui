'use client';
import { useState } from 'react';

type Subject = { id: number; name: string };
type Lesson = { id: number; class: { name: string }; subject: { id: number } };

const TeacherSubjectsDropdown = ({
  subjects,
  lessons,
}: {
  subjects: Subject[];
  lessons: Lesson[];
}) => {
  const [open, setOpen] = useState(false);

  if (subjects.length === 0)
    return <span className="text-gray-400 text-xs">—</span>;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs bg-lamaSkyLight text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
      >
        {subjects.length} subject{subjects.length > 1 ? 's' : ''}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[220px] p-2 flex flex-col gap-1">
            {subjects.map((subject) => {
              const subjectClasses = lessons
                .filter((l) => l.subject.id === subject.id)
                .map((l) => l.class.name);
              return (
                <div
                  key={subject.id}
                  className="px-2 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <p className="text-xs font-semibold text-gray-800">
                    {subject.name}
                  </p>
                  {subjectClasses.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {subjectClasses.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherSubjectsDropdown;
