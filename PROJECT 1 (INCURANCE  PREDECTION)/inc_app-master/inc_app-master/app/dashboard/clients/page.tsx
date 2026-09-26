import ClientsTable from "@/components/ClientsTable";
export default function ClientsPage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your insurance clients.</p>
        </div>
      </div>

      <ClientsTable skip={0} limit = {100} ></ClientsTable>
    </div>
  );
}
