
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const role_id = searchParams.get('role_id') || undefined;

    try {
        const users = await UserService.getAll({ search, status, role_id });
        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic Validation
        if (!body.email || !body.password || !body.role_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await UserService.findByEmail(body.email);
        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const newUser = await UserService.create(body);
        return NextResponse.json(newUser, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
