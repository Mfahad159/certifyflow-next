import Verification from "@/components/dashboard/verification/Verification";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Certificate | CertifyFlow",
    description: "Verify the authenticity of a certificate.",
};

export default function VerifyPage() {
    return <Verification />;
}
