import { useRef, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/Button";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

type BulkKind = "companies" | "poc" | "reviews";
const KIND_OPTIONS: BulkKind[] = ["companies", "poc", "reviews"];

const TYPE_MAP = {
  companies: { api: "company/bulk-insert-companies", formKey: "companies" },
  poc: { api: "poc/bulk-insert-poc", formKey: "poc" },
  reviews: { api: "review/bulk-insert-reviews", formKey: "reviews" },
} as const;

type BulkUploadResponse = {
  imported: number;
  skipped?: number;
  message?: string;
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function BulkUploadCompanies() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [kind, setKind] = useState<BulkKind>("companies");

  const filename = file?.name ?? "No file selected";
  const filesize = useMemo(() => (file ? humanSize(file.size) : ""), [file]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { file: File; kind: BulkKind }) => {
      const { api, formKey } = TYPE_MAP[payload.kind];
      const form = new FormData();
      form.append(formKey, payload.file);

      const res = await axiosInstance.post(`/${api}`, form);
      return res.data as BulkUploadResponse;
    },
    onSuccess: () => {
      setError(null);
      toast.success("upload successful");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (err: unknown) => {
      toast.error("upload failed");
      if (err instanceof Error) setError(err.message);
    },
  });

  function validateAndSet(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    const isCsv =
      f.type === "text/csv" ||
      f.name.toLowerCase().endsWith(".csv") ||
      f.type === "";
    if (!isCsv) return fail("Please select a .csv file.");
    if (f.size > MAX_BYTES)
      return fail(`File is too large. Max allowed is ${humanSize(MAX_BYTES)}.`);
    setFile(f);
    quickPeek(f).then(
      (ok) =>
        !ok &&
        setError(
          "This doesn’t look like a CSV (no commas found in the header)."
        )
    );
  }

  function fail(msg: string) {
    setFile(null);
    setError(msg);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    validateAndSet(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    validateAndSet(f);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleUpload() {
    if (!file) return setError("Select a CSV file first.");
    mutate({ file, kind });
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Bulk Upload</h1>
        <p className="text-sm text-gray-600">
          Choose the upload type and provide a CSV. Header example:{" "}
          <code>name,email,phone</code>.
        </p>
      </header>

      {/* Type selector (drives endpoint + form key) */}
      <section className="space-y-2">
        <label htmlFor="bulk-kind" className="block font-medium">
          Upload type
        </label>
        <Listbox value={kind} onChange={setKind} disabled={isPending}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-1 focus:ring-blue-500">
              <span className="block truncate capitalize">{kind}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg focus:outline-none">
              {KIND_OPTIONS.map((option) => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 capitalize ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {option}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        <p className="text-xs text-gray-500">
          Endpoint: <code>/api/{TYPE_MAP[kind].api}</code> • File key:{" "}
          <code>{TYPE_MAP[kind].formKey}</code>
        </p>
      </section>

      <section className="space-y-3">
        <label htmlFor="csv-input" className="block font-medium">
          Select your CSV file
        </label>

        {/* Hidden native input */}
        <input
          id="csv-input"
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onInputChange}
          className="hidden"
          aria-describedby="csv-help"
        />

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && openFilePicker()
          }
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          aria-label="CSV file dropzone"
          className={[
            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer",
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
          ].join(" ")}
        >
          <p className="font-medium">
            {dragActive ? "Drop your file here" : "Drag & drop your CSV here"}
          </p>
          <p className="text-sm text-gray-600">or click to browse</p>
        </div>

        {/* File meta */}
        <div className="text-sm text-gray-700">
          <span className="font-medium">Selected:</span> {filename}{" "}
          {filesize && <span>• {filesize}</span>}
        </div>

        {/* Help + errors */}
        <p id="csv-help" className="text-xs text-gray-500">
          Accepted type: <code>.csv</code>. Max size: {humanSize(MAX_BYTES)}.
        </p>
        {error && (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <Button onClick={handleUpload} disabled={!file || isPending}>
          {isPending ? "Uploading…" : "Upload"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setError(null);
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          disabled={isPending && !file}
        >
          Reset
        </Button>
      </div>
    </main>
  );
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function quickPeek(file: File): Promise<boolean> {
  const blob = file.slice(0, 1024);
  const text = await blob.text();
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  return firstLine.includes(",");
}
