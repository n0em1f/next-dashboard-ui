import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import FilterSortButtons from '@/components/FilterSortButtons';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { auth } from '@clerk/nextjs/server';
import { Prisma, Subject, Teacher } from '@prisma/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SubjectList = Subject & { teachers: Teacher[] };

// ─── Student view: card-based layout ────────────────────────────────────────

const StudentSubjectsView = async ({ userId }: { userId: string }) => {
  const student = await prisma.student.findUnique({
    where: { id: userId },
    select: { classId: true },
  });

  if (!student) return <p className="text-gray-500 p-4">Student not found.</p>;

  const subjects = await prisma.subject.findMany({
    where: { lessons: { some: { classId: student.classId } } },
    include: {
      teachers: { select: { id: true, name: true, surname: true } },
      lessons: {
        where: { classId: student.classId },
        select: {
          id: true,
          name: true,
          day: true,
          startTime: true,
          endTime: true,
          fileUrl: true,
          fileName: true,
        },
        orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
      },
    },
    orderBy: { name: 'asc' },
  });

  // Get results for grade averages per subject
  const results = await prisma.result.findMany({
    where: { studentId: userId },
    include: {
      exam: { include: { lesson: { select: { subjectId: true } } } },
      assignment: { include: { lesson: { select: { subjectId: true } } } },
    },
  });

  const avgBySubject: Record<number, number | null> = {};
  subjects.forEach((s) => {
    const scores = results
      .filter(
        (r) =>
          r.exam?.lesson?.subjectId === s.id ||
          r.assignment?.lesson?.subjectId === s.id,
      )
      .map((r) => r.score);
    avgBySubject[s.id] =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
  });

  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const dayLabel: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-lg font-semibold">My Subjects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const avg = avgBySubject[subject.id];
          const lessonsWithPdf = subject.lessons.filter((l) => l.fileUrl);
          const sortedLessons = [...subject.lessons].sort(
            (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
          );

          return (
            <div
              key={subject.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {subject.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {subject.teachers
                      .map((t) => `${t.name} ${t.surname}`)
                      .join(', ') || 'No teacher assigned'}
                  </p>
                </div>
                {avg !== null && (
                  <div
                    className={`text-sm font-bold px-2 py-1 rounded-lg ${
                      avg >= 75
                        ? 'bg-green-100 text-green-700'
                        : avg >= 50
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    avg {avg}
                  </div>
                )}
              </div>

              {/* Schedule */}
              {sortedLessons.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Schedule
                  </p>
                  {sortedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1"
                    >
                      <span className="font-medium w-8">
                        {dayLabel[lesson.day]}
                      </span>
                      <span className="flex-1 truncate px-2">
                        {lesson.name}
                      </span>
                      <span className="text-gray-400 whitespace-nowrap">
                        {new Date(lesson.startTime).toLocaleTimeString(
                          'en-GB',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                        –
                        {new Date(lesson.endTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* PDF Materials */}
              {lessonsWithPdf.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Materials
                  </p>
                  {lessonsWithPdf.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-2 bg-blue-50 rounded-md px-2 py-1.5"
                    >
                      <span className="text-blue-500">📄</span>
                      <span className="text-xs text-blue-800 flex-1 truncate">
                        {lesson.fileName || lesson.name}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={lesson.fileUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </a>
                        <span className="text-gray-300">·</span>
                        <a
                          href={lesson.fileUrl!}
                          download={lesson.fileName || 'lesson.pdf'}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {lessonsWithPdf.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No materials uploaded yet.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Admin / Teacher view: original table ────────────────────────────────────

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Students get a dedicated card view
  if (role === 'student' && userId) {
    return <StudentSubjectsView userId={userId} />;
  }

  const columns = [
    { header: 'Subject Name', accessor: 'name' },
    {
      header: 'Teachers',
      accessor: 'teachers',
      className: 'hidden md:table-cell',
    },
    {
      header: 'Lessons with PDF',
      accessor: 'pdfs',
      className: 'hidden md:table-cell',
    },
    { header: 'Actions', accessor: 'action' },
  ];

  const renderRow = (
    item: SubjectList & { _count?: { lesons: number }; pdfCount?: number },
  ) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((t) => t.name).join(', ')}
      </td>
      <td className="hidden md:table-cell">
        {(item as any).pdfCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            📄 {(item as any).pdfCount} PDF
            {(item as any).pdfCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, teacherId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.SubjectWhereInput = {};

  if (queryParams.search)
    query.name = { contains: queryParams.search, mode: 'insensitive' };
  if (teacherId) query.teachers = { some: { id: teacherId } };

  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
    orderBy: { name: 'asc' },
  });

  const [rawData, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
        lessons: { select: { fileUrl: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: sort === 'desc' ? 'desc' : 'asc' },
    }),
    prisma.subject.count({ where: query }),
  ]);

  // Attach pdfCount to each subject
  const data = rawData.map((s) => ({
    ...s,
    pdfCount: s.lessons.filter((l) => l.fileUrl).length,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSortButtons
              filterFields={[
                {
                  label: 'Teacher',
                  param: 'teacherId',
                  options: teachers.map((t) => ({
                    label: `${t.name} ${t.surname}`,
                    value: t.id,
                  })),
                },
              ]}
            />
            {role === 'admin' && (
              <FormContainer table="subject" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SubjectListPage;
