import { useCallback, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Card,
    Columns,
    Divider,
    Page,
    Spinner,
    Stack,
    Text
} from '@shopify/polaris';
import { useAppQuery, useAuthenticatedFetch } from '@/hooks';
import { useParams } from 'react-router-dom';
import { toaster } from 'evergreen-ui';

const EditPage = () => {
    const fetch = useAuthenticatedFetch();
    const { id } = useParams();
    const [isClosing, setIsClosing] = useState(false);
    const [isRefunding, setIsRefund] = useState(false);
    const [isReOpen, setIsReOpen] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const {
        data,
        isLoading: isLoadingReturn,
        refetch,
        isRefetching
    } = useAppQuery({
        url: '/api/returns/all/' + id,
        reactQueryOptions: {}
    });

    const handleClose = async () => {
        console.log(data);
        if (window.confirm('Are you sure close return')) {
            setIsClosing(true);
            await fetch('/api/returns/close-return', {
                body: JSON.stringify({
                    returnId: data.shopify_return_id,
                    id: data.id
                }),
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((res) => {
                    if (!res.ok) {
                        return res.text().then((text) => {
                            throw new Error(text);
                        });
                    }
                    return res.json();
                })
                .catch((error) => {
                    toaster.danger(error.message);
                });
            refetch();
            setIsClosing(false);
        }
    };

    const handleRefund = async () => {
        if (window.confirm('Are you sure refund return')) {
            setIsRefund(true);
            try {
                await fetch('/api/returns/refund-return', {
                    body: JSON.stringify({
                        returnId: data.shopify_return_id,
                        id: data.id,
                        returnLineItems: data.returnLineItems
                    }),
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    }
                })
                    .then((res) => {
                        if (!res.ok) {
                            return res.text().then((text) => {
                                throw new Error(text);
                            });
                        }
                        return res.json();
                    })
                    .catch((error) => {
                        toaster.danger(error.message);
                    });

                refetch();
                setIsRefund(false);
            } catch (error: any) {
                console.log(error);
            }
        }
    };

    const handleReOpen = async () => {
        if (window.confirm('Are you sure reopen return')) {
            setIsReOpen(true);
            await fetch('/api/returns/reopen-return', {
                body: JSON.stringify({
                    returnId: data.shopify_return_id,
                    id: data.id
                }),
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((res) => {
                    if (!res.ok) {
                        return res.text().then((text) => {
                            throw new Error(text);
                        });
                    }
                    return res.json();
                })
                .catch((error) => {
                    toaster.danger(error.message);
                });
            refetch();
            setIsReOpen(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure cancel return')) {
            setIsCancel(true);
            await fetch('/api/returns/cancel-return', {
                body: JSON.stringify({
                    returnId: data.shopify_return_id,
                    id: data.id
                }),
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((res) => {
                    if (!res.ok) {
                        return res.text().then((text) => {
                            throw new Error(text);
                        });
                    }
                    return res.json();
                })
                .catch((error) => {
                    toaster.danger(error.message);
                });
            refetch();
            setIsCancel(false);
        }
    };

    return (
        <Page>
            <div style={{ marginTop: 'var(--p-space-5)' }}>
                <Card>
                    <Card.Header title="Return Details">
                        <ButtonGroup>
                            <Button
                                loading={isRefunding}
                                onClick={handleRefund}
                            >
                                Refund
                            </Button>
                            <Button loading={isClosing} onClick={handleClose}>
                                Close
                            </Button>
                            <Button loading={isReOpen} onClick={handleReOpen}>
                                ReOpen
                            </Button>
                            <Button loading={isCancel} onClick={handleCancel}>
                                Cancel
                            </Button>
                        </ButtonGroup>
                    </Card.Header>
                    <div style={{ marginBottom: 'var(--p-space-5)' }}></div>
                    <Divider borderStyle="base" />
                    <Card.Section>
                        {isLoadingReturn ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: 'var(--p-space-5)'
                                }}
                            >
                                <Spinner />
                            </div>
                        ) : (
                            <Stack vertical>
                                <Stack.Item fill>
                                    <Columns
                                        columns={{
                                            xs: '3fr 3fr',
                                            md: '3fr 3fr'
                                        }}
                                    >
                                        <PlaceHolder
                                            label={'Order Id: '}
                                            value={data.order_id ?? ''}
                                        />
                                        <PlaceHolder
                                            label={`Condition Description:`}
                                            value={
                                                data.condition
                                                    ? data.condition
                                                    : ''
                                            }
                                        />
                                    </Columns>
                                </Stack.Item>
                                <Stack.Item fill>
                                    <Columns
                                        columns={{
                                            xs: '3fr 3fr',
                                            md: '3fr 3fr'
                                        }}
                                    >
                                        <PlaceHolder
                                            label={`RMA: `}
                                            value={`${
                                                data.rma ? data.rma : ''
                                            }`}
                                        />
                                        <PlaceHolder
                                            label={`Tracking Number: ${''}`}
                                            value={
                                                data.tracking_number
                                                    ? data.tracking_number
                                                    : ''
                                            }
                                        />
                                    </Columns>
                                </Stack.Item>
                                <Stack.Item fill>
                                    <Columns
                                        columns={{
                                            xs: '3fr 3fr',
                                            md: '3fr 3fr'
                                        }}
                                    >
                                        <PlaceHolder
                                            label={`Customer Email: ${''}`}
                                            value={
                                                data.customerEmail
                                                    ? data.customerEmail
                                                    : ''
                                            }
                                        />
                                        <PlaceHolder
                                            label={`Status: ${''}`}
                                            value={
                                                data.status ? data.status : ''
                                            }
                                        />
                                    </Columns>
                                </Stack.Item>
                            </Stack>
                        )}
                    </Card.Section>
                </Card>
            </div>
        </Page>
    );
};

const PlaceHolder = ({ label = '', value = '' }) => {
    return (
        <div
            style={{
                width: '100%',
                borderBottom: '1px solid var(--p-border-subdued)',
                padding: 'var(--p-space-3)'
            }}
        >
            <Columns
                columns={{
                    xs: '3fr 3fr',
                    md: '3fr 3fr'
                }}
                gap={{
                    xs: '2',
                    md: '2'
                }}
            >
                <Text as="h2" variant="bodyMd">
                    {label}
                </Text>
                <Text as="h2" variant="headingMd">
                    {value}
                </Text>
            </Columns>
        </div>
    );
};

export default EditPage;
