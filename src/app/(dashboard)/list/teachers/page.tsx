import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import FilterSortButtons from '@/components/FilterSortButtons';
import TeacherSubjectsDropdown from '@/components/TeacherSubjectsDropdown';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { auth } from '@clerk/nextjs/server';
import { Class, Prisma, Subject, Teacher } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type LessonWithClass = {
  id: number;
  class: { name: string };
  subject: { id: number };
};

type TeacherList = Teacher & {
  subjects: Subject[];
  classes: Class[];
  lessons: LessonWithClass[];
};

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: 'Info', accessor: 'info' },
    {
      header: 'Teacher ID',
      accessor: 'teacherId',
      className: 'hidden md:table-cell',
    },
    {
      header: 'Subjects & Classes',
      accessor: 'subjects',
      className: 'hidden md:table-cell',
    },
    { header: 'Phone', accessor: 'phone', className: 'hidden lg:table-cell' },
    {
      header: 'Address',
      accessor: 'address',
      className: 'hidden lg:table-cell',
    },
    ...(role === 'admin' ? [{ header: 'Actions', accessor: 'action' }] : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || '/noAvatar.png'}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name + ' ' + item.surname}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        <TeacherSubjectsDropdown
          subjects={item.subjects}
          lessons={item.lessons}
        />
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === 'admin' && (
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, subjectId, classId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams.search)
    query.name = { contains: queryParams.search, mode: 'insensitive' };
  if (subjectId) query.subjects = { some: { id: parseInt(subjectId) } };
  if (classId) query.classes = { some: { id: parseInt(classId) } };

  const [subjects, classes] = await Promise.all([
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
        lessons: {
          select: {
            id: true,
            class: { select: { name: true } },
            subject: { select: { id: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: sort === 'desc' ? 'desc' : 'asc' },
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSortButtons
              filterFields={[
                {
                  label: 'Subject',
                  param: 'subjectId',
                  options: subjects.map((s) => ({
                    label: s.name,
                    value: s.id.toString(),
                  })),
                },
                {
                  label: 'Class',
                  param: 'classId',
                  options: classes.map((c) => ({
                    label: c.name,
                    value: c.id.toString(),
                  })),
                },
              ]}
            />
            {role === 'admin' && (
              <FormContainer table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;
