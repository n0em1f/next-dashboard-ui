'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const TableSearch = () => {
  const router = useRouter();
  const [value, setValue] = useState('');

  const handleSearch = useCallback(
    (val: string) => {
      const params = new URLSearchParams(window.location.search);
      if (val) {
        params.set('search', val);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`${window.location.pathname}?${params}`);
    },
    [router],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(value);
    }, 350);
    return () => clearTimeout(timer);
  }, [value, handleSearch]);

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </div>
  );
};

export default TableSearch;
