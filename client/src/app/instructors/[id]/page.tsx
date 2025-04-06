"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profilePicture: string;
  bjjCredentials: {
    beltRank: string;
    yearsOfExperience: number;
    teachingExperience: number;
    certifications: string[];
  };
  sessionRate: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  availability: Array<{
    day: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
}

export default function InstructorProfile() {
  const params = useParams();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${params.id}`);
        setInstructor(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load instructor profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInstructor();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading instructor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Instructor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-indigo-600">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700">
                {instructor.profilePicture ? (
                  <Image
                    src={instructor.profilePicture}
                    alt={`${instructor.firstName} ${instructor.lastName}`}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white text-4xl font-bold">
                    {instructor.firstName.charAt(0)}
                    {instructor.lastName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {instructor.firstName} {instructor.lastName}
                </h1>
                <p className="text-gray-400 mt-1">
                  {instructor.location.city}, {instructor.location.state},{" "}
                  {instructor.location.country}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg text-gray-300">
                  ${instructor.sessionRate}/hour
                </div>
                <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Book a Session
                </button>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-2">About</h2>
              <p className="text-gray-300">
                {instructor.bio || "No bio available"}
              </p>
            </div>

            {/* Credentials */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Belt Rank
                  </h3>
                  <p className="text-gray-300">
                    {instructor.bjjCredentials.beltRank}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Experience
                  </h3>
                  <p className="text-gray-300">
                    {instructor.bjjCredentials.yearsOfExperience} years of
                    practice
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Teaching Experience
                  </h3>
                  <p className="text-gray-300">
                    {instructor.bjjCredentials.teachingExperience} years
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Certifications
                  </h3>
                  <ul className="text-gray-300 list-disc list-inside">
                    {instructor.bjjCredentials.certifications.map(
                      (cert, index) => (
                        <li key={index}>{cert}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Availability
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instructor.availability.map((day, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {day.day}
                    </h3>
                    <ul className="text-gray-300">
                      {day.timeSlots.map((slot, slotIndex) => (
                        <li key={slotIndex}>
                          {slot.startTime} - {slot.endTime}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
