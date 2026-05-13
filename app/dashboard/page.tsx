import type { Metadata } from "next";
import CAEDashboard from "@/components/dashboard/CAEDashboard";

export const metadata: Metadata = { title: "CAE — Tartarus Incident | Epimenides Paradigm" };

export default function DashboardPage() {
  return <CAEDashboard />;
}
