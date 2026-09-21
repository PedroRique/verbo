import { ReelsFeed } from "@/components/reels-feed"
import { getReels } from "@/lib/bible"

export default async function HomePage() {
  const reels = await getReels()
  return <ReelsFeed reels={reels} />
}
