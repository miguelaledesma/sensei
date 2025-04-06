"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FiMapPin, FiClock, FiAward, FiDollarSign } from "react-icons/fi";
import Calendar from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: [number, number];
  };
  sessionRate?: number;
  specialties?: string[];
  bjjCredentials?: {
    beltRank?: string;
    yearsOfExperience?: number;
  };
  bio?: string;
  availability?: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
}

export default function InstructorProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<
    "selecting" | "confirming" | "success"
  >("selecting");

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        // Mock data for instructor
        const mockInstructor: Instructor = {
          _id: params.id as string,
          firstName: "John",
          lastName: "Doe",
          profilePicture: "https://via.placeholder.com/150",
          location: {
            city: "New York",
            state: "NY",
            country: "USA",
            coordinates: [40.7128, -74.006],
          },
          sessionRate: 100,
          specialties: ["Brazilian Jiu-Jitsu", "Wrestling", "MMA"],
          bjjCredentials: {
            beltRank: "Black Belt",
            yearsOfExperience: 15,
          },
          bio: "World-class BJJ instructor with over 15 years of experience. Multiple-time champion and dedicated coach focused on developing well-rounded practitioners.",
          availability: {
            "2024-03-20": [
              { start: "09:00", end: "10:00" },
              { start: "10:00", end: "11:00" },
              { start: "14:00", end: "15:00" },
              { start: "15:00", end: "16:00" },
            ],
            "2024-03-21": [
              { start: "11:00", end: "12:00" },
              { start: "13:00", end: "14:00" },
              { start: "16:00", end: "17:00" },
            ],
          },
        };
        setInstructor(mockInstructor);
      } catch (error) {
        console.error("Error fetching instructor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [params.id]);

  const handleBooking = async () => {
    if (!selectedTimeSlot || !instructor) return;

    if (!user) {
      // Save booking details to localStorage before redirecting
      localStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          instructorId: instructor._id,
          date: selectedDate.toISOString(),
          timeSlot: selectedTimeSlot,
        })
      );
      router.push(
        "/sign-in?redirect=" +
          encodeURIComponent(`/instructors/${instructor._id}`)
      );
      return;
    }

    try {
      // Mock API call to create booking
      const bookingDetails = {
        instructorId: instructor._id,
        studentId: user.id,
        date: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        status: "confirmed",
      };

      // In a real app, this would be an API call
      // await axios.post('/api/bookings', bookingDetails);

      // Store booking in localStorage for mock data persistence
      const existingBookings = JSON.parse(
        localStorage.getItem("bookings") || "[]"
      );
      localStorage.setItem(
        "bookings",
        JSON.stringify([...existingBookings, bookingDetails])
      );

      setBookingStep("success");
    } catch (error) {
      console.error("Error booking session:", error);
      alert("Failed to book session. Please try again.");
    }
  };

  const handleConfirmBooking = () => {
    setBookingStep("confirming");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Instructor not found.</p>
      </div>
    );
  }

  if (bookingStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your session with {instructor.firstName} {instructor.lastName} is
            scheduled for {format(selectedDate, "MMMM d, yyyy")} at{" "}
            {selectedTimeSlot}.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Dashboard
            </button>
            <button
              onClick={() => router.push("/instructors")}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Find More Instructors
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bookingStep === "confirming") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Confirm Your Booking
          </h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Instructor:</span>
              <span className="font-medium">
                {instructor.firstName} {instructor.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {format(selectedDate, "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTimeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium">
                ${instructor.sessionRate}/hour
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleBooking}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirm Booking
            </button>
            <button
              onClick={() => setBookingStep("selecting")}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Change Time
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Instructor Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-6">
                {instructor.profilePicture ? (
                  <img
                    src={instructor.profilePicture}
                    alt={`${instructor.firstName} ${instructor.lastName}`}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {instructor.firstName.charAt(0)}
                    {instructor.lastName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {instructor.firstName} {instructor.lastName}
                  </h1>
                  <div className="mt-2 flex items-center text-gray-500">
                    <FiMapPin className="h-5 w-5 mr-2" />
                    <span>
                      {instructor.location?.city}, {instructor.location?.state}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-gray-500">
                    <FiDollarSign className="h-5 w-5 mr-2" />
                    <span>${instructor.sessionRate}/hour</span>
                  </div>
                  <div className="mt-2 flex items-center text-gray-500">
                    <FiAward className="h-5 w-5 mr-2" />
                    <span>
                      {instructor.bjjCredentials?.beltRank} •{" "}
                      {instructor.bjjCredentials?.yearsOfExperience} years
                      experience
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <p className="mt-2 text-gray-600">{instructor.bio}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Specialties
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {instructor.specialties?.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Calendar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Book a Session
              </h2>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                availability={instructor.availability}
                onTimeSelect={setSelectedTimeSlot}
                selectedTimeSlot={selectedTimeSlot}
              />
              {selectedTimeSlot && (
                <div className="mt-6">
                  <button
                    onClick={handleConfirmBooking}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Book Session for {selectedTimeSlot}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
