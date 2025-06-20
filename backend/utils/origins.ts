import { getEnvListValue } from "./getEnv.js";

export function getAllowedOrigins(): string[] {
    return getEnvListValue('ALLOWED_ORIGINS', 'ALLOWED_ORIGINS_FILE', ['http://localhost:8080']);
}
