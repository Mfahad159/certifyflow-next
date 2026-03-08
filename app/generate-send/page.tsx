import Editor from "@/components/dashboard/editor/Editor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Generate & Send | CertifyFlow",
    description: "Import CSV, map fields, and email certificates.",
};

export default function GenerateSendPage() {
    return <Editor campaignType="generate_send" />;
}
