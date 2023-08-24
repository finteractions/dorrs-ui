import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
        res.status(400).send('Invalid filename');
        return;
    }

    const filePath = path.join(process.cwd(), 'public', 'doc', filename);

    try {
        const fileData = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(fileData);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}
