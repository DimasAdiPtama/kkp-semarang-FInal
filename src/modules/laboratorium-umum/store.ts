import { createLabStore } from '../laboratory-shared/lab.store-factory';

const useLaboratoriumUmumStore = createLabStore({
    title: 'Laboratorium Umum',
    collectionName: 'LAB',
    historyCollectionName: 'historyLabUmum',
    reportLabel: 'Laboratorium Umum',
    isOc: false,
});

export default useLaboratoriumUmumStore;
