import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsePet – Cute Minimal Tamagotchi (CPE222 FPGA Prototype)" },
      {
        name: "description",
        content: "PulsePet – A cute Japanese minimalist Tamagotchi virtual pet with digital logic ICU rescue minigame, designed for Nexys A7 FPGA.",
      },
      { property: "og:title", content: "PulsePet – Cute Minimal Tamagotchi" },
      {
        property: "og:description",
        content: "Interactive browser prototype for CPE222 Digital Electronics and Logic Design final project.",
      },
    ],
  }),
  component: PulsePetPage,
});

export function PulsePetPage() {
  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0, overflow: "hidden", background: "#FFF9F3" }}>
      <iframe
        src="/pulsepet.html"
        title="PulsePet Game"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        allow="autoplay"
      />
    </div>
  );
}
