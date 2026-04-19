import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useScreeningStore } from "../stores/screeningStore";
import {
  formatDistanceAway,
  getAllCities,
  getDoctorsByCity,
  getDoctorsForCondition,
  getNearbyDoctorsWithProgressiveRadius,
  haversineDistance,
} from "../services/doctorService";

const CONDITION_LABELS = {
  iron_deficiency_anemia: "Iron Deficiency Anemia",
  hypothyroidism: "Hypothyroidism",
  hyperthyroidism: "Hyperthyroidism",
  pcos: "Polycystic Ovary Syndrome (PCOS)",
  pcod: "Polycystic Ovarian Disease (PCOD)",
  endometriosis_tendency: "Endometriosis",
};

const SPECIALTY_COLORS = {
  Gynecologist: { bg: "#fdf0eb", color: "#d97049" },
  Endocrinologist: { bg: "#eff6ff", color: "#2563eb" },
  Hematologist: { bg: "#fdf4ff", color: "#7c3aed" },
  "General Physician": { bg: "#e6f7ef", color: "#3da97a" },
};

function StarRating({ rating, reviews }) {
  if (!rating) {
    return <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>No ratings yet</span>;
  }

  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < full ? "#f59e0b" : i === full && half ? "#f59e0b" : "#d1d5db", fontSize: "14px" }}>
          ★
        </span>
      ))}
      <span style={{ marginLeft: "4px", fontWeight: 600, color: "var(--color-text)", fontSize: "var(--text-sm)" }}>
        {rating.toFixed(1)}
      </span>
      <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>({reviews} reviews)</span>
    </div>
  );
}

function DoctorCard({ doctor }) {
  const specialtyStyle = SPECIALTY_COLORS[doctor.specialty] || { bg: "#f3f4f6", color: "#6b6b80" };

  function handleCall() {
    window.open(`tel:${doctor.phone}`, "_self");
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Hi, I am looking to book an appointment with ${doctor.name} at ${doctor.clinic}. I have been experiencing hormonal health concerns and would like a consultation.`
    );
    const cleanPhone = doctor.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  }

  function handleDirections() {
    const query = doctor.address && doctor.address !== "Address unavailable"
      ? doctor.address
      : `${doctor.lat},${doctor.lng}`;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      "_blank"
    );
  }

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <div className="doctor-avatar">
              {doctor.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 style={{ marginBottom: "2px" }}>{doctor.name}</h3>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  background: specialtyStyle.bg,
                  color: specialtyStyle.color,
                }}
              >
                {doctor.specialty}
              </span>
            </div>
          </div>

          <StarRating rating={doctor.rating} reviews={doctor.reviews} />
        </div>

        {doctor.distance != null && (
          <div className="distance-badge">
            {formatDistanceAway(doctor.distance)}
          </div>
        )}
      </div>

      <div className="doctor-card-body">
        {(doctor.area || doctor.city) && (
          <div className="doctor-info-row">
            <span>
              📍 {[doctor.area, doctor.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        {doctor.clinic && (
          <div className="doctor-info-row">
            <span>🏥 {doctor.clinic}</span>
          </div>
        )}
        {doctor.experience != null && (
          <div className="doctor-info-row">
            <span>💼 {doctor.experience} years experience</span>
          </div>
        )}
        {doctor.consultationFee != null && (
          <div className="doctor-info-row">
            <span>💰 ₹{doctor.consultationFee} consultation</span>
          </div>
        )}
        {doctor.availability && (
          <div className="doctor-info-row">
            <span>🕐 {doctor.availability}</span>
          </div>
        )}
        {doctor.teleAvailable && (
          <div className="doctor-info-row">
            <span>📞 Tele-consultation available</span>
          </div>
        )}
        {doctor.within500m && (
          <div className="doctor-info-row">
            <span className="indicator-badge high">Within 500 meters</span>
          </div>
        )}
        <div className="doctor-info-row" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
          <span>📋 {doctor.address}</span>
        </div>
        {doctor.lat != null && doctor.lng != null && (
          <div className="doctor-info-row" style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
            <span>🧭 {doctor.lat.toFixed(5)}, {doctor.lng.toFixed(5)}</span>
          </div>
        )}
      </div>

      <div className="doctor-card-actions">
        <button className="btn btn-primary btn-sm" onClick={handleCall} disabled={!doctor.phone}>
          📞 Call
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleWhatsApp} disabled={!doctor.phone}>
          💬 WhatsApp
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleDirections}>
          📍 Directions
        </button>
      </div>
    </div>
  );
}

export function NearbyDoctorsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { latestOutput } = useScreeningStore();

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [radiusUsed, setRadiusUsed] = useState(null);
  const [searchSource, setSearchSource] = useState("local");
  const [searchStatus, setSearchStatus] = useState("");
  const [showAll, setShowAll] = useState(false);
  const lastCoordsRef = useRef(null);

  const primaryCondition = latestOutput?.primary_tendency || location?.state?.condition || null;
  const conditionLabel = primaryCondition ? (CONDITION_LABELS[primaryCondition] || primaryCondition) : null;

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!lastCoordsRef.current) {
          lastCoordsRef.current = next;
          setUserLocation(next);
          setLocationError("");
          setLocationLoading(false);
          return;
        }

        const movedKm = haversineDistance(
          lastCoordsRef.current.lat,
          lastCoordsRef.current.lng,
          next.lat,
          next.lng
        );

        if (movedKm >= 30) {
          lastCoordsRef.current = next;
          setUserLocation(next);
        }

        setLocationError("");
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied. Showing doctors by city.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDoctors() {
      setDoctorsLoading(true);
      setSearchStatus("");
      try {
        if (selectedCity) {
          const cityDoctors = getDoctorsByCity(selectedCity, primaryCondition).map((doctor) => {
            const distance =
              userLocation?.lat != null && userLocation?.lng != null && doctor.lat && doctor.lng
                ? haversineDistance(userLocation.lat, userLocation.lng, doctor.lat, doctor.lng)
                : null;

            return { ...doctor, distance, within500m: distance != null && distance <= 500, source: "local" };
          });

          cityDoctors.sort((a, b) => (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER));
          setDoctors(cityDoctors);
          setRadiusUsed(null);
          setSearchSource("local");
          return;
        }

        if (userLocation?.lat != null && userLocation?.lng != null) {
          const nearbyResponse = await getNearbyDoctorsWithProgressiveRadius({
            lat: userLocation.lat,
            lng: userLocation.lng,
            signal: controller.signal,
            onRadiusExpand: (radius) => {
              setSearchStatus(`No doctors found within ${radius} meters, expanding search...`);
            },
          });

          if (nearbyResponse.doctors.length > 0) {
            setDoctors(nearbyResponse.doctors);
            setRadiusUsed(nearbyResponse.radiusUsed);
            setSearchSource(nearbyResponse.source);
            setSearchStatus("");
            return;
          }

          const fallback = getDoctorsForCondition(primaryCondition, userLocation.lat, userLocation.lng).map((doctor) => ({
            ...doctor,
            within500m: doctor.distance != null && doctor.distance <= 500,
            source: "local",
          }));
          setDoctors(fallback);
          setRadiusUsed(nearbyResponse.radiusUsed);
          setSearchSource("local_fallback");
          setSearchStatus(`No doctors found within ${nearbyResponse.radiusUsed} meters from OpenStreetMap.`);
          return;
        }

        const generic = getDoctorsForCondition(primaryCondition, null, null).map((doctor) => ({
          ...doctor,
          source: "local",
        }));
        setDoctors(generic);
        setRadiusUsed(null);
        setSearchSource("local");
      } catch (error) {
        if (error.name === "AbortError") return;

        const fallback = getDoctorsForCondition(primaryCondition, userLocation?.lat, userLocation?.lng).map((doctor) => ({
          ...doctor,
          within500m: doctor.distance != null && doctor.distance <= 500,
          source: "local",
        }));
        setDoctors(fallback);
        setSearchSource("local_fallback");
        setSearchStatus("Unable to reach OpenStreetMap right now. Showing cached local doctor list.");
      } finally {
        setDoctorsLoading(false);
      }
    }

    loadDoctors();
    return () => controller.abort();
  }, [primaryCondition, selectedCity, userLocation]);

  const closestDoctor = useMemo(() => {
    if (!userLocation || selectedCity || doctors.length === 0) return null;
    return doctors[0];
  }, [doctors, selectedCity, userLocation]);

  const displayedDoctors = showAll ? doctors : doctors.slice(0, 6);
  const cities = getAllCities();

  return (
    <>
      {/* Hero */}
      <div className="panel panel-hero" style={{ marginBottom: "var(--space-6)" }}>
        <h1>Find a Doctor Near You</h1>
        <p>
          {primaryCondition
            ? <>Based on your screening result — <strong>{conditionLabel}</strong> — here are specialists who can help.</>
            : <>Browse verified doctors for women's health concerns across India.</>}
        </p>
      </div>

      {/* Location Status */}
      <section className="panel" style={{ marginBottom: "var(--space-4)" }}>
        <div className="panel-header">
          <div>
            <h2>Nearby Specialists</h2>
            <p>Curated healthcare providers for your health profile</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {locationLoading && (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                📍 Detecting location...
              </span>
            )}
            {doctorsLoading && (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Loading nearby doctors from OpenStreetMap...
              </span>
            )}
            {!locationLoading && userLocation && (
              <span className="indicator-badge high" style={{ fontSize: "var(--text-xs)" }}>
                📍 Live location active
              </span>
            )}
            {!locationLoading && locationError && (
              <span className="indicator-badge low" style={{ fontSize: "var(--text-xs)" }}>
                📍 Using city filter
              </span>
            )}
          </div>
        </div>

        {/* City Filter */}
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-5)" }}>
          <button
            className={`btn btn-sm ${!selectedCity ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedCity("")}
          >
            Near Me {userLocation ? "📍" : ""}
          </button>
          {cities.map((city) => (
            <button
              key={city}
              className={`btn btn-sm ${selectedCity === city ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </button>
          ))}
        </div>

        {locationError && (
          <div className="alert alert-warning" style={{ marginBottom: "var(--space-4)" }}>
            <span>ℹ️</span> {locationError} Use the city filters above to browse doctors.
          </div>
        )}

        {searchStatus && !selectedCity && (
          <div className="alert alert-warning" style={{ marginBottom: "var(--space-4)" }}>
            <span>🔎</span> {searchStatus}
          </div>
        )}

        {closestDoctor && (
          <div className="alert" style={{ marginBottom: "var(--space-4)", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-lg)" }}>🎯</span>
            <div>
              <strong>Closest doctor near you:</strong> {closestDoctor.name} ({formatDistanceAway(closestDoctor.distance)})
              {closestDoctor.within500m ? " • within 500 meters" : ""}
              {radiusUsed ? ` • search radius used: ${radiusUsed}m` : ""}
              {searchSource === "overpass_osm" ? " • powered by OpenStreetMap Overpass" : " • local fallback data"}
            </div>
          </div>
        )}

        {/* Doctor Cards */}
        {doctorsLoading ? (
          <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-muted)" }}>
            <p>Fetching closest doctors for your current location...</p>
          </div>
        ) : displayedDoctors.length > 0 ? (
          <div className="doctors-grid">
            {displayedDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "var(--space-10)", color: "var(--color-text-muted)" }}>
            <div style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-3)" }}>👩‍⚕️</div>
            <p>No doctors found. Try selecting a city above.</p>
            <p style={{ fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}>
              Showing all {doctors.length} doctors — no matching filter.
            </p>
          </div>
        )}

        {/* Show More */}
        {doctors.length > 6 && (
          <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less ↑" : `Show All ${doctors.length} Doctors →`}
            </button>
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <div className="disclaimer" style={{ marginBottom: "var(--space-4)" }}>
        <span className="disclaimer-icon">ℹ️</span>
        <div>
          <strong>Not a referral or endorsement.</strong> Doctors listed here are curated based on specialty relevance. Always verify credentials and read patient reviews before booking. This is not a medical referral.
        </div>
      </div>

      {/* Navigation */}
      <div className="button-row">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary" onClick={() => navigate("/checkin")}>
          New Check-in
        </button>
      </div>
    </>
  );
}
