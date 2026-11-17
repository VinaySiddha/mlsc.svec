import { sql } from './client';

export interface TeamMemberInput {
  name: string;
  email: string;
  role: string;
  category_id?: string;
  image_url?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  status?: string;
}

export class TeamRepository {
  static async getCategories() {
    return await sql`SELECT * FROM team_categories ORDER BY display_order ASC`;
  }

  static async createCategory(name: string, description?: string, displayOrder = 0) {
    const [result] = await sql`
      INSERT INTO team_categories (name, description, display_order)
      VALUES (${name}, ${description || null}, ${displayOrder})
      RETURNING *
    `;
    return result;
  }

  static async getMembers(status = 'active') {
    return await sql`
      SELECT m.*, c.name as category_name
      FROM team_members m
      LEFT JOIN team_categories c ON m.category_id = c.id
      WHERE m.status = ${status}
      ORDER BY m.name ASC
    `;
  }

  static async createMember(data: TeamMemberInput) {
    const [result] = await sql`
      INSERT INTO team_members (
        name, email, role, category_id, image_url, linkedin_url, github_url, twitter_url, status
      ) VALUES (
        ${data.name}, ${data.email}, ${data.role}, ${data.category_id || null},
        ${data.image_url || null}, ${data.linkedin_url || null}, ${data.github_url || null}, ${data.twitter_url || null},
        ${data.status || 'active'}
      )
      RETURNING *
    `;
    return result;
  }
}
