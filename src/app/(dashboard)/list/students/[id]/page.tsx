import Announcements from '@/components/Announcements';
import BigCalendarContainer from '@/components/BigCalendarContainer';
import FormContainer from '@/components/FormContainer';
import StudentAttendanceChart from '@/components/StudentAttendanceChart';
import StudentAttendanceCard from '@/components/StudentAttendanceCard';

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
    },
  });

  if (!student) return notFound();

  // Sem 1: Ian-Iun, Sem 2: Sep-Dec
  const now = new Date();
  const year = now.getFullYear();

  const sem1Start = new Date(year, 0, 1); // 1 Ian
  const sem1End = new Date(year, 5, 30); // 30 Iun
  const sem2Start = new Date(year, 8, 1); // 1 Sep
  const sem2End = new Date(year, 11, 31); // 31 Dec

  const [sem1Records, sem2Records] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId: id, date: { gte: sem1Start, lte: sem1End } },
      select: { present: true },
    }),
    prisma.attendance.findMany({
      where: { studentId: id, date: { gte: sem2Start, lte: sem2End } },
      select: { present: true },
    }),
  ]);

  const sem1Present = sem1Records.filter((r) => r.present).length;
  const sem2Present = sem2Records.filter((r) => r.present).length;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-6 rounded-md flex-1 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-3 w-full">
              <Image
                src={student.img || '/noAvatar.png'}
                alt={student.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  {student.name + ' ' + student.surname}
                </h1>
                {role === 'admin' && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-500 text-center">
                {(student as any).description || 'No description provided.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium w-full border-t border-white/30 pt-4">
              <div className="flex items-center gap-1.5">
                <Image src="/blood.png" alt="" width={14} height={14} />
                <span>{student.bloodType}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Image src="/date.png" alt="" width={14} height={14} />
                <span>
                  {new Intl.DateTimeFormat('en-GB').format(student.birthday)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Image src="/mail.png" alt="" width={14} height={14} />
                <span className="break-all">{student.email || '-'}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Image src="/phone.png" alt="" width={14} height={14} />
                <span>{student.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>
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
                  {student.class.name.charAt(0)}th
                </h1>
                <span className="text-sm text-gray-400">Year</span>
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
                  {student.class._count.lessons}
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
                <h1 className="text-xl font-semibold">{student.class.name}</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Student&apos;s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              href={`/list/lessons?classId=${student.classId}`}
              className="p-3 rounded-md bg-lamaSkyLight"
            >
              Student&apos;s Lessons
            </Link>
            <Link
              href={`/list/teachers?classId=${student.classId}`}
              className="p-3 rounded-md bg-lamaPurpleLight"
            >
              Student&apos;s Teachers
            </Link>
            <Link
              href={`/list/exams?classId=${student.classId}`}
              className="p-3 rounded-md bg-lamaYellowLight"
            >
              Student&apos;s Exams
            </Link>
            <Link
              href={`/list/assignments?classId=${student.classId}`}
              className="p-3 rounded-md bg-pink-50"
            >
              Student&apos;s Assignments
            </Link>
            <Link
              href={`/list/results?studentId=${student.id}`}
              className="p-3 rounded-md bg-lamaSkyLight"
            >
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <StudentAttendanceChart
          sem1Present={sem1Present}
          sem1Total={sem1Records.length}
          sem2Present={sem2Present}
          sem2Total={sem2Records.length}
        />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;
