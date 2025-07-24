"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet.markercluster";
import { useEffect, useRef, useState } from "react";
import type { LatLngTuple, LeafletEvent } from "leaflet";

export default function DonorMap({ requests = [], donors = [] }: { requests: any[]; donors: any[] }) {
  const center: LatLngTuple = [22.9734, 78.6569];
  const mapRef = useRef<any>(null);
  const [route, setRoute] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  // Mock user location (Bhopal)
  const userLocation: LatLngTuple = [23.2599, 77.4126];
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fix default icon issue in Leaflet with Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapContainerRef.current && !mapRef.current) {
      // Find the Leaflet map instance from the DOM
      const leafletMap = (window as any).L?.map?.instances?.[0];
      if (leafletMap) mapRef.current = leafletMap;
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    // Remove previous clusters
    if (typeof window !== "undefined" && (window as any).L) {
      map.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L.MarkerClusterGroup) map.removeLayer(layer);
      });
      // Create cluster group
      const clusterGroup = (window as any).L.markerClusterGroup();
      // Add request markers
      requests.forEach((req, i) => {
        if (req.lat && req.lng) {
          const marker = L.marker([req.lat, req.lng] as LatLngTuple);
          marker.bindPopup(
            `<b>Request</b><br/>Blood Type: ${req.blood_type}<br/>Units: ${req.units_needed}<br/>Location: ${req.location}<br/><button id='route-req-${i}' style='margin-top:6px;background:#e53935;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-weight:600;cursor:pointer;'>Suggest Route</button>`
          );
          marker.on('popupopen', () => {
            setTimeout(() => {
              const btn = document.getElementById(`route-req-${i}`);
              if (btn) btn.onclick = () => setRoute({ from: userLocation as [number, number], to: [req.lat, req.lng] as [number, number] });
            }, 0);
          });
          clusterGroup.addLayer(marker);
        }
      });
      // Add donor markers
      donors.forEach((don, i) => {
        if (don.lat && don.lng) {
          const marker = L.marker([don.lat, don.lng] as LatLngTuple, { icon: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-red.png", iconSize: [25, 41], iconAnchor: [12, 41] }) });
          marker.bindPopup(
            `<b>Donor</b><br/>Name: ${don.name}<br/>Blood Type: ${don.blood_type}<br/><button id='route-don-${i}' style='margin-top:6px;background:#e53935;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-weight:600;cursor:pointer;'>Suggest Route</button>`
          );
          marker.on('popupopen', () => {
            setTimeout(() => {
              const btn = document.getElementById(`route-don-${i}`);
              if (btn) btn.onclick = () => setRoute({ from: userLocation as [number, number], to: [don.lat, don.lng] as [number, number] });
            }, 0);
          });
          clusterGroup.addLayer(marker);
        }
      });
      map.addLayer(clusterGroup);
    }
    // Draw route if set
    if (route) {
      const routing = (L as any).Routing.control({
        waypoints: [L.latLng(route.from[0], route.from[1]), L.latLng(route.to[0], route.to[1])],
        lineOptions: { styles: [{ color: '#e53935', weight: 5 }] },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
      }).addTo(map);
      return () => { map.removeControl(routing); };
    }
  }, [requests, donors, route]);

  return (
    <div ref={mapContainerRef} style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      {/* Minimal legend for user location and route */}
      <div style={{ position: 'absolute', top: 12, right: 12, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e5393533', padding: '8px 16px', fontSize: 14, color: '#e53935', fontWeight: 600, zIndex: 1000 }}>
        <span style={{ marginRight: 10, color: '#43a047' }}>●</span> You (mock)
        <span style={{ margin: '0 10px', color: '#e53935' }}>—</span>
        <span style={{ color: '#e53935' }}>●</span> Donor/Request
      </div>
    </div>
  );
} 