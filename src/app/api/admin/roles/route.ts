
import { NextResponse } from 'next/server';
import { RoleService } from '@/services/role.service';

export async function GET() {
    try {
        const roles = await RoleService.getAll();
        return NextResponse.json(roles);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
