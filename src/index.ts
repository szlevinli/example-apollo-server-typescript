import { ApolloServer } from 'apollo-server';
import isEmail from 'isemail';

import typeDefs from './schema';
import resolvers from './resolvers';
import { createStore, UserAttributes } from './utils';
import LaunchAPI from './datasources/launch';
import UserAPI from './datasources/user';

export interface ContextType {
  user: UserAttributes | null;
}

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
  context: async ({ req }): Promise<ContextType> => {
    const auth = req.headers?.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };

    const [user] = await store.users.findOrCreate({
      where: { email },
    });

    return user ? { user: { ...user.get() } } : { user: null };
  },
});

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://localhost:4000
  `);
});
