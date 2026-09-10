import { requireAuthContext } from "@/lib/auth/session";
import { getPermissionSet } from "@/lib/auth/permissions";
import { getUnreadNotificationCount } from "@/features/notifications/queries";
import { NotificationsProvider } from "@/features/notifications/components/notifications-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireAuthContext();
  const [{ allowed }, unreadNotifications] = await Promise.all([
    getPermissionSet(),
    getUnreadNotificationCount(),
  ]);

  return (
    <NotificationsProvider workspaceId={ctx.workspace.id} userId={ctx.userId}>
      <div className="flex min-h-dvh">
        <Sidebar allowed={[...allowed]} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            workspaceName={ctx.workspace.name}
            email={ctx.email}
            fullName={ctx.profile?.full_name ?? null}
            allowed={[...allowed]}
            unreadNotifications={unreadNotifications}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </NotificationsProvider>
  );
}
