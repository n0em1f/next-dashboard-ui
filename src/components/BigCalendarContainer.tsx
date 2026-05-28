import prisma from '@/lib/prisma';
import BigCalendar from './BigCalendar';
import { adjustScheduleToCurrentWeek } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: 'teacherId' | 'classId';
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === 'teacherId'
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });

  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
    day: lesson.day,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);
  console.log('type:', type, 'id:', id);
  console.log('dataRes:', dataRes);
  console.log('schedule:', schedule);
  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
