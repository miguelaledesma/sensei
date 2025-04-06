"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  availability?: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
  onTimeSelect: (time: string | null) => void;
  selectedTimeSlot: string | null;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  availability,
  onTimeSelect,
  selectedTimeSlot,
}: CalendarProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availability?.[dateStr] || [];
  };

  return (
    <div className="w-full">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-900">
          {format(weekStart, "MMMM d")} -{" "}
          {format(addDays(weekStart, 6), "MMMM d, yyyy")}
        </span>
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className={`
              p-2 text-center rounded-lg transition-colors
              ${
                isSameDay(day, selectedDate)
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }
              ${
                getAvailableTimesForDate(day).length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
            disabled={getAvailableTimesForDate(day).length === 0}
          >
            <div className="text-xs font-medium">{format(day, "EEE")}</div>
            <div className="text-sm">{format(day, "d")}</div>
          </button>
        ))}
      </div>

      {/* Time Slots */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Available Times for {format(selectedDate, "MMMM d, yyyy")}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {getAvailableTimesForDate(selectedDate).map((slot, index) => (
            <button
              key={index}
              onClick={() => onTimeSelect(slot.start)}
              className={`
                py-2 px-4 text-sm rounded-md text-center transition-colors
                ${
                  selectedTimeSlot === slot.start
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }
              `}
            >
              {slot.start}
            </button>
          ))}
        </div>
        {getAvailableTimesForDate(selectedDate).length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No available time slots for this date.
          </p>
        )}
      </div>
    </div>
  );
}
