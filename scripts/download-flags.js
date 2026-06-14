const https = require('https');
const fs = require('fs');
const path = require('path');

const FLAGS_DIR = path.join(__dirname, '../assets/flags');

// FIFA code → flagcdn code
const TEAMS = {
  ARG: 'ar', MEX: 'mx', BRA: 'br', USA: 'us', CAN: 'ca', URU: 'uy',
  COL: 'co', ECU: 'ec', CHI: 'cl', PAR: 'py', PAN: 'pa', HAI: 'ht',
  CUW: 'cw',
  FRA: 'fr', ESP: 'es', GER: 'de', ENG: 'gb-eng', POR: 'pt', NED: 'nl',
  CRO: 'hr', NOR: 'no', SUI: 'ch', BEL: 'be', DEN: 'dk', AUT: 'at',
  SWE: 'se', SCO: 'gb-sct', CZE: 'cz', TUR: 'tr', BIH: 'ba',
  MAR: 'ma', SEN: 'sn', TUN: 'tn', EGY: 'eg', ALG: 'dz', CIV: 'ci',
  GHA: 'gh', NGA: 'ng', CMR: 'cm', RSA: 'za', COD: 'cd', CPV: 'cv',
  KSA: 'sa', JPN: 'jp', KOR: 'kr', IRN: 'ir', AUS: 'au', QAT: 'qa',
  IRQ: 'iq', JOR: 'jo', UZB: 'uz', NZL: 'nz',
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(FLAGS_DIR)) fs.mkdirSync(FLAGS_DIR, { recursive: true });

  for (const [code, cdn] of Object.entries(TEAMS)) {
    const url = `https://flagcdn.com/64x48/${cdn}.png`;
    const dest = path.join(FLAGS_DIR, `${code}.png`);
    try {
      await download(url, dest);
      console.log(`✓ ${code} (${cdn})`);
    } catch (e) {
      console.log(`✗ ${code}: ${e.message}`);
    }
  }
  console.log('Listo!');
}

main();
