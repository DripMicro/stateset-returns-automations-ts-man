import { GraphQLClient, RequestDocument } from 'graphql-request';

const ShopifyClient = async (
    shop: string,
    access_token: string,
    query: RequestDocument,
    variables: any
) => {
    const graphQLClient = new GraphQLClient(
        `https://${shop}/admin/api/unstable/graphql.json`,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': access_token
            }
        }
    );

    return await graphQLClient.request(query, variables);
};

export default ShopifyClient;
