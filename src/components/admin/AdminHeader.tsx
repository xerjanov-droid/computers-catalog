"use client";

import { Bell } from "lucide-react";
import { AdminLanguageSwitcher } from "./AdminLanguageSwitcher";

export function AdminHeader() {
    return (
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
            {/* Left: Breadcrumbs or Title (optional) */}
            <div />

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                <AdminLanguageSwitcher />

                <button className="text-gray-400 hover:text-gray-600 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-900">Admin User</div>
                        <div className="text-xs text-gray-500">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        A
                    </div>
                </div>
            </div>
        </header>
    );
}
