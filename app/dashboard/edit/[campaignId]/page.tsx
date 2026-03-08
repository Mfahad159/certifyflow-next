import Editor from "@/components/dashboard/editor/Editor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Campaign | CertifyFlow",
    description: "Design and export certificates for your campaign.",
};

export default function EditCampaignPage() {
    return <Editor campaignType="generate_only" />;
}
