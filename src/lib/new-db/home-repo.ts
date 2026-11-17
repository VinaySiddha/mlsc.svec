import { sql } from './client';

export class HomeRepository {
  static async getHeroItems() {
    return await sql`SELECT * FROM home_hero WHERE is_active = true ORDER BY display_order ASC`;
  }

  static async getGalleryItems() {
    return await sql`SELECT * FROM home_gallery ORDER BY display_order ASC`;
  }

  static async getChapters() {
    return await sql`SELECT * FROM home_chapters ORDER BY display_order ASC`;
  }

  static async getAmbassadors() {
    return await sql`SELECT * FROM home_ambassadors ORDER BY display_order ASC`;
  }

  static async addGalleryItem(data: { title?: string; caption?: string; image_url: string; category?: string; order?: number }) {
    const [result] = await sql`
      INSERT INTO home_gallery (title, caption, image_url, category, display_order)
      VALUES (${data.title || null}, ${data.caption || null}, ${data.image_url}, ${data.category || 'general'}, ${data.order || 0})
      RETURNING *
    `;
    return result;
  }
}
