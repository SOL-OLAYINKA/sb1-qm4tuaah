import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

const CycleTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodDays, setPeriodDays] = useState<Date[]>([]);
  const [ovulationDay] = useState<Date>(addDays(new Date(), 14));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const togglePeriodDay = (date: Date) => {
    setPeriodDays(prev => 
      prev.some(d => isSameDay(d, date))
        ? prev.filter(d => !isSameDay(d, date))
        : [...prev, date]
    );
  };

  const nextMonth = () => {
    setCurrentDate(prev => addDays(prev, 30));
  };

  const prevMonth = () => {
    setCurrentDate(prev => addDays(prev, -30));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Cycle Tracker</h1>
        <p className="text-gray-600 mt-2">Monitor your menstrual cycle and fertility windows</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map(day => {
            const isPeriod = periodDays.some(d => isSameDay(d, day));
            const isOvulation = isSameDay(day, ovulationDay);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <button
                key={day.toString()}
                onClick={() => {
                  setSelectedDate(day);
                  togglePeriodDay(day);
                }}
                className={`
                  aspect-square p-2 rounded-full relative
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isSelected ? 'bg-pink-100' : 'hover:bg-gray-100'}
                  ${isPeriod ? 'bg-red-100' : ''}
                  ${isOvulation ? 'bg-purple-100' : ''}
                `}
              >
                <span className="relative z-10">{format(day, 'd')}</span>
                {isPeriod && (
                  <Droplets className="absolute bottom-0 right-0 w-3 h-3 text-red-500" />
                )}
                {isOvulation && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded-full" />
              <span className="text-sm text-gray-600">Period</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 rounded-full" />
              <span className="text-sm text-gray-600">Ovulation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Cycle Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Cycle Length</p>
            <p className="text-2xl font-bold text-pink-600">28 days</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Next Period</p>
            <p className="text-2xl font-bold text-purple-600">In 12 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;