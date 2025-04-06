"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the map component with no SSR
const InstructorMap = dynamic(() => import("@/components/InstructorMap"), {
  ssr: false,
});

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
  bjjCredentials?: {
    beltRank?: string;
    yearsOfExperience?: number;
  };
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchParams, setSearchParams] = useState({
    city: "",
    state: "",
    country: "",
    minRate: "",
    maxRate: "",
    beltRank: "",
    minExperience: "",
  });
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    40.7128, -74.006,
  ]); // Default to NYC

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    // Update map center if we have instructors with coordinates
    const instructorsWithCoords = instructors.filter(
      (instructor) => instructor.location?.coordinates
    );
    if (
      instructorsWithCoords.length > 0 &&
      instructorsWithCoords[0].location?.coordinates
    ) {
      // Use the first instructor's coordinates as center
      setMapCenter(instructorsWithCoords[0].location.coordinates);
    }
  }, [instructors]);

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const response = await axios.get("/api/users/search/instructors", {
        params: searchParams,
      });
      setInstructors(response.data.instructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstructors();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block text-indigo-400">
              Find Your Perfect Instructor
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Browse our network of world-class instructors and find the perfect
            match for your training goals.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={searchParams.city}
              onChange={(e) =>
                setSearchParams({ ...searchParams, city: e.target.value })
              }
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="State"
              value={searchParams.state}
              onChange={(e) =>
                setSearchParams({ ...searchParams, state: e.target.value })
              }
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Country"
              value={searchParams.country}
              onChange={(e) =>
                setSearchParams({ ...searchParams, country: e.target.value })
              }
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Min Rate ($)"
              value={searchParams.minRate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, minRate: e.target.value })
              }
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Max Rate ($)"
              value={searchParams.maxRate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, maxRate: e.target.value })
              }
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={searchParams.beltRank}
              onChange={(e) =>
                setSearchParams({ ...searchParams, beltRank: e.target.value })
              }
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Belt Rank</option>
              <option value="white">White</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="brown">Brown</option>
              <option value="black">Black</option>
            </select>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Search Instructors
            </button>
          </div>
        </form>

        {/* Map */}
        <InstructorMap instructors={instructors} center={mapCenter} />

        {/* Instructor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingInstructors ? (
            <div className="col-span-full text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading instructors...</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="col-span-full text-center">
              <p className="text-gray-300">
                No instructors found matching your criteria.
              </p>
            </div>
          ) : (
            instructors.map((instructor) => (
              <div
                key={instructor._id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {instructor.profilePicture ? (
                      <img
                        src={instructor.profilePicture}
                        alt={`${instructor.firstName} ${instructor.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {instructor.firstName.charAt(0)}
                        {instructor.lastName.charAt(0)}
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-white">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      <p className="text-gray-400">
                        {instructor.location?.city || "Location not specified"},{" "}
                        {instructor.location?.state || ""}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-indigo-400 font-semibold">
                      ${instructor.sessionRate || "N/A"}/hour
                    </p>
                    <p className="text-gray-300">
                      {instructor.bjjCredentials?.beltRank || "N/A"} Belt •{" "}
                      {instructor.bjjCredentials?.yearsOfExperience || "N/A"}{" "}
                      years experience
                    </p>
                  </div>
                  <Link
                    href={`/instructors/${instructor._id}`}
                    className="mt-4 block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
