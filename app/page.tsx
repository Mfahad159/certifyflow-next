import LandingPage from "@/components/Landing/index/LandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CertifyFlow | Modern Certificate Delivery",
  description: "Send and track thousands of certificates, without the headache. Complete certificate and credential automation platform.",
};

export default function Home() {
  return <LandingPage />;
}
