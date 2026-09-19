import { Upload, XIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "#/components/ui/button.tsx";
import { useObjectUrl } from "#/hooks/use-object-url";
import { cn } from "#/lib/utils.ts";

import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from "./attachment";

export type FileUploadProps = {
    value: File | null;
    onChange: (file: File | null) => void;
    /** Forwarded to the `<input accept>` and enforced on drop (e.g. ".png,.svg,.ico" or "image/*"). */
    accept?: string;
    /** Built-in size check, in bytes. */
    maxSizeBytes?: number;
    /** Extra validation run after the built-in checks; return an error message or `null`. */
    validate?: (file: File) => string | null;
    /** Surface validation errors to the parent (the component also renders them itself). */
    onError?: (message: string | null) => void;
    disabled?: boolean;
    /** Trigger label for the `"button"` variant. */
    label?: React.ReactNode;
    /** Helper text shown under the control (inside the box for the dropzone variant). */
    hint?: React.ReactNode;
    /** Tune the preview `<img>` (e.g. "object-cover"). Defaults to "object-contain". */
    previewClassName?: string;
    id?: string;
    className?: string;
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept?: string): boolean {
    if (!accept) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accept
        .split(",")
        .map(token => token.trim().toLowerCase())
        .filter(Boolean)
        .some(token => {
            if (token.startsWith(".")) return name.endsWith(token);
            if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
            return type === token;
        });
}

export function FileUpload({
    value,
    onChange,
    accept,
    maxSizeBytes,
    validate,
    onError,
    disabled = false,
    label = "Upload file",
    hint,
    id,
    className,
}: FileUploadProps) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setErrorState] = useState<string | null>(null);
    const previewUrl = useObjectUrl(value);

    function setError(message: string | null) {
        setErrorState(message);
        onError?.(message);
    }

    function selectFile(file: File | null | undefined) {
        if (!file) return;
        if (!matchesAccept(file, accept)) {
            setError("Unsupported file type.");
            return;
        }
        console.log("file.size", file.size, "maxSizeBytes", maxSizeBytes);
        if (maxSizeBytes != null && file.size > maxSizeBytes) {
            setError(`File is too large (max ${formatFileSize(maxSizeBytes)}).`);
            return;
        }
        const customError = validate?.(file) ?? null;
        if (customError) {
            setError(customError);
            return;
        }
        setError(null);
        onChange(file);
    }

    function openDialog() {
        if (!disabled) inputRef.current?.click();
    }

    function clear() {
        onChange(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    const input = (
        <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            className="peer sr-only"
            onChange={event => selectFile(event.target.files?.[0])}
        />
    );

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {input}
            {value ? (
                <Attachment className="w-full">
                    <AttachmentMedia>{previewUrl && <img src={previewUrl} alt={value.name} />}</AttachmentMedia>
                    <AttachmentContent>
                        <AttachmentTitle>{value.name}</AttachmentTitle>
                        <AttachmentDescription>{formatFileSize(value.size)}</AttachmentDescription>
                    </AttachmentContent>
                    {!disabled && (
                        <AttachmentActions>
                            <AttachmentAction aria-label="Remove sales-dashboard.pdf" onClick={clear}>
                                <XIcon />
                            </AttachmentAction>
                        </AttachmentActions>
                    )}
                </Attachment>
            ) : (
                <Button type="button" variant="outline" disabled={disabled} onClick={openDialog} className="w-full">
                    <Upload />
                    {label}
                </Button>
            )}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
