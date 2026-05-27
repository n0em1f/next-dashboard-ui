import Image from 'next/image';
import AttendanceChart from './AttendanceChart';
import prisma from '@/lib/prisma';
import Link from 'next/link';

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  const resData = await prisma.attendance.findMany({
    where: { date: { gte: lastMonday } },
    select: { date: true, present: true },
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const attendanceMap: { [key: string]: { present: number; absent: number } } = {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
  };

  resData.forEach((item) => {
    const itemDate = new Date(item.date);
    const day = itemDate.getDay();
    if (day >= 1 && day <= 5) {
      const dayName = daysOfWeek[day - 1];
      if (item.present) attendanceMap[dayName].present += 1;
      else attendanceMap[dayName].absent += 1;
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Link href="/list/attendance">
          <Image src="/moreDark.png" alt="" width={20} height={20} className="cursor-pointer hover:opacity-70 transition-opacity" />
        </Link>
      </div>
      <AttendanceChart data={data} />
    </div>
  );
};

export default AttendanceChartContainer;