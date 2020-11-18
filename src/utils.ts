import { Sequelize, Optional, Model, DataTypes } from 'sequelize';

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: './store.sqlite',
  logging: false,
});

export interface UserAttributes {
  id: number;
  email: string;
  token: string | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public email!: string;
  public token!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface TripAttributes {
  id: number;
  launchId: string;
  userId: UserAttributes['id'];
}

type TripCreationAttributes = Optional<TripAttributes, 'id'>;

export class Trip
  extends Model<TripAttributes, TripCreationAttributes>
  implements TripAttributes {
  public id!: number;
  public launchId!: string;
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

////////////////////////////////////////

export type Store = {
  users: typeof User;
  trips: typeof Trip;
};

export const createStore = (): Store => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      token: new DataTypes.STRING(128),
    },
    {
      sequelize,
      tableName: 'user',
    }
  );

  Trip.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      launchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { sequelize, tableName: 'trip' }
  );

  sequelize.sync();

  return {
    users: User,
    trips: Trip,
  };
};

// ======================= Pagination ========================

interface Args<CursorType, ResultType> {
  after: CursorType;
  pageSize: number;
  results: Array<ResultType>;
  getCursor?: (item: ResultType) => CursorType;
}

interface PaginateResults {
  <CursorType, ResultType extends { cursor?: CursorType }>(
    args: Args<CursorType, ResultType>
  ): Array<ResultType>;
}

export const paginateResults: PaginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);

  const cursorIndex = results.findIndex((item) => {
    const itemCursor = item.cursor ? item.cursor : getCursor(item);
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize)
        )
    : results.slice(0, pageSize);
};
