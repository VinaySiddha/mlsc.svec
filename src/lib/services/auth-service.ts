import * as jose from 'jose';

export class AuthService {
  static checkRequiredSecrets() {
    const secretsToCheck = [
      { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
      { name: 'GOOGLE_API_KEY', value: process.env.GOOGLE_API_KEY },
      { name: 'GMAIL_USER', value: process.env.GMAIL_USER },
      { name: 'GMAIL_APP_PASSWORD', value: process.env.GMAIL_APP_PASSWORD },
      { name: 'JSEARCH_API_KEY', value: process.env.JSEARCH_API_KEY },
    ];

    for (const secret of secretsToCheck) {
      if (!secret.value) {
        return { name: secret.name, isMissing: true };
      }
    }
    return { isMissing: false };
  }

  static authenticateUser(username: string, password: string) {
    const SUPER_ADMIN_USERNAME = 'vinaysiddha';
    const SUPER_ADMIN_PASSWORD = 'Vinay@15';

    const panelCredentials = [
      { username: 'gen_ai_panel', password: 'panel@genai', domain: 'gen_ai' },
      { username: 'ds_ml_panel', password: 'panel@ds', domain: 'ds_ml' },
      { username: 'azure_panel', password: 'panel@azure', domain: 'azure' },
      { username: 'web_app_panel', password: 'panel@web', domain: 'web_app' },
    ];

    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
      return { role: 'admin', username };
    }

    const panel = panelCredentials.find(
      (p) => p.username === username && p.password === password
    );
    if (panel) {
      return { role: 'panel', domain: panel.domain, username };
    }

    return null;
  }

  static async generateToken(payload: { role: string; domain?: string; username: string }) {
    const JWT_SECRET = process.env.JWT_SECRET!;
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);
    return token;
  }
}
