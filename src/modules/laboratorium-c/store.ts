import { createLabStore } from '../laboratory-shared/lab.store-factory';

const useLaboratoriumCStore = createLabStore({
    title: 'Laboratorium C',
    collectionName: 'LabOc',
    historyCollectionName: 'historyLabOfficial',
    reportLabel: 'Laboratorium C',
    isOc: true,
});

export default useLaboratoriumCStore;
