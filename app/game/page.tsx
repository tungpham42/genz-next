import Game from "@/pages/Game";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trò chơi | Z-Lingo",
  description: "Trò chơi từ điển Gen Z",
  openGraph: {
    title: "Trò chơi | Z-Lingo",
    description: "Trò chơi từ điển Gen Z",
    images: [
      {
        url: "https://genz.soft.io.vn/og-game.png",
        width: 1200,
        height: 630,
        alt: "Z-Lingo Game Open Graph Image",
      },
    ],
  },
};

export default function GamePage() {
  return <Game />;
}
