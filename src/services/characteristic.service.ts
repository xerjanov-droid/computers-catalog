import { query } from '@/lib/db';
import { Characteristic, CategoryCharacteristic } from '@/types';

export class CharacteristicService {
    // Dictionary CRUD
    static async getAll(): Promise<Characteristic[]> {
        const res = await query('SELECT * FROM characteristics ORDER BY key ASC');
        return res.rows;
    }

    static async create(data: Omit<Characteristic, 'id'>): Promise<Characteristic> {
        const sql = `
            INSERT INTO characteristics (key, type, name_ru, name_uz, name_en, options, is_filterable)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        // Ensure options is stringified if it's an object/array, though pg handles JSONB
        const res = await query(sql, [
            data.key, data.type, data.name_ru, data.name_uz, data.name_en,
            JSON.stringify(data.options || []), data.is_filterable
        ]);
        return res.rows[0];
    }

    static async update(id: number, data: Partial<Characteristic>): Promise<Characteristic> {
        // Build dynamic query
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.name_ru) { fields.push(`name_ru=$${idx++}`); values.push(data.name_ru); }
        if (data.name_uz) { fields.push(`name_uz=$${idx++}`); values.push(data.name_uz); }
        if (data.name_en) { fields.push(`name_en=$${idx++}`); values.push(data.name_en); }
        if (data.options) { fields.push(`options=$${idx++}`); values.push(JSON.stringify(data.options)); }
        if (data.is_filterable !== undefined) { fields.push(`is_filterable=$${idx++}`); values.push(data.is_filterable); }
        // Type and Key usually shouldn't change easily, but feasible

        values.push(id);
        const sql = `UPDATE characteristics SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;
        const res = await query(sql, values);
        return res.rows[0];
    }

    static async getById(id: number): Promise<Characteristic | null> {
        const res = await query('SELECT * FROM characteristics WHERE id = $1', [id]);
        return res.rows[0] || null;
    }

    // Category Mapping
    static async getByCategory(categoryId: number): Promise<CategoryCharacteristic[]> {
        const sql = `
            SELECT cc.*, 
                   json_build_object(
                       'id', c.id,
                       'key', c.key,
                       'type', c.type,
                       'name_ru', c.name_ru,
                       'name_uz', c.name_uz,
                       'name_en', c.name_en,
                       'options', c.options
                   ) as characteristic
            FROM category_characteristics cc
            JOIN characteristics c ON cc.characteristic_id = c.id
            WHERE cc.category_id = $1
            ORDER BY cc.order_index ASC
        `;
        const res = await query(sql, [categoryId]);
        return res.rows;
    }

    static async linkToCategory(
        categoryId: number,
        charId: number,
        meta: { order_index?: number, is_required?: boolean, show_in_key_specs?: boolean }
    ) {
        const sql = `
            INSERT INTO category_characteristics (category_id, characteristic_id, order_index, is_required, show_in_key_specs)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (category_id, characteristic_id) DO UPDATE SET
                order_index = EXCLUDED.order_index,
                is_required = EXCLUDED.is_required,
                show_in_key_specs = EXCLUDED.show_in_key_specs
        `;
        await query(sql, [
            categoryId, charId,
            meta.order_index ?? 0,
            meta.is_required ?? false,
            meta.show_in_key_specs ?? false
        ]);
    }

    static async unlinkFromCategory(categoryId: number, charId: number) {
        await query('DELETE FROM category_characteristics WHERE category_id = $1 AND characteristic_id = $2', [categoryId, charId]);
    }
}
