"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function RegisterForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [birthday, setBirthday] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [joinReason, setJoinReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setResult(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("submit_registration_request", {
        p_token: token,
        p_name: name.trim(),
        p_phone_number: phoneNumber.trim() || undefined,
        p_occupation: occupation.trim() || undefined,
        p_gender: gender || undefined,
        p_marital_status: maritalStatus || undefined,
        p_birthday: birthday || undefined,
        p_anniversary_date: maritalStatus === "married" ? anniversaryDate || undefined : undefined,
        p_residential_address: residentialAddress.trim() || undefined,
        p_join_reason: joinReason.trim() || undefined,
      })
      .single();

    setSubmitting(false);

    if (error) {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
      return;
    }

    switch (data.outcome) {
      case "created":
        setResult({ ok: true, message: `Thank you, ${name.trim()}. Your registration was submitted for review.` });
        break;
      case "invalid_link":
        setResult({ ok: false, message: "This registration link is no longer active." });
        break;
      case "missing_name":
        setResult({ ok: false, message: "Name is required." });
        break;
      default:
        setResult({ ok: false, message: "Could not submit your registration. Please try again." });
    }
  }

  if (result) {
    return (
      <Alert tone={result.ok ? "success" : "error"} className="mt-4">
        {result.message}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone_number" className="text-sm font-medium text-neutral-700">
          Phone number
        </label>
        <input
          id="phone_number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="occupation" className="text-sm font-medium text-neutral-700">
          Occupation
        </label>
        <input
          id="occupation"
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="gender" className="text-sm font-medium text-neutral-700">
          Gender
        </label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">Not specified</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="marital_status" className="text-sm font-medium text-neutral-700">
          Marital status
        </label>
        <select
          id="marital_status"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">Not specified</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="widowed">Widowed</option>
          <option value="divorced">Divorced</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="birthday" className="text-sm font-medium text-neutral-700">
          Birthday
        </label>
        <input
          id="birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {maritalStatus === "married" && (
        <div className="space-y-1">
          <label htmlFor="anniversary_date" className="text-sm font-medium text-neutral-700">
            Wedding anniversary
          </label>
          <input
            id="anniversary_date"
            type="date"
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="residential_address" className="text-sm font-medium text-neutral-700">
          Residential address
        </label>
        <textarea
          id="residential_address"
          value={residentialAddress}
          onChange={(e) => setResidentialAddress(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="join_reason" className="text-sm font-medium text-neutral-700">
          Why are you joining the department?
        </label>
        <textarea
          id="join_reason"
          value={joinReason}
          onChange={(e) => setJoinReason(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <Button type="submit" disabled={!name.trim() || submitting} fullWidth>
        {submitting ? "Submitting..." : "Submit registration"}
      </Button>
    </form>
  );
}
