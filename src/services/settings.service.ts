import { query } from '@/lib/db';

export interface Setting {
    id: number;
    key: string;
    value: any;
    category: 'general' | 'localization' | 'catalog' | 'filters' | 'orders' | 'security' | 'system';
    description?: string;
    updated_by?: number;
    updated_at: Date;
    created_at: Date;
}

export class SettingsService {
    static async getAll(): Promise<Setting[]> {
        const res = await query('SELECT * FROM settings ORDER BY category, key');
        // pg library automatically parses JSONB values correctly
        // No need to manually parse - just return as is
        return res.rows;
    }

    static async getByCategory(category: string): Promise<Setting[]> {
        const res = await query('SELECT * FROM settings WHERE category = $1 ORDER BY key', [category]);
        // pg library automatically parses JSONB values correctly
        return res.rows;
    }

    static async get(key: string): Promise<Setting | null> {
        const res = await query('SELECT * FROM settings WHERE key = $1', [key]);
        if (res.rows.length === 0) return null;
        // pg library automatically parses JSONB values correctly
        return res.rows[0];
    }

    static async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
        const setting = await this.get(key);
        if (!setting) return defaultValue as T;
        return setting.value as T;
    }

    static async set(key: string, value: any, category: string, userId?: number): Promise<Setting> {
        // Convert value to JSONB format
        // Always stringify to ensure proper JSONB format
        let valueJson: string;
        if (typeof value === 'string') {
            // Check if it's already valid JSON (starts with {, [, or quoted)
            const trimmed = value.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[') || 
                (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                // Try to parse to validate, but always stringify for consistency
                try {
                    JSON.parse(value);
                    valueJson = value; // Already valid JSON
                } catch {
                    valueJson = JSON.stringify(value); // Wrap simple string
                }
            } else {
                // Simple string like "in_stock" - wrap it
                valueJson = JSON.stringify(value);
            }
        } else {
            valueJson = JSON.stringify(value);
        }
        
        const res = await query(
            `INSERT INTO settings (key, value, category, updated_by, updated_at)
             VALUES ($1, $2::jsonb, $3, $4, now())
             ON CONFLICT (key) DO UPDATE SET
                 value = EXCLUDED.value,
                 category = EXCLUDED.category,
                 updated_by = EXCLUDED.updated_by,
                 updated_at = now()
             RETURNING *`,
            [key, valueJson, category, userId]
        );
        // pg library automatically parses JSONB values correctly
        return res.rows[0];
    }

    static async update(key: string, value: any, userId?: number): Promise<Setting> {
        // Convert value to JSONB format
        let valueJson: string;
        if (typeof value === 'string') {
            // Check if it's already valid JSON (starts with {, [, or quoted)
            const trimmed = value.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[') || 
                (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
                // Try to parse to validate, but always stringify for consistency
                try {
                    JSON.parse(value);
                    valueJson = value; // Already valid JSON
                } catch {
                    valueJson = JSON.stringify(value); // Wrap simple string
                }
            } else {
                // Simple string like "in_stock" - wrap it
                valueJson = JSON.stringify(value);
            }
        } else {
            valueJson = JSON.stringify(value);
        }
        
        const res = await query(
            `UPDATE settings 
             SET value = $1::jsonb, updated_by = $2, updated_at = now()
             WHERE key = $3
             RETURNING *`,
            [valueJson, userId, key]
        );
        if (res.rows.length === 0) {
            throw new Error(`Setting with key "${key}" not found`);
        }
        // pg library automatically parses JSONB values correctly
        return res.rows[0];
    }

    static async updateMany(updates: { key: string; value: any }[], userId?: number): Promise<Setting[]> {
        await query('BEGIN');
        try {
            const results: Setting[] = [];
            for (const update of updates) {
                const setting = await this.update(update.key, update.value, userId);
                results.push(setting);
            }
            await query('COMMIT');
            return results;
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }

    static async delete(key: string): Promise<void> {
        await query('DELETE FROM settings WHERE key = $1', [key]);
    }
}

