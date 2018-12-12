import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { OperationDefinitionNode } from 'graphql';
import { getAuthHeader } from './services/auth.service';

const httpLink = new HttpLink({
  uri: `http://${process.env.REACT_APP_APOLLO_SERVER_URI}`,
});

const wsLink = new WebSocketLink({
  uri: `ws://${process.env.REACT_APP_APOLLO_SERVER_URI}`,
  options: {
    reconnect: true,
    connectionParams: () => ({
      authToken: getAuthHeader() || null
    }),
  },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache({
  dataIdFromObject: (obj: any) => obj._id
});

export default new ApolloClient({
  link,
  cache,
});
