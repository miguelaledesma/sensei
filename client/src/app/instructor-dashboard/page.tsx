"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import Link from "next/link";

interface Booking {
  instructorId: string;
  studentId: string;
  date: string;
  timeSlot: string;
  status: string;
  student?: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export default function InstructorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Redirect non-instructors to the student dashboard
    if (user.role !== "instructor") {
      router.push("/dashboard");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/bookings?instructorId=${user.id}`);

        // For now, we'll get mock data from localStorage
        const storedBookings = JSON.parse(
          localStorage.getItem("bookings") || "[]"
        );
        const instructorBookings = storedBookings.filter(
          (booking: Booking) => booking.instructorId === user.id
        );

        // Add mock student data
        const bookingsWithStudents = instructorBookings.map(
          (booking: Booking) => ({
            ...booking,
            student: {
              firstName: "Jane",
              lastName: "Smith",
              profilePicture: "https://via.placeholder.com/150",
            },
          })
        );

        setBookings(bookingsWithStudents);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, router]);

  if (!user) {
    return null; // Router will handle redirect
  }

  if (user.role !== "instructor") {
    return null; // Router will handle redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.firstName}!</p>
          <div className="mt-4">
            <Link
              href="/instructor-dashboard/availability"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Manage Availability
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Overview */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Today's Sessions
              </h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {
                  bookings.filter(
                    (b) =>
                      format(new Date(b.date), "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd")
                  ).length
                }
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Upcoming Sessions
              </h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {bookings.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Total Students
              </h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {new Set(bookings.map((b) => b.studentId)).size}
              </p>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upcoming Sessions
                </h2>
              </div>

              {bookings.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No upcoming sessions scheduled.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start space-x-6">
                        {booking.student?.profilePicture ? (
                          <img
                            src={booking.student.profilePicture}
                            alt={`${booking.student.firstName} ${booking.student.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                            {booking.student?.firstName.charAt(0)}
                            {booking.student?.lastName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              Session with {booking.student?.firstName}{" "}
                              {booking.student?.lastName}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {booking.status}
                            </span>
                          </div>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center text-gray-500">
                              <FiCalendar className="h-5 w-5 mr-2" />
                              <span>
                                {format(new Date(booking.date), "MMMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <FiClock className="h-5 w-5 mr-2" />
                              <span>{booking.timeSlot}</span>
                            </div>
                          </div>
                          <div className="mt-4 space-x-4">
                            <button
                              onClick={() => {
                                // In a real app, this would open a modal or navigate to a session details page
                                alert("Session details would open here");
                              }}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                // In a real app, this would open a chat/messaging interface
                                alert("Messaging interface would open here");
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Message Student
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
