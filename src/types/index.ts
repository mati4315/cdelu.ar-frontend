// Este archivo puede usarse para tipos y interfaces globales de la aplicación.
// Por ejemplo, tipos para el estado de Pinia que no son directamente de la API.

export interface AppError {
  message: string;
  code?: string | number;
}

// Tipos para el progreso de subida de archivos
export interface UploadProgressEvent {
  loaded: number;
  total?: number; // total puede ser undefined si el servidor no envía Content-Length
  progress?: number; // Porcentaje calculado
  bytes: number;
  estimated?: number; // Tiempo estimado en segundos
  rate?: number; // Bytes por segundo
  upload: true;
  timeStamp: number;
}

export type OnUploadProgressCallback = (progressEvent: UploadProgressEvent) => void;

// Puedes añadir más tipos globales aquí según sea necesario. 