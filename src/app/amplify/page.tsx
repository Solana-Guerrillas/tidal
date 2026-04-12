"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAmplifyWorkspace } from "@/providers/amplify-workspace-provider";
import { AmplifyWorkspace } from "@/components/amplify/amplify-workspace";
import { getAmplifyWorkspaceHref } from "@/lib/routes/amplify";

export default function AmplifyPage() {
  const router = useRouter();
  const { workspace } = useAmplifyWorkspace();

  useEffect(() => {
    router.replace(getAmplifyWorkspaceHref(workspace.id));
  }, [router, workspace.id]);

  return <AmplifyWorkspace workspaceId={workspace.id} />;
}
