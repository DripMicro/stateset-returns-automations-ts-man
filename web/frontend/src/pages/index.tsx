import { Page, Layout, Text } from '@shopify/polaris';
import { ReturnTable } from 'components/ReturnTable';
import { SearchBox } from 'components/SearchBox';

export default function HomePage() {
    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <div style={{ marginTop: 'var(--p-space-5)' }}>
                        <Text alignment={'center'} variant="headingXl" as="h2">
                            Stateset Returns Automation
                        </Text>
                        <Text
                            alignment="center"
                            variant="headingSm"
                            as="span"
                            color="subdued"
                        >
                            Admin Setup Instuctions
                        </Text>
                    </div>
                </Layout.Section>
                <Layout.Section>
                    <SearchBox />
                </Layout.Section>
                <Layout.Section>
                    <ReturnTable refetchAll={false} />
                </Layout.Section>
            </Layout>
        </Page>
    );
}
