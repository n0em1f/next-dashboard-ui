import FormContainer from '@/components/FormContainer';
import SubmitAssignment from '@/components/SubmitAssignment';
import GradeSubmissions from '@/components/Gradesubmissions';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const SingleAssignmentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const assignment = await prisma.assignment.findUnique({
    where: { id: parseInt(id) },
    include: {
      lesson: {
        include: {
          subject: { select: { name: true } },
          class: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true, surname: true } },
        },
      },
    },
  });

  if (!assignment) return notFound();

  // ---- Access control ----
  if (role === 'teacher' && assignment.lesson.teacher.id !== userId) {
    return notFound();
  }
  if (role === 'student') {
    const belongs = await prisma.student.findFirst({
      where: { id: userId!, classId: assignment.lesson.class.id },
      select: { id: true },
    });
    if (!belongs) return notFound();
  }

  // ---- Submissions ----
  // Student: only their own submission. Teacher/admin: all submissions.
  let mySubmission = null;
  let allSubmissions: any[] = [];

  if (role === 'student') {
    const sub = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: userId!,
        },
      },
    });
    mySubmission = sub
      ? { ...sub, submittedAt: sub.submittedAt.toISOString() }
      : null;
  } else if (role === 'teacher' || role === 'admin') {
    const subs = await prisma.submission.findMany({
      where: { assignmentId: assignment.id },
      include: {
        student: { select: { id: true, name: true, surname: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    allSubmissions = subs.map((s) => ({
      ...s,
      submittedAt: s.submittedAt.toISOString(),
    }));
  }

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white rounded-md p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/list/assignments" className="hover:underline">
                Assignments
              </Link>
              <span>/</span>
              <span>{assignment.lesson.subject.name}</span>
            </div>
            <h1 className="text-2xl font-semibold">{assignment.title}</h1>
            <p className="text-sm text-gray-500">
              {assignment.lesson.subject.name} — {assignment.lesson.class.name}{' '}
              · {assignment.lesson.teacher.name}{' '}
              {assignment.lesson.teacher.surname}
            </p>
          </div>

          {(role === 'admin' || role === 'teacher') && (
            <div className="flex items-center gap-2">
              <FormContainer
                table="assignment"
                type="update"
                data={assignment}
              />
              <FormContainer
                table="assignment"
                type="delete"
                id={assignment.id}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-medium">
          <span className="px-3 py-1.5 rounded-md bg-lamaSkyLight">
            Start: {fmtDate(assignment.startDate)}
          </span>
          <span
            className={`px-3 py-1.5 rounded-md ${
              isOverdue ? 'bg-red-50 text-red-500' : 'bg-lamaYellowLight'
            }`}
          >
            Due: {fmtDate(assignment.dueDate)}
            {isOverdue ? ' (overdue)' : ''}
          </span>
          {assignment.maxScore != null && (
            <span className="px-3 py-1.5 rounded-md bg-lamaPurpleLight">
              Max score: {assignment.maxScore}
            </span>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white rounded-md p-6 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Description</h2>
        {assignment.description ? (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {assignment.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400">No description provided.</p>
        )}
      </div>

      {/* INSTRUCTIONS */}
      <div className="bg-white rounded-md p-6 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Instructions</h2>
        {assignment.instructions ? (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {assignment.instructions}
          </p>
        ) : (
          <p className="text-sm text-gray-400">No instructions provided.</p>
        )}
      </div>

      {/* STUDENT: upload own submission */}
      {role === 'student' && (
        <SubmitAssignment
          assignmentId={assignment.id}
          existing={mySubmission}
        />
      )}

      {/* TEACHER/ADMIN: see & grade submissions */}
      {(role === 'teacher' || role === 'admin') && (
        <GradeSubmissions submissions={allSubmissions} />
      )}
    </div>
  );
};

export default SingleAssignmentPage;
