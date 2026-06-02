export type LabQueueStatus = 'Pending' | 'Diproses' | 'Selesai';

export type LabResultItem = {
    testName: string;
    testKey: string;
    result: string;
    tarif: number;
};

export type LabSample = {
    token: string;
    email: string;
    isOc: boolean;
    jumlahKg: string;
    lhuUrl: string;
    lpp: string;
    namaSampel: string;
    namaLatin: string;
    nip: string;
    rawSelectedTests: string;
    selectedTests: string[];
    status: string;
    tanggalPengujian: string;
    timestamp: number;
    uid: string;
    namaPetugas: string;
    nipPetugas: string;
    tanggalPenerbitan: string;
    namaPenanggungJawab: string;
    nipPenanggungJawab: string;
    hasilUji: LabResultItem[];
    totalTarif: number;
};

export type LabHistoryItem = LabSample & {
    sourceCollection: string;
    historyCollection: string;
};

export type LabModuleConfig = {
    title: string;
    collectionName: string;
    historyCollectionName: string;
    reportLabel: string;
    isOc: boolean;
};
