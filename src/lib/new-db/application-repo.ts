import { sql } from './client';

export interface ApplicationInput {
  name: string;
  email: string;
  phone?: string;
  branch?: string;
  year?: string;
  technical_domain?: string;
  non_technical_domain?: string;
  resume_url?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  notes?: string;
}

export class ApplicationRepository {
  /**
   * Insert a new applicant record (No ORM, pure SQL)
   */
  static async create(data: ApplicationInput) {
    const [result] = await sql`
      INSERT INTO applications (
        name, email, phone, branch, year,
        technical_domain, non_technical_domain,
        resume_url, github_url, linkedin_url, portfolio_url, notes
      ) VALUES (
        ${data.name}, ${data.email}, ${data.phone || null}, ${data.branch || null}, ${data.year || null},
        ${data.technical_domain || null}, ${data.non_technical_domain || null},
        ${data.resume_url || null}, ${data.github_url || null}, ${data.linkedin_url || null}, ${data.portfolio_url || null}, ${data.notes || null}
      )
      RETURNING *
    `;
    return result;
  }

  /**
   * Fetch applications with optional domain or status filter
   */
  static async getFiltered(params: { domain?: string; status?: string; search?: string; limit?: number; offset?: number }) {
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    return await sql`
      SELECT * FROM applications
      WHERE is_archived = false
        ${params.domain ? sql`AND (technical_domain = ${params.domain} OR non_technical_domain = ${params.domain})` : sql``}
        ${params.status ? sql`AND status = ${params.status}` : sql``}
        ${params.search ? sql`AND (name ILIKE ${'%' + params.search + '%'} OR email ILIKE ${'%' + params.search + '%'})` : sql``}
      ORDER BY applied_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  /**
   * Get application by ID
   */
  static async getById(id: string) {
    const [result] = await sql`
      SELECT * FROM applications WHERE id = ${id} LIMIT 1
    `;
    return result || null;
  }

  /**
   * Update application status and score
   */
  static async updateStatus(id: string, status: string, feedback?: string, score?: number) {
    const [result] = await sql`
      UPDATE applications
      SET 
        status = ${status},
        feedback = COALESCE(${feedback || null}, feedback),
        score = COALESCE(${score ?? null}, score),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result;
  }

  /**
   * Archive application
   */
  static async archive(id: string) {
    return await sql`
      UPDATE applications
      SET is_archived = true, updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}
