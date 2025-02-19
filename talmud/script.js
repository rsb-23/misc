// Global state
let currentClaims = [];

// Input parsing and validation
function parseClaims(csvInput) {
  const errorElement = document.getElementById("claims-error");
  errorElement.textContent = "";

  try {
    const claims = csvInput.split(",").map((x) => {
      const num = Number(x.trim());
      if (isNaN(num)) throw new Error(`Invalid number: ${x.trim()}`);
      if (num <= 0) throw new Error(`Claims must be positive numbers: ${num}`);
      return num;
    });

    if (claims.length === 0) {
      throw new Error("Please enter at least one valid claim");
    }
    if (claims.length > 8) {
      throw new Error("Maximum 8 claims allowed");
    }

    return claims;
  } catch (error) {
    errorElement.textContent = error.message;
    return null;
  }
}

// Slider management
function updateSlider() {
  const totalClaims = currentClaims.reduce((a, b) => a + b, 0);
  const slider = document.getElementById("estate");
  const currentValue = Number(slider.value);

  // Round max value up to nearest 50
  const roundedMax = Math.ceil(totalClaims / 50) * 50;
  slider.max = totalClaims;
  document.getElementById("max-estate").textContent = `Total Claims: ${totalClaims}`;

  // Adjust estate value if needed, rounding to nearest 50
  const newValue = Math.min(Math.round(currentValue / 50) * 50, roundedMax);
  slider.value = newValue;
  document.getElementById("estate-value").textContent = newValue;
}

// Vessel generation and management
function generateVessels(claims) {
  const container = document.getElementById("vessels");
  container.innerHTML = "";

  claims.forEach((claim, index) => {
    const originalIndex = index;
    const vesselGroup = document.createElement("div");
    vesselGroup.className = "vessel-group";

    const vesselContent = `
            <div class="split-vessel" id="vessel${originalIndex}">
                <div class="vessel" id="vesselUp">
                    <div class="water" id="waterUp"></div>
                </div>
                <div class="vessel" id="vesselDown">
                    <div class="water" id="waterDown"></div>
                </div>
            </div>
            <div class="vessel-label" id="label${originalIndex}">
                Creditor ${originalIndex + 1}:<br>0
            </div>
        `;

    vesselGroup.innerHTML = vesselContent;

    container.appendChild(vesselGroup);
  });
}

// Update vessel visualization
function updateVessels(allocation, claims) {
  const maxClaim = Math.max(...claims);
  const sortedClaims = [...claims].sort((a, b) => a - b);

  // Calculate base water level for connected vessels
  const totalEstate = allocation.reduce((a, b) => a + b, 0);
  const midLevel = totalEstate / 2;

  for (let i = 0; i < claims.length; i++) {
    const vessel = document.getElementById(`vessel${i}`);
    const vesselUp = vessel.children[0];
    const vesselDown = vessel.children[1];
    const waterUp = vesselUp.children[0];
    const waterDown = vesselDown.children[0];
    const label = document.getElementById(`label${i}`);

    if (!vessel || !label) continue;

    // Set vessel height proportional to claim
    const vesselHeight = (claims[i] / maxClaim) * 120;
    vesselUp.style.height = `${vesselHeight}px`;
    vesselDown.style.height = `${vesselHeight}px`;

    // Calculate water height with natural distribution
    const halfClaim = claims[i] / 2;
    let waterUpHeight, waterDownHeight;
    let claimRatio = allocation[i] / halfClaim;
    if (claimRatio <= 1) {
      waterUpHeight = 0;
      waterDownHeight = vesselHeight * claimRatio;
    } else {
      waterUpHeight = vesselHeight * (claimRatio - 1);
      waterDownHeight = vesselHeight;
    }

    waterUp.style.height = `${waterUpHeight}px`;
    waterDown.style.height = `${waterDownHeight}px`;
    label.innerHTML = `Creditor ${i + 1}:<br>${allocation[i].toFixed(2)}`;
  }
}

function talmudicDistribution(estate, claims) {
  const indexedClaims = claims.map((c, i) => ({ claim: c, index: i }));
  indexedClaims.sort((a, b) => a.claim - b.claim);

  const sortedClaims = indexedClaims.map((x) => x.claim);
  const totalClaims = sortedClaims.reduce((sum, c) => sum + c, 0);
  const n = sortedClaims.length;

  // Generic distribution function
  const calculateDistribution = (totalAvailable, getInitialValue) => {
    let distributed = 0;
    const result = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      const initial = getInitialValue(sortedClaims[i]);
      const remaining = n - i;
      const potential = distributed + initial * remaining;

      if (potential <= totalAvailable) {
        distributed += initial;
        result[i] = initial;
      } else {
        const remainingAmount = totalAvailable - distributed;
        const equalShare = remainingAmount / remaining;
        result.fill(equalShare, i);
        break;
      }
    }
    return result;
  };

  let allocations;
  if (estate <= totalClaims / 2) {
    // Small estate: distribute up to half claims
    allocations = calculateDistribution(estate, (c) => c / 2);
  } else {
    // Large estate: calculate losses and subtract from claims
    const totalLoss = totalClaims - estate;
    const losses = calculateDistribution(totalLoss, (c) => c / 2);
    allocations = sortedClaims.map((c, i) => c - losses[i]);
  }

  // Restore original order
  const result = new Array(n);
  indexedClaims.forEach(({ index }, i) => {
    result[index] = allocations[i];
  });

  return result;
}

// Main calculation function
function calculate() {
  const claims = parseClaims(document.getElementById("claims").value);
  if (!claims) return;

  const estate = Number(document.getElementById("estate").value);

  if (JSON.stringify(claims) !== JSON.stringify(currentClaims)) {
    currentClaims = claims;
    generateVessels(claims);
    updateSlider();
  }

  const allocation = talmudicDistribution(estate, claims);
  updateVessels(allocation, claims);
}

// Event listeners
document.getElementById("estate").addEventListener("input", function () {
  document.getElementById("estate-value").textContent = this.value;
  calculate();
});

document.addEventListener("DOMContentLoaded", function () {
  const popupTrigger = document.querySelector(".popup-trigger");
  const popupOverlay = document.querySelector(".popup-overlay");
  const closeBtn = document.querySelector(".close-btn");

  popupTrigger.addEventListener("click", function () {
    popupOverlay.style.display = "flex";
  });

  closeBtn.addEventListener("click", function () {
    popupOverlay.style.display = "none";
  });

  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.style.display = "none";
    }
  });
});

// Initial calculation
calculate();
