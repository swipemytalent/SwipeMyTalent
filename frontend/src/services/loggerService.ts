export class LoggerService {
  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  static info(message: string, data?: any): void {
    console.info(`[INFO] ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    console.log(`[DEBUG] ${message}`, data || '');
  }
} 