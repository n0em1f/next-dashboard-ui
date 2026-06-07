// 'use client';
// import Image from 'next/image';
// import {
//   RadialBarChart,
//   RadialBar,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

// export const dynamic = 'force-dynamic';

// const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
//   const data = [
//     {
//       name: 'Total',
//       count: boys + girls,
//       fill: 'white',
//     },
//     {
//       name: 'Girls',
//       count: girls,
//       fill: '#FAE27C',
//     },
//     {
//       name: 'Boys',
//       count: boys,
//       fill: '#C3EBFA',
//     },
//   ];
//   return (
//     <div className="relative w-full h-[75%]">
//       <ResponsiveContainer width="100%" height={300}>
//         <RadialBarChart
//           cx="50%"
//           cy="50%"
//           innerRadius="40%"
//           outerRadius="100%"
//           barSize={32}
//           data={data}
//         >
//           <RadialBar background dataKey="count" />
//         </RadialBarChart>
//       </ResponsiveContainer>
//       <Image
//         src="/maleFemale.png"
//         alt=""
//         width={50}
//         height={50}
//         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//       />
//     </div>
//   );
// };

// export default CountChart;

'use client';
import Image from 'next/image';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export const dynamic = 'force-dynamic';

const CountChart = ({
  data,
}: {
  data: { name: string; count: number; fill: string }[];
}) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const chartData = [{ name: 'Total', count: total, fill: 'white' }, ...data];

  return (
    <div className="relative w-full h-[200px]">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={14}
          data={chartData}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      <Image
        src="/maleFemale.png"
        alt=""
        width={40}
        height={40}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default CountChart;
