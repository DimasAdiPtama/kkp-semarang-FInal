import type { HistoryUser, UserActivity } from './store';

const formatDisplayDate = (value?: string | number) => {
    if (!value) return '-';

    const date = typeof value === 'number' ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
    }).format(date);
};

const findUserForActivity = (activity: UserActivity, users: HistoryUser[]) => {
    const activityNpwp = (activity.npwp || '').trim();
    const activityUid = (activity.uid || '').trim();
    const activityEmail = (activity.email || '').trim().toLowerCase();

    return users.find((user) => {
        const userNpwp = (user.npwp || '').trim();
        if (
            userNpwp &&
            userNpwp !== '-' &&
            activityNpwp &&
            activityNpwp !== '-'
        ) {
            return userNpwp === activityNpwp;
        }
        if (user.uid && activityUid && user.uid === activityUid) {
            return true;
        }
        if (
            user.email &&
            activityEmail &&
            user.email.toLowerCase() === activityEmail
        ) {
            return true;
        }
        return false;
    });
};

export const openHistoryReportPrint = (
    activities: UserActivity[],
    users: HistoryUser[],
) => {
    if (activities.length === 0) {
        alert('Tidak ada data history untuk diekspor.');
        return;
    }

    // Grouping: Trader -> Service Label
    const groups = activities.reduce<
        Record<string, Record<string, UserActivity[]>>
    >((acc, activity) => {
        const user = findUserForActivity(activity, users);
        const traderLabel =
            user?.namaTrader && user.namaTrader !== '-'
                ? user.namaTrader
                : user?.nama || activity.userName || 'Trader Tidak Diketahui';

        if (!acc[traderLabel]) acc[traderLabel] = {};

        const serviceLabel = activity.serviceLabel || 'Layanan Lainnya';
        if (!acc[traderLabel][serviceLabel])
            acc[traderLabel][serviceLabel] = [];

        acc[traderLabel][serviceLabel].push(activity);
        return acc;
    }, {});

    const orderedTraders = Object.entries(groups).sort(([left], [right]) =>
        left.localeCompare(right),
    );

    const sectionsHtml = orderedTraders
        .map(([traderName, services]) => {
            const serviceSections = Object.entries(services)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([serviceLabel, items]) => {
                    const rowsHtml = items
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map(
                            (item, index) => `
                                <tr>
                                    <td style="width: 30px; text-align: center;">${index + 1}</td>
                                    <td style="width: 150px;">${item.title || '-'}</td>
                                    <td style="width: 100px;">${item.userName || '-'}</td>
                                    <td style="width: 80px;">${item.status || '-'}</td>
                                    <td style="width: 100px;">${item.subStatus || '-'}</td>
                                    <td>${item.description || '-'}</td>
                                    <td style="width: 130px;">${formatDisplayDate(item.timestamp || item.dateLabel)}</td>
                                </tr>
                            `,
                        )
                        .join('');

                    return `
                        <div class="service-block">
                            <h3 class="service-title">${serviceLabel} (${items.length} history)</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Judul/Nomor</th>
                                        <th>User</th>
                                        <th>Status</th>
                                        <th>Sub Status</th>
                                        <th>Ringkasan</th>
                                        <th>Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>${rowsHtml}</tbody>
                            </table>
                        </div>
                    `;
                })
                .join('');

            return `
                <section class="trader-section">
                    <div class="trader-head">
                        <h2>${traderName}</h2>
                    </div>
                    ${serviceSections}
                </section>
            `;
        })
        .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir.');
        return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>Laporan History KKP Semarang</title>
                <style>
                    @page { size: A4 landscape; margin: 10mm; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #1e293b;
                        margin: 0;
                        padding: 20px;
                        line-height: 1.4;
                    }
                    .header {
                        border-bottom: 2px solid #0f172a;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                    }
                    h1 {
                        margin: 0;
                        font-size: 22px;
                        color: #0f172a;
                    }
                    .print-info {
                        font-size: 12px;
                        color: #64748b;
                        margin-top: 5px;
                    }
                    .trader-section {
                        margin-top: 30px;
                        page-break-inside: avoid;
                    }
                    .trader-head {
                        background: #f1f5f9;
                        padding: 8px 12px;
                        border-left: 4px solid #0f172a;
                        margin-bottom: 15px;
                    }
                    .trader-head h2 {
                        margin: 0;
                        font-size: 18px;
                        color: #0f172a;
                        text-transform: uppercase;
                    }
                    .service-block {
                        margin-bottom: 20px;
                        margin-left: 10px;
                    }
                    .service-title {
                        font-size: 14px;
                        margin: 0 0 8px 0;
                        color: #334155;
                        border-bottom: 1px dashed #cbd5e1;
                        padding-bottom: 4px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                        table-layout: fixed;
                    }
                    th, td {
                        border: 1px solid #94a3b8;
                        padding: 6px 8px;
                        vertical-align: top;
                        text-align: left;
                        word-wrap: break-word;
                    }
                    th {
                        background: #f8fafc;
                        color: #475569;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background: #fcfcfc;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LAPORAN RIWAYAT LAYANAN (HISTORY)</h1>
                    <div class="print-info">
                        Dicetak pada: ${formatDisplayDate(Date.now())} | Total Trader: ${orderedTraders.length}
                    </div>
                </div>
                ${sectionsHtml || '<p>Belum ada data history.</p>'}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
};
