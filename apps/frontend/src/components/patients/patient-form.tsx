"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const patientFormSchema = z.object({
  mrn: z.string().min(3, "MRN minimal 3 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional()
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export function PatientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  pending
}: {
  defaultValues: PatientFormValues;
  onSubmit: (values: PatientFormValues) => void;
  onCancel: () => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="mrn">MRN</Label>
        <Input id="mrn" {...form.register("mrn")} placeholder="MRN0002" />
        {form.formState.errors.mrn ? (
          <p className="text-sm text-red-600">{form.formState.errors.mrn.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} placeholder="Nama pasien" />
        {form.formState.errors.name ? (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register("phone")} placeholder="08xxxxxxxxxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthDate">Birth date</Label>
        <Input id="birthDate" {...form.register("birthDate")} type="date" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...form.register("address")} placeholder="Alamat" />
      </div>

      <div className="md:col-span-2 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
