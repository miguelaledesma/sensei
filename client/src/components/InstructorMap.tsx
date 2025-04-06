"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
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

interface InstructorMapProps {
  instructors: Instructor[];
  center: [number, number];
}

export default function InstructorMap({
  instructors,
  center,
}: InstructorMapProps) {
  return (
    <div className="h-[400px] mb-12 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {instructors.map((instructor) => {
          // Only render marker if instructor has valid coordinates
          if (
            instructor.location?.coordinates &&
            Array.isArray(instructor.location.coordinates) &&
            instructor.location.coordinates.length === 2
          ) {
            return (
              <Marker
                key={instructor._id}
                position={instructor.location.coordinates}
                icon={icon}
              >
                <Popup>
                  <div className="text-gray-900">
                    <h3 className="font-bold">
                      {instructor.firstName} {instructor.lastName}
                    </h3>
                    <p>${instructor.sessionRate || "N/A"}/hour</p>
                    <p>{instructor.bjjCredentials?.beltRank || "N/A"} Belt</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
