const zipInput = document.getElementById('zip');
const zipForm = document.getElementById('zip-form');
const errorMsg = document.getElementById('zip-error');
const overlay = document.querySelector('.overlay');
const app = document.getElementById('app');
const progressContainer = document.getElementById('progress-container');

zipInput.addEventListener('input', () => {
  errorMsg.classList.add('hidden');
});

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
  renderThankYou(); // Replace this with full multi-step flow later
}

function renderThankYou() {
  app.innerHTML = `
    <div class="card">
      <h2>Thanks!</h2>
      <p>We’re processing your information and preparing your quote.</p>
    </div>
  `;
}
