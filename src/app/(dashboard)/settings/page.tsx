import { redirect } from "next/navigation";

import { requireAuthContext } from "@/lib/auth/session";
import { getPermissionSet } from "@/lib/auth/permissions";
import { getMembers } from "@/features/team/queries";
import {
  isAiConfigured,
  getWorkspaceAiSettings,
  hasEnvFallbackKey,
  isAiEncryptionKeyConfigured,
} from "@/features/ai/settings-queries";
import { listOpenRouterFreeModels } from "@/features/ai/openrouter-models";
import { AiKeySettings } from "@/features/ai/components/ai-key-settings";
import { getAuditLogs } from "@/features/audit/queries";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { getNotificationPreferences } from "@/features/notifications/queries";
import { PreferencesPanel } from "@/features/notifications/components/preferences-panel";
import { TeamSettings } from "@/features/team/components/team-settings";
import { InviteMemberDialog } from "@/features/team/components/invite-member-dialog";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await requireAuthContext();
  const { allowed } = await getPermissionSet();
  if (!allowed.has("settings.view")) redirect("/");

  const members = await getMembers(ctx.workspace.id);
  const canViewTeam = allowed.has("team.view");
  const canInvite = allowed.has("team.invite");
  const canEditRoles = allowed.has("team.edit_roles");
  const canManageAiKey = allowed.has("settings.update");
  const canViewAudit = allowed.has("audit.view");

  const [aiConfigured, aiSettings, openRouterModels, auditRows, notificationPrefs] =
    await Promise.all([
      isAiConfigured(ctx.workspace.id),
      canManageAiKey
        ? getWorkspaceAiSettings(ctx.workspace.id)
        : Promise.resolve(null),
      canManageAiKey ? listOpenRouterFreeModels() : Promise.resolve([]),
      canViewAudit
        ? getAuditLogs(ctx.workspace.id, { limit: 100 })
        : Promise.resolve([]),
      getNotificationPreferences(),
    ]);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your workspace and team"
        action={canInvite ? <InviteMemberDialog /> : undefined}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{ctx.workspace.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-mono text-xs">{ctx.workspace.slug}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">AI features</span>
              {aiConfigured ? (
                <Badge variant="secondary">Enabled</Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {canManageAiKey && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI API key</CardTitle>
            </CardHeader>
            <CardContent>
              <AiKeySettings
                settings={aiSettings}
                hasEnvFallback={hasEnvFallbackKey()}
                openRouterModels={openRouterModels}
                encryptionConfigured={isAiEncryptionKeyConfigured()}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent className="max-w-sm">
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <PreferencesPanel initial={notificationPrefs} />
          </CardContent>
        </Card>

        {canViewTeam && (
          <div>
            <h2 className="mb-3 text-sm font-medium">
              Team members &amp; permissions
            </h2>
            <TeamSettings
              members={members}
              ownerUserId={ctx.workspace.created_by}
              canEdit={canEditRoles}
            />
            {!canEditRoles && (
              <p className="text-muted-foreground mt-2 text-xs">
                You can view the team but need the &quot;Edit roles &amp;
                permissions&quot; permission to make changes.
              </p>
            )}
          </div>
        )}

        {canViewAudit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit log</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogTable rows={auditRows} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
