// generar-apple-secret.js
//
// Genera el "client secret" de Sign in with Apple (un JWT firmado con ES256).
// Corre 100% local: la llave privada nunca sale de tu máquina.
//
//   node generar-apple-secret.js
//
// No necesita instalar nada: usa el módulo crypto de Node.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// LLENA ESTOS CUATRO VALORES
// ---------------------------------------------------------------------------
const TEAM_ID     = 'XD4752SP79';                              // arriba a la derecha en developer.apple.com
const KEY_ID      = 'UT4H698687';                              // los 10 caracteres de la pantalla de la Key
const SERVICES_ID = 'com.jacarandalab.catrineando.signin';     // el Services ID, NO el bundle
const P8_PATH     = './AuthKey_UT4H698687.p8';                 // ruta al archivo descargado
// ---------------------------------------------------------------------------

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function main() {
  const ruta = path.resolve(P8_PATH);

  if (!fs.existsSync(ruta)) {
    console.error(`\n❌ No encuentro el .p8 en: ${ruta}`);
    console.error('   Ajusta P8_PATH arriba.\n');
    process.exit(1);
  }

  if (KEY_ID === 'PONER_AQUI' || KEY_ID.length !== 10) {
    console.error('\n❌ KEY_ID debe ser la cadena de 10 caracteres de tu Key.\n');
    process.exit(1);
  }

  const privateKey = fs.readFileSync(ruta, 'utf8');

  const ahora = Math.floor(Date.now() / 1000);
  // Apple no acepta más de 6 meses (15777000 s). Usamos el máximo.
  const expira = ahora + 15777000;

  const header = { alg: 'ES256', kid: KEY_ID };
  const payload = {
    iss: TEAM_ID,
    iat: ahora,
    exp: expira,
    aud: 'https://appleid.apple.com',
    sub: SERVICES_ID,
  };

  const cuerpo =
    `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  // dsaEncoding ieee-p1363 = formato JOSE (r||s). Sin esto Apple rechaza la firma.
  const firma = crypto.sign('sha256', Buffer.from(cuerpo), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });

  const jwt = `${cuerpo}.${base64url(firma)}`;

  console.log('\n✅ Client secret generado:\n');
  console.log(jwt);
  console.log(`\n📅 Caduca el ${new Date(expira * 1000).toLocaleDateString('es-MX')}`);
  console.log('   Ponte un recordatorio: cuando expira, el login deja de');
  console.log('   funcionar sin avisar.\n');
}

main();