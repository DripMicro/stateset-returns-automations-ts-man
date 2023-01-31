import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import { v4 as uuid } from 'uuid';
import hasuraClient from '../../lib/hasura-client';
import ShopifyClient from '../../lib/shopify-client';
import { getAccessTokenFormShop } from '../../lib/utils';

export default async function (req: Request, res: Response) {
    const {
        shop,
        order_id: orderId,
        lineItem_id: lineItemId,
        reason,
        note,
        quantity,
        customer_email: customerEmail
    } = req.body;

    try {
        const accessToken = await getAccessTokenFormShop(shop);
        // ------------- set ReturnLineItems ----------
        const returnLineItem: any = {
            fulfillmentLineItemId: lineItemId,
            quantity: parseInt(quantity),
            returnReason: reason
        };
        console.log(returnLineItem)
        if (reason == 'OTHER') {
            returnLineItem.returnReasonNote = note;
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
        const response = await ShopifyClient(shop, accessToken, query, {
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
                customerEmail,
                status: returnData.status,
                rma: returnData.name,
                store_id: shop,
                shopify_return_id: returnData.id,
                order_id: orderId
            }
        });

        return res.json(insert_returns);
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
}
