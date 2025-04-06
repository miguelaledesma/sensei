"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  specialties?: string[];
}

interface InstructorMapProps {
  instructors: Instructor[];
  center: [number, number];
}

export default function InstructorMap({
  instructors,
  center,
}: InstructorMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it hasn't been initialized yet
    if (!mapRef.current) {
      // Create a custom monochromatic style
      const monochromeStyle = {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
            paint: {
              "raster-saturation": -1, // Remove all color
              "raster-contrast": 0.1, // Slightly increase contrast
              "raster-brightness-min": 0.1, // Adjust brightness
              "raster-brightness-max": 0.9,
            },
          },
        ],
      };

      // Create the map with a monochromatic style
      mapRef.current = L.map(mapContainerRef.current, {
        center: center,
        zoom: 10,
        zoomControl: false, // We'll add this manually for better positioning
      });

      // Add the monochromatic tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(mapRef.current);

      // Add zoom control to the bottom right
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(mapRef.current);
    }

    // Clear existing markers
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });
    }

    // Add markers for instructors with coordinates
    instructors.forEach((instructor) => {
      if (
        instructor.location?.coordinates &&
        instructor.location.coordinates.length === 2
      ) {
        const [lat, lng] = instructor.location.coordinates;

        // Create a custom icon
        const icon = L.divIcon({
          className: "instructor-marker",
          html: `<div class="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">${instructor.firstName.charAt(
            0
          )}${instructor.lastName.charAt(0)}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Create the marker
        const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);

        // Add popup with instructor info
        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-gray-900">${instructor.firstName} ${
          instructor.lastName
        }</h3>
            <p class="text-gray-700 text-sm">${
              instructor.location.city || ""
            } ${instructor.location.state || ""}</p>
            ${
              instructor.specialties && instructor.specialties.length > 0
                ? `<div class="mt-1 flex flex-wrap gap-1">
                ${instructor.specialties
                  .map(
                    (specialty) =>
                      `<span class="px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">${specialty}</span>`
                  )
                  .join("")}
              </div>`
                : ""
            }
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Center the map on the first instructor with coordinates
    const instructorsWithCoords = instructors.filter(
      (instructor) => instructor.location?.coordinates
    );
    if (
      instructorsWithCoords.length > 0 &&
      instructorsWithCoords[0].location?.coordinates
    ) {
      mapRef.current.setView(instructorsWithCoords[0].location.coordinates, 10);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [instructors, center]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <style jsx global>{`
        .instructor-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full"></div>
    </div>
  );
}
