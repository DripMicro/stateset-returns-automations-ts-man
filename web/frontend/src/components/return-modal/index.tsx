import {
    Button,
    Form,
    FormLayout,
    Modal,
    Select,
    Stack,
    TextContainer,
    TextFieldProps
} from '@shopify/polaris';
import {
    useState,
    useCallback,
    useRef,
    ReactElement,
    ReactNode,
    useEffect
} from 'react';
import { toaster } from 'evergreen-ui';
import TextField from 'components/TextField';
import { ReturnReason } from '@/libs/utils';
import { useAuthenticatedFetch, useAuthenticatedFetchPost } from '@/hooks';
import { v4 as uuid } from 'uuid';

const ORDER_PREFIX = 'gid://shopify/Order/';

export default function ReturnModal({
    active,
    setActive
}: {
    active: boolean;
    setActive: (value: boolean | ((prevVar: boolean) => boolean)) => void;
}) {
    const fetch = useAuthenticatedFetch();
    const fetchPost = useAuthenticatedFetchPost();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [orders, setOrders] = useState<{ value: string; label: string }[]>(
        []
    );
    const [lineItems, setLineItems] = useState<
        { value: string; label: string; quantity: number }[]
    >([]);

    const [selectOrder, setSelectOrder] = useState('');
    const [selectLineItem, setSelectLineItem] = useState('');
    const [selectReason, setReason] = useState('COLOR');
    const toggleModal = useCallback(() => {
        setActive((active: boolean) => !active);
        clearForm();
    }, []);

    useEffect(() => {
        getOrder();
    }, []);

    useEffect(() => {
        if (selectOrder) {
            getProducts();
        }
    }, [selectOrder]);

    const getProducts = async () => {
        setIsLoading(true);
        const response = await fetch(
            '/api/returns/fulfillments?id=' + selectOrder,
            {}
        );
        setIsLoading(false);
        if (response.ok) {
            const data = await response.json();
            const items = data.map((item: any) => ({
                value: item.fulfillmentLineItemId,
                label: item.name,
                quantity: item.quantity
            }));
            setLineItems([
                { value: '', label: 'Select LineItem.', quantity: 0 },
                ...items
            ]);
        } else {
            setLineItems([
                {
                    value: '',
                    label: 'No fulfillment item',
                    quantity: 0
                }
            ]);
        }
    };

    const getOrder = async () => {
        const response = await fetch('/api/returns/all-orders', {});
        if (response.ok) {
            const data = await response.json();
            const newOrders = data.map((item: any) => ({
                value: String(item.id).replace(ORDER_PREFIX, ''),
                label: item.name
            }));
            setOrders([{ value: '', label: 'Select Order ' }, ...newOrders]);
        }
    };

    const handleSubmit = async () => {
        if (!selectOrder) {
            toaster.danger('Please select an order!');
            return;
        }

        if (!selectLineItem) {
            toaster.danger('Please select a Line item');
            return;
        }

        if (!selectReason) {
            toaster.danger('Please select a Reason');
            return;
        }

        setIsCreating(true);
        const res = await fetch('/api/session', {});

        try {
            const response = await fetch('/api/returns/shopify-return', {
                body: JSON.stringify({
                    orderId: selectOrder,
                    lineItemId: selectLineItem,
                    reason: selectReason,
                    email: email,
                    quantity: lineItems.find(
                        (item) => item.value == selectLineItem
                    )?.quantity,
                    shopOrigin: 'stateset-demo.myshopify.com'
                }),
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                clearForm();
                toggleModal();
            }

            setIsCreating(false);
        } catch (error: any) {
            console.log(error);
            if (error.response && error.response.data) {
                toaster.danger(error.response.data);
            } else {
                toaster.danger(error.message);
            }
            setIsCreating(false);
        }
    };
    // console.log(selectLineItem);
    const handleEmailChange = useCallback((val: string) => setEmail(val), []);
    const handleChangeReason = useCallback((val: string) => setReason(val), []);
    const handleChangeLineItem = useCallback(
        (val: string) => setSelectLineItem(val),
        []
    );
    const handleChangeOrder = useCallback(
        (val: string) => setSelectOrder(val),
        []
    );

    const clearForm = () => {
        setSelectOrder('');
        setSelectLineItem('');
        setEmail('');
        setReason('');
    };

    return (
        <div style={{ height: '500px' }}>
            <Modal
                open={active}
                onClose={toggleModal}
                title="Add Return"
                primaryAction={{
                    content: 'Save',
                    onAction: handleSubmit,
                    loading: isCreating
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: toggleModal
                    }
                ]}
            >
                <Modal.Section>
                    <Form onSubmit={() => {}}>
                        <FormLayout>
                            <Select
                                label="Select Order"
                                options={orders}
                                requiredIndicator
                                value={selectOrder}
                                onChange={handleChangeOrder}
                            />
                            <Select
                                label="Select Line Item"
                                requiredIndicator
                                disabled={isLoading}
                                options={lineItems}
                                value={selectLineItem}
                                onChange={handleChangeLineItem}
                            />
                            <Select
                                label="Select Reason"
                                options={ReturnReason.map((item) => ({
                                    label: item,
                                    value: item
                                }))}
                                requiredIndicator
                                value={selectReason}
                                onChange={handleChangeReason}
                            />
                            <TextField
                                // multiline={4}
                                value={email}
                                onChange={handleEmailChange}
                                label="Email"
                                type="email"
                                autoComplete="email"
                            />
                        </FormLayout>
                    </Form>
                </Modal.Section>
            </Modal>
        </div>
    );
}
