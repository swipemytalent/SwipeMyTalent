import * as fs from 'fs';

export function readSecret(envVar: string, fileEnvVar: string): string {
    const filePath = process.env[fileEnvVar];
    if (filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8').trim();
        } catch (error) {
            throw new Error(`Failed to read secret file ${filePath} for ${fileEnvVar}: ${error}`);
        }
    }

    const val = process.env[envVar];
    if (!val) {
        throw new Error(`Missing required env variable or secret file: ${envVar} or ${fileEnvVar}`);
    } 

    return val;
}