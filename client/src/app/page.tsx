"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-400">Sensei</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Master new skills, track your progress, and achieve your goals with
            personalized guidance. Book a one on one session with a world class
            instructor.
          </p>
          <div className="mt-10">
            <Link
              href="/instructors"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Find Instructors
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-indigo-400 text-2xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Book 1:1 Sessions with World Class Practicioners
              </h3>
              <p className="text-gray-300">
                Get customized learning paths tailored to your goals and skill
                level with world class athletes in Jujistu, Judo, Wrestling, MMA
                and more!
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-indigo-400 text-2xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-300">
                Monitor your progress with your personalized jou.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-indigo-400 text-2xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Reach your goals faster!
              </h3>
              <p className="text-gray-300">
                We understand that joining a gym can be overwhelming. No need
                for that. Look around at all the different practicioners, select
                the one that matches your vibe, book a class and get going.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
