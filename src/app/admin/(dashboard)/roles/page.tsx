
import { RolesClient } from '@/components/admin/roles/RolesClient';
import { RoleService } from '@/services/role.service';

export const dynamic = 'force-dynamic';

export default async function RolesPage() {
    const roles = await RoleService.getAll();

    return (
        <RolesClient initialRoles={roles} />
    );
}
