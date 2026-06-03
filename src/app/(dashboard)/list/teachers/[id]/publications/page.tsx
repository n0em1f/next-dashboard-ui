import FormContainer from '@/components/FormContainer';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PublicationsPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: { id: true, name: true, surname: true },
  });

  if (!teacher) return notFound();

  const publications = await prisma.publication.findMany({
    where: { teacherId: id },
    orderBy: { year: 'desc' },
  });

  const typeColors: Record<string, string> = {
    Book: 'bg-blue-100 text-blue-700',
    Article: 'bg-green-100 text-green-700',
    'Research Paper': 'bg-purple-100 text-purple-700',
    Thesis: 'bg-amber-100 text-amber-700',
    'Conference Paper': 'bg-pink-100 text-pink-700',
    Other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/list/teachers/${id}`}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back to {teacher.name} {teacher.surname}
          </Link>
          <h1 className="text-lg font-semibold mt-1">
            Publications — {teacher.name} {teacher.surname}
          </h1>
        </div>
        {(role === 'admin' || role === 'teacher') && (
          <FormContainer
            table="publication"
            type="create"
            relatedData={{ teacherId: id }}
          />
        )}
      </div>

      {publications.length === 0 ? (
        <div className="bg-white rounded-md p-8 text-center text-gray-400">
          No publications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="bg-white rounded-md p-4 flex items-start justify-between gap-4 shadow-sm"
            >
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[pub.type] || typeColors.Other}`}
                  >
                    {pub.type}
                  </span>
                  <span className="text-xs text-gray-400">{pub.year}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {pub.title}
                </p>
                {pub.url && (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {pub.url}
                  </a>
                )}
              </div>
              {(role === 'admin' || role === 'teacher') && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FormContainer table="publication" type="update" data={pub} />
                  <FormContainer
                    table="publication"
                    type="delete"
                    id={pub.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicationsPage;
