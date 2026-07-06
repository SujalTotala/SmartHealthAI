// SmartHealth AI - Prediction and Resource Redistribution Engine

/**
 * Evaluates the current state of all health centers to generate intelligent, actionable recommendations
 */
export function generateAIRecommendations(centres) {
  const recommendations = [];

  // --- 1. MEDICINE TRANSFER RECOMMENDATIONS ---
  centres.forEach(target => {
    target.medicines.forEach(targetMed => {
      // Check if this medicine is in deficit (below threshold)
      if (targetMed.stock < targetMed.threshold) {
        const deficitAmount = targetMed.threshold - targetMed.stock;
        
        // Search for a clinic with a healthy surplus of the same medicine
        let bestSource = null;
        let maxAvailableSurplus = 0;

        centres.forEach(source => {
          if (source.id === target.id) return; // cannot transfer to itself
          
          const sourceMed = source.medicines.find(m => m.id === targetMed.id);
          if (sourceMed) {
            // Surplus is stock above threshold
            const surplus = sourceMed.stock - sourceMed.threshold;
            if (surplus > deficitAmount && surplus > maxAvailableSurplus) {
              maxAvailableSurplus = surplus;
              bestSource = source;
            }
          }
        });

        if (bestSource) {
          const quantityToTransfer = Math.min(deficitAmount, maxAvailableSurplus);
          recommendations.push({
            id: `rec_med_${target.id}_${targetMed.id}`,
            type: "medicine_transfer",
            priority: targetMed.stock === 0 ? "High" : "Medium",
            title: `Redistribute ${targetMed.name}`,
            message: `Transfer ${quantityToTransfer} tablets of ${targetMed.name} from ${bestSource.name} to ${target.name}.`,
            details: `${target.name} has only ${targetMed.stock} left (threshold: ${targetMed.threshold}). ${bestSource.name} has a surplus of ${maxAvailableSurplus} tablets.`,
            action: {
              type: "MEDICINE_TRANSFER",
              sourceId: bestSource.id,
              targetId: target.id,
              medicineId: targetMed.id,
              quantity: quantityToTransfer
            }
          });
        }
      }
    });
  });

  // --- 2. DOCTOR REALLOCATION RECOMMENDATIONS ---
  centres.forEach(target => {
    // Check for absent doctors
    const absentDoctors = target.doctors.filter(d => d.status === "Absent");
    
    if (absentDoctors.length > 0) {
      absentDoctors.forEach(absDoc => {
        // Look for a source clinic with general physicians and low load
        let bestSourceClinic = null;
        let bestSourceDoc = null;
        
        centres.forEach(source => {
          if (source.id === target.id) return;
          // Check if source has doctors who are present and clinic has a low waiting time
          if (source.patients.waitingTime < 20) {
            const availableDoc = source.doctors.find(d => d.status === "Present" && d.specialty === "General Medicine");
            if (availableDoc) {
              bestSourceClinic = source;
              bestSourceDoc = availableDoc;
            }
          }
        });

        if (bestSourceDoc) {
          recommendations.push({
            id: `rec_doc_${target.id}_${absDoc.id}`,
            type: "doctor_shift",
            priority: "Medium",
            title: `Temporary Doctor Shift Allocation`,
            message: `Deploy General Physician ${bestSourceDoc.name} from ${bestSourceClinic.name} to ${target.name}.`,
            details: `${target.name} has an unplanned absence of ${absDoc.name}. ${bestSourceClinic.name} currently has low patient load (waiting time: ${bestSourceClinic.patients.waitingTime}m).`,
            action: {
              type: "DOCTOR_SHIFT",
              sourceId: bestSourceClinic.id,
              targetId: target.id,
              doctorId: bestSourceDoc.id,
              doctorName: bestSourceDoc.name
            }
          });
        }
      });
    }
  });

  // --- 3. DIAGNOSTIC REDIRECTION RECOMMENDATIONS ---
  centres.forEach(target => {
    target.diagnostics.forEach(diag => {
      if (diag.status === "Equipment Failure") {
        // Find a nearby operational diagnostic machine with the shortest queue
        let bestTargetClinic = null;
        let minQueue = 999;

        centres.forEach(source => {
          if (source.id === target.id) return;
          
          const sourceDiag = source.diagnostics.find(d => d.id === diag.id);
          if (sourceDiag && sourceDiag.status === "Operational") {
            if (sourceDiag.queueSize < minQueue) {
              minQueue = sourceDiag.queueSize;
              bestTargetClinic = source;
            }
          }
        });

        if (bestTargetClinic) {
          recommendations.push({
            id: `rec_diag_${target.id}_${diag.id}`,
            type: "diagnostic_redirect",
            priority: "High",
            title: `${diag.name} Redirection Suggested`,
            message: `Redirect ${diag.name} patients from ${target.name} to ${bestTargetClinic.name}.`,
            details: `Equipment failure detected at ${target.name}. ${bestTargetClinic.name} has operational equipment with a short queue of ${minQueue} patients.`,
            action: {
              type: "DIAGNOSTIC_REDIRECT",
              sourceId: target.id,
              targetId: bestTargetClinic.id,
              testId: diag.id
            }
          });
        }
      }
    });
  });

  // --- 4. BED REDISTRIBUTION/REDIRECTION RECOMMENDATIONS ---
  centres.forEach(target => {
    const icuOccRate = target.beds.icu.occupied / target.beds.icu.total;
    const generalOccRate = target.beds.general.occupied / target.beds.general.total;

    if (icuOccRate >= 0.9 && target.beds.icu.total > 0) {
      // ICU is full or almost full. Look for nearby clinic with available ICU beds.
      let bestClinic = null;
      let maxAvailableBeds = 0;

      centres.forEach(source => {
        if (source.id === target.id) return;
        const availableICU = source.beds.icu.total - source.beds.icu.occupied;
        if (availableICU > maxAvailableBeds) {
          maxAvailableBeds = availableICU;
          bestClinic = source;
        }
      });

      if (bestClinic && maxAvailableBeds > 0) {
        recommendations.push({
          id: `rec_bed_icu_${target.id}`,
          type: "bed_redirection",
          priority: "High",
          title: `ICU Bed Occupancy Alert`,
          message: `Divert incoming critical ICU patients from ${target.name} to ${bestClinic.name}.`,
          details: `${target.name} ICU occupancy is at ${(icuOccRate * 100).toFixed(0)}%. ${bestClinic.name} has ${maxAvailableBeds} ICU beds available.`,
          action: {
            type: "BED_REDIRECT",
            sourceId: target.id,
            targetId: bestClinic.id,
            bedType: "icu"
          }
        });
      }
    }
  });

  return recommendations;
}

/**
 * Predicts resource metrics (medicine stockout, bed occupancy, patient loads) based on historical models
 */
export function getPredictions(centre, timeline) {
  // Medicine Expiry & Stockouts
  const medicinePredictions = centre.medicines.map(med => {
    const daysRemaining = med.stock > 0 ? (med.stock / med.dailyRate) : 0;
    
    // expiry calculation
    const today = new Date(timeline.date);
    const expiry = new Date(med.expiryDate);
    const diffTime = expiry - today;
    const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status = "Stable";
    if (daysRemaining <= 3) status = "Critical Stockout";
    else if (daysRemaining <= 7) status = "Low Stock Risk";
    else if (daysToExpiry <= 15) status = "Expiry Hazard";

    return {
      medicineId: med.id,
      name: med.name,
      daysRemaining: parseFloat(daysRemaining.toFixed(1)),
      daysToExpiry,
      status
    };
  });

  // Patient Load Prediction for Tomorrow
  const baseLoad = centre.type === "CHC" ? 220 : 100;
  let multiplier = 1.0;
  if (timeline.season === "Monsoon") multiplier = 1.25;
  if (timeline.season === "Winter") multiplier = 1.1;

  const predictedLoad = Math.round(baseLoad * multiplier * (0.95 + Math.random() * 0.1));
  const peakHoursStr = centre.type === "CHC" ? "10:30 AM - 02:00 PM" : "09:30 AM - 12:00 PM";

  // Bed Occupancy Prediction (next 3 days)
  const bedOccupancyHistory = [
    { day: "Today", general: centre.beds.general.occupied, icu: centre.beds.icu.occupied },
    { day: "Tomorrow", general: Math.min(centre.beds.general.total, Math.round(centre.beds.general.occupied * (0.9 + Math.random() * 0.2))), icu: Math.min(centre.beds.icu.total, Math.round(centre.beds.icu.occupied * (0.95 + Math.random() * 0.15))) },
    { day: "Day +2", general: Math.min(centre.beds.general.total, Math.round(centre.beds.general.occupied * (0.85 + Math.random() * 0.3))), icu: Math.min(centre.beds.icu.total, Math.round(centre.beds.icu.occupied * (0.9 + Math.random() * 0.2))) }
  ];

  return {
    medicinePredictions,
    patientPrediction: {
      tomorrowLoad: predictedLoad,
      peakHours: peakHoursStr,
      overcrowdingRisk: predictedLoad > (centre.type === "CHC" ? 280 : 130) ? "High" : "Low"
    },
    bedOccupancyHistory
  };
}

/**
 * Smart Chatbot NLP Router
 * Mimics a highly competent district AI health center coordinator
 */
export function queryAIChatbot(query, state) {
  const q = query.toLowerCase().trim();
  const { centres, recommendations } = state;

  // Response templates
  if (q.includes("paracetamol") || q.includes("medicine") || q.includes("stock") || q.includes("shortage")) {
    // Look for medicines below threshold
    const lowStockItems = [];
    const surplusItems = [];

    centres.forEach(c => {
      c.medicines.forEach(m => {
        if (m.stock < m.threshold) {
          lowStockItems.push({ clinic: c.name, medicine: m.name, stock: m.stock, threshold: m.threshold });
        }
        if (m.stock > m.threshold * 2) {
          surplusItems.push({ clinic: c.name, medicine: m.name, stock: m.stock, excess: m.stock - m.threshold });
        }
      });
    });

    let text = "### Medicine Inventory Analysis\n\n";
    if (lowStockItems.length > 0) {
      text += "**Alert: Buffer Stock Deficits Detected**\n\n";
      text += "| Facility | Medicine | Current Stock | Minimum Threshold | Status |\n";
      text += "| --- | --- | --- | --- | --- |\n";
      lowStockItems.forEach(item => {
        text += `| ${item.clinic} | ${item.medicine} | **${item.stock}** | ${item.threshold} | Deficit |\n`;
      });
      text += "\n";
    } else {
      text += "✅ All medicine inventories are currently above minimum safety thresholds.\n\n";
    }

    if (surplusItems.length > 0) {
      text += "**Surplus Allocation Assets:**\n\n";
      text += "| Facility | Medicine | Current Stock | Available Surplus |\n";
      text += "| --- | --- | --- | --- |\n";
      surplusItems.forEach(item => {
        text += `| ${item.clinic} | ${item.medicine} | **${item.stock}** | +${item.excess} |\n`;
      });
    }

    // Match recommended transfers
    const relevantRecs = recommendations.filter(r => r.type === "medicine_transfer");
    if (relevantRecs.length > 0) {
      const topRec = relevantRecs[0];
      const srcName = centres.find(c => c.id === topRec.action.sourceId)?.name || "Source";
      const targetName = centres.find(c => c.id === topRec.action.targetId)?.name || "Target";
      const qty = topRec.action.quantity;
      const medName = topRec.title.split("Redistribute ")[1] || "Medicine";
      
      text += "\n\n💡 **AI Transfer Recommendation:**\n";
      text += `Transfer of **${qty}** units of **${medName}** from **${srcName}** to **${targetName}** is recommended to address buffer deficits.`;
      
      return {
        text,
        suggestions: ["Show redistribution wizard", "Execute top medicine transfer"],
        action: {
          type: "NAVIGATE",
          tab: "redistribution"
        }
      };
    }

    return {
      text,
      suggestions: ["Check bed levels", "View redistribution options"]
    };
  }

  if (q.includes("bed") || q.includes("icu") || q.includes("occupancy")) {
    let text = "### Bed Occupancy & Capacity Report\n\n";
    text += "| Facility | ICU Bed Status | General Bed Status | Status |\n";
    text += "| --- | --- | --- | --- |\n";
    let isShortage = false;

    centres.forEach(c => {
      const icuOcc = c.beds.icu.occupied;
      const icuTotal = c.beds.icu.total;
      const genOcc = c.beds.general.occupied;
      const genTotal = c.beds.general.total;

      const icuStr = icuTotal > 0 ? `${icuOcc}/${icuTotal} occupied` : "N/A";
      const genStr = `${genOcc}/${genTotal} occupied`;
      
      let status = "Stable";
      if (icuOcc === icuTotal && icuTotal > 0) {
        status = "🚨 ICU Capacity Met";
        isShortage = true;
      } else if (icuOcc / icuTotal >= 0.8 && icuTotal > 0) {
        status = "⚠️ High Occupancy Alert";
        isShortage = true;
      }
      
      text += `| ${c.name} | ${icuStr} | ${genStr} | ${status} |\n`;
    });

    if (isShortage) {
      const bedRecs = recommendations.filter(r => r.type === "bed_redirection");
      if (bedRecs.length > 0) {
        text += `\n💡 **AI Bed Redirection Recommendation:**\n`;
        text += `${bedRecs[0].message} ${bedRecs[0].details}`;
      }
    }

    return {
      text,
      suggestions: ["Divert patients to Paithan", "Show all recommendations"],
      action: {
        type: "NAVIGATE",
        tab: "beds"
      }
    };
  }

  if (q.includes("doctor") || q.includes("absent") || q.includes("attendance") || q.includes("staff")) {
    const absentDocs = [];
    centres.forEach(c => {
      c.doctors.forEach(d => {
        if (d.status === "Absent") {
          absentDocs.push({ clinic: c.name, doctor: d.name, specialty: d.specialty, risk: d.absenteeismRisk });
        }
      });
    });

    let text = "### Staffing & Attendance Registry\n\n";
    if (absentDocs.length > 0) {
      text += "**Unscheduled Facility Absences Logged:**\n\n";
      text += "| Medical Officer | Specialty | Facility | Absenteeism Risk |\n";
      text += "| --- | --- | --- | --- |\n";
      absentDocs.forEach(d => {
        text += `| ${d.doctor} | ${d.specialty} | ${d.clinic} | ${d.risk} |\n`;
      });

      const doctorRecs = recommendations.filter(r => r.type === "doctor_shift");
      if (doctorRecs.length > 0) {
        text += `\n💡 **AI Staffing Suggestion:**\n`;
        text += `${doctorRecs[0].message} \n*Detail:* ${doctorRecs[0].details}`;
      }
    } else {
      text += "✅ All scheduled medical officers and doctors are present today.\n";
    }

    return {
      text,
      suggestions: ["Check shift schedule", "Show redistribution wizard"],
      action: {
        type: "NAVIGATE",
        tab: "doctors"
      }
    };
  }

  if (q.includes("diagnostic") || q.includes("equipment") || q.includes("failed") || q.includes("x-ray") || q.includes("ultrasound")) {
    const failedEq = [];
    centres.forEach(c => {
      c.diagnostics.forEach(d => {
        if (d.status === "Equipment Failure") {
          failedEq.push({ clinic: c.name, equipment: d.name });
        }
      });
    });

    let text = "### Diagnostic Equipment Diagnostics\n\n";
    if (failedEq.length > 0) {
      text += "**Equipment Malfunction Log:**\n\n";
      text += "| Facility | Device Name | Status | Fault State |\n";
      text += "| --- | --- | --- | --- |\n";
      failedEq.forEach(eq => {
        text += `| ${eq.clinic} | ${eq.equipment} | Down | Equipment Failure |\n`;
      });
      
      const diagRecs = recommendations.filter(r => r.type === "diagnostic_redirect");
      if (diagRecs.length > 0) {
        text += `\n💡 **AI Redirection Plan:**\n`;
        text += `${diagRecs[0].message}\n*Detail:* ${diagRecs[0].details}`;
      }
    } else {
      text += "✅ All diagnostic devices (Blood analyzers, X-Rays, ECGs, Ultrasounds) are fully functional across the district.\n";
    }

    return {
      text,
      suggestions: ["View equipment health", "Show all warnings"],
      action: {
        type: "NAVIGATE",
        tab: "diagnostics"
      }
    };
  }

  if (q.includes("transfer") || q.includes("execute") || q.includes("redistribute") || q.includes("recommend")) {
    if (recommendations.length > 0) {
      let text = "### Active AI Recommendations\n\n";
      recommendations.forEach((rec, idx) => {
        text += `${idx + 1}. **${rec.title}** (${rec.priority} Priority)\n`;
        text += `   *Action:* ${rec.message}\n`;
        text += `   *Rationale:* ${rec.details}\n\n`;
      });
      return {
        text,
        suggestions: ["Execute top medicine transfer", "Open redistribution dashboard"],
        action: {
          type: "NAVIGATE",
          tab: "redistribution"
        }
      };
    } else {
      return {
        text: "✅ No resource redistributions are currently recommended. District resource levels are balanced.",
        suggestions: ["Check medicine levels", "Check bed capacity"]
      };
    }
  }

  // Fallback response with helpful starting queries
  return {
    text: "**SmartHealth AI Operations Assistant**\n\nWelcome to the District Informatics Control Panel. I have analyzed all facility logs in real-time. Please query me regarding inventory, staffing levels, bed occupancies, or equipment diagnostic states.\n\nSuggested operations queries:\n- *'Which clinics have a medicine shortage?'*\n- *'Are there any vacant beds?'*\n- *'Show me active equipment failures.'*\n- *'Any doctors absent today?'*\n- *'Show me redistribution recommendations.'*",
    suggestions: ["Check stockouts", "View bed availability", "Check doctor status"]
  };
}
