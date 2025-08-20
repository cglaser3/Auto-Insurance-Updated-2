const { writeFile } = require('fs/promises');

const START_YEAR = 1981;
const END_YEAR = 2025;
const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function buildDataset() {
  const makesData = await fetchJSON(`${BASE_URL}/GetAllMakes?format=json`);
  const makes = makesData.Results.map(r => r.Make_Name);
  const dataset = {};

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    dataset[year] = {};
    for (const make of makes) {
      const url = `${BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
      const modelData = await fetchJSON(url);
      const models = modelData.Results.map(r => r.Model_Name).filter(Boolean);
      if (models.length) dataset[year][make] = models;
    }
    console.log(`Processed ${year}`);
  }

  await writeFile('public/data/models_by_year_nested.json', JSON.stringify(dataset, null, 2));
}

buildDataset().catch(err => {
  console.error(err);
  process.exit(1);
});
