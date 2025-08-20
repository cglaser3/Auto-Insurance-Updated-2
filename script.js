const zipInput = document.getElementById('zip');
const zipForm = document.getElementById('zip-form');
const errorMsg = document.getElementById('zip-error');
const overlay = document.querySelector('.overlay');
const app = document.getElementById('app');
const progressContainer = document.getElementById('progress-container');

const formData = {};
let steps = [];
let currentStep = -1;

zipInput.addEventListener('input', () => errorMsg.classList.add('hidden'));

zipForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const zip = zipInput.value.trim();
  if (/^\d{5}$/.test(zip)) {
    errorMsg.classList.add('hidden');
    startQuoteFlow(zip);
  } else {
    errorMsg.classList.remove('hidden');
  }
});

function startQuoteFlow(zip) {
  overlay.classList.add('hidden');
  app.classList.remove('hidden');
  progressContainer.classList.remove('hidden');
  formData.zip = zip;
  buildSteps();
  nextStep();
}

function buildSteps() {
  steps = [
    personalStep,
    contactStep,
    addressStep,
    homeStatusStep,
    vehicleCountStep
  ];
}

function nextStep() {
  currentStep++;
  updateProgress();
  if (currentStep < steps.length) {
    steps[currentStep]();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    steps[currentStep]();
    updateProgress();
  }
}

function updateProgress() {
  const pct = Math.min((currentStep) / (steps.length - 1) * 100, 100);
  document.getElementById('progress').style.width = pct + '%';
}

function renderCard(inner, showBack = true) {
  app.innerHTML = `<div class="question-card">${inner}</div>`;
  if (showBack && currentStep > 0) {
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    backBtn.className = 'back-btn';
    backBtn.addEventListener('click', prevStep);
    app.querySelector('.question-card').appendChild(backBtn);
  }
}

// ----- Personal Info -----
function personalStep() {
  const monthOpts = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
  const dayOpts = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
  const currentYear = new Date().getFullYear();
  let yearOpts = '';
  for (let y = currentYear - 18; y >= currentYear - 100; y--) {
    yearOpts += `<option value="${y}">${y}</option>`;
  }
  renderCard(`
    <h2>Your Name</h2>
    <input id="first" type="text" placeholder="First name" />
    <input id="last" type="text" placeholder="Last name" />
    <div class="grid">
      <select id="dobMonth"><option value="">MM</option>${monthOpts}</select>
      <select id="dobDay"><option value="">DD</option>${dayOpts}</select>
      <select id="dobYear"><option value="">YYYY</option>${yearOpts}</select>
    </div>
    <button id="next">Next</button>
  `, false);
  document.getElementById('next').addEventListener('click', () => {
    formData.firstName = document.getElementById('first').value.trim();
    formData.lastName = document.getElementById('last').value.trim();
    formData.dobMonth = document.getElementById('dobMonth').value;
    formData.dobDay = document.getElementById('dobDay').value;
    formData.dobYear = document.getElementById('dobYear').value;
    nextStep();
  });
}

function contactStep() {
  renderCard(`
    <h2>Contact Details</h2>
    <input type="email" id="email" placeholder="Email" />
    <input type="tel" id="phone" placeholder="Phone" />
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData.email = document.getElementById('email').value.trim();
    formData.phone = document.getElementById('phone').value.trim();
    nextStep();
  });
}

function addressStep() {
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  const stateOpts = states.map(s => `<option value="${s}">${s}</option>`).join('');
  renderCard(`
    <h2>Your Address</h2>
    <input id="street" type="text" placeholder="Street address" />
    <input id="city" type="text" placeholder="City" />
    <select id="state"><option value="">State</option>${stateOpts}</select>
    <input id="zip2" type="text" placeholder="ZIP" value="${formData.zip}" />
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData.street = document.getElementById('street').value.trim();
    formData.city = document.getElementById('city').value.trim();
    formData.state = document.getElementById('state').value;
    formData.zip = document.getElementById('zip2').value.trim();
    nextStep();
  });
}

function homeStatusStep() {
  renderCard(`
    <h2>Do you rent or own your home?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Rent">Rent</button>
      <button class="option-btn" data-val="Own">Own</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.homeStatus = btn.dataset.val;
      nextStep();
    });
  });
}

// ----- Vehicles -----
function vehicleCountStep() {
  renderCard(`
    <h2>How many vehicles?</h2>
    <div class="grid">
      <button class="option-btn" data-val="1">1</button>
      <button class="option-btn" data-val="2">2</button>
      <button class="option-btn" data-val="3">3</button>
      <button class="option-btn" data-val="4">4</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.val, 10);
      formData.vehicleCount = count;
      for (let i = 0; i < count; i++) {
        steps.push(() => vehicleYearStep(i));
        steps.push(() => vehicleMakeStep(i));
        steps.push(() => vehicleModelStep(i));
        steps.push(() => vehicleMileageStep(i));
        steps.push(() => vehicleUseStep(i));
        steps.push(() => vehicleCoverageStep(i));
        steps.push(() => vehicleDeductibleStep(i));
      }
      steps.push(driverCountStep);
      nextStep();
    });
  });
}

function vehicleYearStep(i) {
  const currentYear = new Date().getFullYear();
  let opts = '';
  for (let y = currentYear; y >= 1990; y--) {
    opts += `<option value="${y}">${y}</option>`;
  }
  renderCard(`
    <h2>Vehicle ${i + 1} - Year</h2>
    <select id="year"><option value="">Year</option>${opts}</select>
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData[`vehicleYear${i}`] = document.getElementById('year').value;
    nextStep();
  });
}

const localMakes = ['Toyota','Honda','Ford','Chevrolet','Nissan'];

function vehicleMakeStep(i) {
  const makeOpts = localMakes.map(m => `<option value="${m}">${m}</option>`).join('');
  renderCard(`
    <h2>Vehicle ${i + 1} - Make</h2>
    <select id="make"><option value="">Make</option>${makeOpts}</select>
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData[`vehicleMake${i}`] = document.getElementById('make').value;
    nextStep();
  });
}

function vehicleModelStep(i) {
  renderCard(`
    <h2>Vehicle ${i + 1} - Model</h2>
    <select id="model"></select>
    <button id="next">Next</button>
  `);
  const year = formData[`vehicleYear${i}`];
  const make = formData[`vehicleMake${i}`];
  const modelSelect = document.getElementById('model');
  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`)
    .then(r => r.json())
    .then(data => {
      const models = data.Results.map(r => r.Model_Name).sort();
      modelSelect.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('') || '<option value="Other">Other</option>';
    })
    .catch(() => {
      modelSelect.innerHTML = '<option value="Other">Other</option>';
    });
  document.getElementById('next').addEventListener('click', () => {
    formData[`vehicleModel${i}`] = modelSelect.value;
    nextStep();
  });
}

function vehicleMileageStep(i) {
  renderCard(`
    <h2>Vehicle ${i + 1} - Annual mileage?</h2>
    <div class="grid">
      <button class="option-btn" data-val="<5k">&lt;5k</button>
      <button class="option-btn" data-val="5k-8k">5k–8k</button>
      <button class="option-btn" data-val="8k-12k">8k–12k</button>
      <button class="option-btn" data-val=">12k">&gt;12k</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`vehicleMileage${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

function vehicleUseStep(i) {
  renderCard(`
    <h2>Vehicle ${i + 1} - Primary use?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Commute">Commute</button>
      <button class="option-btn" data-val="Pleasure">Pleasure</button>
      <button class="option-btn" data-val="Business">Business</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`vehicleUse${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

function vehicleCoverageStep(i) {
  renderCard(`
    <h2>Vehicle ${i + 1} - Coverage type?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Full">Full</button>
      <button class="option-btn" data-val="Liability">Liability</button>
    </div>
  `);
  const btns = app.querySelectorAll('.option-btn');
  btns[0].addEventListener('click', () => {
    formData[`vehicleCoverage${i}`] = 'Full';
    nextStep();
  });
  btns[1].addEventListener('click', () => {
    formData[`vehicleCoverage${i}`] = 'Liability';
    formData[`vehicleDeductible${i}`] = '';
    currentStep++; // skip deductible step
    nextStep();
  });
}

function vehicleDeductibleStep(i) {
  renderCard(`
    <h2>Vehicle ${i + 1} - Deductible</h2>
    <div class="grid">
      <button class="option-btn" data-val="250">$250</button>
      <button class="option-btn" data-val="500">$500</button>
      <button class="option-btn" data-val="1000">$1000</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`vehicleDeductible${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

// ----- Drivers -----
function driverCountStep() {
  renderCard(`
    <h2>How many drivers?</h2>
    <div class="grid">
      <button class="option-btn" data-val="1">1</button>
      <button class="option-btn" data-val="2">2</button>
      <button class="option-btn" data-val="3">3</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.val, 10);
      formData.driverCount = count;
      for (let i = 0; i < count; i++) {
        if (i === 0) {
          formData[`driverFirst0`] = formData.firstName;
          formData[`driverLast0`] = formData.lastName;
          formData[`driverDobMonth0`] = formData.dobMonth;
          formData[`driverDobDay0`] = formData.dobDay;
          formData[`driverDobYear0`] = formData.dobYear;
        } else {
          steps.push(() => driverNameStep(i));
        }
        steps.push(() => driverLicenseStep(i));
        steps.push(() => driverGenderStep(i));
        steps.push(() => driverMaritalStep(i));
        steps.push(() => driverViolationsStep(i));
        steps.push(() => driverDefensiveStep(i));
      }
      steps.push(currentlyInsuredStep);
      steps.push(currentCompanyStep);
      steps.push(currentDurationStep);
      steps.push(currentPremiumStep);
      steps.push(billingFreqStep);
      steps.push(desiredLimitsStep);
      steps.push(finalStep);
      nextStep();
    });
  });
}

function driverNameStep(i) {
  const monthOpts = Array.from({ length: 12 }, (_, m) => `<option value="${m + 1}">${m + 1}</option>`).join('');
  const dayOpts = Array.from({ length: 31 }, (_, d) => `<option value="${d + 1}">${d + 1}</option>`).join('');
  const currentYear = new Date().getFullYear();
  let yearOpts = '';
  for (let y = currentYear - 18; y >= currentYear - 100; y--) {
    yearOpts += `<option value="${y}">${y}</option>`;
  }
  renderCard(`
    <h2>Driver ${i + 1} - Name & DOB</h2>
    <input id="dfirst" type="text" placeholder="First name" />
    <input id="dlast" type="text" placeholder="Last name" />
    <div class="grid">
      <select id="ddobMonth"><option value="">MM</option>${monthOpts}</select>
      <select id="ddobDay"><option value="">DD</option>${dayOpts}</select>
      <select id="ddobYear"><option value="">YYYY</option>${yearOpts}</select>
    </div>
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData[`driverFirst${i}`] = document.getElementById('dfirst').value.trim();
    formData[`driverLast${i}`] = document.getElementById('dlast').value.trim();
    formData[`driverDobMonth${i}`] = document.getElementById('ddobMonth').value;
    formData[`driverDobDay${i}`] = document.getElementById('ddobDay').value;
    formData[`driverDobYear${i}`] = document.getElementById('ddobYear').value;
    nextStep();
  });
}

function driverLicenseStep(i) {
  renderCard(`
    <h2>Driver ${i + 1} - License Number</h2>
    <input id="lic" type="text" placeholder="License number" />
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData[`driverLicense${i}`] = document.getElementById('lic').value.trim();
    nextStep();
  });
}

function driverGenderStep(i) {
  renderCard(`
    <h2>Driver ${i + 1} - Gender</h2>
    <div class="grid">
      <button class="option-btn" data-val="Male">Male</button>
      <button class="option-btn" data-val="Female">Female</button>
      <button class="option-btn" data-val="Other">Other</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`driverGender${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

function driverMaritalStep(i) {
  renderCard(`
    <h2>Driver ${i + 1} - Marital Status</h2>
    <div class="grid">
      <button class="option-btn" data-val="Single">Single</button>
      <button class="option-btn" data-val="Married">Married</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`driverMarital${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

function driverViolationsStep(i) {
  renderCard(`
    <h2>Driver ${i + 1} - Any violations in 36 months?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Yes">Yes</button>
      <button class="option-btn" data-val="No">No</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`driverViolations${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

function driverDefensiveStep(i) {
  renderCard(`
    <h2>Driver ${i + 1} - Defensive driver course?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Yes">Yes</button>
      <button class="option-btn" data-val="No">No</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData[`driverDefensive${i}`] = btn.dataset.val;
      nextStep();
    });
  });
}

// ----- Insurance History -----
function currentlyInsuredStep() {
  renderCard(`
    <h2>Are you currently insured?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Yes">Yes</button>
      <button class="option-btn" data-val="No">No</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      formData.currentlyInsured = val;
      if (val === 'No') {
        formData.currentCompany = '';
        formData.currentDuration = '';
        formData.currentPremium = '';
        formData.billingFreq = '';
        currentStep += 4;
      }
      nextStep();
    });
  });
}

function currentCompanyStep() {
  renderCard(`
    <h2>Current company?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Geico">Geico</button>
      <button class="option-btn" data-val="Progressive">Progressive</button>
      <button class="option-btn" data-val="Allstate">Allstate</button>
      <button class="option-btn" data-val="Other">Other</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.currentCompany = btn.dataset.val;
      nextStep();
    });
  });
}

function currentDurationStep() {
  renderCard(`
    <h2>How long with current company?</h2>
    <div class="grid">
      <button class="option-btn" data-val="1">1 year</button>
      <button class="option-btn" data-val="2">2</button>
      <button class="option-btn" data-val="3">3</button>
      <button class="option-btn" data-val="4">4</button>
      <button class="option-btn" data-val="5+">5+</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.currentDuration = btn.dataset.val;
      nextStep();
    });
  });
}

function currentPremiumStep() {
  renderCard(`
    <h2>Current premium ($)</h2>
    <input id="prem" type="text" placeholder="" />
    <button id="next">Next</button>
  `);
  document.getElementById('next').addEventListener('click', () => {
    formData.currentPremium = document.getElementById('prem').value.trim();
    nextStep();
  });
}

function billingFreqStep() {
  renderCard(`
    <h2>Billing frequency?</h2>
    <div class="grid">
      <button class="option-btn" data-val="Monthly">Monthly</button>
      <button class="option-btn" data-val="Every 6 Months">Every 6 Months</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.billingFreq = btn.dataset.val;
      nextStep();
    });
  });
}

function desiredLimitsStep() {
  renderCard(`
    <h2>Desired coverage limits?</h2>
    <div class="grid">
      <button class="option-btn" data-val="25/50">25/50</button>
      <button class="option-btn" data-val="50/100">50/100</button>
      <button class="option-btn" data-val="100/300">100/300</button>
      <button class="option-btn" data-val="Greater">Greater</button>
    </div>
  `);
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.desiredLimits = btn.dataset.val;
      nextStep();
    });
  });
}

// ----- Final -----
function finalStep() {
  submitForm();
  renderProcessing();
}

function renderProcessing() {
  const messages = ['Gathering data', 'Reviewing drivers', 'Reviewing vehicles', 'Finding best rates', 'Finalizing quote...'];
  renderCard(`
    <h2>Preparing your quote...</h2>
    <p id="msg">${messages[0]}</p>
    <div class="loading"><div class="loading-bar" id="loadBar"></div></div>
  `, false);
  const bar = document.getElementById('loadBar');
  const msg = document.getElementById('msg');
  let elapsed = 0;
  const duration = 20 * 60 * 1000; // 20 minutes
  const step = 1000;
  const msgInterval = duration / messages.length;
  const interval = setInterval(() => {
    elapsed += step;
    const pct = (elapsed / duration) * 100;
    bar.style.width = pct + '%';
    const index = Math.min(Math.floor(elapsed / msgInterval), messages.length - 1);
    msg.textContent = messages[index];
    if (elapsed >= duration) {
      clearInterval(interval);
      renderThankYou();
    }
  }, step);
}

function renderThankYou() {
  renderCard(`
    <h2>Your quote has been finalized and is on its way to your email inbox.</h2>
  `, false);
}

function submitForm() {
  const form = document.forms['quote'];
  const fd = new FormData(form);
  Object.keys(formData).forEach(key => {
    fd.set(key, formData[key]);
    let input = form.querySelector(`input[name="${key}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      form.appendChild(input);
    }
    input.value = formData[key];
  });
  fetch('/', { method: 'POST', body: fd });
}
