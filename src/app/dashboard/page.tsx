"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannerAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user, accessToken, logout, isAuthenticated } = useScannerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Manage your tags and assets</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold">Public ID</p>
              <p className="font-mono text-sm">{user.publicId}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold">Role</p>
              <p className="font-mono text-sm">{user.role}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
              <p className="font-mono text-sm">{user.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Tags</h2>
          <p className="text-slate-600 mb-4">Manage your scannable tags</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tags will be loaded from API */}
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <p className="text-slate-500 text-sm">No tags yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
