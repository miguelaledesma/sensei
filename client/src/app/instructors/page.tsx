"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FiSearch, FiMapPin, FiFilter } from "react-icons/fi";

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
  specialties?: string[];
  bjjCredentials?: {
    beltRank?: string;
    yearsOfExperience?: number;
  };
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchParams, setSearchParams] = useState({
    query: "",
    location: "",
    specialty: "",
    experienceLevel: "",
  });
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    40.7128, -74.006,
  ]); // Default to NYC
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center max-w-3xl"
          >
            <div className="flex-1 flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchParams.query}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, query: e.target.value })
                  }
                  placeholder="Search martial arts, specialties, or instructor names"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchParams.location}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      location: e.target.value,
                    })
                  }
                  placeholder="Location"
                  className="block w-full pl-10 pr-3 py-2 border border-l-0 border-gray-300 rounded-r-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiFilter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </form>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="py-3 border-t border-gray-200">
            <div className="flex space-x-4">
              <select
                value={searchParams.specialty}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    specialty: e.target.value,
                  })
                }
                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Specialties</option>
                <option value="bjj">Brazilian Jiu-Jitsu</option>
                <option value="wrestling">Wrestling</option>
                <option value="judo">Judo</option>
                <option value="mma">MMA</option>
                <option value="striking">Striking</option>
                <option value="self-defense">Self-Defense</option>
              </select>
              <select
                value={searchParams.experienceLevel}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    experienceLevel: e.target.value,
                  })
                }
                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner-Friendly</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Split View */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Side - Instructor List */}
        <div className="w-1/2 overflow-y-auto p-4">
          {loadingInstructors ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No instructors found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {instructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-center">
                      {instructor.profilePicture ? (
                        <img
                          src={instructor.profilePicture}
                          alt={`${instructor.firstName} ${instructor.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                          {instructor.firstName.charAt(0)}
                          {instructor.lastName.charAt(0)}
                        </div>
                      )}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {instructor.firstName} {instructor.lastName}
                          </h3>
                          <p className="text-blue-600 font-semibold">
                            ${instructor.sessionRate || "N/A"}/hr
                          </p>
                        </div>
                        <p className="text-gray-500">
                          {instructor.location?.city ||
                            "Location not specified"}
                          , {instructor.location?.state || ""}
                        </p>
                        {instructor.specialties &&
                          instructor.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {instructor.specialties.map(
                                (specialty, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                                  >
                                    {specialty}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/instructors/${instructor._id}`}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Map */}
        <div className="w-1/2 relative">
          <div className="absolute inset-0">
            <InstructorMap instructors={instructors} center={mapCenter} />
          </div>
        </div>
      </div>
    </div>
  );
}
