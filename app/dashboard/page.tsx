import Dashboard from "@/components/dashboard/index/Dashboard"
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth.server";
import { getRecentCampaigns, getUserStats } from "@/lib/campaignService.server";

export const metadata: Metadata = {
    title: "Dashboard | CertifyFlow",
    description: "Manage your certificate campaigns.",
};

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const [recentCampaigns, stats] = await Promise.all([
        getRecentCampaigns(user.id),
        getUserStats(user.id)
    ]);

    // We pass the parsed data to the client component to minimize client-side refetching
    return (
        <Dashboard
            initialUser={user}
            initialCampaigns={recentCampaigns}
            initialStats={stats}
        />
    );
}
