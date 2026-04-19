export const CONDITION_SPECIALTY_MAP = {
  iron_deficiency_anemia: "General Physician / Hematologist",
  hypothyroidism: "Endocrinologist",
  hyperthyroidism: "Endocrinologist",
  pcos: "Gynecologist",
  pcod: "Gynecologist",
  endometriosis_tendency: "Gynecologist",
};

export const DOCTORS = [
  // ---- Delhi NCR ----
  {
    id: "d001",
    name: "Dr. Priya Sharma",
    specialty: "Gynecologist",
    conditions: ["pcos", "pcod", "endometriosis_tendency"],
    city: "Delhi",
    area: "Vasant Kunj",
    clinic: "Women Care Clinic",
    address: "Plot 45, Sector 9, Vasant Kunj, New Delhi",
    phone: "+91-11-45678900",
    rating: 4.8,
    reviews: 324,
    experience: 15,
    consultationFee: 800,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 28.5245,
    lng: 77.1373,
  },
  {
    id: "d002",
    name: "Dr. Anita Gupta",
    specialty: "Endocrinologist",
    conditions: ["hypothyroidism", "hyperthyroidism"],
    city: "Delhi",
    area: "Saket",
    clinic: "Endocrine & Diabetes Centre",
    address: "E-34, Saket District Centre, New Delhi",
    phone: "+91-11-45678901",
    rating: 4.9,
    reviews: 512,
    experience: 20,
    consultationFee: 1200,
    availability: "Mon-Fri",
    teleAvailable: true,
    lat: 28.5259,
    lng: 77.2088,
  },
  {
    id: "d003",
    name: "Dr. Meera Reddy",
    specialty: "Hematologist",
    conditions: ["iron_deficiency_anemia"],
    city: "Delhi",
    area: "Dwarka",
    clinic: "Blood & Health Centre",
    address: "C-12, Sector 6, Dwarka, New Delhi",
    phone: "+91-11-45678902",
    rating: 4.6,
    reviews: 198,
    experience: 12,
    consultationFee: 700,
    availability: "Tue-Sat",
    teleAvailable: false,
    lat: 28.5705,
    lng: 77.0468,
  },
  {
    id: "d004",
    name: "Dr. Sunita Kapoor",
    specialty: "General Physician",
    conditions: ["iron_deficiency_anemia"],
    city: "Delhi",
    area: "Rohini",
    clinic: "Kapoor Health Centre",
    address: "B-5, Sector 11, Rohini, New Delhi",
    phone: "+91-11-45678903",
    rating: 4.5,
    reviews: 445,
    experience: 18,
    consultationFee: 500,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 28.7327,
    lng: 77.1154,
  },
  // ---- Mumbai ----
  {
    id: "d005",
    name: "Dr. Kavita Iyer",
    specialty: "Gynecologist",
    conditions: ["pcos", "pcod", "endometriosis_tendency"],
    city: "Mumbai",
    area: "Andheri West",
    clinic: "Women's Health Hub",
    address: "203,曜 Andheri West, Mumbai 400053",
    phone: "+91-22-45678910",
    rating: 4.7,
    reviews: 289,
    experience: 14,
    consultationFee: 900,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 19.1355,
    lng: 72.8295,
  },
  {
    id: "d006",
    name: "Dr. Rajesh Menon",
    specialty: "Endocrinologist",
    conditions: ["hypothyroidism", "hyperthyroidism"],
    city: "Mumbai",
    area: "Bandra East",
    clinic: "ThyroCare Clinic",
    address: "15A, Bandra Kurla Complex, Mumbai 400051",
    phone: "+91-22-45678911",
    rating: 4.8,
    reviews: 634,
    experience: 22,
    consultationFee: 1100,
    availability: "Mon-Fri",
    teleAvailable: true,
    lat: 19.0607,
    lng: 72.8644,
  },
  {
    id: "d007",
    name: "Dr. Deepa Nair",
    specialty: "Hematologist",
    conditions: ["iron_deficiency_anemia"],
    city: "Mumbai",
    area: "Powai",
    clinic: "Hematology & Wellness Centre",
    address: "H-201, Lake Home, Powai, Mumbai 400076",
    phone: "+91-22-45678912",
    rating: 4.6,
    reviews: 167,
    experience: 10,
    consultationFee: 750,
    availability: "Wed-Sat",
    teleAvailable: false,
    lat: 19.1186,
    lng: 72.9061,
  },
  {
    id: "d008",
    name: "Dr. Anjali Desai",
    specialty: "Gynecologist",
    conditions: ["pcos", "pcod", "endometriosis_tendency"],
    city: "Mumbai",
    area: "Juhu",
    clinic: "Juhu Women's Clinic",
    address: "12, Juhu Tara Road, Mumbai 400049",
    phone: "+91-22-45678913",
    rating: 4.9,
    reviews: 401,
    experience: 17,
    consultationFee: 1000,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 19.0969,
    lng: 72.8263,
  },
  // ---- Bangalore ----
  {
    id: "d009",
    name: "Dr. Lavanya Rao",
    specialty: "Gynecologist",
    conditions: ["pcos", "pcod", "endometriosis_tendency"],
    city: "Bangalore",
    area: "Koramangala",
    clinic: "Femina Health Centre",
    address: "567, 5th Block, Koramangala, Bangalore 560095",
    phone: "+91-80-45678920",
    rating: 4.8,
    reviews: 478,
    experience: 16,
    consultationFee: 850,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    id: "d010",
    name: "Dr. Suresh Bhat",
    specialty: "Endocrinologist",
    conditions: ["hypothyroidism", "hyperthyroidism"],
    city: "Bangalore",
    area: "Indiranagar",
    clinic: "Bangalore Thyroid & Hormone Centre",
    address: "100 FT Road, Indiranagar, Bangalore 560038",
    phone: "+91-80-45678921",
    rating: 4.7,
    reviews: 522,
    experience: 19,
    consultationFee: 950,
    availability: "Mon-Fri",
    teleAvailable: true,
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    id: "d011",
    name: "Dr. Geetha Krishnan",
    specialty: "Hematologist",
    conditions: ["iron_deficiency_anemia"],
    city: "Bangalore",
    area: "HSR Layout",
    clinic: "Blood Health Clinic",
    address: "22, 27th Cross, HSR Layout, Bangalore 560102",
    phone: "+91-80-45678922",
    rating: 4.5,
    reviews: 203,
    experience: 11,
    consultationFee: 650,
    availability: "Tue-Sat",
    teleAvailable: false,
    lat: 12.9121,
    lng: 77.6446,
  },
  {
    id: "d012",
    name: "Dr. Preethi Shenoy",
    specialty: "General Physician",
    conditions: ["iron_deficiency_anemia"],
    city: "Bangalore",
    area: "Whitefield",
    clinic: "Wellness First Clinic",
    address: "EPIP Zone, Whitefield, Bangalore 560066",
    phone: "+91-80-45678923",
    rating: 4.6,
    reviews: 311,
    experience: 13,
    consultationFee: 550,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 12.9698,
    lng: 77.7499,
  },
  // ---- Hyderabad ----
  {
    id: "d013",
    name: "Dr. Radhika Reddy",
    specialty: "Gynecologist",
    conditions: ["pcos", "pcod", "endometriosis_tendency"],
    city: "Hyderabad",
    area: "Banjara Hills",
    clinic: "Reddy Women's Hospital",
    address: "Road No. 12, Banjara Hills, Hyderabad 500034",
    phone: "+91-40-45678930",
    rating: 4.9,
    reviews: 389,
    experience: 18,
    consultationFee: 900,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 17.4126,
    lng: 78.4375,
  },
  {
    id: "d014",
    name: "Dr. Vikram Singh",
    specialty: "Endocrinologist",
    conditions: ["hypothyroidism", "hyperthyroidism"],
    city: "Hyderabad",
    area: "Jubilee Hills",
    clinic: "Endocrine Health Centre",
    address: "402, Jubilee Hills Road No. 5, Hyderabad 500033",
    phone: "+91-40-45678931",
    rating: 4.7,
    reviews: 445,
    experience: 16,
    consultationFee: 1000,
    availability: "Mon-Fri",
    teleAvailable: true,
    lat: 17.4018,
    lng: 78.4233,
  },
  {
    id: "d015",
    name: "Dr. Fatima Khan",
    specialty: "Hematologist",
    conditions: ["iron_deficiency_anemia"],
    city: "Hyderabad",
    area: "Gachibowli",
    clinic: "Life Blood Diagnostics",
    address: "3rd Floor, Inorbit Mall Road, Gachibowli, Hyderabad 500032",
    phone: "+91-40-45678932",
    rating: 4.4,
    reviews: 156,
    experience: 9,
    consultationFee: 600,
    availability: "Wed-Sun",
    teleAvailable: false,
    lat: 17.4401,
    lng: 78.3489,
  },
  // ---- Pune ----
  {
    id: "d016",
    name: "Dr. Sneha Joshi",
    specialty: "Gynecologist",
    conditions: ["pcos", "pcod", "endometriosis_tendency"],
    city: "Pune",
    area: "Kothrud",
    clinic: "Joshi Women's Clinic",
    address: "Shop 12, Kothrud Depot Road, Pune 411038",
    phone: "+91-20-45678940",
    rating: 4.8,
    reviews: 267,
    experience: 14,
    consultationFee: 700,
    availability: "Mon-Sat",
    teleAvailable: true,
    lat: 18.5081,
    lng: 73.7991,
  },
  {
    id: "d017",
    name: "Dr. Amit Patil",
    specialty: "Endocrinologist",
    conditions: ["hypothyroidism", "hyperthyroidism"],
    city: "Pune",
    area: "Model Colony",
    clinic: "Pune Diabetes & Hormone Centre",
    address: "A-5, Model Colony, Shivaji Nagar, Pune 411016",
    phone: "+91-20-45678941",
    rating: 4.6,
    reviews: 338,
    experience: 15,
    consultationFee: 800,
    availability: "Mon-Fri",
    teleAvailable: true,
    lat: 18.5308,
    lng: 73.8585,
  },
  {
    id: "d018",
    name: "Dr. Nisha Deshmukh",
    specialty: "General Physician",
    conditions: ["iron_deficiency_anemia"],
    city: "Pune",
    area: "Viman Nagar",
    clinic: "Viman Health Clinic",
    address: "A-102, Phoenix Marketcity Road, Viman Nagar, Pune 411014",
    phone: "+91-20-45678942",
    rating: 4.5,
    reviews: 189,
    experience: 10,
    consultationFee: 450,
    availability: "Mon-Sat",
    teleAvailable: false,
    lat: 18.5679,
    lng: 73.9145,
  },
];

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADII_METERS = [150, 200, 500, 1000, 2000];

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceAway(distanceMeters) {
  if (distanceMeters == null || Number.isNaN(distanceMeters)) return "Distance unavailable";
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  return `${(distanceMeters / 1000).toFixed(1)} km away`;
}

function buildOverpassQuery(lat, lng, radiusMeters) {
  return `[out:json][timeout:20];node(around:${radiusMeters},${lat},${lng})["amenity"="doctors"];out body;`;
}

function formatOsmAddress(tags = {}) {
  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  const road = tags["addr:street"] || tags["addr:road"] || "";
  const houseNumber = tags["addr:housenumber"] || "";
  const suburb = tags["addr:suburb"] || "";
  const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "";
  const postcode = tags["addr:postcode"] || "";

  const line = [houseNumber, road, suburb, city, postcode].filter(Boolean).join(", ");
  return line || "Address unavailable";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchNearbyDoctorsAtRadius({ lat, lng, radiusMeters, signal }) {
  const query = buildOverpassQuery(lat, lng, radiusMeters);

  const response = await fetch(OVERPASS_API_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
    body: query,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Overpass API failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const elements = Array.isArray(payload.elements) ? payload.elements : [];

  const mapped = elements
    .map((element) => {
      const doctorLat = element?.lat;
      const doctorLng = element?.lon;
      const hasCoordinates = typeof doctorLat === "number" && typeof doctorLng === "number";
      const distance = hasCoordinates ? haversineDistance(lat, lng, doctorLat, doctorLng) : null;
      const tags = element?.tags || {};
      const fallbackName = tags.operator || tags.healthcare || "Nearby Doctor";

      return {
        id: element.id ? `osm-${element.id}` : `osm-${Math.random().toString(36).slice(2, 10)}`,
        name: tags.name || fallbackName,
        specialty: "Doctor",
        rating: null,
        reviews: 0,
        address: formatOsmAddress(tags),
        city: tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "",
        area: tags["addr:suburb"] || "",
        clinic: tags.name || fallbackName,
        phone: tags.phone || tags["contact:phone"] || "",
        experience: null,
        consultationFee: null,
        availability: "Not available",
        teleAvailable: Boolean(tags.website || tags["contact:website"]),
        lat: hasCoordinates ? doctorLat : null,
        lng: hasCoordinates ? doctorLng : null,
        distance,
        within500m: distance != null && distance <= 500,
        source: "overpass_osm",
      };
    })
    .filter((doctor) => doctor.distance != null)
    .sort((a, b) => a.distance - b.distance);

  return mapped;
}

export async function getNearbyDoctorsWithProgressiveRadius({ lat, lng, signal, onRadiusExpand }) {
  const searchedRadii = [];
  for (const radius of SEARCH_RADII_METERS) {
    if (searchedRadii.length > 0) {
      await delay(300);
    }

    searchedRadii.push(radius);
    const doctors = await fetchNearbyDoctorsAtRadius({
      lat,
      lng,
      radiusMeters: radius,
      signal,
    });

    if (doctors.length > 0) {
      return {
        doctors,
        radiusUsed: radius,
        searchedRadii,
        source: "overpass_osm",
      };
    }

    if (typeof onRadiusExpand === "function") {
      onRadiusExpand(radius);
    }
  }

  return {
    doctors: [],
    radiusUsed: SEARCH_RADII_METERS[SEARCH_RADII_METERS.length - 1],
    searchedRadii,
    source: "overpass_osm",
  };
}

export function getDoctorsForCondition(condition, userLat, userLng) {
  const specialty = CONDITION_SPECIALTY_MAP[condition];

  let filtered = DOCTORS;
  if (specialty) {
    filtered = DOCTORS.filter((d) => d.specialty === specialty);
  }

  const withDistance = filtered.map((doctor) => {
    let distance = null;
    if (userLat != null && userLng != null && doctor.lat && doctor.lng) {
      distance = haversineDistance(userLat, userLng, doctor.lat, doctor.lng);
    }
    return { ...doctor, distance };
  });

  if (userLat != null && userLng != null) {
    withDistance.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
  }

  return withDistance;
}

export function getAllCities() {
  return [...new Set(DOCTORS.map((d) => d.city))].sort();
}

export function getDoctorsByCity(city, condition) {
  const specialty = CONDITION_SPECIALTY_MAP[condition];
  let filtered = DOCTORS.filter((d) => d.city === city);
  if (specialty) {
    filtered = filtered.filter((d) => d.specialty === specialty);
  }
  return filtered;
}
