import type { LabHistoryItem, LabSample } from '../lab.types';
import LabReportDocument from './lab-report.document';

type LabReportViewProps = {
    item: LabSample | LabHistoryItem;
    title: string;
};

export default function LabReportView({ item, title }: LabReportViewProps) {
    return <LabReportDocument item={item} title={title} />;
}
