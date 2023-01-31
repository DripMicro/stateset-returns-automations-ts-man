import express, { Request, Response } from 'express';
import { gql } from 'graphql-request';
import hasuraClient from '../../lib/hasura-client';

export default async function (req: Request, res: Response) {
    const { shop, customer_email: customerEmail } = req.body;

    const GET_ALL_QUERY = gql`
        query ($shop: String!, $email: String) {
            returns(
                where: {
                    store_id: { _eq: $shop }
                    customerEmail: { _eq: $email }
                }
            ) {
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
        shop: shop,
        email: customerEmail
    });
    res.json(allReturns ?? []);
}
