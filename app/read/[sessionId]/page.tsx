import StoryGame from "@/components/StoryGame";

export default async function ReadPage({ params }: PageProps<"/read/[sessionId]">) {
  const { sessionId } = await params;
  return <StoryGame sessionId={sessionId} />;
}
