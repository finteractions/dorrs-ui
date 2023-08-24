import { NextApiRequest, NextApiResponse } from 'next';
import XLSX from 'xlsx';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
        res.status(400).send('Invalid filename');
        return;
    }

    const csvContent = req.body;
    const rows = csvContent.split('\n').map((row: string) => row.split(','));
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
}
