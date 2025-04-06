"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, parseISO, isSameDay } from "date-fns";

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export default function AvailabilityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    start: "09:00",
    end: "10:00",
  });

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (user.role !== "instructor") {
      router.push("/dashboard");
      return;
    }

    // Load saved availability from localStorage
    const savedAvailability = localStorage.getItem(`availability_${user.id}`);
    if (savedAvailability) {
      setAvailability(JSON.parse(savedAvailability));
    } else {
      // Initialize with empty slots for the next 7 days
      const initialAvailability = Array.from({ length: 7 }, (_, i) => ({
        date: format(addDays(new Date(), i), "yyyy-MM-dd"),
        slots: [],
      }));
      setAvailability(initialAvailability);
    }
    setLoading(false);
  }, [user, router]);

  const handleAddSlot = () => {
    if (!selectedDate) return;

    const updatedAvailability = availability.map((day) => {
      if (day.date === selectedDate) {
        return {
          ...day,
          slots: [...day.slots, newSlot].sort((a, b) =>
            a.start.localeCompare(b.start)
          ),
        };
      }
      return day;
    });

    setAvailability(updatedAvailability);
    localStorage.setItem(
      `availability_${user?.id}`,
      JSON.stringify(updatedAvailability)
    );
    setNewSlot({ start: "09:00", end: "10:00" });
  };

  const handleRemoveSlot = (date: string, index: number) => {
    const updatedAvailability = availability.map((day) => {
      if (day.date === date) {
        return {
          ...day,
          slots: day.slots.filter((_, i) => i !== index),
        };
      }
      return day;
    });

    setAvailability(updatedAvailability);
    localStorage.setItem(
      `availability_${user?.id}`,
      JSON.stringify(updatedAvailability)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Set Your Availability
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your available time slots for the next 7 days
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar View */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Weekly Schedule
                </h2>
                <div className="space-y-4">
                  {availability.map((day) => (
                    <div
                      key={day.date}
                      className={`p-4 rounded-lg border ${
                        selectedDate === day.date
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className="font-medium text-gray-900">
                        {format(parseISO(day.date), "EEEE, MMMM d")}
                      </div>
                      <div className="mt-2 space-y-2">
                        {day.slots.map((slot, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <span className="text-sm text-gray-600">
                              {slot.start} - {slot.end}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSlot(day.date, index);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Time Slot Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Add Time Slot
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Date
                    </label>
                    <div className="mt-1 text-gray-900">
                      {selectedDate
                        ? format(parseISO(selectedDate), "EEEE, MMMM d")
                        : "Please select a date"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newSlot.start}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, start: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newSlot.end}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, end: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddSlot}
                    disabled={!selectedDate}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add Time Slot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
