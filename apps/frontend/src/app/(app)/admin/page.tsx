"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBlock, LoadingBlock } from "@/components/ui/state-block";
import {
  createRole,
  createUser,
  getApiErrorMessage,
  listPermissions,
  listRoles,
  listUsers,
  setRolePermissions
} from "@/lib/simrs-api";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  roleKeys: z.string().optional()
});

const createRoleSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional()
});

const setPermissionSchema = z.object({
  roleId: z.string().min(1),
  permissionKeys: z.string().min(1)
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
type SetPermissionFormValues = z.infer<typeof setPermissionSchema>;

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const qc = useQueryClient();

  const users = useQuery({ queryKey: ["admin", "users"], queryFn: listUsers });
  const roles = useQuery({ queryKey: ["admin", "roles"], queryFn: listRoles });
  const permissions = useQuery({ queryKey: ["admin", "permissions"], queryFn: listPermissions });

  const userForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", name: "", password: "", roleKeys: "staff" }
  });

  const roleForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { key: "", name: "", description: "" }
  });

  const rolePermForm = useForm<SetPermissionFormValues>({
    resolver: zodResolver(setPermissionSchema),
    defaultValues: { roleId: "", permissionKeys: "patients.read,patients.write" }
  });

  const createUserMutation = useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      createUser({
        email: values.email,
        name: values.name,
        password: values.password,
        roleKeys: values.roleKeys ? splitCsv(values.roleKeys) : undefined
      }),
    onSuccess: async () => {
      toast.success("User created");
      userForm.reset({ email: "", name: "", password: "", roleKeys: "staff" });
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      toast.success("Role created");
      roleForm.reset({ key: "", name: "", description: "" });
      await qc.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const setRolePermMutation = useMutation({
    mutationFn: (values: SetPermissionFormValues) =>
      setRolePermissions(values.roleId, splitCsv(values.permissionKeys)),
    onSuccess: async () => {
      toast.success("Role permissions updated");
      await qc.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="Users and Roles" description="Manajemen akun, role, dan permission" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create user</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={userForm.handleSubmit((values) => createUserMutation.mutate(values))}>
              <Field label="Email"><Input {...userForm.register("email")} /></Field>
              <Field label="Name"><Input {...userForm.register("name")} /></Field>
              <Field label="Password"><Input type="password" {...userForm.register("password")} /></Field>
              <Field label="Role keys (comma separated)"><Input {...userForm.register("roleKeys")} /></Field>
              <Button type="submit" disabled={createUserMutation.isPending}>{createUserMutation.isPending ? "Saving..." : "Create user"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create role</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={roleForm.handleSubmit((values) => createRoleMutation.mutate(values))}>
              <Field label="Key"><Input {...roleForm.register("key")} placeholder="nurse" /></Field>
              <Field label="Name"><Input {...roleForm.register("name")} placeholder="Nurse" /></Field>
              <Field label="Description"><Input {...roleForm.register("description")} /></Field>
              <Button type="submit" disabled={createRoleMutation.isPending}>{createRoleMutation.isPending ? "Saving..." : "Create role"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Set role permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[220px_1fr_auto]" onSubmit={rolePermForm.handleSubmit((values) => setRolePermMutation.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="roleId">Role</Label>
              <select id="roleId" className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 text-sm" {...rolePermForm.register("roleId")}>
                <option value="">Select role</option>
                {(roles.data ?? []).map((role) => (
                  <option key={role.id} value={role.id}>{role.key}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="permissionKeys">Permission keys (comma separated)</Label>
              <Input id="permissionKeys" {...rolePermForm.register("permissionKeys")} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={setRolePermMutation.isPending}>{setRolePermMutation.isPending ? "Saving..." : "Apply"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {(users.isLoading || roles.isLoading || permissions.isLoading) ? <LoadingBlock label="Loading admin data..." /> : null}
      {(users.isError || roles.isError || permissions.isError) ? <ErrorBlock message="Failed to load admin data" /> : null}

      {users.data && roles.data && permissions.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {users.data.map((user) => (
                <div key={user.id} className="rounded-md border p-3">
                  <div className="font-medium">{user.name} · {user.email}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role.key} variant="outline">{role.key}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.data.map((role) => (
                <div key={role.id} className="rounded-md border p-3">
                  <div className="font-medium">{role.name} ({role.key})</div>
                  <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {(role.permissions ?? []).length} permission(s)
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Permission catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permissions.data.map((permission) => (
                  <Badge key={permission.id} variant="outline">{permission.key}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
