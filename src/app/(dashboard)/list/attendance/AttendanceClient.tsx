'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  checkInAttendance,
  markStudentAttendance,
} from '@/lib/attendanceActions';
import { toast } from 'react-toastify';

type Lesson = {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: { name: string };
  teacher?: { name: string; surname: string };
  class?: { name: string };
};

type Student = { id: string; name: string; surname: string; img?: string };
type AttendanceRecord = {
  id?: number;
  studentId?: string;
  lessonId?: number;
  present: boolean;
};
type ReportRow = {
  id: string;
  name: string;
  surname: string;
  present: number;
  absent: number;
  total: number;
  percentage: number | null;
};

const DAY_NAMES: { [key: string]: string } = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
};

const AttendanceClient = ({
  role,
  currentUserId,
  currentTime,
  studentLessons,
  studentAttendance,
  availableLessons,
  selectedLessonId,
  selectedLesson,
  lessonStudents,
  lessonAttendance,
  reportData,
  reportLessonId,
  fromDate,
  toDate,
}: {
  role: string;
  currentUserId: string;
  currentTime: string;
  studentLessons: Lesson[];
  studentAttendance: AttendanceRecord[];
  availableLessons: Lesson[];
  selectedLessonId: number | null;
  selectedLesson: any;
  lessonStudents: Student[];
  lessonAttendance: AttendanceRecord[];
  reportData: ReportRow[];
  reportLessonId: number | null;
  fromDate: string;
  toDate: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<number | string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'report'>('today');
  const [reportFrom, setReportFrom] = useState(fromDate);
  const [reportTo, setReportTo] = useState(toDate);
  const [selectedReportLesson, setSelectedReportLesson] = useState<string>(
    reportLessonId?.toString() || '',
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date(currentTime);

  const isCheckInAllowed = (lesson: Lesson) => {
    const start = new Date(lesson.startTime);
    const today = new Date();
    start.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    const deadline = new Date(start.getTime() + 15 * 60 * 1000);
    return now >= start && now <= deadline;
  };

  const hasCheckedIn = (lessonId: number) =>
    studentAttendance.some((a) => a.lessonId === lessonId);

  const handleCheckIn = async (lessonId: number) => {
    setLoading(lessonId);
    const result = await checkInAttendance({
      studentId: currentUserId,
      lessonId,
    });
    if (result.success) {
      toast.success('Attendance marked successfully!');
      router.refresh();
    } else toast.error(result.message || 'Could not mark attendance.');
    setLoading(null);
  };

  const handleMarkStudent = async (studentId: string, present: boolean) => {
    if (!selectedLessonId) return;
    setLoading(studentId);
    const result = await markStudentAttendance({
      studentId,
      lessonId: selectedLessonId,
      present,
    });
    if (result.success) {
      toast.success('Attendance updated!');
      router.refresh();
    } else toast.error('Could not update attendance.');
    setLoading(null);
  };

  const getStudentAttendance = (studentId: string) =>
    lessonAttendance.find((a) => a.studentId === studentId);

  const handleReportSearch = () => {
    if (!selectedReportLesson) return;
    router.push(
      `/list/attendance?tab=report&reportLessonId=${selectedReportLesson}&from=${reportFrom}&to=${reportTo}`,
    );
  };

  if (!mounted) return null;

  // ===================== STUDENT VIEW =====================
  if (role === 'student') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          Today&apos;s Attendance
        </h1>
        {studentLessons.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center text-gray-500">
            No lessons scheduled for today.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {studentLessons.map((lesson) => {
              const checkedIn = hasCheckedIn(lesson.id);
              const canCheckIn = isCheckInAllowed(lesson);
              const start = new Date(lesson.startTime);
              const end = new Date(lesson.endTime);
              return (
                <div
                  key={lesson.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-semibold text-gray-800 text-lg">
                        {lesson.subject?.name}
                      </h2>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {lesson.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {start.toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      —{' '}
                      {end.toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {lesson.teacher && (
                      <p className="text-xs text-gray-400 mt-1">
                        Teacher: {lesson.teacher.name} {lesson.teacher.surname}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {checkedIn ? (
                      <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
                        <span className="text-lg">✓</span>
                        <span className="font-medium text-sm">Present</span>
                      </div>
                    ) : canCheckIn ? (
                      <button
                        onClick={() => handleCheckIn(lesson.id)}
                        disabled={loading === lesson.id}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {loading === lesson.id ? 'Checking in...' : 'Check In'}
                      </button>
                    ) : (
                      <div className="text-xs text-gray-400 text-center">
                        {new Date(lesson.startTime) > now ? (
                          <span>Not started yet</span>
                        ) : (
                          <span className="text-red-400">Check-in closed</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ===================== TEACHER / ADMIN VIEW =====================
  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 lg:h-full">
      {/* LEFT - lesson selector */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Lessons</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select a lesson</p>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {availableLessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => {
                  setActiveTab('today');
                  router.push(`/list/attendance?lessonId=${lesson.id}`);
                }}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedLessonId === lesson.id && activeTab === 'today' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              >
                <p className="font-medium  text-gray-800 text-sm">
                  {lesson.subject?.name}
                </p>
                <p className="text-xs text-gray-500">{lesson.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {DAY_NAMES[lesson.day]}
                  </span>
                  {lesson.class && (
                    <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                      {lesson.class.name}
                    </span>
                  )}
                </div>
                {role === 'admin' && lesson.teacher && (
                  <p className="text-xs text-gray-400 mt-1">
                    {lesson.teacher.name} {lesson.teacher.surname}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'today' ? 'bg-blue-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            Today&apos;s Attendance
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'report' ? 'bg-blue-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            Report
          </button>
        </div>

        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <>
            {!selectedLesson ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-medium">Select a lesson</p>
                  <p className="text-sm mt-1">to view and manage attendance</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedLesson.subject?.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedLesson.name} — {selectedLesson.class?.name}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-gray-500">
                      Present:{' '}
                      <strong className="text-green-600">
                        {lessonAttendance.filter((a) => a.present).length}
                      </strong>
                    </span>
                    <span className="text-sm text-gray-500">
                      Absent:{' '}
                      <strong className="text-red-500">
                        {lessonAttendance.filter((a) => !a.present).length}
                      </strong>
                    </span>
                    <span className="text-sm text-gray-500">
                      Not marked:{' '}
                      <strong className="text-gray-400">
                        {lessonStudents.length - lessonAttendance.length}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {lessonStudents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No students in this class.
                    </div>
                  ) : (
                    lessonStudents.map((student) => {
                      const attendance = getStudentAttendance(student.id);
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                              {student.name[0]}
                              {student.surname[0]}
                            </div>
                            <p className="font-medium text-gray-800 text-sm">
                              {student.name} {student.surname}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {attendance ? (
                              <>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${attendance.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                                >
                                  {attendance.present ? 'Present' : 'Absent'}
                                </span>
                                <button
                                  onClick={() =>
                                    handleMarkStudent(
                                      student.id,
                                      !attendance.present,
                                    )
                                  }
                                  disabled={loading === student.id}
                                  className="text-xs text-gray-400 hover:text-gray-600 underline ml-2"
                                >
                                  Change
                                </button>
                              </>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleMarkStudent(student.id, true)
                                  }
                                  disabled={loading === student.id}
                                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() =>
                                    handleMarkStudent(student.id, false)
                                  }
                                  disabled={loading === student.id}
                                  className="bg-red-400 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Absent
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">
                  Lesson
                </label>
                <select
                  value={selectedReportLesson}
                  onChange={(e) => setSelectedReportLesson(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 min-w-[200px]"
                >
                  <option value="">Select a lesson...</option>
                  {availableLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.subject?.name} — {l.name} ({l.class?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">
                  From
                </label>
                <input
                  type="date"
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">To</label>
                <input
                  type="date"
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <button
                onClick={handleReportSearch}
                disabled={!selectedReportLesson}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Generate Report
              </button>
            </div>

            {/* Report table */}
            {reportData.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Attendance Report</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {reportFrom} — {reportTo}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">
                          Student
                        </th>
                        <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase">
                          Present
                        </th>
                        <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase">
                          Absent
                        </th>
                        <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reportData.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                                {row.name[0]}
                                {row.surname[0]}
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {row.name} {row.surname}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-green-600 font-semibold">
                              {row.present}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-red-500 font-semibold">
                              {row.absent}
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-600">
                            {row.total}
                          </td>
                          <td className="p-4 text-center">
                            {row.percentage !== null ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${row.percentage >= 75 ? 'bg-green-500' : row.percentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                    style={{ width: `${row.percentage}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-bold ${row.percentage >= 75 ? 'text-green-600' : row.percentage >= 50 ? 'text-yellow-600' : 'text-red-500'}`}
                                >
                                  {row.percentage}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">
                                No data
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : reportLessonId ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center text-gray-400">
                No attendance data for the selected period.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceClient;
