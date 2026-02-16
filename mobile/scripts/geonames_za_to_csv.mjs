/**
 * Convert GeoNames ZA postal-code dump (ZA.txt) to CSV for Supabase import.
 *
 * 1) Download and unzip:
 *    - https://download.geonames.org/export/zip/ZA.zip
 *    - extract ZA.txt
 *
 * 2) Run:
 *    node mobile/scripts/geonames_za_to_csv.mjs --input "path/to/ZA.txt" --output "za_postal_codes.csv"
 *
 * Output columns match `public.za_postal_codes`:
 * country_code, postal_code, place_name, admin_name1, admin_name2, admin_name3, latitude, longitude, accuracy
 */

import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";

function getArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const value = process.argv[idx + 1];
  return value ?? fallback;
}

const inputPath = getArg("--input", path.resolve(process.cwd(), "ZA.txt"));
const outputPath = getArg("--output", path.resolve(process.cwd(), "za_postal_codes.csv"));

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  console.error(`Download https://download.geonames.org/export/zip/ZA.zip and extract ZA.txt`);
  process.exit(1);
}

function csvEscape(value) {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const input = fs.createReadStream(inputPath, { encoding: "utf8" });
const rl = readline.createInterface({ input, crlfDelay: Infinity });

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const out = fs.createWriteStream(outputPath, { encoding: "utf8" });

out.write(
  [
    "country_code",
    "postal_code",
    "place_name",
    "admin_name1",
    "admin_name2",
    "admin_name3",
    "latitude",
    "longitude",
    "accuracy",
  ].join(",") + "\n"
);

let count = 0;
let skipped = 0;

for await (const line of rl) {
  if (!line) continue;
  const parts = line.split("\t");
  // Expected format (readme.txt):
  // 0 country code
  // 1 postal code
  // 2 place name
  // 3 admin name1
  // 4 admin code1
  // 5 admin name2
  // 6 admin code2
  // 7 admin name3
  // 8 admin code3
  // 9 latitude
  // 10 longitude
  // 11 accuracy
  if (parts.length < 12) {
    skipped++;
    continue;
  }

  const row = [
    parts[0], // country_code
    parts[1], // postal_code
    parts[2], // place_name
    parts[3], // admin_name1
    parts[5], // admin_name2
    parts[7], // admin_name3
    parts[9], // latitude
    parts[10], // longitude
    parts[11], // accuracy
  ].map(csvEscape);

  out.write(row.join(",") + "\n");

  count++;
  if (count % 50000 === 0) {
    console.log(`Processed ${count.toLocaleString()} rows...`);
  }
}

out.end();

console.log(`Done. Wrote ${count.toLocaleString()} rows to ${outputPath}`);
if (skipped) console.log(`Skipped ${skipped.toLocaleString()} malformed rows`);

