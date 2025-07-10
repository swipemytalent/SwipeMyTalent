import { readSecret } from "./readSecret";

export function getEnvValue(name: string, fileEnvName: string, isRequired = true): string | undefined {
    let value: string | undefined;
    if (process.env.NODE_ENV === 'prod') {
        value = readSecret(name, fileEnvName);
    } else {
        value = process.env[name];
    }

    if (isRequired && !value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export function getEnvListValue(name: string, fileEnvName: string, defaultValue: string[]) {
    const value = getEnvValue(name, fileEnvName, false);

    return value ? value.split(',').map(s => s.trim()).filter(Boolean) : defaultValue;
}
