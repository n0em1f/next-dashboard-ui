import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import AttendanceClient from './AttendanceClient';

const AttendancePage = async ({
  searchParams,
}: {
  searchParams: {
    lessonId?: string;
    tab?: string;
    from?: string;
    to?: string;
    reportLessonId?: string;
  };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || '';

  const now = new Date();
  const today = now.getDay();
  const dayMap: { [key: number]: string } = {
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
  };
  const todayName = dayMap[today];

  // ---- STUDENT ----
  let studentLessons: any[] = [];
  let studentAttendance: any[] = [];

  if (role === 'student') {
    const studentInfo = await prisma.student.findUnique({
      where: { id: userId! },
      select: { classId: true },
    });

    if (studentInfo && todayName) {
      studentLessons = await prisma.lesson.findMany({
        where: { classId: studentInfo.classId, day: todayName as any },
        include: {
          subject: { select: { name: true } },
          teacher: { select: { name: true, surname: true } },
        },
        orderBy: { startTime: 'asc' },
      });

      studentAttendance = await prisma.attendance.findMany({
        where: {
          studentId: userId!,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
            ),
          },
        },
        select: { lessonId: true, present: true },
      });
    }
  }

  // ---- TEACHER / ADMIN ----
  let availableLessons: any[] = [];
  if (role === 'teacher') {
    availableLessons = await prisma.lesson.findMany({
      where: { teacherId: userId! },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  } else if (role === 'admin') {
    availableLessons = await prisma.lesson.findMany({
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }

  // ---- TODAY ATTENDANCE ----
  const selectedLessonId = searchParams.lessonId
    ? parseInt(searchParams.lessonId)
    : null;
  let lessonStudents: any[] = [];
  let lessonAttendance: any[] = [];
  let selectedLesson: any = null;

  if (selectedLessonId && (role === 'teacher' || role === 'admin')) {
    selectedLesson = await prisma.lesson.findUnique({
      where: { id: selectedLessonId },
      include: {
        subject: { select: { name: true } },
        class: {
          include: {
            students: {
              select: { id: true, name: true, surname: true, img: true },
            },
          },
        },
      },
    });

    if (selectedLesson) {
      lessonStudents = selectedLesson.class.students;
      lessonAttendance = await prisma.attendance.findMany({
        where: {
          lessonId: selectedLessonId,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
            ),
          },
        },
        select: { studentId: true, present: true, id: true },
      });
    }
  }

  // ---- REPORT ----
  let reportData: any[] = [];
  const reportLessonId = searchParams.reportLessonId
    ? parseInt(searchParams.reportLessonId)
    : null;
  const fromDate = searchParams.from
    ? new Date(searchParams.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const toDate = searchParams.to ? new Date(searchParams.to) : now;

  if ((role === 'teacher' || role === 'admin') && reportLessonId) {
    const reportLesson = await prisma.lesson.findUnique({
      where: { id: reportLessonId },
      include: {
        class: {
          include: {
            students: { select: { id: true, name: true, surname: true } },
          },
        },
      },
    });

    if (reportLesson) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          lessonId: reportLessonId,
          date: { gte: fromDate, lte: new Date(toDate.setHours(23, 59, 59)) },
        },
        select: { studentId: true, present: true, date: true },
      });

      reportData = reportLesson.class.students.map((student: any) => {
        const records = attendanceRecords.filter(
          (r) => r.studentId === student.id,
        );
        const present = records.filter((r) => r.present).length;
        const absent = records.filter((r) => !r.present).length;
        const total = records.length;
        const percentage =
          total > 0 ? Math.round((present / total) * 100) : null;
        return {
          id: student.id,
          name: student.name,
          surname: student.surname,
          present,
          absent,
          total,
          percentage,
        };
      });
    }
  }

  const serializeLesson = (l: any) => ({
    ...l,
    startTime: l.startTime.toISOString(),
    endTime: l.endTime.toISOString(),
  });

  return (
    <AttendanceClient
      role={role}
      currentUserId={userId!}
      currentTime={now.toISOString()}
      studentLessons={studentLessons.map(serializeLesson)}
      studentAttendance={studentAttendance}
      availableLessons={availableLessons.map(serializeLesson)}
      selectedLessonId={selectedLessonId}
      selectedLesson={selectedLesson ? serializeLesson(selectedLesson) : null}
      lessonStudents={lessonStudents}
      lessonAttendance={lessonAttendance}
      reportData={reportData}
      reportLessonId={reportLessonId}
      fromDate={fromDate.toISOString().split('T')[0]}
      toDate={toDate.toISOString().split('T')[0]}
    />
  );
};

export default AttendancePage;
