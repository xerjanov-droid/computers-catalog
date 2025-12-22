
import { UsersClient } from '@/components/admin/users/UsersClient';
import { UserService } from '@/services/user.service';
import { RoleService } from '@/services/role.service';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
    const search = searchParams['search'];
    const status = searchParams['status'];
    const roleId = searchParams['role_id'];

    const users = await UserService.getAll({ search, status, role_id: roleId });
    const roles = await RoleService.getAll();

    return (
        <UsersClient
            initialUsers={users}
            roles={roles}
        />
    );
}
