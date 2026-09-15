import ReportView from "@/components/ReportView";

export default async function ReportPage({ params }: PageProps<"/report/[sessionId]">) {
  const { sessionId } = await params;
  return <ReportView sessionId={sessionId} />;
}
