"use client";

import { useState } from "react";

export default function DeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });
    setSubmitting(true);

    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, confirmDelete })
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", message: data?.message || "Request failed." });
        setSubmitting(false);
        return;
      }

      setStatus({
        type: "success",
        message: "Your request has been received. We will process it shortly."
      });
      setEmail("");
      setConfirmDelete(false);
    } catch (error) {
      setStatus({ type: "error", message: "Request failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Account Deletion Request
        </h1>
        <p className="mt-2 text-gray-600">
          Submit a request to permanently delete your GugaStream account data.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              required
            />
            <span>
              I confirm that I want my profile, history, and all related data
              permanently deleted.
            </span>
          </label>

          {status.type !== "idle" && (
            <div
              className={
                status.type === "success"
                  ? "rounded-md bg-green-50 p-3 text-sm text-green-700"
                  : "rounded-md bg-red-50 p-3 text-sm text-red-700"
              }
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gray-900 py-2.5 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
