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

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

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
          {(role === 'admin' || role === 'teacher') && (
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
            {(role === 'admin' || role === 'teacher') && (
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
