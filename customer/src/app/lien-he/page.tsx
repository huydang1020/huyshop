import type { Metadata } from "next";
import ContactComponent from "@/components/contact";
export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ",
};

export default function ContactPage() {
  return <ContactComponent />;
}
