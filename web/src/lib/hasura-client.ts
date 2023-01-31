import { GraphQLClient } from 'graphql-request';
const RMAI_ADMIN_SECRET = '5jo9kIVeKM';
const HasuraClient = () => {
    return new GraphQLClient('https://rmai.stateset.app/v1/graphql', {
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': RMAI_ADMIN_SECRET
        }
    });
};

export default HasuraClient();
