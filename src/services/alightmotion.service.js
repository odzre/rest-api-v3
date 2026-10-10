import crypto from 'crypto';

const DEFAULTS = {
  orderPrefix: 'tskiofc',
  apiKey: 'AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0',
  productId: 'am.full.sub.annual.19q4',
  purchaseToken:
    'mmgaobamlahbbeccfplmbkbb.AO-J1OzqG0or_GJJIx-ms8GrTm-jaglCRfhQSRPUZKpl2YspYS-oN7_94uv8RC5vQbvd_Ios2pPDStZ2n7F0hLE3FiOU7HS3R6Fquulv5xLXFECSv4ctElw',
  skuType: 'subs',
  firebaseInstanceIdToken:
    'cSDnCyp3T-uwp07z3tL86T:APA91bFkmvvsHw5nnqa1SBFci-99DRsKClLiETdRrVcJjS5yBx1v_FbCb1d8WhBuea_zmwnYBktyTIzcRhN4b6uNOUur9wPc0gKXmJDoZic0LhNq5V2s0xI',
  headers: {
    'Content-Type': 'application/json',
    'X-Android-Package': 'com.alightcreative.motion',
    'X-Android-Cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 15; 23127PN0CC Build/BP1A.250505.005)',
  },
};

export class AlightMotionAuth {
  constructor(config = {}) {
    const cfg = { ...DEFAULTS, ...config };
    this.orderPrefix = cfg.orderPrefix;
    this.apiKey = cfg.apiKey;
    this.productId = cfg.productId;
    this.purchaseToken = cfg.purchaseToken;
    this.skuType = cfg.skuType;
    this.firebaseInstanceIdToken = cfg.firebaseInstanceIdToken;
    this.headers = cfg.headers;
  }

  generateCodeOrder() {
    return crypto.randomInt(10000, 99999).toString();
  }

  extractOobCode(fullUrl) {
    if (!fullUrl) return null;
    try {
      let cleanUrl = fullUrl.replace(/&amp;/g, '&');
      try {
        cleanUrl = decodeURIComponent(cleanUrl);
      } catch {}

      try {
        const urlObj = new URL(cleanUrl);
        let oobCode = urlObj.searchParams.get('oobCode');
        if (!oobCode) {
          const nestedLink =
            urlObj.searchParams.get('link') || urlObj.searchParams.get('q') || urlObj.searchParams.get('url');
          if (nestedLink) {
            try {
              const innerUrlObj = new URL(nestedLink);
              oobCode = innerUrlObj.searchParams.get('oobCode');
            } catch {}
          }
        }
        if (oobCode) return oobCode.replace(/[^a-zA-Z0-9_-]/g, '');
      } catch {}

      const match =
        cleanUrl.match(/[?&]oobCode=([a-zA-Z0-9_-]+)/i) || cleanUrl.match(/oobCode=([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch {
      return null;
    }
  }

  async sendMagicLink(email) {
    try {
      const createRes = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/createAuthUri?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ identifier: email, continueUri: 'http://localhost' }),
          signal: AbortSignal.timeout(30000),
        }
      );
      if (!createRes.ok) {
        const errText = await createRes.text().catch(() => '');
        return { success: false, error: errText || `HTTP ${createRes.status}` };
      }
      const res = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            requestType: 6,
            email: email,
            androidInstallApp: true,
            canHandleCodeInApp: true,
            continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
            iosBundleId: 'com.alightcreative.motion',
            androidPackageName: 'com.alightcreative.motion',
            androidMinimumVersion: '585',
            clientType: 'CLIENT_TYPE_ANDROID',
          }),
          signal: AbortSignal.timeout(30000),
        }
      );
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        return { success: false, error: errBody || `HTTP ${res.status}` };
      }
      return { success: true, message: 'Link berhasil dikirim.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyAndFetchProfile(email, rawLink) {
    try {
      const oobCode = this.extractOobCode(rawLink);
      if (!oobCode) throw new Error('Gagal mengekstrak oobCode dari link.');

      const signinRes = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/emailLinkSignin?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            email: email,
            oobCode: oobCode,
            clientType: 'CLIENT_TYPE_ANDROID',
          }),
          signal: AbortSignal.timeout(30000),
        }
      );
      const signinData = await signinRes.json().catch(() => ({}));
      if (!signinRes.ok) {
        return {
          success: false,
          error:
            (signinData && signinData.error && signinData.error.message) ||
            `HTTP ${signinRes.status}`,
        };
      }

      const accountRes = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ idToken: signinData.idToken }),
          signal: AbortSignal.timeout(30000),
        }
      );
      const accountData = await accountRes.json().catch(() => ({}));
      if (!accountRes.ok) {
        return {
          success: false,
          error:
            (accountData && accountData.error && accountData.error.message) ||
            `HTTP ${accountRes.status}`,
        };
      }

      return {
        success: true,
        idToken: signinData.idToken,
        user: accountData.users && accountData.users[0],
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async applyPremium(idToken) {
    try {
      const codeorder = this.generateCodeOrder();
      const res = await fetch(
        'https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase',
        {
          method: 'POST',
          headers: {
            authorization: 'Bearer ' + idToken,
            'firebase-instance-id-token': this.firebaseInstanceIdToken,
            'content-type': 'application/json; charset=utf-8',
            'accept-encoding': 'gzip',
            'user-agent': 'okhttp/3.12.1',
          },
          body: JSON.stringify({
            data: {
              productId: this.productId,
              token: this.purchaseToken,
              skuType: this.skuType,
              orderId: this.orderPrefix + '-' + codeorder,
            },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );
      const body = await res.text().catch(() => '');
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        data = body;
      }
      if (!res.ok) {
        const errMsg =
          (data && data.error && (data.error.message || data.error)) || body || `HTTP ${res.status}`;
        return { success: false, error: typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg };
      }
      return { success: true, data, codeorder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default AlightMotionAuth;
