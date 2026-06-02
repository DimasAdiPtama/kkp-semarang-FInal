import { formatCurrency } from '../laboratory-shared/lab.utils';

export type ReportingPDFData = {
    records: any[];
    totals: any;
    startDate: string;
    endDate: string;
    formatDateLabel: (date: string) => string;
};

export const openReportingPDF = (data: ReportingPDFData) => {
    const { records, totals, startDate, endDate, formatDateLabel } = data;

    const summaryItems = [
        ['SMKHP Offline', totals.smkhpOffline],
        ['SMKHP Online', totals.smkhpOnline],
        ['Laboratorium Umum', totals.laboratoriumUmum],
        ['Laboratorium C', totals.laboratoriumC],
        ['Customer Service Offline', totals.customerServiceOffline],
        ['Customer Service Online', totals.customerServiceOnline],
        ['Total', totals.total],
    ];

    const summaryHtml = summaryItems
        .map(
            ([label, value]) =>
                `<tr>
                    <td style="padding:6px 8px;border:1px solid #000;">${label}</td>
                    <td style="padding:6px 8px;border:1px solid #000;text-align:right;font-weight:bold;">${value}</td>
                </tr>`,
        )
        .join('');

    const recordsHtml = records
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(
            (record, index) => `
            <tr>
                <td style="padding:4px 6px;border:1px solid #000;text-align:center;">${index + 1}</td>
                <td style="padding:4px 6px;border:1px solid #000;">${formatDateLabel(record.dateKey)}</td>
                <td style="padding:4px 6px;border:1px solid #000;">${record.serviceLabel}</td>
                <td style="padding:4px 6px;border:1px solid #000;">${record.title || record.id}</td>
                <td style="padding:4px 6px;border:1px solid #000;">${record.userName || '-'}</td>
                <td style="padding:4px 6px;border:1px solid #000;">${record.status || '-'}</td>
                <td style="padding:4px 6px;border:1px solid #000;text-align:right;">${formatCurrency(record.totalTarif || 0)}</td>
            </tr>`,
        )
        .join('');

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
            <head>
                <title>Laporan Reporting KKP Semarang</title>
                <style>
                    @page { size: A4 portrait; margin: 15mm; }
                    body {
                        font-family: 'Arial', sans-serif;
                        color: #000;
                        margin: 0;
                        padding: 0;
                        line-height: 1.4;
                    }
                    .header {
                        border-bottom: 3px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        gap: 20px;
                    }
                    .header img {
                        height: 60px;
                        width: auto;
                    }
                    .header-text {
                        text-align: center;
                        flex: 1;
                    }
                    .header-text p {
                        margin: 0;
                        font-size: 10px;
                    }
                    .header-text .main-title {
                        font-size: 12px;
                        font-weight: bold;
                        color: #1e3a8a;
                    }
                    .report-title {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .report-title h1 {
                        font-size: 14px;
                        text-decoration: underline;
                        margin: 0;
                        letter-spacing: 2px;
                    }
                    .report-title p {
                        font-size: 11px;
                        margin: 5px 0 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                        margin-bottom: 20px;
                    }
                    th {
                        background: #f3f4f6;
                        border: 1px solid #000;
                        padding: 6px 8px;
                        text-align: left;
                    }
                    h2 {
                        font-size: 12px;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                    }
                    .summary-container {
                        width: 300px;
                    }
                    .footer {
                        margin-top: 40px;
                        display: flex;
                        justify-content: flex-end;
                    }
                    .signature {
                        width: 200px;
                        text-align: center;
                        font-size: 11px;
                    }
                    .signature .space {
                        height: 60px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/logo/logo_blt.png" alt="Logo KKP" />
                    <div class="header-text">
                        <p class="main-title">KEMENTERIAN KELAUTAN DAN PERIKANAN</p>
                        <p>BADAN KARANTINA IKAN, PENGENDALIAN MUTU</p>
                        <p>DAN KEAMANAN HASIL PERIKANAN</p>
                        <p style="font-weight: bold;">BALAI KARANTINA IKAN, PENGENDALIAN MUTU</p>
                        <p style="font-weight: bold;">DAN KEAMANAN HASIL PERIKANAN SEMARANG</p>
                        <p>Jalan Dr. Suratmo No 28, Semarang 50148</p>
                    </div>
                    <img src="/logo/Logo_KAN_JI1.png" alt="Logo KAN" />
                </div>

                <div class="report-title">
                    <h1>LAPORAN REKAPITULASI LAYANAN</h1>
                    <p>Periode: ${formatDateLabel(startDate)} s/d ${formatDateLabel(endDate)}</p>
                </div>

                <div class="summary-container">
                    <h2>Ringkasan Statistik</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Jenis Layanan</th>
                                <th style="text-align:right;">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summaryHtml}
                        </tbody>
                    </table>
                </div>

                <h2>Detail Aktivitas Layanan</h2>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30px; text-align:center;">No</th>
                            <th style="width: 80px;">Tanggal</th>
                            <th style="width: 120px;">Layanan</th>
                            <th>Judul / Token</th>
                            <th style="width: 120px;">User/Trader</th>
                            <th style="width: 80px;">Status</th>
                            <th style="width: 90px; text-align:right;">Tarif</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recordsHtml || '<tr><td colspan="7" style="text-align:center;padding:20px;">Tidak ada data pada periode ini</td></tr>'}
                    </tbody>
                </table>

                <div class="footer">
                    <div class="signature">
                        <p>Semarang, ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                        <p>Petugas Pelaporan,</p>
                        <div class="space"></div>
                        <p style="font-weight: bold; text-decoration: underline;">( ............................ )</p>
                    </div>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};
