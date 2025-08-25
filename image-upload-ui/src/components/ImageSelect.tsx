import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type DragEvent,
} from "react";
import { ImageIcon, X, Upload, MoveVertical, Trash2 } from "lucide-react";

type ImgVal = File | string;

type MultiImageSelectProps = {
  value: ImgVal[] | ImgVal; // allow single or array
  onChange: (next: ImgVal[] | ImgVal) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
};

function isFile(x: ImgVal): x is File {
  return typeof x !== "string";
}

export default function MultiImageSelect({
  value,
  onChange,
  accept = "image/*",
  maxFiles = 12,
  maxSizeMB = 10,
  disabled = false,
  className = "",
}: MultiImageSelectProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 🔑 Normalize value into array always for internal use
  const valuesArray = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  const clearNativeInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const previews = useMemo(() => {
    return valuesArray.map((item) => {
      if (isFile(item))
        return { src: URL.createObjectURL(item), kind: "file" as const };
      return { src: item, kind: "url" as const };
    });
  }, [valuesArray]);

  const lastUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    lastUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    lastUrlsRef.current = previews
      .filter((p) => p.kind === "file")
      .map((p) => p.src);

    return () => {
      lastUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      lastUrlsRef.current = [];
    };
  }, [previews]);

  // revoke blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.kind === "file") URL.revokeObjectURL(p.src);
      });
    };
  }, []); // run once

  const openPicker = () => {
    clearNativeInput();
    inputRef.current?.click();
  };

  const validateFiles = (files: File[]) => {
    const errs: string[] = [];
    const sizeCap = maxSizeMB * 1024 * 1024;

    const filtered = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        errs.push(`"${f.name}" is not an image.`);
        return false;
      }
      if (f.size > sizeCap) {
        errs.push(`"${f.name}" exceeds ${maxSizeMB} MB.`);
        return false;
      }
      return true;
    });

    if (valuesArray.length + filtered.length > maxFiles) {
      const allowed = Math.max(0, maxFiles - valuesArray.length);
      if (allowed === 0) {
        errs.push(`You already have ${maxFiles} images.`);
        return [];
      }
      errs.push(
        `Only ${allowed} more image${
          allowed > 1 ? "s" : ""
        } allowed (max ${maxFiles}).`
      );
      return filtered.slice(0, allowed);
    }

    if (errs.length) setMessage(errs.join(" "));
    else setMessage(null);

    const existingKeys = new Set(
      valuesArray.map((v) => (isFile(v) ? `${v.name}:${v.size}` : v))
    );

    const deduped = filtered.filter(
      (f) => !existingKeys.has(`${f.name}:${f.size}`)
    );
    if (deduped.length < filtered.length) {
      setMessage((prev) =>
        [prev, "Skipped duplicates."].filter(Boolean).join(" ")
      );
    }
    return deduped;
  };

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList || disabled) return;
    const incoming = Array.from(filesList);
    const valid = validateFiles(incoming);
    const next = [...valuesArray, ...valid];
    if (valid.length) {
      onChange(next.length === 1 ? next[0] : next);
    }
    clearNativeInput();
  };

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      const dt = e.dataTransfer;
      if (dt?.files?.length) handleFiles(dt.files);
    },
    [disabled]
  );

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setDragActive(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeAt = (idx: number) => {
    const next = [...valuesArray];
    next.splice(idx, 1);
    onChange(next.length === 1 ? next[0] : next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= valuesArray.length) return;
    const next = [...valuesArray];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next.length === 1 ? next[0] : next);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker();
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 bg-white",
        ].join(" ")}
        aria-disabled={disabled}
      >
        <Upload className="h-6 w-6 mb-2" />
        <p className="text-sm text-gray-700">
          Drag images here or <span className="underline">browse</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Up to {maxFiles} images, {maxSizeMB} MB each
        </p>
      </div>

      {message && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center justify-between">
          <span>{message}</span>
          <X
            className="w-4 h-4 cursor-pointer text-amber-700"
            onClick={() => setMessage(null)}
          />
        </p>
      )}

      {previews.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((p, i) => (
            <li key={`${p.src}-${i}`} className="relative group">
              <div className="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
                {p.src ? (
                  <img
                    src={p.src}
                    alt={`image-${i}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs shadow ring-1 ring-gray-200"
                  onClick={() => move(i, i - 1)}
                  aria-label="Move up"
                >
                  <MoveVertical className="h-3.5 w-3.5 rotate-180" />
                  Up
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs shadow ring-1 ring-gray-200"
                  onClick={() => move(i, i + 1)}
                  aria-label="Move down"
                >
                  <MoveVertical className="h-3.5 w-3.5" />
                  Down
                </button>
              </div>

              <button
                type="button"
                className="absolute -right-2 -top-2 inline-flex items-center justify-center rounded-full bg-white text-gray-700 shadow ring-1 ring-gray-200 p-1 opacity-90 hover:opacity-100"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          No images selected.
        </div>
      )}
    </div>
  );
}
