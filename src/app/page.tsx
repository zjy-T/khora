import { Hero } from "@/components/home/Hero";
import { EntryPortals } from "@/components/home/EntryPortals";
import { ClosingInvitation } from "@/components/home/ClosingInvitation";

export default function HomePage() {
  return (
    <>
      <Hero />
      <EntryPortals />
      <ClosingInvitation />
    </>
  );
}
