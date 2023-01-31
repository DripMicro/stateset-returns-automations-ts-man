import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import hasuraClient from '../../lib/hasura-client';
import ShopifyClient from '../../lib/shopify-client';
import { getAccessTokenFormShop } from '../../lib/utils';

export default async function (req: Request, res: Response) {
  const { order_id: id, shop } = req.body;



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
    const accessToken = await getAccessTokenFormShop(shop);
    const response = await ShopifyClient(shop, accessToken, query, {});
    let returnLineItems: any[] = [];
    if (response.returnableFulfillments?.edges) {
      const edges = response.returnableFulfillments?.edges;
      // console.log(edges[0].node.returnableFulfillmentLineItems.edges[0])
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
}
