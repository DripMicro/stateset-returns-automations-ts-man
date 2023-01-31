import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import hasuraClient from '../../lib/hasura-client';
import ShopifyClient from '../../lib/shopify-client';
import { getAccessTokenFormShop } from '../../lib/utils';

export default async function (req: Request, res: Response) {
    const { return_id: id, shop, return_shopify_id: returnId } = req.body;

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
        const accessToken = await getAccessTokenFormShop(shop);
        const response = await ShopifyClient(
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
}


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

