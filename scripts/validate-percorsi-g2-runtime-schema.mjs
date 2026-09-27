import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const file = process.argv[2];
if (!file) throw new Error('usage: node scripts/validate-percorsi-g2-runtime-schema.mjs <receipt.json>');
const schema = JSON.parse(fs.readFileSync(new URL('../schemas/percorsi-g2-runtime-qualification.schema.json', import.meta.url), 'utf8'));
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const ajv = new Ajv2020({allErrors:true, strict:true});
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(data)) {
  console.error('FAIL JSON Schema Draft 2020-12', JSON.stringify(validate.errors));
  process.exit(1);
}
console.log('PASS JSON Schema Draft 2020-12');
