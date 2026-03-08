import Editor from "@/components/dashboard/editor/Editor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "New Template | CertifyFlow",
    description: "Create a new certificate template.",
};

export default function NewTemplatePage() {
    return <Editor campaignType="template" />;
}
