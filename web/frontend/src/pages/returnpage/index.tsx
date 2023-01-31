import { useState } from 'react';
import { Card, Layout, Page, Stack } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { SearchBox } from 'components/SearchBox';
import { ReturnTable } from 'components/ReturnTable';
import ReturnModal from '@/components/return-modal';

const ReturnPage = () => {
    const [activeModal, setActiveModal] = useState(false);
    return (
        <Page>
            <TitleBar
                title="My Returns"
                primaryAction={{
                    content: 'Add Return',
                    onAction: () => setActiveModal((active) => !active)
                }}
            />
            <Layout>
                <Layout.Section>
                    <div style={{ marginTop: 'var(--p-space-5)' }}>
                        <Card sectioned>
                            <Stack vertical>
                                <SearchBox />
                                <ReturnTable refetchAll={activeModal} />
                            </Stack>
                        </Card>
                    </div>
                </Layout.Section>
            </Layout>
            <ReturnModal active={activeModal} setActive={setActiveModal} />
        </Page>
    );
};

export default ReturnPage;
