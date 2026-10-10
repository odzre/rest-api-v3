import 'dotenv/config';
import readline from 'readline';
import { setAdmin } from '../src/services/admin.service.js';
import { hashPassword } from '../src/utils/hash.util.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const email = (await ask('Email admin: ')).trim().toLowerCase();
const password = await ask('Password admin (min 8 karakter): ');

if (!email || !password || password.length < 8) {
  console.error('Email wajib diisi dan password minimal 8 karakter.');
  process.exit(1);
}

const passwordHash = await hashPassword(password);
await setAdmin({ email, passwordHash });

console.log('Admin berhasil disimpan di Redis:', email);
rl.close();
process.exit(0);
