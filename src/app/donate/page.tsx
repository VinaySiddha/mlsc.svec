import { DonateClient } from "./donate-client";

export const metadata = {
  title: "Support MLSC SVEC — Student Innovation Fund",
  description: "Support Microsoft Learn Student Club Sri Vasavi Engineering College. Help us fund cloud servers, domain registrations, hardware workshop supplies, and hackathon prizes for student developers.",
};

export default function DonatePage() {
  return <DonateClient />;
}
