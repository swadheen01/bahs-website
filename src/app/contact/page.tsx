import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "যোগাযোগ | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default function ContactPage() {
  return <ContactClient />;
}
