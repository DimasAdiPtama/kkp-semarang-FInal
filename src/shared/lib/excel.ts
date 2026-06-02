import { read, utils } from 'xlsx';

export type ExcelRow = Record<string, unknown>;

const normalizeKey = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[\s./()-]+/g, '_')
        .replace(/^_+|_+$/g, '');

export const readExcelRows = async (file: File): Promise<ExcelRow[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) return [];

    const sheet = workbook.Sheets[firstSheetName];
    const rows = utils.sheet_to_json<ExcelRow>(sheet, {
        defval: '',
        raw: false,
    });

    return rows.map((row) => {
        return Object.entries(row).reduce<ExcelRow>((acc, [key, value]) => {
            acc[normalizeKey(key)] = value;
            return acc;
        }, {});
    });
};
