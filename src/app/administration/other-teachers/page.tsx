import { redirect } from "next/navigation";

export default function OtherTeachersRedirect() {
  redirect("/administration/staff");
}
