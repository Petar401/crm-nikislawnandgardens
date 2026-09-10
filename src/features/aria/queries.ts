import { createClient } from "@/lib/supabase/server";

/**
 * CRM snapshot bundled into Aria's system prompt on every chat turn.
 *
 * This runs live on every user message using the request-bound Supabase client
 * (RLS-scoped, same client the rest of the app uses). It is intentionally NOT
 * cached: Aria must reflect the workspace as it is right now, so a client,
 * contact or file added seconds ago is immediately visible. The reads are
 * bounded and run in parallel, so the cost is a single fan-out per message.
 *
 * Every query's `.error` is checked and logged. A failed query must never be
 * silently swallowed into an empty list — that hides real problems (a blank
 * snapshot then makes Aria wrongly claim the CRM is empty).
 */

/** Upper bound on rows pulled per entity so the context window stays sane. */
const LIST_CAP = 200;

type QueryResult<T> = { data: T[] | null; error: { message: string } | null };

/** Unwraps a Supabase list result, logging (not hiding) any error. */
function rows<T>(label: string, result: QueryResult<T>): T[] {
  if (result.error) {
    console.error(`[aria] failed to load ${label}: ${result.error.message}`);
  }
  return result.data ?? [];
}

export interface AriaFileRef {
  id: string;
  file_name: string;
  mime_type: string | null;
  storage_bucket: string;
  storage_path: string;
  source: "attachment";
}

export interface CrmContext {
  json: string;
  /** All readable files (attachments) keyed by id, for read-on-demand. */
  files: Map<string, AriaFileRef>;
}

export async function getCrmContext(workspaceId: string): Promise<CrmContext> {
  const supabase = await createClient();

  const [
    companies,
    contacts,
    deals,
    tasks,
    activities,
    notebookNotes,
    notes,
    leads,
    attachments,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id,name,status,industry,city,country,website,phone,email")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(LIST_CAP),
    supabase
      .from("contacts")
      .select(
        "id,first_name,last_name,email,phone,job_title,company_id,is_primary,contact_role"
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(LIST_CAP),
    supabase
      .from("deals")
      .select(
        "id,name,value,currency,status,stage_id,company_id,probability,expected_close_date"
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(LIST_CAP),
    supabase
      .from("tasks")
      .select("id,title,status,priority,due_at,assigned_to,company_id,deal_id")
      .eq("workspace_id", workspaceId)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(LIST_CAP),
    supabase
      .from("activities")
      .select("type,title,detail,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("notebook_notes")
      .select("title,body")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("notes")
      .select("body,company_id,contact_id,deal_id,lead_id,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("leads")
      .select(
        "id,company_name,website,industry,city,country,contact_name,job_title,match_score,match_reason,status"
      )
      .eq("workspace_id", workspaceId)
      .order("match_score", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("attachments")
      .select(
        "id,file_name,mime_type,entity_type,file_size,storage_bucket,storage_path"
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(LIST_CAP),
  ]);

  type StoredFile = {
    id: string;
    file_name: string;
    mime_type: string | null;
    storage_bucket: string;
    storage_path: string;
  };

  const attachmentRows = rows("attachments", attachments) as (StoredFile & {
    entity_type: string;
    file_size: number | null;
  })[];

  const files = new Map<string, AriaFileRef>();
  attachmentRows.forEach((a) => {
    files.set(a.id, {
      id: a.id,
      file_name: a.file_name,
      mime_type: a.mime_type,
      storage_bucket: a.storage_bucket,
      storage_path: a.storage_path,
      source: "attachment",
    });
  });

  // Model-facing view: identity + business fields, but never the internal
  // storage bucket/path (Aria reads files via read_workspace_file by id).
  const filesView = attachmentRows.map((a) => ({
    id: a.id,
    file_name: a.file_name,
    mime_type: a.mime_type,
    entity_type: a.entity_type,
    file_size: a.file_size,
  }));

  const json = JSON.stringify({
    companies: rows("companies", companies),
    contacts: rows("contacts", contacts),
    deals: rows("deals", deals),
    tasks: rows("tasks", tasks),
    recentActivities: rows("activities", activities),
    notebookNotes: rows("notebook_notes", notebookNotes),
    notes: rows("notes", notes),
    leads: rows("leads", leads),
    files: filesView,
  });

  return { json, files };
}
