import { DataSource, DataSourceConfig } from 'apollo-datasource';
import sequelize from '../../node_modules/@types/sequelize';
import isEmail from 'isemail';

import { Store, User, Trip } from '../utils';
import { Launch } from '../generated/graphql';

interface UserAPIContext {
  user: User;
}

class UserAPI extends DataSource<UserAPIContext> {
  store: Store;
  context: UserAPIContext | null;

  constructor({ store }: { store: Store }) {
    super();
    this.store = store;
    this.context = null;
  }

  initialize(config: DataSourceConfig<UserAPIContext>): void {
    this.context = config.context;
  }

  async findOrCreateUser(
    { email: emailArg } = { email: '' }
  ): Promise<sequelize.Instance<User> | null> {
    const email = this.context?.user?.email || emailArg;
    if (!email || !isEmail.validate(email as string)) return null;

    const [user, success] = await this.store.users.findOrCreate({
      where: { email },
    });

    return success ? user : null;
  }

  async bookTrip({
    launchId,
  }: {
    launchId: Launch['id'];
  }): Promise<Trip | null> {
    const userId = this.context?.user.id;
    const [trip, success] = await this.store.trips.findOrCreate({
      where: { userId, launchId },
    });

    return success ? trip.get() : null;
  }

  async bookTrips(
    { launchIds } = { launchIds: new Array<Launch['id']>() }
  ): Promise<Trip[] | null> {
    const userId = this.context?.user.id;
    if (!userId) return null;

    const results = new Array<Trip>();

    for (const launchId of launchIds) {
      const res = await this.bookTrip({ launchId });
      res && results.push(res);
    }

    return results;
  }

  async cancelTrip({ launchId }: { launchId: Launch['id'] }): Promise<boolean> {
    const userId = this.context?.user.id;
    if (!userId) return false;

    return !!this.store.trips.destroy({
      where: { userId, launchId },
    });
  }

  async getLaunchIdsByUser(): Promise<sequelize.DataTypeInteger[]> {
    const userId = this.context?.user.id;
    const found = await this.store.trips.findAll({
      where: { userId },
    });

    return found.map((l) => l.get().id).filter((l) => !!l);
  }

  async isBookedOnLaunch({
    launchId,
  }: {
    launchId: Launch['id'];
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
