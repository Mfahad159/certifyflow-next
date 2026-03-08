import Dashboard from "@/components/dashboard/index/Dashboard"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | CertifyFlow",
    description: "Manage your certificate campaigns.",
};

export default function DashboardPage() {
    return <Dashboard />;
}
