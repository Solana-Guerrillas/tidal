import { AmplifyWorkspace } from "@/components/amplify/amplify-workspace";

export default async function AmplifyWorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <AmplifyWorkspace workspaceId={workspaceId} />;
}
