"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/ui/state-block";
import { deletePatient, getApiErrorMessage, listPatients } from "@/lib/simrs-api";

export default function PatientsListPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const queryKey = useMemo(() => ["patients", { q }], [q]);
  const patients = useQuery({
    queryKey,
    queryFn: () => listPatients({ page: 1, limit: 20, q: q || undefined })
  });

  const del = useMutation({
    mutationFn: async (id: string) => deletePatient(id),
    onSuccess: async () => {
      toast.success("Patient deleted");
      await qc.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Patients" description="Manage patient master data" actionHref="/patients/new" actionLabel="New patient" />

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Input placeholder="Search by name or MRN..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="secondary" onClick={() => patients.refetch()} disabled={patients.isFetching}>
              Search
            </Button>
          </div>

          {patients.isLoading ? <LoadingBlock label="Loading patients..." /> : null}
          {patients.isError ? <ErrorBlock message="Failed to load patients" onRetry={() => patients.refetch()} /> : null}

          {patients.data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">MRN</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Phone</th>
                    <th className="py-2 pr-2">Updated</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.data.data.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-2 font-mono text-xs">{p.mrn}</td>
                      <td className="py-2 pr-2">{p.name}</td>
                      <td className="py-2 pr-2">{p.phone ?? "-"}</td>
                      <td className="py-2 pr-2">{new Date(p.updatedAt).toLocaleString()}</td>
                      <td className="py-2 pr-2">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/patients/${p.id}/edit`}>Edit</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => del.mutate(p.id)}
                            disabled={del.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {patients.data.data.length === 0 ? (
                    <tr>
                      <td className="py-4" colSpan={5}>
                        <EmptyBlock message="No patients found" />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

