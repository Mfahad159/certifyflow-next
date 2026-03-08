import { Metadata } from "next";
import { getCertificateByUUID } from "@/lib/services/certificateService";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Verify Certificate | CertifyFlow",
    description: "Verify the authenticity of a certificate.",
};

export default async function VerifyPage({ params }: { params: { uuid: string } }) {
    const certificate = await getCertificateByUUID(params.uuid);

    if (!certificate) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <XCircle size={40} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Certificate Not Found</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    The certificate you are looking for does not exist or the link is invalid. Please make sure you have the correct URL.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background overflow-hidden relative">
            <div className="container mx-auto px-6 py-20 relative z-10 min-h-screen flex flex-col justify-center max-w-3xl">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-500 text-sm font-bold mb-8">
                        <CheckCircle2 size={16} />
                        Verified Authentic
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">
                        Official Certificate
                    </h1>
                </div>

                <div className="bg-secondary/20 dark:bg-zinc-900/40 backdrop-blur-xl border border-border p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
                    <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-border/50">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Certificate ID</p>
                                <p className="font-mono text-sm text-foreground bg-background/50 px-3 py-2 rounded-lg border border-border mt-1 break-all">
                                    {certificate.certificate_uuid}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Issue Date</p>
                                <p className="font-medium text-foreground text-lg">
                                    {new Date(certificate.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background text-sm font-bold text-foreground capitalize">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                {certificate.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
