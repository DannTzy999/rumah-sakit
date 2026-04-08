"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/ui/state-block";
import { downloadFile, getApiErrorMessage, listFiles, uploadFile } from "@/lib/simrs-api";

export default function FilesPage() {
  const [q, setQ] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qc = useQueryClient();

  const files = useQuery({
    queryKey: ["files", q],
    queryFn: () => listFiles({ page: 1, limit: 100, q: q || undefined })
  });

  const upload = useMutation({
    mutationFn: uploadFile,
    onSuccess: async () => {
      toast.success("File uploaded");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await qc.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error))
  });

  const handleDownload = async (id: string, filename: string) => {
    try {
      const blob = await downloadFile(id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4 p-6">
      <PageHeader title="File Upload" description="Upload dan manajemen dokumen medis" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload file</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <Button
            onClick={() => {
              if (!selectedFile) {
                toast.error("Pilih file terlebih dahulu");
                return;
              }
              upload.mutate(selectedFile);
            }}
            disabled={upload.isPending}
          >
            <UploadCloud className="size-4" />
            {upload.isPending ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex gap-2">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search files..." />
            <Button variant="secondary" onClick={() => files.refetch()} disabled={files.isFetching}>Search</Button>
          </div>

          {files.isLoading ? <LoadingBlock label="Loading files..." /> : null}
          {files.isError ? <ErrorBlock message="Failed to load files" onRetry={() => files.refetch()} /> : null}

          {files.data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-2">Filename</th>
                    <th className="py-2 pr-2">Type</th>
                    <th className="py-2 pr-2">Size</th>
                    <th className="py-2 pr-2">Created</th>
                    <th className="py-2 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.data.data.map((file) => (
                    <tr key={file.id} className="border-b">
                      <td className="py-2 pr-2">{file.filename}</td>
                      <td className="py-2 pr-2">{file.mimeType}</td>
                      <td className="py-2 pr-2">{Math.ceil(file.size / 1024)} KB</td>
                      <td className="py-2 pr-2">{new Date(file.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => handleDownload(file.id, file.filename)}>
                          <Download className="size-4" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {files.data.data.length === 0 ? <EmptyBlock message="No files found" /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
