import { useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

interface FileUploaderProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf')) return FileText;
  return File;
}

export function FileUploader({
  files,
  onChange,
  maxFiles = 10,
  accept = 'image/*,.pdf,.doc,.docx',
  disabled = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const remainingSlots = maxFiles - files.length;
      if (remainingSlots <= 0) {
        toast.error(`Osiągnięto limit ${maxFiles} plików`);
        return;
      }

      const filesToProcess = Array.from(fileList).slice(0, remainingSlots);
      const validFiles: File[] = [];

      for (const file of filesToProcess) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Plik "${file.name}" przekracza limit 10MB`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      const promises = validFiles.map(
        (file) =>
          new Promise<UploadedFile>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          })
      );

      Promise.all(promises).then((newFiles) => {
        onChange([...files, ...newFiles]);
        toast.success(`Dodano ${newFiles.length} plik(ów)`);
      });
    },
    [files, maxFiles, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const FileIcon = (type: string) => {
    const Icon = getFileIcon(type);
    return <Icon className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
          disabled
            ? 'border-muted bg-muted/20 cursor-not-allowed'
            : 'border-border hover:border-primary hover:bg-primary/5'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Przeciągnij pliki lub kliknij, aby wybrać
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max {maxFiles} plików, do 10MB każdy • PDF, JPG, PNG, DOC
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Dodane pliki ({files.length}/{maxFiles}):
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                {FileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
