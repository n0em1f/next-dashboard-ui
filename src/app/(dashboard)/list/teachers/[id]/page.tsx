import Announcements from '@/components/Announcements';
import BigCalendarContainer from '@/components/BigCalendarContainer';
import FormContainer from '@/components/FormContainer';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
          publications: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-6 rounded-md flex-1 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-3 w-full">
              <Image
                src={teacher.img || '/noAvatar.png'}
                alt={teacher.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {teacher.name + ' ' + teacher.surname}
                </h1>
                {role === 'admin' && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              <p className="text-sm text-gray-500 text-center">
                {(teacher as any).description || 'No description provided.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium w-full border-t border-white/30 pt-4">
              <div className="flex items-center gap-1.5">
                <Image src="/blood.png" alt="" width={14} height={14} />
                <span>{teacher.bloodType}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Image src="/date.png" alt="" width={14} height={14} />
                <span>
                  {new Intl.DateTimeFormat('en-GB').format(teacher.birthday)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Image src="/mail.png" alt="" width={14} height={14} />
                <span className="break-all">{teacher.email || '-'}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Image src="/phone.png" alt="" width={14} height={14} />
                <span>{teacher.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <Link
              href={`/list/teachers/${teacher.id}/publications`}
              className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] hover:bg-gray-50 transition-colors"
            >
              <Image
                src="/singlePublication.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {teacher._count.publications}
                </h1>
                <span className="text-sm text-gray-400">Publications</span>
              </div>
            </Link>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {teacher._count.subjects}
                </h1>
                <span className="text-sm text-gray-400">Subjects</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {teacher._count.lessons}
                </h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {teacher._count.classes}
                </h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Teacher&apos;s Schedule</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              href={`/list/classes?supervisorId=${teacher.id}`}
              className="p-3 rounded-md bg-lamaSkyLight"
            >
              Teacher&apos;s Classes
            </Link>
            <Link
              href={`/list/lessons?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-lamaYellowLight"
            >
              Teacher&apos;s Lessons
            </Link>
            <Link
              href={`/list/exams?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-pink-50"
            >
              Teacher&apos;s Exams
            </Link>
            <Link
              href={`/list/assignments?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-lamaPurpleLight"
            >
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
