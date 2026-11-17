import { sql } from './client';

export interface EventInput {
  title: string;
  description?: string;
  event_date?: Date | string;
  end_date?: Date | string;
  location?: string;
  mode?: string;
  banner_image?: string;
  list_image?: string;
  highlight_images?: string[];
  speakers?: any[];
  seat_limits?: number;
  is_featured?: boolean;
}

export class EventRepository {
  static async create(data: EventInput) {
    const [result] = await sql`
      INSERT INTO events (
        title, description, event_date, end_date, location, mode,
        banner_image, list_image, highlight_images, speakers, seat_limits, is_featured
      ) VALUES (
        ${data.title}, ${data.description || null}, ${data.event_date ? new Date(data.event_date) : null},
        ${data.end_date ? new Date(data.end_date) : null}, ${data.location || null}, ${data.mode || 'offline'},
        ${data.banner_image || null}, ${data.list_image || null},
        ${JSON.stringify(data.highlight_images || [])}::jsonb,
        ${JSON.stringify(data.speakers || [])}::jsonb,
        ${data.seat_limits || 0}, ${data.is_featured || false}
      )
      RETURNING *
    `;
    return result;
  }

  static async getAll() {
    return await sql`
      SELECT * FROM events ORDER BY event_date DESC
    `;
  }

  static async getById(id: string) {
    const [result] = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`;
    return result || null;
  }

  static async registerUser(eventId: string, user: { name: string; email: string; phone?: string; rollNumber?: string }) {
    const [result] = await sql`
      INSERT INTO event_registrations (
        event_id, user_name, user_email, phone, roll_number
      ) VALUES (
        ${eventId}, ${user.name}, ${user.email}, ${user.phone || null}, ${user.rollNumber || null}
      )
      ON CONFLICT (event_id, user_email) DO NOTHING
      RETURNING *
    `;
    return result;
  }

  static async getRegistrations(eventId: string) {
    return await sql`
      SELECT * FROM event_registrations WHERE event_id = ${eventId} ORDER BY registered_at DESC
    `;
  }
}
