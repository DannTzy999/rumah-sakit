"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patients/patient-form";
import { Card, CardContent } from "@/components/ui/card";
import { createPatient, getApiErrorMessage } from "@/lib/simrs-api";

export default function NewPatientPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: createPatient,
    onSuccess: async () => {
      toast.success("Patient created");
      await qc.invalidateQueries({ queryKey: ["patients"] });
      router.replace("/patients");
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="New patient" description="Create a new patient record" />

      <Card>
        <CardContent className="p-4">
          <PatientForm
            defaultValues={{ mrn: "", name: "", phone: "", address: "", birthDate: "" }}
            onSubmit={(values) => create.mutate(values)}
            onCancel={() => router.back()}
            submitLabel="Save"
            pending={create.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

