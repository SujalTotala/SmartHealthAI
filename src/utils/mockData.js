// SmartHealth AI - Mock Data & State Management Logic

export const INITIAL_MEDICINES_LIBRARY = [
  { id: "med_paracetamol", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", defaultThreshold: 200 },
  { id: "med_amoxicillin", name: "Amoxicillin 500mg", category: "Antibiotic", defaultThreshold: 150 },
  { id: "med_metformin", name: "Metformin 500mg", category: "Antidiabetic", defaultThreshold: 100 },
  { id: "med_cetirizine", name: "Cetirizine 10mg", category: "Antihistamine", defaultThreshold: 100 },
  { id: "med_amlodipine", name: "Amlodipine 5mg", category: "Antihypertensive", defaultThreshold: 120 },
  { id: "med_ors", name: "ORS Packets", category: "Oral Rehydration", defaultThreshold: 250 },
  { id: "med_ibuprofen", name: "Ibuprofen 400mg", category: "NSAID", defaultThreshold: 150 },
  { id: "med_cough_syrup", name: "Cough Syrup 100ml", category: "Antitussive", defaultThreshold: 80 }
];

export const initialHealthCentres = [
  {
    id: "phc_khuldabad",
    name: "PHC Khuldabad",
    type: "PHC",
    district: "Aurangabad District (West)",
    coordinates: { x: 35, y: 30 }, // for geographical rendering
    beds: {
      general: { total: 20, occupied: 18 },
      icu: { total: 4, occupied: 4 }, // FULL warning
      pediatric: { total: 8, occupied: 3 },
      emergency: { total: 5, occupied: 3 }
    },
    medicines: [
      { id: "med_paracetamol", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", stock: 80, dailyRate: 25, expiryDate: "2026-09-12", threshold: 200 }, // LOW STOCK & EXPIRING
      { id: "med_amoxicillin", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 220, dailyRate: 15, expiryDate: "2026-12-05", threshold: 150 },
      { id: "med_metformin", name: "Metformin 500mg", category: "Antidiabetic", stock: 45, dailyRate: 10, expiryDate: "2026-08-20", threshold: 100 }, // LOW STOCK & EXPIRING SOON
      { id: "med_cetirizine", name: "Cetirizine 10mg", category: "Antihistamine", stock: 320, dailyRate: 12, expiryDate: "2027-02-15", threshold: 100 },
      { id: "med_amlodipine", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 190, dailyRate: 14, expiryDate: "2027-04-20", threshold: 120 },
      { id: "med_ors", name: "ORS Packets", category: "Oral Rehydration", stock: 95, dailyRate: 35, expiryDate: "2026-08-01", threshold: 250 }, // LOW STOCK & EXPIRING VERY SOON
      { id: "med_ibuprofen", name: "Ibuprofen 400mg", category: "NSAID", stock: 210, dailyRate: 18, expiryDate: "2026-10-18", threshold: 150 },
      { id: "med_cough_syrup", name: "Cough Syrup 100ml", category: "Antitussive", stock: 150, dailyRate: 10, expiryDate: "2026-07-28", threshold: 80 }
    ],
    doctors: [
      { id: "doc_101", name: "Dr. Aarav Sharma", specialty: "General Medicine", status: "Present", checkIn: "08:55 AM", checkOut: "--", attendanceRate: 94, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_102", name: "Dr. Priya Patel", specialty: "Pediatrics", status: "Present", checkIn: "09:02 AM", checkOut: "--", attendanceRate: 97, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_103", name: "Dr. Rohan Joshi", specialty: "Gynecology", status: "Absent", checkIn: "--", checkOut: "--", attendanceRate: 68, absenteeismRisk: "High", shift: "Night" } // HIGH RISK ABSENTEE
    ],
    patients: {
      todayCount: 145,
      waitingTime: 32,
      peakHours: "10:00 AM - 01:00 PM",
      departmentLoad: { General: 65, Pediatrics: 35, Gynecology: 25, Emergency: 20 }
    },
    diagnostics: [
      { id: "diag_blood", name: "Blood Test", status: "Operational", averageTime: "45 mins", queueSize: 14 },
      { id: "diag_xray", name: "X-Ray", status: "Operational", averageTime: "30 mins", queueSize: 6 },
      { id: "diag_ecg", name: "ECG", status: "Operational", averageTime: "15 mins", queueSize: 3 },
      { id: "diag_ct", name: "CT Scan", status: "Unavailable", averageTime: "--", queueSize: 0 }, // Not available at small PHCs
      { id: "diag_ultra", name: "Ultrasound", status: "Equipment Failure", averageTime: "--", queueSize: 8 } // FAILURE ALERT
    ]
  },
  {
    id: "phc_vaijapur",
    name: "PHC Vaijapur",
    type: "PHC",
    district: "Aurangabad District (South)",
    coordinates: { x: 55, y: 70 },
    beds: {
      general: { total: 15, occupied: 6 },
      icu: { total: 2, occupied: 0 },
      pediatric: { total: 6, occupied: 1 },
      emergency: { total: 4, occupied: 1 }
    },
    medicines: [
      { id: "med_paracetamol", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", stock: 850, dailyRate: 18, expiryDate: "2027-05-18", threshold: 200 }, // SURPLUS (can supply Khuldabad)
      { id: "med_amoxicillin", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 90, dailyRate: 12, expiryDate: "2026-11-20", threshold: 150 }, // LOW STOCK
      { id: "med_metformin", name: "Metformin 500mg", category: "Antidiabetic", stock: 400, dailyRate: 8, expiryDate: "2027-01-10", threshold: 100 }, // SURPLUS
      { id: "med_cetirizine", name: "Cetirizine 10mg", category: "Antihistamine", stock: 80, dailyRate: 15, expiryDate: "2026-09-30", threshold: 100 }, // LOW STOCK
      { id: "med_amlodipine", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 320, dailyRate: 10, expiryDate: "2027-08-14", threshold: 120 },
      { id: "med_ors", name: "ORS Packets", category: "Oral Rehydration", stock: 680, dailyRate: 20, expiryDate: "2027-03-22", threshold: 250 }, // SURPLUS (can supply Khuldabad)
      { id: "med_ibuprofen", name: "Ibuprofen 400mg", category: "NSAID", stock: 110, dailyRate: 15, expiryDate: "2026-08-30", threshold: 150 }, // LOW STOCK
      { id: "med_cough_syrup", name: "Cough Syrup 100ml", category: "Antitussive", stock: 95, dailyRate: 12, expiryDate: "2026-12-10", threshold: 80 }
    ],
    doctors: [
      { id: "doc_201", name: "Dr. Sandeep Naik", specialty: "General Medicine", status: "Present", checkIn: "08:45 AM", checkOut: "--", attendanceRate: 91, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_202", name: "Dr. Ananya Deshmukh", specialty: "Obstetrics", status: "On Leave", checkIn: "--", checkOut: "--", attendanceRate: 88, absenteeismRisk: "Medium", shift: "Morning" }
    ],
    patients: {
      todayCount: 64,
      waitingTime: 12,
      peakHours: "09:00 AM - 11:30 AM",
      departmentLoad: { General: 32, Pediatrics: 12, Gynecology: 15, Emergency: 5 }
    },
    diagnostics: [
      { id: "diag_blood", name: "Blood Test", status: "Operational", averageTime: "30 mins", queueSize: 3 },
      { id: "diag_xray", name: "X-Ray", status: "Operational", averageTime: "20 mins", queueSize: 2 },
      { id: "diag_ecg", name: "ECG", status: "Operational", averageTime: "10 mins", queueSize: 1 },
      { id: "diag_ct", name: "CT Scan", status: "Unavailable", averageTime: "--", queueSize: 0 },
      { id: "diag_ultra", name: "Ultrasound", status: "Operational", averageTime: "40 mins", queueSize: 2 }
    ]
  },
  {
    id: "chc_paithan",
    name: "CHC Paithan",
    type: "CHC",
    district: "Aurangabad District (Central)",
    coordinates: { x: 50, y: 45 },
    beds: {
      general: { total: 50, occupied: 42 },
      icu: { total: 10, occupied: 6 },
      pediatric: { total: 15, occupied: 9 },
      emergency: { total: 10, occupied: 8 }
    },
    medicines: [
      { id: "med_paracetamol", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", stock: 1200, dailyRate: 60, expiryDate: "2027-02-14", threshold: 400 },
      { id: "med_amoxicillin", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 850, dailyRate: 40, expiryDate: "2027-01-25", threshold: 300 },
      { id: "med_metformin", name: "Metformin 500mg", category: "Antidiabetic", stock: 540, dailyRate: 25, expiryDate: "2026-11-15", threshold: 200 },
      { id: "med_cetirizine", name: "Cetirizine 10mg", category: "Antihistamine", stock: 610, dailyRate: 22, expiryDate: "2027-06-12", threshold: 200 },
      { id: "med_amlodipine", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 450, dailyRate: 28, expiryDate: "2027-03-10", threshold: 240 },
      { id: "med_ors", name: "ORS Packets", category: "Oral Rehydration", stock: 1500, dailyRate: 80, expiryDate: "2027-05-30", threshold: 500 },
      { id: "med_ibuprofen", name: "Ibuprofen 400mg", category: "NSAID", stock: 720, dailyRate: 35, expiryDate: "2027-01-18", threshold: 300 },
      { id: "med_cough_syrup", name: "Cough Syrup 100ml", category: "Antitussive", stock: 420, dailyRate: 30, expiryDate: "2026-12-08", threshold: 160 }
    ],
    doctors: [
      { id: "doc_301", name: "Dr. Vikas Mahajan", specialty: "General Surgeon", status: "Present", checkIn: "08:30 AM", checkOut: "--", attendanceRate: 98, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_302", name: "Dr. Sneha Kulkarni", specialty: "Pediatrician", status: "Present", checkIn: "08:50 AM", checkOut: "--", attendanceRate: 95, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_303", name: "Dr. Amit Shinde", specialty: "Anesthesiologist", status: "Present", checkIn: "09:15 AM", checkOut: "--", attendanceRate: 92, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_304", name: "Dr. Kavita Rao", specialty: "Gynecologist", status: "Absent", checkIn: "--", checkOut: "--", attendanceRate: 74, absenteeismRisk: "Medium", shift: "Night" }
    ],
    patients: {
      todayCount: 312,
      waitingTime: 45, // HIGH WAIT TIME
      peakHours: "10:30 AM - 02:30 PM",
      departmentLoad: { General: 140, Pediatrics: 72, Gynecology: 50, Emergency: 50 }
    },
    diagnostics: [
      { id: "diag_blood", name: "Blood Test", status: "Operational", averageTime: "40 mins", queueSize: 22 },
      { id: "diag_xray", name: "X-Ray", status: "Operational", averageTime: "25 mins", queueSize: 11 },
      { id: "diag_ecg", name: "ECG", status: "Operational", averageTime: "15 mins", queueSize: 8 },
      { id: "diag_ct", name: "CT Scan", status: "Operational", averageTime: "60 mins", queueSize: 5 },
      { id: "diag_ultra", name: "Ultrasound", status: "Operational", averageTime: "45 mins", queueSize: 9 }
    ]
  },
  {
    id: "phc_kannad",
    name: "PHC Kannad",
    type: "PHC",
    district: "Aurangabad District (North)",
    coordinates: { x: 25, y: 15 },
    beds: {
      general: { total: 18, occupied: 15 },
      icu: { total: 3, occupied: 2 },
      pediatric: { total: 6, occupied: 5 }, // HIGH OCCUPANCY
      emergency: { total: 5, occupied: 4 }
    },
    medicines: [
      { id: "med_paracetamol", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", stock: 350, dailyRate: 20, expiryDate: "2026-11-30", threshold: 200 },
      { id: "med_amoxicillin", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 380, dailyRate: 15, expiryDate: "2027-02-14", threshold: 150 }, // SURPLUS (can supply Vaijapur)
      { id: "med_metformin", name: "Metformin 500mg", category: "Antidiabetic", stock: 80, dailyRate: 11, expiryDate: "2026-09-02", threshold: 100 }, // LOW STOCK
      { id: "med_cetirizine", name: "Cetirizine 10mg", category: "Antihistamine", stock: 450, dailyRate: 14, expiryDate: "2027-01-20", threshold: 100 }, // SURPLUS (can supply Vaijapur)
      { id: "med_amlodipine", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 110, dailyRate: 12, expiryDate: "2026-10-05", threshold: 120 }, // LOW STOCK
      { id: "med_ors", name: "ORS Packets", category: "Oral Rehydration", stock: 190, dailyRate: 28, expiryDate: "2026-08-25", threshold: 250 }, // LOW STOCK
      { id: "med_ibuprofen", name: "Ibuprofen 400mg", category: "NSAID", stock: 430, dailyRate: 16, expiryDate: "2027-03-05", threshold: 150 }, // SURPLUS (can supply Vaijapur)
      { id: "med_cough_syrup", name: "Cough Syrup 100ml", category: "Antitussive", stock: 75, dailyRate: 9, expiryDate: "2026-12-15", threshold: 80 } // LOW STOCK
    ],
    doctors: [
      { id: "doc_401", name: "Dr. Nidhi Gokhale", specialty: "General Medicine", status: "Present", checkIn: "08:58 AM", checkOut: "--", attendanceRate: 96, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_402", name: "Dr. Rajendra Prasad", specialty: "General Medicine", status: "Present", checkIn: "09:00 AM", checkOut: "--", attendanceRate: 93, absenteeismRisk: "Low", shift: "Morning" }
    ],
    patients: {
      todayCount: 112,
      waitingTime: 22,
      peakHours: "09:30 AM - 12:30 PM",
      departmentLoad: { General: 58, Pediatrics: 28, Gynecology: 14, Emergency: 12 }
    },
    diagnostics: [
      { id: "diag_blood", name: "Blood Test", status: "Operational", averageTime: "40 mins", queueSize: 8 },
      { id: "diag_xray", name: "X-Ray", status: "Equipment Failure", averageTime: "--", queueSize: 12 }, // FAILURE
      { id: "diag_ecg", name: "ECG", status: "Operational", averageTime: "15 mins", queueSize: 4 },
      { id: "diag_ct", name: "CT Scan", status: "Unavailable", averageTime: "--", queueSize: 0 },
      { id: "diag_ultra", name: "Ultrasound", status: "Operational", averageTime: "45 mins", queueSize: 5 }
    ]
  },
  {
    id: "chc_sillod",
    name: "CHC Sillod",
    type: "CHC",
    district: "Aurangabad District (East)",
    coordinates: { x: 75, y: 25 },
    beds: {
      general: { total: 40, occupied: 34 },
      icu: { total: 8, occupied: 7 }, // HIGH OCCUPANCY
      pediatric: { total: 10, occupied: 5 },
      emergency: { total: 8, occupied: 6 }
    },
    medicines: [
      { id: "med_paracetamol", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", stock: 950, dailyRate: 50, expiryDate: "2027-04-12", threshold: 350 },
      { id: "med_amoxicillin", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 650, dailyRate: 35, expiryDate: "2026-12-10", threshold: 250 },
      { id: "med_metformin", name: "Metformin 500mg", category: "Antidiabetic", stock: 380, dailyRate: 20, expiryDate: "2027-03-28", threshold: 200 },
      { id: "med_cetirizine", name: "Cetirizine 10mg", category: "Antihistamine", stock: 220, dailyRate: 18, expiryDate: "2026-08-10", threshold: 200 }, // LOW STOCK
      { id: "med_amlodipine", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 480, dailyRate: 22, expiryDate: "2027-07-02", threshold: 200 },
      { id: "med_ors", name: "ORS Packets", category: "Oral Rehydration", stock: 890, dailyRate: 65, expiryDate: "2026-10-30", threshold: 400 },
      { id: "med_ibuprofen", name: "Ibuprofen 400mg", category: "NSAID", stock: 520, dailyRate: 28, expiryDate: "2027-02-25", threshold: 250 },
      { id: "med_cough_syrup", name: "Cough Syrup 100ml", category: "Antitussive", stock: 340, dailyRate: 25, expiryDate: "2027-01-14", threshold: 150 }
    ],
    doctors: [
      { id: "doc_501", name: "Dr. Meera Nair", specialty: "General Medicine", status: "Present", checkIn: "08:40 AM", checkOut: "--", attendanceRate: 97, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_502", name: "Dr. Vinay Deshpande", specialty: "Pediatrician", status: "Present", checkIn: "08:48 AM", checkOut: "--", attendanceRate: 93, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_503", name: "Dr. Kiran Salunkhe", specialty: "Orthopedics", status: "Present", checkIn: "09:05 AM", checkOut: "--", attendanceRate: 91, absenteeismRisk: "Low", shift: "Morning" },
      { id: "doc_504", name: "Dr. Shreya Joshi", specialty: "Gynecology", status: "Present", checkIn: "09:12 AM", checkOut: "--", attendanceRate: 85, absenteeismRisk: "Medium", shift: "Night" }
    ],
    patients: {
      todayCount: 220,
      waitingTime: 38,
      peakHours: "10:00 AM - 01:30 PM",
      departmentLoad: { General: 95, Pediatrics: 50, Gynecology: 40, Emergency: 35 }
    },
    diagnostics: [
      { id: "diag_blood", name: "Blood Test", status: "Operational", averageTime: "30 mins", queueSize: 15 },
      { id: "diag_xray", name: "X-Ray", status: "Operational", averageTime: "20 mins", queueSize: 7 },
      { id: "diag_ecg", name: "ECG", status: "Operational", averageTime: "15 mins", queueSize: 4 },
      { id: "diag_ct", name: "CT Scan", status: "Operational", averageTime: "45 mins", queueSize: 2 },
      { id: "diag_ultra", name: "Ultrasound", status: "Operational", averageTime: "30 mins", queueSize: 6 }
    ]
  }
];

export const initialAlerts = [
  { id: "alert_1", type: "shortage", severity: "Emergency", centre: "PHC Khuldabad", title: "Critical Medicine Shortage", message: "Paracetamol 500mg is below threshold and will run out in 3.2 days.", time: "10 mins ago" },
  { id: "alert_2", type: "failure", severity: "Emergency", centre: "PHC Khuldabad", title: "Equipment Failure", message: "Ultrasound machine diagnostic scanner is down. Suggest redirecting patients to CHC Paithan.", time: "1 hour ago" },
  { id: "alert_3", type: "attendance", severity: "Warning", centre: "PHC Khuldabad", title: "Doctor Absent", message: "Dr. Rohan Joshi (Gynecologist) did not check in. shift coverage needed.", time: "2 hours ago" },
  { id: "alert_4", type: "shortage", severity: "Emergency", centre: "PHC Khuldabad", title: "ICU Beds Full", message: "ICU bed occupancy is at 100% capacity.", time: "3 hours ago" },
  { id: "alert_5", type: "failure", severity: "Warning", centre: "PHC Kannad", title: "Equipment Failure", message: "X-Ray tube component malfunctioning. Suggest redirecting to PHC Khuldabad or CHC Paithan.", time: "4 hours ago" }
];

export const INITIAL_TIMELINE = {
  day: 1,
  date: "2026-07-06",
  season: "Monsoon", // influences malaria/dengue patient loads and ORS usage
  weather: "Rainy, 28°C"
};

/**
 * Simulates advancing the environment by 1 day
 * - Burns down medicine inventories based on dailyRate (with slight seasonal randomization)
 * - Changes patient counts randomly based on season (e.g. Monsoon increases fever, cough)
 * - Randomizes doctor check-ins / leaves
 * - Randomizes bed occupancies slightly
 * - Re-evaluates thresholds to trigger new alerts
 */
export function advanceSimulationDay(currentState) {
  const { centres, alerts, timeline } = currentState;
  const nextDay = timeline.day + 1;

  // Advance date
  const currentDate = new Date(timeline.date);
  currentDate.setDate(currentDate.getDate() + 1);
  const nextDateStr = currentDate.toISOString().split('T')[0];

  // Random seasonal fluctuation
  let season = timeline.season;
  let weather = timeline.weather;

  // Cycle seasons every 15 days in simulation
  if (nextDay % 30 < 10) {
    season = "Monsoon";
    weather = Math.random() > 0.3 ? "Heavy Rain, 26°C" : "Cloudy, 29°C";
  } else if (nextDay % 30 < 20) {
    season = "Winter";
    weather = "Foggy morning, 18°C";
  } else {
    season = "Summer";
    weather = "Hot and dry, 39°C";
  }

  const updatedCentres = centres.map(centre => {
    // 1. Medicine Burn Rate
    const updatedMedicines = centre.medicines.map(med => {
      // Monsoon increases ORS/Paracetamol/Cough syrup usage
      let usageFactor = 1.0;
      if (season === "Monsoon" && (med.id === "med_paracetamol" || med.id === "med_ors" || med.id === "med_cough_syrup")) {
        usageFactor = 1.4;
      } else if (season === "Winter" && med.id === "med_cough_syrup") {
        usageFactor = 1.3;
      }

      const actualBurn = Math.round(med.dailyRate * usageFactor * (0.8 + Math.random() * 0.4));
      const remainingStock = Math.max(0, med.stock - actualBurn);
      return {
        ...med,
        stock: remainingStock
      };
    });

    // 2. Patient Footfall fluctuations
    let patientFactor = 1.0;
    if (season === "Monsoon") patientFactor = 1.25; // Outbreak season
    if (season === "Summer") patientFactor = 0.9;

    const newPatientsCount = Math.round((centre.type === "CHC" ? 250 : 100) * patientFactor * (0.7 + Math.random() * 0.6));
    const newWaitingTime = Math.round((newPatientsCount / (centre.type === "CHC" ? 6 : 3)) * (0.8 + Math.random() * 0.4));

    // 3. Bed Management updates
    const updatedBeds = { ...centre.beds };
    Object.keys(updatedBeds).forEach(bedType => {
      const cap = updatedBeds[bedType].total;
      let occ = updatedBeds[bedType].occupied;

      // adjust occupied beds slightly
      const delta = Math.random() > 0.5 ? 1 : -1;
      const amount = Math.floor(Math.random() * 3);
      occ = Math.max(0, Math.min(cap, occ + delta * amount));

      // ICU stays highly occupied
      if (bedType === 'icu' && Math.random() > 0.4) {
        occ = Math.max(Math.floor(cap * 0.8), occ);
      }
      updatedBeds[bedType] = { total: cap, occupied: occ };
    });

    // 4. Doctor attendance update
    const updatedDoctors = centre.doctors.map(doc => {
      // Simulate check-in / check-out
      let status = "Present";
      let checkIn = "08:45 AM";
      // Dr. Rohan Rao and Kavita Rao have higher risk of absenteeism
      const absentChance = doc.absenteeismRisk === "High" ? 0.25 : doc.absenteeismRisk === "Medium" ? 0.12 : 0.03;

      if (Math.random() < absentChance) {
        status = Math.random() > 0.5 ? "Absent" : "On Leave";
        checkIn = "--";
      } else {
        const min = Math.floor(Math.random() * 30);
        checkIn = `08:${min < 10 ? '0' + min : min} AM`;
      }

      return {
        ...doc,
        status,
        checkIn
      };
    });

    // 5. Diagnostics equipment updates
    const updatedDiagnostics = centre.diagnostics.map(diag => {
      let status = diag.status;
      // 2% chance of failure if active
      if (status === "Operational" && Math.random() < 0.02) {
        status = "Equipment Failure";
      } else if (status === "Equipment Failure" && Math.random() < 0.15) {
        // 15% chance of self-repair/maintenance team completing work
        status = "Operational";
      }

      const queueDelta = Math.random() > 0.5 ? 2 : -2;
      const newQueue = status === "Operational" ? Math.max(1, Math.min(25, diag.queueSize + queueDelta)) : 0;

      return {
        ...diag,
        status,
        queueSize: newQueue
      };
    });

    return {
      ...centre,
      beds: updatedBeds,
      medicines: updatedMedicines,
      doctors: updatedDoctors,
      patients: {
        ...centre.patients,
        todayCount: newPatientsCount,
        waitingTime: newWaitingTime
      },
      diagnostics: updatedDiagnostics
    };
  });

  // Re-calculate and generate new simulation alerts
  const newAlerts = [];

  updatedCentres.forEach(centre => {
    // Inventory alerts
    centre.medicines.forEach(med => {
      if (med.stock === 0) {
        newAlerts.push({
          id: `sim_alert_stockout_${centre.id}_${med.id}_${nextDay}`,
          type: "shortage",
          severity: "Emergency",
          centre: centre.name,
          title: "Medicine Stockout",
          message: `${med.name} is completely OUT of stock! Immediate transfer required.`,
          time: "Just now"
        });
      } else if (med.stock < med.threshold) {
        const estDays = (med.stock / med.dailyRate).toFixed(1);
        newAlerts.push({
          id: `sim_alert_low_${centre.id}_${med.id}_${nextDay}`,
          type: "shortage",
          severity: "Warning",
          centre: centre.name,
          title: "Low Medicine Stock",
          message: `${med.name} stock (${med.stock}) is below threshold. Est. stock-out in ${estDays} days.`,
          time: "Just now"
        });
      }
    });

    // Bed full alerts
    if (centre.beds.general.occupied === centre.beds.general.total) {
      newAlerts.push({
        id: `sim_alert_bed_gen_${centre.id}_${nextDay}`,
        type: "shortage",
        severity: "Warning",
        centre: centre.name,
        title: "General Beds Full",
        message: `General bed capacity is at 100% capacity.`,
        time: "Just now"
      });
    }
    if (centre.beds.icu.occupied === centre.beds.icu.total) {
      newAlerts.push({
        id: `sim_alert_bed_icu_${centre.id}_${nextDay}`,
        type: "shortage",
        severity: "Emergency",
        centre: centre.name,
        title: "Critical Bed Shortage (ICU)",
        message: `ICU beds are completely full. Consider patient redistribution.`,
        time: "Just now"
      });
    }

    // Doctor absenteeism alerts
    centre.doctors.forEach(doc => {
      if (doc.status === "Absent") {
        newAlerts.push({
          id: `sim_alert_absent_${centre.id}_${doc.id}_${nextDay}`,
          type: "attendance",
          severity: doc.absenteeismRisk === "High" ? "Emergency" : "Warning",
          centre: centre.name,
          title: "Doctor Unplanned Absenteeism",
          message: `${doc.name} (${doc.specialty}) failed to check in today. Shift coverage required.`,
          time: "Just now"
        });
      }
    });

    // Diagnostic failures alerts
    centre.diagnostics.forEach(diag => {
      if (diag.status === "Equipment Failure") {
        newAlerts.push({
          id: `sim_alert_diag_${centre.id}_${diag.id}_${nextDay}`,
          type: "failure",
          severity: "Emergency",
          centre: centre.name,
          title: "Diagnostic Equipment Down",
          message: `${diag.name} machine is reporting operational error. Redirecting tests.`,
          time: "Just now"
        });
      }
    });
  });

  // Keep first 10 fresh alerts
  const combinedAlerts = [...newAlerts, ...alerts].slice(0, 20);

  return {
    centres: updatedCentres,
    alerts: combinedAlerts,
    timeline: {
      day: nextDay,
      date: nextDateStr,
      season,
      weather
    }
  };
}
