'use client'; // Forțăm execuția pe client pentru a alinia starea cu browserul

import { useEffect, useState } from 'react';
import Announcements from '@/components/Announcements';
import AttendanceChartContainer from '@/components/AttendanceChartContainer';
import CountChartContainer from '@/components/CountChartContainer';
import EventCalendarContainer from '@/components/EventCalendarContainer';
import FinanceChart from '@/components/FinanceChart';
import UserCard from '@/components/UserCard';

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const [isClient, setIsClient] = useState(false);

  // useEffect se execută DOAR când pagina a ajuns cu succes în browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cât timp Next.js compilează pe server, arătăm un ecran curat de încărcare
  // Asta oprește instant toate erorile de Hydration și problemele de dimensiune ale graficelor
  if (!isClient) {
    return (
      <div className="p-4 w-full h-screen flex items-center justify-center text-gray-500 font-medium">
        Se încarcă panoul de administrare...
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
