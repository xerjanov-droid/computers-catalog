import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsService } from '@/services/settings.service';
import { SettingsClient } from '@/components/admin/settings/SettingsClient';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/admin/login');
    }

    // Fetch all settings
    const settings = await SettingsService.getAll();

    // Group settings by category
    const settingsByCategory = settings.reduce((acc: any, setting) => {
        if (!acc[setting.category]) {
            acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
    }, {});

    return <SettingsClient initialSettings={settingsByCategory} />;
}

