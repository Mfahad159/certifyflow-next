import Editor from "@/components/dashboard/editor/Editor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Generate Only | CertifyFlow",
    description: "Create certificates and download them.",
};

export default function GeneratePage() {
    return <Editor campaignType="generate_only" />;
}
