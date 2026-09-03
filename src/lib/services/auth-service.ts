import { SignJWT } from 'jose';

export class AuthService {
  static checkRequiredSecrets() {
    const secretsToCheck = [
      { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
      { name: 'GOOGLE_API_KEY', value: process.env.GOOGLE_API_KEY },
      { name: 'GMAIL_USER', value: process.env.GMAIL_USER },
      { name: 'GMAIL_APP_PASSWORD', value: process.env.GMAIL_APP_PASSWORD },
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
      return { role: 'admin', username, email: 'vinaysiddha.mlsc@gmail.com' };
    }

    const panel = panelCredentials.find(
      (p) => p.username === username && p.password === password
    );
    if (panel) {
      return { role: 'panel', domain: panel.domain, username: panel.username, email: `${panel.username}@mlsc.svec` };
    }

    return null;
  }

  static async generateToken(payload: { role: string; domain?: string; username: string; email?: string }) {
    const JWT_SECRET = process.env.JWT_SECRET!;
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);
    return token;
  }

  static async verifyToken(token: string) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;
    const secret = new TextEncoder().encode(JWT_SECRET);
    try {
      const { jwtVerify } = await import('jose');
      const { payload } = await jwtVerify(token, secret);
      return payload as { role?: string; domain?: string; username?: string; email?: string; name?: string };
    } catch {
      return null;
    }
  }

  static async getSessionUser() {
    try {
      const { cookies, headers } = await import('next/headers');
      
      try {
        const headersList = await headers();
        const headerUsername = headersList.get('X-User-Username');
        const headerEmail = headersList.get('X-User-Email');
        const headerRole = headersList.get('X-User-Role');
        const headerDomain = headersList.get('X-Panel-Domain');

        if (headerUsername || headerEmail || headerRole) {
          return {
            username: headerUsername || undefined,
            email: headerEmail || undefined,
            role: headerRole || undefined,
            domain: headerDomain || undefined,
          };
        }
      } catch {
        // Fallback to cookie check if headers are not available in current scope
      }

      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('session')?.value;
      if (!sessionToken) return null;
      return await this.verifyToken(sessionToken);
    } catch {
      return null;
    }
  }
}
