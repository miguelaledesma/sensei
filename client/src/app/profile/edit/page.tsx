"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phoneNumber: yup.string(),
  bio: yup.string(),
  sessionRate: yup.number().min(0, "Session rate must be positive"),
  location: yup.object().shape({
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
  }),
  bjjCredentials: yup.object().shape({
    beltRank: yup.string().required("Belt rank is required"),
    yearsOfExperience: yup
      .number()
      .min(0, "Years of experience must be positive")
      .required("Years of experience is required"),
    teachingExperience: yup
      .number()
      .min(0, "Teaching experience must be positive")
      .required("Teaching experience is required"),
    certifications: yup.array().of(
      yup.object().shape({
        value: yup.string().required("Certification is required"),
      })
    ),
  }),
  availability: yup.array().of(
    yup.object().shape({
      day: yup.string().required("Day is required"),
      timeSlots: yup.array().of(
        yup.object().shape({
          startTime: yup.string().required("Start time is required"),
          endTime: yup.string().required("End time is required"),
        })
      ),
    })
  ),
});

type FormData = yup.InferType<typeof schema>;

type TimeSlot = {
  startTime: string;
  endTime: string;
};

type AvailabilityField = {
  day: string;
  timeSlots: TimeSlot[];
};

type FieldArrayAvailability = {
  id: string;
  day: string;
  timeSlots: TimeSlot[];
};

type CertificationField = {
  id: string;
  value: string;
};

export default function EditProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const {
    fields: availabilityFields,
    append: appendAvailability,
    remove: removeAvailability,
  } = useFieldArray<FormData>({
    control,
    name: "availability",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray<FormData>({
    control,
    name: "bjjCredentials.certifications" as const,
  });

  useEffect(() => {
    // Temporarily disabled auth check for testing
    // if (!loading && !user) {
    //   router.push("/sign-in");
    // } else if (user && user.role !== "instructor") {
    //   router.push("/dashboard");
    // }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/users/profile");
        reset(response.data.user);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create FormData to handle file upload
      const formData = new FormData();

      // Append profile picture if selected
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      // Append all other data
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      await axios.put(`/api/users/${user?.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAvailability = () => {
    const newAvailability: AvailabilityField = {
      day: "",
      timeSlots: [{ startTime: "", endTime: "" }],
    };
    appendAvailability(newAvailability);
  };

  const addTimeSlot = (index: number) => {
    const availability = availabilityFields[index] as FieldArrayAvailability;
    const timeSlots = [...(availability.timeSlots || [])];
    timeSlots.push({ startTime: "", endTime: "" });

    // Update the field
    const updatedAvailability = { ...availability, timeSlots };
    removeAvailability(index);
    appendAvailability(updatedAvailability);
  };

  const removeTimeSlot = (availabilityIndex: number, timeSlotIndex: number) => {
    const availability = availabilityFields[
      availabilityIndex
    ] as FieldArrayAvailability;
    const timeSlots = [...(availability.timeSlots || [])];
    timeSlots.splice(timeSlotIndex, 1);

    // Update the field
    const updatedAvailability = { ...availability, timeSlots };
    removeAvailability(availabilityIndex);
    appendAvailability(updatedAvailability);
  };

  const addCertification = () => {
    appendCertification({ value: "" });
  };

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

  // Temporarily disabled role check
  // if (!user || user.role !== "instructor") {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            Edit Your Profile
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-900/50 text-red-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-300"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register("firstName")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register("lastName")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="sessionRate"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Session Rate ($)
                  </label>
                  <input
                    type="number"
                    id="sessionRate"
                    {...register("sessionRate", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.sessionRate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.sessionRate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-300"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  {...register("bio")}
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label
                  htmlFor="profilePicture"
                  className="block text-sm font-medium text-gray-300"
                >
                  Profile Picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-gray-300"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="location.city"
                    className="block text-sm font-medium text-gray-300"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="location.city"
                    {...register("location.city")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.location?.city && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.location.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location.state"
                    className="block text-sm font-medium text-gray-300"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="location.state"
                    {...register("location.state")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.location?.state && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.location.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location.country"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="location.country"
                    {...register("location.country")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.location?.country && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.location.country.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Credentials
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bjjCredentials.beltRank"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Belt Rank
                  </label>
                  <select
                    id="bjjCredentials.beltRank"
                    {...register("bjjCredentials.beltRank")}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a belt rank</option>
                    <option value="white">White</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="brown">Brown</option>
                    <option value="black">Black</option>
                  </select>
                  {errors.bjjCredentials?.beltRank && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bjjCredentials.beltRank.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bjjCredentials.yearsOfExperience"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="bjjCredentials.yearsOfExperience"
                    {...register("bjjCredentials.yearsOfExperience", {
                      valueAsNumber: true,
                    })}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.bjjCredentials?.yearsOfExperience && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bjjCredentials.yearsOfExperience.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bjjCredentials.teachingExperience"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Teaching Experience (years)
                  </label>
                  <input
                    type="number"
                    id="bjjCredentials.teachingExperience"
                    {...register("bjjCredentials.teachingExperience", {
                      valueAsNumber: true,
                    })}
                    className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.bjjCredentials?.teachingExperience && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bjjCredentials.teachingExperience.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certifications
                </label>
                {certificationFields.map((field, index) => (
                  <div key={field.id} className="flex items-center mb-2">
                    <input
                      type="text"
                      {...register(
                        `bjjCredentials.certifications.${index}.value` as const
                      )}
                      className="flex-1 rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCertification}
                  className="mt-2 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  Add Certification
                </button>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Availability
              </h2>

              {availabilityFields.map((field, index) => (
                <div key={field.id} className="mb-6 p-4 bg-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-white">
                      Day {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Remove Day
                    </button>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor={`availability.${index}.day`}
                      className="block text-sm font-medium text-gray-300"
                    >
                      Day of Week
                    </label>
                    <select
                      id={`availability.${index}.day`}
                      {...register(`availability.${index}.day`)}
                      className="mt-1 block w-full rounded-md bg-gray-500 border-gray-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select a day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                    {errors.availability?.[index]?.day && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.availability[index].day.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Time Slots
                    </label>
                    {(field as FieldArrayAvailability).timeSlots?.map(
                      (_, timeSlotIndex: number) => (
                        <div
                          key={timeSlotIndex}
                          className="flex items-center mb-2"
                        >
                          <input
                            type="time"
                            {...register(
                              `availability.${index}.timeSlots.${timeSlotIndex}.startTime`
                            )}
                            className="flex-1 rounded-md bg-gray-500 border-gray-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="mx-2 text-gray-300">to</span>
                          <input
                            type="time"
                            {...register(
                              `availability.${index}.timeSlots.${timeSlotIndex}.endTime`
                            )}
                            className="flex-1 rounded-md bg-gray-500 border-gray-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index, timeSlotIndex)}
                            className="ml-2 p-2 text-red-500 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => addTimeSlot(index)}
                      className="mt-2 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-400"
                    >
                      Add Time Slot
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addAvailability}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
              >
                Add Day
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
