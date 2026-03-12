
export interface SrtGenerationState {
  isProcessing: boolean;
  error: string | null;
  srtContent: string | null;
  progress: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  base64: string;
}
