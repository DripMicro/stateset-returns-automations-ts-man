import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import hasuraClient from '../../lib/hasura-client';
import ShopifyClient from '../../lib/shopify-client';
import { getAccessTokenFormShop } from '../../lib/utils';

export default async function (req: Request, res: Response) {
    const { return_id: id, shop, return_shopify_id: returnId } = req.body;

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
        const accessToken = await getAccessTokenFormShop(shop);
        const response = await ShopifyClient(
            shop,
            accessToken,
            returnQuery,
            {}
        );

        console.log(response.returnCancel.userErrors, returnQuery);
        if (response.returnCancel.userErrors?.length) {
            const message = response.returnCancel.userErrors[0].message;
            res.status(500).send(message);
            return;
        }
        if (response.returnCancel?.return) {
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
                    status: response.returnCancel.return.status
                }
            });
            console.log(data);
            return res.status(200).json(response.returnCancel.return);
        }

        res.status(500).send('There is no cancel Transaction');
    } catch (error: any) {
        console.error(error, 'close-return');
        res.status(500).send(error.message);
    }
}
