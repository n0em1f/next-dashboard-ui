'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

type FilterField = {
  label: string; // ex: "Class", "Subject", "Teacher"
  param: string; // ex: "classId", "subjectId"
  options: { label: string; value: string }[];
};

const FilterSortButtons = ({
  filterFields = [],
}: {
  filterFields?: FilterField[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedField, setSelectedField] = useState<FilterField | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get('sort') || '';
  // Check if any filter is active
  const hasActiveFilter = filterFields.some((f) => searchParams.get(f.param));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
        setSelectedField(null);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const handleSort = (value: string) => {
    updateParam('sort', value === currentSort ? '' : value);
    setShowSort(false);
  };

  const handleFilterValue = (field: FilterField, value: string) => {
    updateParam(field.param, value);
    setShowFilter(false);
    setSelectedField(null);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    filterFields.forEach((f) => params.delete(f.param));
    params.delete('sort');
    params.delete('page');
    router.push(`?${params.toString()}`);
    setShowFilter(false);
    setSelectedField(null);
  };

  return (
    <>
      {/* FILTER BUTTON */}
      {filterFields.length > 0 && (
        <div ref={filterRef} className="relative">
          <button
            onClick={() => {
              setShowFilter(!showFilter);
              setSelectedField(null);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${hasActiveFilter ? 'bg-blue-400' : 'bg-lamaYellow'}`}
            title="Filter"
          >
            <Image src="/filter.png" alt="" width={14} height={14} />
          </button>

          {showFilter && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[200px] overflow-hidden">
              {/* Header */}
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">Filter by</p>
                {hasActiveFilter && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Field selection */}
              {!selectedField ? (
                <div className="py-1">
                  {filterFields.map((field) => {
                    const activeValue = searchParams.get(field.param);
                    const activeOption = field.options.find(
                      (o) => o.value === activeValue,
                    );
                    return (
                      <button
                        key={field.param}
                        onClick={() => setSelectedField(field)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <span>{field.label}</span>
                        <div className="flex items-center gap-1">
                          {activeOption && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                              {activeOption.label}
                            </span>
                          )}
                          <span className="text-gray-400">›</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Value selection */
                <div className="py-1">
                  <button
                    onClick={() => setSelectedField(null)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                  >
                    <span>‹</span>
                    <span>{selectedField.label}</span>
                  </button>
                  <button
                    onClick={() => handleFilterValue(selectedField, '')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!searchParams.get(selectedField.param) ? 'text-blue-500 font-medium' : 'text-gray-700'}`}
                  >
                    All
                  </button>
                  {selectedField.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        handleFilterValue(selectedField, opt.value)
                      }
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${searchParams.get(selectedField.param) === opt.value ? 'text-blue-500 font-medium bg-blue-50' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SORT BUTTON */}
      <div ref={sortRef} className="relative">
        <button
          onClick={() => setShowSort(!showSort)}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${currentSort ? 'bg-blue-400' : 'bg-lamaYellow'}`}
          title="Sort"
        >
          <Image src="/sort.png" alt="" width={14} height={14} />
        </button>

        {showSort && (
          <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600">
                Sort by name
              </p>
            </div>
            <button
              onClick={() => handleSort('asc')}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${currentSort === 'asc' ? 'text-blue-500 font-medium' : 'text-gray-700'}`}
            >
              <span>↑</span> A → Z
            </button>
            <button
              onClick={() => handleSort('desc')}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${currentSort === 'desc' ? 'text-blue-500 font-medium' : 'text-gray-700'}`}
            >
              <span>↓</span> Z → A
            </button>
            {currentSort && (
              <button
                onClick={() => handleSort('')}
                className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-gray-50 border-t border-gray-100"
              >
                Clear sort
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FilterSortButtons;
