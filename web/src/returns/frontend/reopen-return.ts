import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import hasuraClient from '../../lib/hasura-client';
import ShopifyClient from '../../lib/shopify-client';
import { getAccessTokenFormShop } from '../../lib/utils';

export default async function (req: Request, res: Response) {
    const { return_shopify_id: returnId, shop, return_id: id } = req.body;



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
        const accessToken = await getAccessTokenFormShop(shop);
        const response = await ShopifyClient(
            shop,
            accessToken,
            returnQuery,
            {}
        );

        console.log(response.returnReopen.userErrors);

        if (response.returnReopen.userErrors?.length) {
            const message = response.returnReopen.userErrors[0].message;
            res.status(500).send(message);
            return;
        }

        if (response.returnReopen?.return) {
            const updateQuery = gql`
                mutation ($id: String, $return_x: returns_set_input!) {
                    update_returns(
                        where: { id: { _eq: $id } }
                        _set: $return_x
                    ) {
                        returning {
                            id
                            status
                        }
                    }
                }
            `;
            const data = await hasuraClient.request(updateQuery, {
                id: id,
                return_x: {
                    status: response.returnReopen.return.status
                }
            });
            console.log(data);
            // ctx.response.status = 200
            // ctx.body = response.returnReopen.return
            res.json(response.returnReopen.return);
            // return res.json(response.returnReopen.return)
            return;
        }
        // ctx.response.status = 500
        res.status(500).send('There is no reopen transaction');
    } catch (error: any) {
        console.error(error, 'reopen-return');
        res.status(500).send(error.message);
    }
}
