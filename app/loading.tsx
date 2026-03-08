import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader size={120} color="#6b55fd" className="mx-auto" />
            </div>
        </div>
    );
}
