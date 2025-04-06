"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-4">
              Welcome back, {user.firstName} {user.lastName}!
            </h1>
            <p className="text-gray-300 mb-6">
              Here's your dashboard and tools for success.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Upcoming Session
                </h2>
                <p className="text-gray-300">
                  View your upcoming lesson and add notes on what you would like
                  to review with your teacher.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Progress Journal
                </h2>
                <p className="text-gray-300">
                  Document your progress and lesson so you don't forget what you
                  learned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
