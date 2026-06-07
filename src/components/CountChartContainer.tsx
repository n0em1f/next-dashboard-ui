// import Image from 'next/image';
// import CountChart from './CountChart';
// import prisma from '@/lib/prisma';
// import Link from 'next/link';

// export const dynamic = 'force-dynamic';

// const CountChartContainer = async () => {
//   const data = await prisma.student.groupBy({
//     by: ['sex'],
//     _count: true,
//   });

//   const boys = data.find((d) => d.sex === 'MALE')?._count || 0;
//   const girls = data.find((d) => d.sex === 'FEMALE')?._count || 0;

//   return (
//     <div className="bg-white rounded-xl w-full h-full p-4">
//       <div className="flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Students</h1>
//         <Link href="/list/students">
//           <Image
//             src="/moreDark.png"
//             alt=""
//             width={20}
//             height={20}
//             className="cursor-pointer hover:opacity-70 transition-opacity"
//           />
//         </Link>
//       </div>
//       <CountChart boys={boys} girls={girls} />
//       <div className="flex justify-center gap-16">
//         <div className="flex flex-col gap-1">
//           <div className="w-5 h-5 bg-lamaSky rounded-full" />
//           <h1 className="font-bold">{boys}</h1>
//           <h2 className="text-xs text-gray-300">
//             Boys (
//             {boys + girls > 0 ? Math.round((boys / (boys + girls)) * 100) : 0}%)
//           </h2>
//         </div>
//         <div className="flex flex-col gap-1">
//           <div className="w-5 h-5 bg-lamaYellow rounded-full" />
//           <h1 className="font-bold">{girls}</h1>
//           <h2 className="text-xs text-gray-300">
//             Girls (
//             {boys + girls > 0 ? Math.round((girls / (boys + girls)) * 100) : 0}
//             %)
//           </h2>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CountChartContainer;

import Image from 'next/image';
import CountChart from './CountChart';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const COLORS = [
  '#C3EBFA',
  '#FAE27C',
  '#B5EAD7',
  '#FFB7B2',
  '#C7CEEA',
  '#FFDAC1',
];

const SPECIALIZATIONS: Record<string, string> = {
  CS: 'Computer Science',
  ENG: 'Engineering',
  ACC: 'Accounting',
  SPT: 'Sports Science',
  PED: 'Pedagogy',
  PSY: 'Psychology',
};

const CountChartContainer = async () => {
  const classes = await prisma.class.findMany({
    select: {
      name: true,
      _count: { select: { students: true } },
    },
  });

  const countBySpec: Record<string, number> = {};
  for (const cls of classes) {
    const prefix = cls.name.split(' - ')[0];
    if (!countBySpec[prefix]) countBySpec[prefix] = 0;
    countBySpec[prefix] += cls._count.students;
  }

  const chartData = Object.entries(countBySpec).map(
    ([prefix, count], index) => ({
      name: SPECIALIZATIONS[prefix] ?? prefix,
      count,
      fill: COLORS[index % COLORS.length],
    }),
  );

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Link href="/list/students">
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        </Link>
      </div>

      {/* Chart */}
      <CountChart data={chartData} />

      {/* Legend - 2 coloane */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 min-w-0">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold">{item.count}</p>
              <p
                className="text-xs text-gray-400 truncate cursor-default"
                title={`${item.name} (${total > 0 ? Math.round((item.count / total) * 100) : 0}%)`}
              >
                {item.name} (
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountChartContainer;
