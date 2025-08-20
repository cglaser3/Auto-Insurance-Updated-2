const zipInput = document.getElementById('zip');
const zipForm = document.getElementById('zip-form');
const errorMsg = document.getElementById('zip-error');
const overlay = document.querySelector('.overlay');
const app = document.getElementById('app');
const progressContainer = document.getElementById('progress-container');

const formData = { vehicles: [] };
let steps = [];
let currentStep = -1;
let modelsData = null;

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
    vehiclesStep,
    driverCountStep
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
function vehiclesStep() {
  renderCard(`
    <h2>Your Vehicles</h2>
    <div class="grid">
      <button id="chooseVin" class="option-btn selected">VIN</button>
      <button id="chooseYmm" class="option-btn">Year/Make/Model</button>
    </div>
    <div id="vinArea">
      <input id="vinInput" type="text" placeholder="VIN" />
      <button id="decodeVin">Decode VIN</button>
      <input id="vinYear" type="text" placeholder="Year" disabled />
      <input id="vinMake" type="text" placeholder="Make" disabled />
      <input id="vinModel" type="text" placeholder="Model" disabled />
    </div>
    <div id="ymmArea" class="hidden">
      <select id="yearSelect"><option value="">Year</option></select>
      <select id="makeSelect"><option value="">Make</option></select>
      <select id="modelSelect"><option value="">Model</option></select>
    </div>
    <button id="addVehicle">Add Vehicle</button>
    <div id="vehicleList"></div>
    <button id="next" disabled>Next</button>
  `);

  const chooseVin = document.getElementById('chooseVin');
  const chooseYmm = document.getElementById('chooseYmm');
  const vinArea = document.getElementById('vinArea');
  const ymmArea = document.getElementById('ymmArea');
  chooseVin.addEventListener('click', () => {
    chooseVin.classList.add('selected');
    chooseYmm.classList.remove('selected');
    vinArea.classList.remove('hidden');
    ymmArea.classList.add('hidden');
  });
  chooseYmm.addEventListener('click', () => {
    chooseYmm.classList.add('selected');
    chooseVin.classList.remove('selected');
    ymmArea.classList.remove('hidden');
    vinArea.classList.add('hidden');
  });

  if (!modelsData) {
    fetch('public/data/models_by_year_nested.json')
      .then(r => r.json())
      .then(data => {
        modelsData = data;
        populateYears();
      });
  } else {
    populateYears();
  }

  function populateYears() {
    const yearSel = document.getElementById('yearSelect');
    yearSel.innerHTML = '<option value="">Year</option>' + Object.keys(modelsData).map(y => `<option value="${y}">${y}</option>`).join('');
  }

  document.getElementById('yearSelect').addEventListener('change', (e) => {
    const year = e.target.value;
    const makeSel = document.getElementById('makeSelect');
    makeSel.innerHTML = '<option value="">Make</option>' + Object.keys(modelsData[year] || {}).map(m => `<option value="${m}">${m}</option>`).join('');
    document.getElementById('modelSelect').innerHTML = '<option value="">Model</option>';
  });

  document.getElementById('makeSelect').addEventListener('change', (e) => {
    const year = document.getElementById('yearSelect').value;
    const make = e.target.value;
    const modelSel = document.getElementById('modelSelect');
    modelSel.innerHTML = '<option value="">Model</option>' + (modelsData[year]?.[make] || []).map(m => `<option value="${m}">${m}</option>`).join('');
  });

  document.getElementById('decodeVin').addEventListener('click', async () => {
    const vin = document.getElementById('vinInput').value.trim();
    if (!vin) return;
    const resp = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    const json = await resp.json();
    const results = json.Results || [];
    const getVal = (v) => {
      const item = results.find(r => r.Variable === v);
      return item && item.Value ? item.Value : '';
    };
    document.getElementById('vinYear').value = getVal('Model Year');
    document.getElementById('vinMake').value = getVal('Make');
    document.getElementById('vinModel').value = getVal('Model');
  });

  const addBtn = document.getElementById('addVehicle');
  const list = document.getElementById('vehicleList');
  const nextBtn = document.getElementById('next');
  addBtn.addEventListener('click', () => {
    let year, make, model, vin = '';
    if (!vinArea.classList.contains('hidden')) {
      vin = document.getElementById('vinInput').value.trim();
      year = document.getElementById('vinYear').value;
      make = document.getElementById('vinMake').value;
      model = document.getElementById('vinModel').value;
      if (!year || !make || !model) return;
    } else {
      year = document.getElementById('yearSelect').value;
      make = document.getElementById('makeSelect').value;
      model = document.getElementById('modelSelect').value;
      if (!year || !make || !model) return;
    }
    const vehicle = { year, make, model, vin };
    const idx = formData.vehicles.length;
    formData.vehicles.push(vehicle);
    formData[`vehicleYear${idx}`] = year;
    formData[`vehicleMake${idx}`] = make;
    formData[`vehicleModel${idx}`] = model;
    formData[`vehicleVin${idx}`] = vin;
    formData.vehicleCount = formData.vehicles.length;
    const preview = document.createElement('div');
    preview.className = 'vehicle-preview';
    preview.textContent = `${year} ${make} ${model}`;
    list.appendChild(preview);
    nextBtn.disabled = false;
    document.getElementById('vinInput').value = '';
    document.getElementById('vinYear').value = '';
    document.getElementById('vinMake').value = '';
    document.getElementById('vinModel').value = '';
    document.getElementById('yearSelect').value = '';
    document.getElementById('makeSelect').innerHTML = '<option value="">Make</option>';
    document.getElementById('modelSelect').innerHTML = '<option value="">Model</option>';
  });

  nextBtn.addEventListener('click', () => {
    if (formData.vehicles.length === 0) return;
    nextStep();
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
