import { IFieldResolver } from 'apollo-server';
import { intersectionWith } from 'lodash';

import LaunchAPI from './datasources/launch';
import UserAPI from './datasources/user';
import { LaunchReducer, Mission } from './types';
import { paginateResults } from './utils';
import { PatchSize } from './generated/graphql';

type ContextType = {
  dataSources: {
    launchAPI: LaunchAPI;
    userAPI: UserAPI;
  };
};

const launchesFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  { pageSize: number; after: string }
> = async (_, { pageSize = 20, after }, { dataSources }) => {
  const allLaunches = await dataSources.launchAPI.getAllLaunches();
  allLaunches.reverse();
  const launches = paginateResults<string, LaunchReducer>({
    after,
    pageSize,
    results: allLaunches,
  });
  return {
    launches,
    cursor: launches.length ? launches[launches.length - 1].cursor : null,
    hasMore: launches.length
      ? launches[launches.length - 1].cursor !==
        allLaunches[allLaunches.length - 1].cursor
      : false,
  };
};

const launchFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  { id: LaunchReducer['id'] }
> = (_, { id }, { dataSources }) =>
  dataSources.launchAPI.getLaunchById({ launchId: id });

const meFieldResolver: IFieldResolver<unknown, ContextType, unknown> = async (
  _,
  __,
  { dataSources }
) => dataSources.userAPI.findOrCreateUser();

const missionPatchFieldResolver: IFieldResolver<
  Mission,
  ContextType,
  { size: PatchSize }
> = (mission, { size } = { size: PatchSize.Large }) => {
  return size === PatchSize.Small
    ? mission.missionPatchSmall
    : mission.missionPatchLarge;
};

const isBookedFieldResolver: IFieldResolver<
  LaunchReducer,
  ContextType,
  unknown
> = async (launch, _, { dataSources }) =>
  dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id });

const tripsFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  unknown
> = async (launch, _, { dataSources }) => {
  const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

  return dataSources.launchAPI.getLaunchesByIds({ launchIds });
};

const loginFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  { email: string }
> = async (_, { email }, { dataSources }) => {
  const user = await dataSources.userAPI.findOrCreateUser({ email });

  if (user) return Buffer.from(email).toString('base64');
};

const bookTripsFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  { launchIds: string[] }
> = async (_, { launchIds }, { dataSources }) => {
  const results = await dataSources.userAPI.bookTrips({ launchIds });
  const launches = await dataSources.launchAPI.getLaunchesByIds({ launchIds });

  const ret = {
    success: (results && results.length === launchIds.length) || false,
    message:
      results && results.length === launchIds.length
        ? 'trips booked successfully'
        : `the following launches couldn't be booked: ${
            !results
              ? launchIds
              : intersectionWith(
                  launchIds,
                  results,
                  (launchId, result) => launchId === result.launchId
                )
          }`,
    launches,
  };

  return ret;
};

const cancelTripFieldResolver: IFieldResolver<
  unknown,
  ContextType,
  { launchId: string }
> = async (_, { launchId }, { dataSources }) => {
  const result = await dataSources.userAPI.cancelTrip({ launchId });

  if (!result)
    return {
      success: false,
      message: `failed to cancel trip`,
    };

  const launch = await dataSources.launchAPI.getLaunchById({ launchId });
  return {
    success: true,
    message: 'trip cancelled',
    launches: [launch],
  };
};

const resolvers = {
  Query: {
    launches: launchesFieldResolver,
    launch: launchFieldResolver,
    me: meFieldResolver,
  },
  Mission: {
    missionPatch: missionPatchFieldResolver,
  },
  Launch: {
    isBooked: isBookedFieldResolver,
  },
  User: {
    trips: tripsFieldResolver,
  },
  Mutation: {
    login: loginFieldResolver,
    bookTrips: bookTripsFieldResolver,
    cancelTrip: cancelTripFieldResolver,
  },
};

export default resolvers;
