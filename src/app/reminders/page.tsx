"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function RemindersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const result = await api.get<any[]>("/reminders");
      setReminders(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading reminders…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to load reminders</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "PUC_EXPIRY": return "shield-check";
      case "INSURANCE_EXPIRY": return "shield";
      case "FASTAG_ISSUE": return "card";
      case "SERVICE_DUE": return "wrench";
      default: return "alarm";
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case "PUC_EXPIRY": return "text-green-600 bg-green-100";
      case "INSURANCE_EXPIRY": return "text-blue-600 bg-blue-100";
      case "FASTAG_ISSUE": return "text-amber-600 bg-amber-100";
      case "SERVICE_DUE": return "text-purple-600 bg-purple-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Your Reminders</h2>
            <p className="text-slate-500">Upcoming deadlines and maintenance</p>
          </CardHeader>

          <CardContent className="pt-0">
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-500">No reminders at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getReminderColor(reminder.reminderType)}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{reminder.title}</p>
                      <p className="text-sm text-slate-500">Due: {new Date(reminder.dueAt).toLocaleDateString()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${reminder.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {reminder.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Reminders are automatically generated based on your vehicle documents
        </p>
      </div>
    </div>
  );
}