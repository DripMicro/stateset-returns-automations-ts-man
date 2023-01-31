import express from 'express';
import { gql } from 'graphql-request';
import hasuraClient from '../lib/hasura-client';
import ShopifyClient from '../lib/shopify-client';
import { v4 as uuid } from 'uuid';
import algoliasearch from 'algoliasearch';
import { IReturnLineItem } from '../lib/interface';

const router = express.Router();

router.get('/all', async (req, res) => {
    const { shop } = res.locals.shopify.session;

    const GET_ALL_QUERY = gql`
        query ($shop: String!) {
            returns(where: { store_id: { _eq: $shop } }) {
                store_id
                id
                order_id
                description
                status
                issue
                tracking_number
                action_needed
                customerEmail
                rma
                zendesk_number
                enteredBy
                order_date
                shipped_date
                requested_date
                condition
                reported_condition
                amount
                tax_refunded
                total_refunded
                created_date
                shopify_return_id
            }
        }
    `;
    const allReturns = await hasuraClient.request(GET_ALL_QUERY, {
        shop: shop
    });
    res.json(allReturns.returns ?? []);
});

router.get('/all/:id', async (req, res) => {
    const { id } = req.params;
    const { shop, accessToken } = res.locals.shopify.session;

    const RETURN_BY_PK_QUERY = gql`
        query ($id: String!) {
            returns_by_pk(id: $id) {
                store_id
                id
                order_id
                description
                status
                issue
                tracking_number
                action_needed
                customerEmail
                rma
                zendesk_number
                enteredBy
                order_date
                shipped_date
                requested_date
                condition
                reported_condition
                amount
                tax_refunded
                total_refunded
                created_date
                shopify_return_id
            }
        }
    `;

    const result = await hasuraClient.request(RETURN_BY_PK_QUERY, {
        id: id
    });
    const { shopify_return_id: returnId } = result.returns_by_pk;
    let returnLineItems = [];

    if (returnId) {
        const query = gql`
            query returnQuery {
                return(id: "${returnId}") {
                name
                order {
                    id
                }
                status,
                returnLineItems(first: 10) {
                    edges {
                    node {
                        id,
                        quantity
                    }
                    }
                }
                }
            } 
        `;

        const data = await ShopifyClient(shop, accessToken, query, {});

        const returnData = data.return;

        if (returnData.returnLineItems?.edges?.length) {
            const { returnLineItems: lineItems } = returnData;
            returnLineItems = lineItems.edges.map((edge: any) => ({
                returnLineItemId: edge.node.id,
                quantity: edge.node.quantity
            }));
        }
    }
    const response = {
        ...(result.returns_by_pk ?? {}),
        returnLineItems
    };
    res.json(response);
});

router.get('/all-orders', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;

    const ordersQuery = gql`
        query {
            orders(first: 50, query: "status:OPEN") {
                edges {
                    node {
                        id
                        name
                        fulfillments(first: 20) {
                            status
                        }
                    }
                }
            }
        }
    `;
    try {
        const response = await ShopifyClient(
            shop,
            accessToken,
            ordersQuery,
            {}
        );

        if (response.orders?.edges) {
            const ids = response.orders.edges.map((edge: any) => {
                return { id: edge.node.id, name: edge.node.name };
            });
            return res.json(ids);
        }

        res.status(500).send('There is no order');
    } catch (error: any) {
        console.error(error, 'get-all-orders');
        res.status(500).send(error.message);
    }
});

router.get('/fulfillments', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const { id } = req.query;

    const query = gql`query returnableFulfillmentsQuery {
        returnableFulfillments(orderId: "gid://shopify/Order/${id}", first: 20) {
          edges {
            node {
              id
              fulfillment {
                id
                name
                status
              }
              # Return the first ten returnable fulfillment line items that belong to the order.
              returnableFulfillmentLineItems(first: 10) {
                edges {
                  node {
                    fulfillmentLineItem {
                      id
                      lineItem {
                        name
                      }
                    }
                    quantity
                  }
                }
              }
            }
          }
        }
    }`;
    try {
        const response = await ShopifyClient(shop, accessToken, query, {});
        let returnLineItems: any[] = [];
        if (response.returnableFulfillments?.edges) {
            const edges = response.returnableFulfillments?.edges;
            // console.log(edges[0].node.returnableFulfillmentLineItems)
            if (Array.isArray(edges) && edges.length) {
                edges.map((edge) => {
                    edge.node.returnableFulfillmentLineItems?.edges?.map(
                        (item: any) => {
                            returnLineItems.push({
                                fulfillmentLineItemId:
                                    item.node.fulfillmentLineItem.id,
                                quantity: item.node.quantity,
                                name: item.node.fulfillmentLineItem.lineItem
                                    .name
                            });
                        }
                    );
                });
            }
        }
        if (!returnLineItems.length) {
            return res.status(500).send('No returnable fulfillments');
        }
        console.log(returnLineItems);
        res.json(returnLineItems);
    } catch (error: any) {
        console.error(error, 'close-return');
        res.status(500).send(error.message);
    }
});

router.post('/shopify-return', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const { orderId, lineItemId, reason, email, quantity } = req.body;

    try {
        // ------------- set ReturnLineItems ----------
        const returnLineItem: any = {
            fulfillmentLineItemId: lineItemId,
            quantity: parseInt(quantity),
            returnReason: reason
        };
        if (reason == 'OTHER') {
            returnLineItem.returnReasonNote = 'OTHER';
        }
        let returnLineItems = [returnLineItem];

        let query = gql`
            mutation returnCreate($returnInput: ReturnInput!) {
                returnCreate(returnInput: $returnInput) {
                    return {
                        id
                        name
                        status
                    }
                    userErrors {
                        code
                        field
                        message
                    }
                }
            }
        `;
        const response: any = await ShopifyClient(shop, accessToken, query, {
            returnInput: {
                notifyCustomer: true,
                orderId: `gid://shopify/Order/${orderId}`,
                requestedAt: new Date(),
                returnLineItems
            }
        });

        if (response && response.returnCreate?.userErrors?.length) {
            const message = response.returnCreate?.userErrors.reduce(
                (prev: string, current: any) => prev + '\n' + current.message,
                ''
            );
            return res.status(500).send(message);
        }
        const returnData = response.returnCreate?.return;

        query = gql`
            mutation addReturn($return_x: returns_insert_input!) {
                insert_returns(objects: [$return_x]) {
                    returning {
                        id
                        order_id
                        customer_id
                        description
                        status
                        tracking_number
                        zendesk_number
                        action_needed
                        issue
                        shipped_date
                        requested_date
                        enteredBy
                        customerEmail
                        rma
                        store_id
                        shopify_return_id
                    }
                }
            }
        `;

        const { insert_returns } = await hasuraClient.request(query, {
            return_x: {
                id: uuid(),
                customerEmail: email,
                status: returnData.status,
                rma: returnData.name,
                store_id: shop,
                shopify_return_id: returnData.id,
                order_id: orderId
            }
        });

        // if(process.env.NODE_ENV === 'production')
        const client = algoliasearch(
            '33E3DVTXWA', // process.env.ALGOLIASEARCH_KEY
            '2fc6ed599dba85c5f91d61afe6737e7e' // process.env.ALGOLIASEARCH_SECURTY
        );
        const index = client.initIndex('prod_RMAI_returns');
        const returning = insert_returns.returning[0];

        index
            .saveObject({
                objectID: returning.id,
                shopid: returning.store_id,
                order_id: returning.order_id,
                customerEmail: returning.customerEmail,
                issue: returning.issue,
                status: returning.status,
                action_needed: returning.action_needed,
                shipped_date: returning.shipped_date,
                requested_date: returning.requested_date,
                rma: returning.rma
            })
            .then(({ objectID }) => {
                console.log(objectID, 'ObjectId');
            });
        res.status(200).json({ returning });
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

router.post('/suggest-refund', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const {
        returnId,
        returnLineItems
    }: { returnId: string; returnLineItems: IReturnLineItem[] } = req.body;

    try {
        const result = await getSuggestedRefund(
            returnId,
            returnLineItems,
            shop,
            accessToken
        );
        res.status(200).json(result);
    } catch (error: any) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

const getSuggestedRefund = async (
    returnId: string,
    returnLineItems: IReturnLineItem[],
    shop: string,
    accessToken: string
) => {
    const suggestQuery: any = gql`
        query suggestedReturnRefundQuery {
            return(id: "${returnId}") {
            # You can use the suggested refund object to later generate an actual refund.
            suggestedRefund(
                returnRefundLineItems: ${returnLineItemsString(returnLineItems)}
            ) {
                # The total monetary value to be refunded.
                amount {
                shopMoney {
                    amount,
                    currencyCode
                }
                }
                # The shipping costs to be refunded from the order.
                shipping {
                maximumRefundableSet {
                    shopMoney {
                    amount,
                    currencyCode
                    }
                }
                }
                # A list of line items to be refunded, along with restock instructions.
                refundDuties {
                amountSet {
                    shopMoney {
                    amount
                    }
                }
                }
                # The sum of all the prices of the line items being refunded.
                subtotal {
                shopMoney {
                    amount
                }
                }
                # A list of suggested order transactions.
                suggestedTransactions {
                amountSet {
                    shopMoney {
                    amount,
                    currencyCode
                    }
                }
                gateway
                parentTransaction {
                    kind
                    id
                }
                }
            }
            }
        }`;
    try {
        const returnResponse = await ShopifyClient(
            shop,
            accessToken,
            suggestQuery,
            {}
        );

        console.log(
            returnResponse.return.suggestedRefund,
            'returnResponseJson'
        );
        if (returnResponse?.return?.suggestedRefund) {
            return returnResponse.return.suggestedRefund;
        }
        throw new Error('No suggestedRefund');
    } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
    }
};

router.post('/refund-return', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const {
        returnId,
        id,
        returnLineItems
    }: {
        returnId: string;
        id: string;
        returnLineItems: IReturnLineItem[];
    } = req.body;
    try {
        const suggestedRefund = await getSuggestedRefund(
            returnId,
            returnLineItems,
            shop,
            accessToken
        );

        const returnQuery = gql`
            mutation returnRefundMutation(
                $returnLineItems: [ReturnRefundLineItemInput!]!, 
                $refundShipping: RefundShippingInput,
                $orderTransactions: [ReturnRefundOrderTransactionInput!]
                ) {
                returnRefund(
                    returnRefundInput: {
                        returnId: "${returnId}",
                        returnRefundLineItems: $returnLineItems,
                        refundShipping: $refundShipping,
                        orderTransactions: $orderTransactions
                    }
                )
                {
                    refund {
                    id
                    }
                    userErrors {
                    field
                    message
                    }
                }
            }`;

        const returnResponseJson: any = await ShopifyClient(
            shop,
            accessToken,
            returnQuery,
            {
                returnLineItems,
                refundShipping: {
                    fullRefund: true,
                    shippingRefundAmount: {
                        amount:
                            suggestedRefund?.shipping?.maximumRefundableSet
                                ?.shopMoney?.amount || 0,
                        currencyCode:
                            suggestedRefund?.shipping?.maximumRefundableSet
                                ?.shopMoney?.currencyCode || 'USD'
                    }
                },
                orderTransactions:
                    suggestedRefund?.suggestedTransactions?.map((item: any) => {
                        return {
                            transactionAmount: {
                                amount: item.amountSet?.shopMoney?.amount || 0,
                                currencyCode:
                                    item.amountSet?.shopMoney?.currencyCode ||
                                    'USD'
                            },
                            parentId: item.parentTransaction.id
                        };
                    }) || []
            }
        );

        console.log(
            returnResponseJson.returnRefund.userErrors,
            returnResponseJson.returnRefund
        );

        if (returnResponseJson.returnRefund.userErrors?.length) {
            const message =
                returnResponseJson.returnRefund.userErrors[0].message;

            res.status(500).send(message);
            return;
        }

        if (returnResponseJson?.returnRefund?.refund) {
            await updateReturn(id, {
                status: 'REFUNDED'
            });

            return res.status(200).json({
                ...returnResponseJson.returnRefund.refund,
                msg: 'Successful Refund Return'
            });
        }

        res.status(500).send('There is no refund Transaction');
    } catch (error: any) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

router.post('/reopen-return', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const { returnId, id }: { returnId: string; id: string } = req.body;
    const returnQuery = gql`
            mutation returnReopenMutation {
            returnReopen(id: "${returnId}") {
                return {
                id,
                status
                }
                userErrors {
                field
                message
                }
            }
            }
        `;
    try {
        const response: any = await ShopifyClient(
            shop,
            accessToken,
            returnQuery,
            {}
        );

        console.log(response.returnReopen.userErrors);
        if (response.returnReopen?.return) {
            const { status } = response.returnReopen?.return;
            await updateReturn(id, {
                status
            });
            return res.json(response.returnReopen.return);
        }

        res.status(500).send('There is no reopen transaction');
    } catch (error: any) {
        console.error(error, 'reopen-return');
        res.status(500).send(error.message);
    }
});

router.post('/cancel-return', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const { returnId, id }: { returnId: string; id: string } = req.body;

    const returnQuery = gql`
            mutation returnCancelMutation {
            returnCancel(id: "${returnId}") {
                return {
                id,
                status
                }
                userErrors {
                field
                message
                }
            }
            }
        `;
    try {
        const response: any = await ShopifyClient(
            shop,
            accessToken,
            returnQuery,
            {}
        );

        console.log(response.returnCancel.userErrors, returnQuery);
        if (response.returnCancel?.return) {
            const { status } = response.returnCancel?.return;
            await updateReturn(id, {
                status
            });
            return res.json(response.returnCancel.return);
        }

        res.status(500).send('There is no cancel Transaction');
    } catch (error: any) {
        console.error(error, 'close-return');
        res.status(500).send(error.message);
    }
});

router.post('/close-return', async (req, res) => {
    const { shop, accessToken } = res.locals.shopify.session;
    const { returnId, id }: { returnId: string; id: string } = req.body;

    const returnQuery = gql`
        mutation returnCloseMutation {
        returnClose(id: "${returnId}") {
            return {
            id,
            status
            }
            userErrors {
            field
            message
            }
        }
        }
    `;
    try {
        const response: any = await ShopifyClient(
            shop,
            accessToken,
            returnQuery,
            {}
        );

        console.log(response);
        if (response.returnClose?.return) {
            const { status } = response.returnClose.return;
            await updateReturn(id, {
                status
            });
            return res.json(response.returnClose.return);
        }

        res.status(500).send('There is no close Transaction');
    } catch (error: any) {
        console.error(error, 'close-return');
        res.status(500).send(error.message);
    }
});

const updateReturn = async (id: string, return_x: any) => {
    const query = gql`
        mutation ($id: String, $return_x: returns_set_input!) {
            update_returns(where: { id: { _eq: $id } }, _set: $return_x) {
                returning {
                    id
                    status
                }
            }
        }
    `;

    await hasuraClient.request(query, {
        id: id,
        return_x
    });
};

const returnLineItemsString = (returnLineItems: IReturnLineItem[]) => {
    let str = '[';
    returnLineItems.map((item: IReturnLineItem) => {
        str += '{';
        Object.keys(item).map((key) => {
            str += key + ':';
            if (Number.isInteger((item as any)[key])) {
                str += `${(item as any)[key]},`;
            } else {
                str += `"${(item as any)[key]}",`;
            }
        });
        str += '}';
    });
    str += ']';
    return str;
};

export default router;
