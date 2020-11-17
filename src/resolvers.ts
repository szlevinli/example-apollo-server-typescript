import { IFieldResolver } from 'apollo-server';

import LaunchAPI from './datasources/launch';
import UserAPI from './datasources/user';
import { LaunchReducer } from './types';
import { UserAttributes } from './utils';

type ContextType = {
  dataSources: {
    launchAPI: LaunchAPI;
    userAPI: UserAPI;
  };
};

const launchesFieldResolver: IFieldResolver<unknown, ContextType, unknown> = (
  _,
  __,
  { dataSources }
): Promise<LaunchReducer[]> => dataSources.launchAPI.getAllLaunches();

const launchFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  { id: Pick<LaunchReducer, 'id'> }
> = (_, { id }, { dataSources }): Promise<LaunchReducer> =>
  dataSources.launchAPI.getLaunchById({ launchId: id });

const meFieldResolver: IFieldResolver<unknown, ContextType, unknown> = (
  _,
  __,
  { dataSources }
): Promise<UserAttributes | null> => dataSources.userAPI.findOrCreateUser();

const resolvers = {
  Query: {
    launches: launchesFieldResolver,
    launch: launchFieldResolver,
    me: meFieldResolver,
  },
};

export default resolvers;
