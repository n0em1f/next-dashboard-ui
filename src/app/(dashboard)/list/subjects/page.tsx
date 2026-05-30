import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import FilterSortButtons from '@/components/FilterSortButtons';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { auth } from '@clerk/nextjs/server';
import { Prisma, Subject, Teacher } from '@prisma/client';

export const dynamic = 'force-dynamic';

type SubjectList = Subject & { teachers: Teacher[] };

// ─── Student: carduri cu orar + PDF-uri, filtrabil după profesor ──────────────

const StudentSubjectsView = async ({
  userId,
  teacherId,
}: {
  userId: string;
  teacherId?: string;
}) => {
  const student = await prisma.student.findUnique({
    where: { id: userId },
    select: { classId: true },
  });
  if (!student) return <p className="text-gray-500 p-4">Student not found.</p>;

  const allTeachers = await prisma.teacher.findMany({
    where: { lesons: { some: { classId: student.classId } } },
    select: { id: true, name: true, surname: true },
    orderBy: { name: 'asc' },
  });

  const subjects = await prisma.subject.findMany({
    where: {
      lesons: { some: { classId: student.classId } },
      ...(teacherId ? { teachers: { some: { id: teacherId } } } : {}),
    },
    include: {
      teachers: { select: { id: true, name: true, surname: true } },
      lesons: {
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

  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const dayLabel: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">My Subjects</h1>
        <FilterSortButtons
          filterFields={[
            {
              label: 'Teacher',
              param: 'teacherId',
              options: allTeachers.map((t) => ({
                label: `${t.name} ${t.surname}`,
                value: t.id,
              })),
            },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const sorted = [...subject.lesons].sort(
            (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
          );
          const withPdf = sorted.filter((l) => l.fileUrl);
          return (
            <div
              key={subject.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm"
            >
              <div>
                <h2 className="font-semibold text-gray-800">{subject.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {subject.teachers
                    .map((t) => `${t.name} ${t.surname}`)
                    .join(', ')}
                </p>
              </div>
              {sorted.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Schedule
                  </p>
                  {sorted.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1"
                    >
                      <span className="font-medium w-8">{dayLabel[l.day]}</span>
                      <span className="flex-1 truncate px-2">{l.name}</span>
                      <span className="text-gray-400 whitespace-nowrap">
                        {new Date(l.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        –
                        {new Date(l.endTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {withPdf.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Materials
                  </p>
                  {withPdf.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-2 bg-blue-50 rounded-md px-2 py-1.5"
                    >
                      <span className="text-blue-500">📄</span>
                      <span className="text-xs text-blue-800 flex-1 truncate">
                        {l.fileName || l.name}
                      </span>
                      <a
                        href={l.fileUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                      <span className="text-gray-300">·</span>
                      <a
                        href={l.fileUrl!}
                        download={l.fileName || 'lesson.pdf'}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
              {withPdf.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No materials yet.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Teacher: orarul lui, filtrabil după clasă, cu upload PDF pe fiecare lecție ─

const TeacherSubjectsView = async ({
  userId,
  classId,
}: {
  userId: string;
  classId?: string;
}) => {
  const myClasses = await prisma.class.findMany({
    where: { lessons: { some: { teacherId: userId } } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: userId,
      ...(classId ? { classId: parseInt(classId) } : {}),
    },
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });

  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const dayLabel: Record<string, string> = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
  };
  const byDay = dayOrder.reduce(
    (acc, day) => {
      acc[day] = lessons.filter((l) => l.day === day);
      return acc;
    },
    {} as Record<string, typeof lessons>,
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">My Schedule</h1>
        <FilterSortButtons
          filterFields={[
            {
              label: 'Class',
              param: 'classId',
              options: myClasses.map((c) => ({
                label: c.name,
                value: c.id.toString(),
              })),
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-3">
        {dayOrder.map((day) => {
          const list = byDay[day];
          if (!list.length) return null;
          return (
            <div
              key={day}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {dayLabel[day]}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {list.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 whitespace-nowrap w-28">
                        {new Date(lesson.startTime).toLocaleTimeString(
                          'en-GB',
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                        –
                        {new Date(lesson.endTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {lesson.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lesson.subject.name} · {lesson.class.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.fileUrl && (
                        <a
                          href={lesson.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-100"
                        >
                          📄 PDF
                        </a>
                      )}
                      <FormContainer
                        table="lesson"
                        type="update"
                        data={lesson}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {lessons.length === 0 && (
          <p className="text-sm text-gray-500">No lessons found.</p>
        )}
      </div>
    </div>
  );
};

// ─── Admin: tabelul original neatins ─────────────────────────────────────────

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role === 'student' && userId)
    return (
      <StudentSubjectsView userId={userId} teacherId={searchParams.teacherId} />
    );

  if (role === 'teacher' && userId)
    return (
      <TeacherSubjectsView userId={userId} classId={searchParams.classId} />
    );

  const columns = [
    { header: 'Subject Name', accessor: 'name' },
    {
      header: 'Teachers',
      accessor: 'teachers',
      className: 'hidden md:table-cell',
    },
    { header: 'Actions', accessor: 'action' },
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((t) => t.name).join(', ')}
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

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: { teachers: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: sort === 'desc' ? 'desc' : 'asc' },
    }),
    prisma.subject.count({ where: query }),
  ]);

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
