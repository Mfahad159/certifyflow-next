import Editor from "@/components/dashboard/editor/Editor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Template | CertifyFlow",
    description: "Modify an existing certificate template.",
};

export default function EditTemplatePage() {
    return <Editor campaignType="template" />;
}
