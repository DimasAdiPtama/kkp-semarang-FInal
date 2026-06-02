import type { LabHistoryItem, LabSample } from '../lab.types';
import {
    findTestCatalog,
    formatCurrency,
    formatLongDate,
    parseSelectedTests,
} from '../lab.utils';

type LabReportDocumentProps = {
    item: LabSample | LabHistoryItem;
    title: string;
    printable?: boolean;
};

const buildMethodCode = (name: string) => {
    const catalog = findTestCatalog(name);
    return `IKU-${catalog.key.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
};

const buildConclusion = (item: LabSample | LabHistoryItem) => {
    const filledResults = item.hasilUji.filter((entry) => entry.result?.trim());
    if (filledResults.length === 0) return 'Belum ada hasil uji yang diinput.';

    return filledResults
        .map((entry) => `${entry.testName}: ${entry.result}`)
        .join('; ');
};

const getRenderedTests = (item: LabSample | LabHistoryItem) => {
    if (item.hasilUji.length > 0) {
        return item.hasilUji;
    }

    return parseSelectedTests(item.rawSelectedTests).map((name) => {
        const catalog = findTestCatalog(name);
        return {
            testKey: catalog.key,
            testName: catalog.label,
            result: '',
            tarif: catalog.tarif,
        };
    });
};

export default function LabReportDocument({
    item,
    title,
    printable = false,
}: LabReportDocumentProps) {
    const tests = getRenderedTests(item);

    return (
        <div className={printable ? 'min-h-screen bg-slate-200 py-6' : ''}>
            <div
                className={`mx-auto w-full bg-white text-black shadow-sm ${
                    printable
                        ? 'min-h-[297mm] max-w-[210mm] px-[18mm] py-[14mm]'
                        : 'border border-slate-300 p-6'
                }`}
            >
                <div className="border-b-[3px] border-black pb-4">
                    <div className="grid grid-cols-[90px_1fr_78px] items-start gap-3">
                        <div className="flex justify-center pt-1">
                            <img
                                src="/logo/logo_blt.png"
                                alt="Logo Balai"
                                className="h-18 w-auto object-contain"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-[12px] font-bold tracking-[0.08em] text-blue-900">
                                KEMENTERIAN KELAUTAN DAN PERIKANAN
                            </p>
                            <p className="text-[12px] text-blue-900">
                                BADAN KARANTINA IKAN, PENGENDALIAN MUTU
                            </p>
                            <p className="text-[12px] text-blue-900">
                                DAN KEAMANAN HASIL PERIKANAN
                            </p>
                            <p className="text-[12px] font-bold text-blue-900">
                                BALAI KARANTINA IKAN, PENGENDALIAN MUTU
                            </p>
                            <p className="text-[12px] font-bold text-blue-900">
                                DAN KEAMANAN HASIL PERIKANAN SEMARANG
                            </p>
                            <p className="mt-1 text-[10px]">
                                JALAN DR. SURATMO NO 28 KELURAHAN KEMBANGARUM
                                SEMARANG 50148
                            </p>
                            <p className="text-[10px]">
                                TELEPON (024) 76671020
                            </p>
                            <p className="text-[10px] text-blue-900 underline">
                                www.kkp.go.id/bkipmsemarang
                            </p>
                        </div>
                        <div className="flex justify-center pt-1">
                            <img
                                src="/logo/Logo_KAN_JI1.png"
                                alt="Logo KAN"
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-5 text-center">
                    <p className="text-[11px] font-bold tracking-[0.3em]">
                        LAPORAN HASIL UJI
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em]">
                        {title}
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-[180px_1fr] gap-x-4 gap-y-1 text-[11px]">
                    <span>Nomor LPP</span>
                    <span>: {item.lpp || '-'}</span>
                    <span>Nama Sampel</span>
                    <span>: {item.namaSampel || '-'}</span>
                    <span>Nama Latin</span>
                    <span>: {item.namaLatin || '-'}</span>
                    <span>Tanggal Pengujian</span>
                    <span>: {formatLongDate(item.tanggalPengujian)}</span>
                    <span>Tanggal Penerbitan</span>
                    <span>: {formatLongDate(item.tanggalPenerbitan)}</span>
                    <span>Email</span>
                    <span>: {item.email || '-'}</span>
                    <span>NIP / Identitas</span>
                    <span>: {item.nip || '-'}</span>
                    <span>Petugas Pengujian</span>
                    <span>: {item.namaPetugas || '-'}</span>
                    <span>NIP Petugas</span>
                    <span>: {item.nipPetugas || '-'}</span>
                    <span>Jumlah Sampel</span>
                    <span>: {item.jumlahKg || '-'}</span>
                </div>

                <div className="mt-5 overflow-hidden border border-black">
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border border-black px-2 py-2 text-left">
                                    No
                                </th>
                                <th className="border border-black px-2 py-2 text-left">
                                    Parameter Uji
                                </th>
                                <th className="border border-black px-2 py-2 text-left">
                                    Metode
                                </th>
                                <th className="border border-black px-2 py-2 text-left">
                                    Satuan
                                </th>
                                <th className="border border-black px-2 py-2 text-left">
                                    Hasil Uji
                                </th>
                                <th className="border border-black px-2 py-2 text-left">
                                    Tarif
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map((entry, index) => {
                                const catalog = findTestCatalog(entry.testName);

                                return (
                                    <tr key={`${entry.testKey}-${index}`}>
                                        <td className="border border-black px-2 py-2 align-top">
                                            {index + 1}
                                        </td>
                                        <td className="border border-black px-2 py-2 align-top">
                                            {entry.testName}
                                        </td>
                                        <td className="border border-black px-2 py-2 align-top">
                                            {buildMethodCode(entry.testName)}
                                        </td>
                                        <td className="border border-black px-2 py-2 align-top">
                                            {catalog.satuan}
                                        </td>
                                        <td className="border border-black px-2 py-2 align-top">
                                            {entry.result || '-'}
                                        </td>
                                        <td className="border border-black px-2 py-2 align-top">
                                            {formatCurrency(
                                                Number(entry.tarif || 0),
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td
                                    colSpan={5}
                                    className="border border-black px-2 py-2 text-right font-bold"
                                >
                                    Total Tarif
                                </td>
                                <td className="border border-black px-2 py-2 font-bold">
                                    {formatCurrency(item.totalTarif)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mt-4 space-y-2 text-[10px]">
                    <p>
                        <span className="font-bold">Kesimpulan:</span>{' '}
                        {buildConclusion(item)}
                    </p>
                    <ol className="list-decimal space-y-1 pl-4">
                        <li>Hasil uji berlaku untuk sampel yang diperiksa.</li>
                        <li>
                            Parameter yang tampil mengikuti data pengujian yang
                            dipilih pada sampel.
                        </li>
                        <li>
                            Laporan hasil uji ini tidak boleh digandakan,
                            kecuali secara lengkap dan seizin tertulis Kepala
                            Balai KIPM Semarang.
                        </li>
                    </ol>
                </div>

                <div className="mt-8 flex justify-end">
                    <div className="w-[260px] text-[11px]">
                        <p>
                            Semarang, {formatLongDate(item.tanggalPenerbitan)}
                        </p>
                        <p className="mt-2">Penanggung jawab Laboratorium</p>
                        <p className="italic">Laboratory in Charge</p>
                        <div className="h-20" />
                        <p className="font-bold uppercase">
                            {item.namaPenanggungJawab || '-'}
                        </p>
                        <p>NIP. {item.nipPenanggungJawab || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
