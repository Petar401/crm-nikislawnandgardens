import { redirect } from "next/navigation";
import Link from "next/link";

import { requireAuthContext } from "@/lib/auth/session";
import { getPermissionSet } from "@/lib/auth/permissions";
import { listProducts, listTaxRates } from "@/features/products/queries";
import { ProductsTable } from "@/features/products/components/products-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const ctx = await requireAuthContext();
  const { allowed } = await getPermissionSet();

  if (!allowed.has("products.view")) redirect("/");

  const [products, taxRates] = await Promise.all([
    listProducts(ctx.workspace.id, { includeArchived: true }),
    listTaxRates(ctx.workspace.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Your catalog of products and services, priced for invoices."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/settings/pricing">Manage price books &amp; tax</Link>
          </Button>
        }
      />
      <ProductsTable
        products={products}
        taxRates={taxRates}
        canCreate={allowed.has("products.create")}
        canUpdate={allowed.has("products.update")}
        canDelete={allowed.has("products.delete")}
      />
    </div>
  );
}
