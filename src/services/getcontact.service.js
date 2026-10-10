import crypto from 'crypto';
import { getGetContactConfig } from './config.service.js';

const DEFAULTS = {
  baseURL: 'https://pbssrv-centralevents.com',
  clientDeviceId: '174680a6f1765b5f',
  hmacSecretKey:
    '31426764382a642f3a6665497235466f3d236d5d785b722b4c657457442a495b494524324866782a2364292478587a78662d7a7b7578593f71703e2b7e365762',
  androidOS: 'android 9',
  appVersion: '8.4.0',
  lang: 'en_US',
  countryCode: 'id',
};

export class GetContactClient {
  constructor(config) {
    const cfg = { ...DEFAULTS, ...config };
    this.baseURL = cfg.baseURL;
    this.clientDeviceId = cfg.clientDeviceId;
    this.hmacSecretKey = cfg.hmacSecretKey;
    this.androidOS = cfg.androidOS;
    this.appVersion = cfg.appVersion;
    this.lang = cfg.lang;
    this.countryCode = cfg.countryCode;
    this.finalKey = cfg.finalKey;
    this.token = cfg.token;
  }

  sign(timestamp, message) {
    return crypto
      .createHmac('sha256', Buffer.from(this.hmacSecretKey, 'hex'))
      .update(`${timestamp}-${message}`)
      .digest('base64');
  }

  encrypt(data, passphrase) {
    const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(passphrase, 'hex'), null);
    cipher.setAutoPadding(true);
    return Buffer.concat([cipher.update(Buffer.from(data, 'utf8')), cipher.final()]).toString('base64');
  }

  decrypt(data, passphrase) {
    const decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(passphrase, 'hex'), null);
    decipher.setAutoPadding(true);
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
  }

  async request(endpoint, requestBody) {
    const bodyJson = JSON.stringify(requestBody);
    const timestamp = Date.now() * 1000;
    const encryptedData = this.encrypt(bodyJson, this.finalKey);
    const signature = this.sign(timestamp, bodyJson);

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-os': this.androidOS,
        'x-app-version': this.appVersion,
        'x-client-device-id': this.clientDeviceId,
        'x-lang': this.lang,
        'x-token': this.token,
        'x-req-timestamp': timestamp.toString(),
        'x-country-code': this.countryCode,
        'x-encrypted': '1',
        'x-req-signature': signature,
        Accept: 'application/json',
        'User-Agent': 'okhttp/4.9.3',
      },
      body: JSON.stringify({ data: encryptedData }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = new Error(`Upstream HTTP ${res.status}`);
      err.statusCode = 502;
      throw err;
    }

    const data = await res.json();
    if (data && data.data) {
      try {
        return JSON.parse(this.decrypt(data.data, this.finalKey));
      } catch {
        return data;
      }
    }
    return data;
  }

  async search(phoneNumber) {
    return this.request('/v2.8/search', {
      countryCode: this.countryCode,
      phoneNumber,
      source: 'search',
      token: this.token,
    });
  }

  async getTags(phoneNumber) {
    return this.request('/v2.8/number-detail', {
      countryCode: this.countryCode,
      phoneNumber,
      source: 'profile',
      token: this.token,
    });
  }

  async subscription() {
    return this.request('/v2.8/subscription', { token: this.token });
  }
}

export const normPhone = (raw) => {
  let s = String(raw || '').replace(/[^\d+]/g, '');
  if (!s) return null;
  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('0')) s = '62' + s.slice(1);
  if (!s.startsWith('62')) s = '62' + s;
  return '+' + s;
};

export const createClientFromConfig = async () => {
  const stored = await getGetContactConfig();
  if (!stored.finalKey || !stored.token) {
    const err = new Error('GetContact belum dikonfigurasi. Admin harus memasang finalKey & token terlebih dahulu.');
    err.statusCode = 503;
    err.code = 'GETCONTACT_NOT_CONFIGURED';
    throw err;
  }
  return new GetContactClient(stored);
};
