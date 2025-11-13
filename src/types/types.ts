export interface TemperaturaRegistro {
  temperatura: number;
  data: string;
  hora: string;
  dia: number;
  mes: number;
  ano: number;
  timestamp: number;
}

export interface TemperaturaResponse {
  temperatura: number;
  timestamp?: string;
  status?: string;
}

export interface Estatisticas {
  total: number;
  media: number;
  maxima: number;
  minima: number;
}