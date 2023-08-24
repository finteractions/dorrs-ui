import {NextApiRequest, NextApiResponse} from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const {filename} = req.query;

    if (!filename || typeof filename !== 'string') {
        res.status(400).send('Invalid filename');
        return;
    }
    const csvContent = req.body;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csvContent);
}
