
import { query } from '@/lib/db';
import { Characteristic } from '@/types';

export class CharacteristicService {
    static async getAll(): Promise<Characteristic[]> {
        const res = await query('SELECT * FROM characteristics ORDER BY id DESC');
        return res.rows;
    }

    static async getById(id: number): Promise<Characteristic | null> {
        const res = await query('SELECT * FROM characteristics WHERE id = $1', [id]);
        const char = res.rows[0];

        if (char && char.type === 'select') {
            const options = await query('SELECT * FROM characteristic_options WHERE characteristic_id = $1 ORDER BY order_index ASC', [id]);
            char.options = options.rows;
        }

        return char || null;
    }

    static async create(data: any): Promise<Characteristic> {
        const { key, name_ru, name_uz, name_en, type, is_filterable, options } = data;

        const res = await query(
            `INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_filterable, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING *`,
            [key, name_ru, name_uz, name_en, type, is_filterable]
        );

        const char = res.rows[0];

        if (type === 'select' && options && options.length > 0) {
            for (const opt of options) {
                await query(
                    `INSERT INTO characteristic_options (characteristic_id, value, label_ru, label_uz, label_en, order_index)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [char.id, opt.value, opt.label_ru, opt.label_uz, opt.label_en, opt.order_index || 0]
                );
            }
        }

        return this.getById(char.id) as Promise<Characteristic>;
    }

    static async update(id: number, data: any): Promise<Characteristic> {
        const { name_ru, name_uz, name_en, is_filterable, options } = data;

        await query(
            `UPDATE characteristics 
             SET name_ru = $1, name_uz = $2, name_en = $3, is_filterable = $4
             WHERE id = $5`,
            [name_ru, name_uz, name_en, is_filterable, id]
        );

        // Handle Options
        // For simplicity, we can clear and re-insert or try to upsert. 
        // Re-inserting is safer for ensuring order and removing deleted ones.
        if (data.type === 'select' && options) {
            await query('DELETE FROM characteristic_options WHERE characteristic_id = $1', [id]);
            for (const opt of options) {
                await query(
                    `INSERT INTO characteristic_options (characteristic_id, value, label_ru, label_uz, label_en, order_index)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [id, opt.value, opt.label_ru, opt.label_uz, opt.label_en, opt.order_index || 0]
                );
            }
        }

        return this.getById(id) as Promise<Characteristic>;
    }

    static async delete(id: number): Promise<void> {
        // Soft delete
        await query('UPDATE characteristics SET is_active = false WHERE id = $1', [id]);
    }

    // Category Linking Methods

    static async getByCategoryId(categoryId: number, lang?: 'ru' | 'uz' | 'en'): Promise<any[]> {
        const res = await query(`
            SELECT c.*, cc.is_required, cc.show_in_key_specs, cc.order_index as link_order
            FROM characteristics c
            JOIN category_characteristics cc ON c.id = cc.characteristic_id
            WHERE cc.category_id = $1 AND c.is_active = true
            ORDER BY cc.order_index ASC
        `, [categoryId]);

        const chars = res.rows;

        // Populate options for select types and localize labels
        for (const char of chars) {
            if (char.type === 'select') {
                const options = await query('SELECT * FROM characteristic_options WHERE characteristic_id = $1 ORDER BY order_index ASC', [char.id]);
                char.options = options.rows.map((o: any) => ({
                    ...o,
                    label: lang ? (o[`label_${lang}`] || o.label_ru) : undefined
                }));
            }
            if (lang) {
                char.name = char[`name_${lang}`] || char.name_ru;
            }
        }

        return chars;
    }

    static async assignToCategory(categoryId: number, characteristicId: number, config: { is_required?: boolean, show_in_key_specs?: boolean, order_index?: number }): Promise<void> {
        await query(`
            INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (category_id, characteristic_id) DO UPDATE 
            SET is_required = EXCLUDED.is_required,
                show_in_key_specs = EXCLUDED.show_in_key_specs,
                order_index = EXCLUDED.order_index
        `, [
            categoryId,
            characteristicId,
            config.is_required || false,
            config.show_in_key_specs || false,
            config.order_index || 0
        ]);
    }

    static async removeFromCategory(categoryId: number, characteristicId: number): Promise<void> {
        await query('DELETE FROM category_characteristics WHERE category_id = $1 AND characteristic_id = $2', [categoryId, characteristicId]);
    }

    static async updateCategoryLink(categoryId: number, characteristicId: number, config: { is_required?: boolean, show_in_key_specs?: boolean, order_index?: number }): Promise<void> {
        const fields = [];
        const values: (number | boolean)[] = [categoryId, characteristicId];
        let idx = 3;

        if (config.is_required !== undefined) {
            fields.push(`is_required = $${idx++}`);
            values.push(config.is_required);
        }
        if (config.show_in_key_specs !== undefined) {
            fields.push(`show_in_key_specs = $${idx++}`);
            values.push(config.show_in_key_specs);
        }
        if (config.order_index !== undefined) {
            fields.push(`order_index = $${idx++}`);
            values.push(config.order_index);
        }

        if (fields.length === 0) return;

        await query(
            `UPDATE category_characteristics SET ${fields.join(', ')} 
             WHERE category_id = $1 AND characteristic_id = $2`,
            values
        );
    }
    static async copyCharacteristics(sourceSubcategoryId: number, targetSubcategoryId: number): Promise<void> {
        // Bulk copy characteristics from source to target subcategory
        // Update existing links to match source configuration (strict order enforcement)
        await query(`
            INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
            SELECT $1, characteristic_id, is_required, show_in_key_specs, order_index
            FROM category_characteristics
            WHERE category_id = $2
            ON CONFLICT (category_id, characteristic_id) 
            DO UPDATE SET
                is_required = EXCLUDED.is_required,
                show_in_key_specs = EXCLUDED.show_in_key_specs,
                order_index = EXCLUDED.order_index
        `, [targetSubcategoryId, sourceSubcategoryId]);
    }
}
