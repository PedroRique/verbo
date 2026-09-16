import reels from "@/data/reels.json"

import { ReelsFeed } from "@/components/reels-feed"
import type { ReelCard } from "@/lib/types"

export default function HomePage() {
  return <ReelsFeed reels={reels as ReelCard[]} />
}
