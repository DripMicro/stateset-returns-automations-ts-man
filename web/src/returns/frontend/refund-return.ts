import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import ShopifyClient from '../../lib/shopify-client';
import { getAccessTokenFormShop, returnLineItemsString } from '../../lib/utils';

export default async function (req: Request, res: Response) {
  const { shop, return_shopify_id: returnId } = req.body;


  try {
    const accessToken = await getAccessTokenFormShop(shop);
    const RETURN_QUERY = gql`
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
        }`;

    let { data }: { data: any } = await ShopifyClient(
      shop,
      accessToken,
      RETURN_QUERY,
      {}
    );

    const returnData = data.return;

    if (!returnData.returnLineItems?.edges?.length) {
      res.status(500).send('No returnLineItems');
      return;
    }

    const { returnLineItems: lineItems } = returnData;
    const returnLineItems = lineItems.edges.map((edge: any) => ({
      returnLineItemId: edge.node.id,
      quantity: edge.node.quantity
    }));

    // get suggest data

    const SUGGEST_QUERY = gql`
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

    const { data: suggestData } = await ShopifyClient(
      shop,
      accessToken,
      SUGGEST_QUERY,
      {}
    );

    const suggestedRefund = suggestData.return.suggestedRefund;

    const RETURN_MUTATION = gql`
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
      RETURN_MUTATION,
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
      return res.status(200).json({
        ...returnResponseJson.returnRefund.refund,
        msg: 'Successful Refund Return'
      });
    }
    res.status(500).send('There is no refund Transaction');
  } catch (error: any) {
    console.error(error, 'Refund-return');
    res.status(500).send(error.message);
  }
}
