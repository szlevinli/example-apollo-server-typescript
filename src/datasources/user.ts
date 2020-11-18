import { DataSource, DataSourceConfig } from 'apollo-datasource';
import isEmail from 'isemail';

import { Store, UserAttributes, TripAttributes } from '../utils';
import { Launch } from '../generated/graphql';
import { LaunchReducer } from '../types';
import { ContextType } from '../index';

class UserAPI extends DataSource<ContextType> {
  store: Store;
  context: ContextType | null;

  constructor({ store }: { store: Store }) {
    super();
    this.store = store;
    this.context = null;
  }

  initialize(config: DataSourceConfig<ContextType>): void {
    this.context = config.context;
  }

  async findOrCreateUser(
    { email: emailArg } = { email: '' }
  ): Promise<UserAttributes | null> {
    const email = this.context?.user?.email || emailArg;
    if (!email || !isEmail.validate(email as string)) return null;

    const [user] = await this.store.users.findOrCreate({
      where: { email },
    });

    return user ? user.get() : null;
  }

  async bookTrip({
    launchId,
  }: {
    launchId: Launch['id'];
  }): Promise<TripAttributes | null> {
    const userId = this.context?.user?.id;
    if (!userId) return null;
    const [trip] = await this.store.trips.findOrCreate({
      where: { userId, launchId },
    });

    return trip ? trip.get() : null;
  }

  async bookTrips(
    { launchIds } = { launchIds: new Array<Launch['id']>() }
  ): Promise<TripAttributes[] | null> {
    const userId = this.context?.user?.id;
    if (!userId) return null;

    const results = new Array<TripAttributes>();

    for (const launchId of launchIds) {
      const res = await this.bookTrip({ launchId });
      res && results.push(res);
    }

    return results;
  }

  async cancelTrip({ launchId }: { launchId: Launch['id'] }): Promise<boolean> {
    const userId = this.context?.user?.id;
    if (!userId) return false;

    return !!this.store.trips.destroy({
      where: { userId, launchId },
    });
  }

  async getLaunchIdsByUser(): Promise<string[]> {
    const userId = this.context?.user?.id;
    const found = await this.store.trips.findAll({
      where: { userId },
    });

    return found.map((l) => l.get().launchId).filter((l) => !!l);
  }

  async isBookedOnLaunch({
    launchId,
  }: {
    launchId: LaunchReducer['id'];
  }): Promise<boolean> {
    if (!this.context || !this.context.user) return false;
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId, launchId },
    });
    return found && found.length > 0;
  }
}

export default UserAPI;
