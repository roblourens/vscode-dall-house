import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';


export async function downloadFile(url: string, destPath: string, headers?: Record<string, string>): Promise<void> {
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (response) => {
            if (response.headers.location) {
                console.log(`Following redirect to ${response.headers.location}`);
                return downloadFile(response.headers.location, destPath).then(resolve, reject);
            }

            if (response.statusCode === 404) {
                return reject(new Error(`File not found: ${url}`));
            }

            const file = fs.createWriteStream(destPath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', (err) => {
                file.close();
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => reject(err));
        });
    });
}