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
  Gynecologist: { bg: "#FFF1F2", color: "#E11D48" },
  Endocrinologist: { bg: "#EFF6FF", color: "#2563EB" },
  Hematologist: { bg: "#F5F3FF", color: "#7C6FCD" },
  "General Physician": { bg: "#F0FDF4", color: "#16A34A" },
};

function StarRating({ rating, reviews }) {
  if (!rating) {
    return <span style={{ color: "#94A3B8", fontSize: "12px" }}>No ratings yet</span>;
  }

  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      <div style={{ display: "flex", gap: "1px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < full ? "#F59E0B" : i === full && half ? "#F59E0B" : "#E2E8F0", fontSize: "14px" }}>
            ★
          </span>
        ))}
      </div>
      <span style={{ marginLeft: "6px", fontWeight: 700, color: "#1E293B", fontSize: "13px" }}>
        {rating.toFixed(1)}
      </span>
      <span style={{ color: "#94A3B8", fontSize: "12px" }}>({reviews})</span>
    </div>
  );
}

function DoctorCard({ doctor }) {
  const specialtyStyle = SPECIALTY_COLORS[doctor.specialty] || { bg: "#F8FAFC", color: "#64748B" };

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
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
  }

  return (
    <div style={{ 
      background: '#FFFFFF', 
      borderRadius: '24px', 
      padding: '24px', 
      border: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: `linear-gradient(135deg, ${specialtyStyle.color}20, ${specialtyStyle.color}10)`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 800,
            color: specialtyStyle.color,
            border: `1px solid ${specialtyStyle.color}20`
          }}>
            {doctor.name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("")}
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>{doctor.name}</h3>
            <span style={{ 
              display: "inline-block", 
              padding: "4px 10px", 
              borderRadius: "8px", 
              fontSize: "11px", 
              fontWeight: 700, 
              background: specialtyStyle.bg, 
              color: specialtyStyle.color,
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              {doctor.specialty}
            </span>
            <div style={{ marginTop: '8px' }}>
              <StarRating rating={doctor.rating} reviews={doctor.reviews} />
            </div>
          </div>
        </div>
        {doctor.distance != null && (
          <div style={{ 
            padding: '4px 10px', 
            background: '#F8FAFC', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 700, 
            color: '#64748B',
            border: '1px solid #E2E8F0'
          }}>
            {formatDistanceAway(doctor.distance)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(doctor.area || doctor.city) && (
          <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#475569' }}>
            <span>📍</span> <span>{[doctor.area, doctor.city].filter(Boolean).join(", ")}</span>
          </div>
        )}
        {doctor.clinic && (
          <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#475569' }}>
            <span>🏥</span> <span>{doctor.clinic}</span>
          </div>
        )}
        {doctor.experience != null && (
          <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#475569' }}>
            <span>💼</span> <span>{doctor.experience} years experience</span>
          </div>
        )}
        {doctor.consultationFee != null && (
          <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
            <span>💰</span> <span>₹{doctor.consultationFee} Consultation</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
        <button 
          onClick={handleCall} 
          disabled={!doctor.phone}
          style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#0F172A', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          Call
        </button>
        <button 
          onClick={handleWhatsApp} 
          disabled={!doctor.phone}
          style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#25D366', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          WhatsApp
        </button>
        <button 
          onClick={handleDirections}
          style={{ padding: '10px 14px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          🧭
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
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        if (!lastCoordsRef.current) {
          lastCoordsRef.current = next;
          setUserLocation(next);
          setLocationError("");
          setLocationLoading(false);
          return;
        }
        const movedKm = haversineDistance(lastCoordsRef.current.lat, lastCoordsRef.current.lng, next.lat, next.lng);
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
            const distance = userLocation?.lat != null && userLocation?.lng != null && doctor.lat && doctor.lng
                ? haversineDistance(userLocation.lat, userLocation.lng, doctor.lat, doctor.lng) : null;
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
            onRadiusExpand: (radius) => setSearchStatus(`Expanding search to ${radius} meters...`),
          });
          if (nearbyResponse.doctors.length > 0) {
            setDoctors(nearbyResponse.doctors);
            setRadiusUsed(nearbyResponse.radiusUsed);
            setSearchSource(nearbyResponse.source);
            setSearchStatus("");
            return;
          }
          const fallback = getDoctorsForCondition(primaryCondition, userLocation.lat, userLocation.lng).map((doctor) => ({
            ...doctor, within500m: doctor.distance != null && doctor.distance <= 500, source: "local",
          }));
          setDoctors(fallback);
          setRadiusUsed(nearbyResponse.radiusUsed);
          setSearchSource("local_fallback");
          return;
        }
        const generic = getDoctorsForCondition(primaryCondition, null, null).map((doctor) => ({ ...doctor, source: "local" }));
        setDoctors(generic);
        setRadiusUsed(null);
        setSearchSource("local");
      } catch (error) {
        if (error.name === "AbortError") return;
        const fallback = getDoctorsForCondition(primaryCondition, userLocation?.lat, userLocation?.lng).map((doctor) => ({
          ...doctor, within500m: doctor.distance != null && doctor.distance <= 500, source: "local",
        }));
        setDoctors(fallback);
        setSearchSource("local_fallback");
        setSearchStatus("Offline mode: showing local doctor data.");
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── HERO SECTION ── */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Find a Doctor Near You
        </h1>
        <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          {primaryCondition
            ? <>Specialists curated for <strong>{conditionLabel}</strong> near your current location.</>
            : <>Browse verified healthcare providers for women's health concerns across India.</>}
        </p>
      </div>

      {/* ── FILTER & STATUS PANEL ── */}
      <section style={{ 
        maxWidth: '1000px', 
        margin: '0 auto 32px', 
        background: '#FFFFFF', 
        borderRadius: '28px', 
        padding: '32px', 
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Nearby Specialists</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: locationLoading || doctorsLoading ? '#EAB308' : '#10B981', animation: locationLoading || doctorsLoading ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                {locationLoading ? "Detecting location..." : doctorsLoading ? "Updating results..." : userLocation ? "Live location active" : "Using city filter"}
              </span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedCity("")}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: !selectedCity ? '#7C6FCD' : '#FFFFFF',
                color: !selectedCity ? '#FFFFFF' : '#64748B',
                border: `1px solid ${!selectedCity ? '#7C6FCD' : '#E2E8F0'}`,
                transition: 'all 0.2s'
              }}
            >
              Near Me 📍
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedCity === city ? '#7C6FCD' : '#FFFFFF',
                  color: selectedCity === city ? '#FFFFFF' : '#64748B',
                  border: `1px solid ${selectedCity === city ? '#7C6FCD' : '#E2E8F0'}`,
                  transition: 'all 0.2s'
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {locationError && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', color: '#92400E', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px', fontSize: '13px', display: 'flex', gap: '10px' }}>
            <span>ℹ️</span> {locationError}
          </div>
        )}

        {searchStatus && !selectedCity && (
          <div style={{ background: '#F5F3FF', border: '1px solid #EDE9FE', color: '#7C6FCD', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px', fontSize: '13px', display: 'flex', gap: '10px' }}>
            <span>🔎</span> {searchStatus}
          </div>
        )}

        {closestDoctor && !doctorsLoading && (
          <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', color: '#16A34A', padding: '14px 18px', borderRadius: '14px', marginBottom: '32px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <div>
              <strong>Found:</strong> {closestDoctor.name} is the closest specialist ({formatDistanceAway(closestDoctor.distance)})
            </div>
          </div>
        )}

        {/* ── DOCTORS GRID ── */}
        {doctorsLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
            <div className="loader" style={{ marginBottom: '16px' }}>⏳</div>
            <p style={{ fontSize: '14px' }}>Fetching the best medical professionals for you...</p>
          </div>
        ) : displayedDoctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
            {displayedDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>👩‍⚕️</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2A1F4E' }}>No matching doctors found</h3>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '300px', margin: '8px auto 0' }}>Try changing your city or search "Near Me" if location is enabled.</p>
          </div>
        )}

        {/* Pagination */}
        {doctors.length > 6 && !doctorsLoading && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{ padding: '12px 28px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {showAll ? "Show Less" : `Show All ${doctors.length} Doctors`}
            </button>
          </div>
        )}
      </section>

      {/* ── DISCLAIMER ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 40px', padding: '24px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '20px', fontSize: '13px', color: '#64748B', display: 'flex', gap: '16px', lineHeight: 1.6 }}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <p style={{ margin: 0 }}>
          <strong>Professional Guidance:</strong> The doctors listed are curated based on specialty relevance to your screening. This list is provided for convenience and does not constitute a referral, medical advice, or endorsement. Please verify professional credentials, availability, and insurance independently.
        </p>
      </div>

      {/* ── FOOTER NAVIGATION ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '60px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '14px 28px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
          ← Back
        </button>
        <button onClick={() => navigate("/checkin")} style={{ padding: '14px 32px', borderRadius: '16px', background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(124, 111, 205, 0.2)' }}>
          New Check-in
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}