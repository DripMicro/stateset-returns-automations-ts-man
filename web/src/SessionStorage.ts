import { Session } from '@shopify/shopify-api';
import { SessionStorage as AppSessionStorage } from '@shopify/shopify-app-session-storage';

import { gql } from 'graphql-request';
import HasuraClient from './lib/hasura-client';

class MySessionStorage implements AppSessionStorage {
    async storeSession(session: Session): Promise<boolean> {
        console.log(session.toPropertyArray(), 'storeSession');
        const sessions = await this.findSessionsByShop(session.shop);
        if (sessions.length) {
            const UPDATE_QUERY = gql`
                mutation UpdateAccessTokens(
                    $shop: String
                    $access_tokens: access_tokens_set_input!
                ) {
                    update_access_tokens(
                        where: { shop: { _eq: $shop } }
                        _set: $access_tokens
                    ) {
                        returning {
                            shopify_access_token
                            shop
                            type
                        }
                    }
                }
            `;

            const accessToken = {
                type: 'Shopify Access Token',
                shopify_access_token: session.accessToken,
                shopify_id: session.id,
                expires: session.expires,
                session_state: session.state,
                isOnline: session.isOnline,
                shopify_scope: session.scope
            };

            const result = await HasuraClient.request(UPDATE_QUERY, {
                access_tokens: accessToken,
                shop: session.shop
            });

            return !!result;
        } else {
            const INSERT_QUERY = gql`
                mutation InsertAccessToken(
                    $access_token: access_tokens_insert_input!
                ) {
                    insert_access_tokens(objects: [$access_token]) {
                        returning {
                            id: shopify_id
                        }
                    }
                }
            `;

            const accessToken = {
                type: 'Shopify Access Token',
                shop: session.shop,
                shopify_access_token: session.accessToken,
                shopify_id: session.id,
                expires: session.expires,
                session_state: session.state,
                isOnline: session.isOnline,
                shopify_scope: session.scope
            };

            const result = await HasuraClient.request(INSERT_QUERY, {
                access_token: accessToken
            });

            return !!result;
        }
    }
    async loadSession(id: string): Promise<Session | undefined> {
        // console.log(id, 'loadSession');
        if (!id) return undefined
        const GET_SESSION_QUERY = gql`
            query getMyConfigurationSettings($id: String) {
                access_tokens(where: { shopify_id: { _eq: $id } }) {
                    shop
                    accessToken: shopify_access_token
                    isOnline
                    expires
                    state: session_state
                    id: shopify_id
                    scope: shopify_scope
                }
            }
        `;
        const accessTokenResponse = await HasuraClient.request<{
            access_tokens: IAccessToken[];
        }>(GET_SESSION_QUERY, {
            id: id
        });
        // console.log(accessTokenResponse, 'accesstoken');
        if (accessTokenResponse.access_tokens.length) {
            return this.makeSessionPropertyArray(
                accessTokenResponse.access_tokens[0]
            );
        }
        return undefined;
    }
    deleteSession(id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    deleteSessions(ids: string[]): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async findSessionsByShop(shop: string): Promise<Session[]> {
        if (!shop) return []
        try {
            const GET_MY_CONFIGURATION_SETTINGS = gql`
            query getMyConfigurationSettings($shop: String) {
                access_tokens(where: { shop: { _eq: $shop } }) {
                    shop
                    accessToken: shopify_access_token
                    isOnline
                    expires
                    state: session_state
                    id: shopify_id
                    scope: shopify_scope
                }
            }
        `;

            const accessTokenResponse = await HasuraClient.request<{
                access_tokens: IAccessToken[];
            }>(GET_MY_CONFIGURATION_SETTINGS, {
                shop: shop
            });
            // console.log(accessTokenResponse, 'accesstoken');
            if (accessTokenResponse.access_tokens.length) {
                return [
                    this.makeSessionPropertyArray(
                        accessTokenResponse.access_tokens[0]
                    )
                ];
            }
            return [];
        }
        catch (error) {
            console.error(error);
            return []
        }
    }

    makeSessionPropertyArray(accessTokens: IAccessToken): Session {
        const array = Object.keys(accessTokens).map<
            [string, string | number | boolean]
        >((key: string) => {
            const value = accessTokens[key as keyof typeof accessTokens];
            return [key, value];
        });

        const session = Session.fromPropertyArray(array);
        // session.scope = 'write_products,read_reports';
        // session.scope = process.env.SCOPES;
        return session;
    }
}

interface IAccessToken {
    shop: string;
    accessToken: string;
    isOnline: boolean;
    state: string;
    id: string;
    scope: string;
}

export default MySessionStorage;

// [
//     2022-12-29 15:52:09 | backend  |   [ 'id', 'offline_stateset-demo.myshopify.com' ],
//     2022-12-29 15:52:09 | backend  |   [ 'shop', 'stateset-demo.myshopify.com' ],
//     2022-12-29 15:52:09 | backend  |   [ 'state', '209467858679752' ],
//     2022-12-29 15:52:09 | backend  |   [ 'isOnline', false ],
//     2022-12-29 15:52:09 | backend  |   [ 'accessToken', 'shpua_3129063d9af419c00d2aa702a29a07f0' ],
//     2022-12-29 15:52:09 | backend  |   [ 'scope', 'write_products,read_reports' ]
//     2022-12-29 15:52:09 | backend  | ] storeSession
