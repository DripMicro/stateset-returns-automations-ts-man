import { gql } from 'graphql-request';
import hasuraClient from './hasura-client';

export const getAccessTokenFormShop = async (shop: string): Promise<string> => {
    try {
        const GET_MY_CONFIGURATION_SETTINGS = gql`
        query getMyConfigurationSettings($shop: String) {
            access_tokens(where: { shop: { _eq: $shop } }) {
                shop
                shopify_access_token
            }
        }
    `;

        const accessTokenResponse = await hasuraClient.request(
            GET_MY_CONFIGURATION_SETTINGS,
            {
                shop: shop
            }
        );

        const shopify_access_token =
            accessTokenResponse.access_tokens[0].shopify_access_token;

        let access_token = shopify_access_token.toString();

        return access_token;
    }
    catch (error) {
        console.error(error);
        throw new Error('No Shop Id');
    }
};

export const returnLineItemsString = (returnLineItems: any[]) => {
    let str = '[';
    returnLineItems.map((item) => {
        str += '{';
        Object.keys(item).map((key) => {
            str += key + ':';
            if (Number.isInteger(item[key])) {
                str += `${item[key]},`;
            } else {
                str += `"${item[key]}",`;
            }
        });
        str += '}';
    });
    str += ']';
    return str;
};
