import FormModal from '@/components/FormModal';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import FilterSortButtons from '@/components/FilterSortButtons';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { auth } from '@clerk/nextjs/server';
import { Class, Lesson, Prisma, Subject, Teacher } from '@prisma/client';

export const dynamic = 'force-dynamic';

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: 'Subject Name', accessor: 'name' },
    { header: 'Class', accessor: 'class' },
    {
      header: 'Teacher',
      accessor: 'teacher',
      className: 'hidden md:table-cell',
    },
    { header: 'PDF', accessor: 'pdf' },
    ...(role === 'admin' ? [{ header: 'Actions', accessor: 'action' }] : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + ' ' + item.teacher.surname}
      </td>
      <td>
        {item.fileUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
            >
              📄 {item.fileName || 'PDF'}
            </a>
            <a
              href={item.fileUrl}
              download={item.fileName || 'lesson.pdf'}
              className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              title="Download"
            >
              ⬇
            </a>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <FormModal table="lesson" type="update" data={item} />
              <FormModal table="lesson" type="delete" id={item.id} />
            </>
          )}
          {role === 'teacher' && item.teacherId === userId && (
            <FormModal table="lesson" type="update" data={item} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, classId, teacherId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.LessonWhereInput = {};

  if (queryParams.search)
    query.OR = [
      {
        subject: {
          name: { contains: queryParams.search, mode: 'insensitive' },
        },
      },
      {
        teacher: {
          name: { contains: queryParams.search, mode: 'insensitive' },
        },
      },
    ];
  if (classId) query.classId = parseInt(classId);
  if (teacherId) query.teacherId = teacherId;

  // Teachers see only their own lessons
  if (role === 'teacher') query.teacherId = userId!;

  // Students see only lessons for their class
  if (role === 'student') {
    const student = await prisma.student.findUnique({
      where: { id: userId! },
      select: { classId: true },
    });
    if (student) query.classId = student.classId;
  }

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { subject: { name: sort === 'desc' ? 'desc' : 'asc' } },
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          {role === 'student' ? 'My Lessons' : 'All Lessons'}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSortButtons
              filterFields={[
                {
                  label: 'Class',
                  param: 'classId',
                  options: classes.map((c) => ({
                    label: c.name,
                    value: c.id.toString(),
                  })),
                },
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
            {role === 'admin' && <FormModal table="lesson" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;
