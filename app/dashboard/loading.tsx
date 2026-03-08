import { Loader } from "@/components/ui/loader";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center ml-[var(--sidebar-width,256px)]">
            <div className="text-center">
                <Loader size={80} color="#6b55fd" className="mx-auto" />
                <p className="mt-4 text-muted-foreground font-medium text-sm animate-pulse">Loading dashboard...</p>
            </div>
        </div>
    );
}
