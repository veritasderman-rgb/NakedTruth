// Applies SQL files to the Neon database over HTTPS (no direct Postgres port
// needed). Each file runs in a single transaction.
//   DATABASE_URL=... node scripts/db-apply.mjs db/schema.sql db/seed_questions.sql
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// Split a SQL script into statements, respecting '...' strings, $tag$...$tag$
// bodies and -- line comments.
export function splitSql(text) {
  const out = [];
  let cur = '';
  let i = 0;
  let dollar = null;
  while (i < text.length) {
    const ch = text[i];
    if (dollar) {
      if (text.startsWith(dollar, i)) { cur += dollar; i += dollar.length; dollar = null; }
      else { cur += ch; i++; }
    } else if (ch === '-' && text[i + 1] === '-') {
      while (i < text.length && text[i] !== '\n') i++;
    } else if (ch === "'") {
      let j = i + 1;
      while (j < text.length) {
        if (text[j] === "'" && text[j + 1] === "'") j += 2;
        else if (text[j] === "'") break;
        else j++;
      }
      cur += text.slice(i, j + 1);
      i = j + 1;
    } else if (ch === '$') {
      const m = /^\$[A-Za-z_]*\$/.exec(text.slice(i, i + 64));
      if (m) { dollar = m[0]; cur += dollar; i += dollar.length; }
      else { cur += ch; i++; }
    } else if (ch === ';') {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
      i++;
    } else { cur += ch; i++; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((s) => !/^(begin|commit)$/i.test(s));
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: node scripts/db-apply.mjs <file.sql> [...]');
  process.exit(1);
}

const sql = neon(url);
for (const file of files) {
  const statements = splitSql(readFileSync(file, 'utf8'));
  await sql.transaction(statements.map((s) => sql.query(s)));
  console.log(`${file}: ${statements.length} statements applied`);
}
