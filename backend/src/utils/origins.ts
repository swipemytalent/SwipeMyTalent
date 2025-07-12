import { getEnvListValue } from "./getEnv";

export function getAllowedOrigins(): string[] {
    return getEnvListValue('ALLOWED_ORIGINS', 'ALLOWED_ORIGINS_FILE', ['http://localhost:8080']);
}
