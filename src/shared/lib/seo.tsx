import { Helmet } from 'react-helmet-async';

type SEOProps = {
    title: string;
    description?: string;
};

const DEFAULT_TITLE = 'My App';
const TITLE_SEPARATOR = ' | ';

export function SEO({ title, description }: SEOProps) {
    const fullTitle = `${title}${TITLE_SEPARATOR}${DEFAULT_TITLE}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
        </Helmet>
    );
}
