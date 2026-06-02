import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../../shared/components';
import LabReportDocument from '../components/lab-report.document';
import { readLabReportPreview } from '../lab-report.preview';

export default function LabReportPreviewPage() {
    const [searchParams] = useSearchParams();
    const key = searchParams.get('key') || '';
    const loaded = React.useMemo(
        () => (key ? readLabReportPreview(key) : null),
        [key],
    );

    if (!loaded) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <div className="max-w-md rounded-sm border border-slate-300 bg-white p-6 text-center space-y-3">
                    <h1 className="text-lg font-black">
                        Preview tidak ditemukan
                    </h1>
                    <p className="text-sm text-slate-500">
                        Data LHU tidak tersedia atau session browser sudah
                        berubah. Silakan buka ulang preview dari aplikasi.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                    <div>
                        <h1 className="text-sm font-black uppercase">
                            Preview LHU
                        </h1>
                        <p className="text-xs text-slate-500">
                            Ukuran dokumen A4, siap dicek atau diexport ke PDF.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.close()}
                        >
                            Tutup
                        </Button>
                        <Button onClick={() => window.print()}>
                            Print / PDF
                        </Button>
                    </div>
                </div>
            </div>
            <LabReportDocument
                item={loaded.item}
                title={loaded.title}
                printable
            />
        </div>
    );
}
