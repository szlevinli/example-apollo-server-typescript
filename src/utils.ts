import { Sequelize, Op, Optional, Model, DataTypes } from 'sequelize';

// export const paginateResults = ({
//   after: cursor,
//   pageSize = 20,
//   results,
//   getCursor = () => null
// }) => {};

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
  launchId: number;
  userId: UserAttributes['id'];
}

type TripCreationAttributes = Optional<TripAttributes, 'id'>;

export class Trip
  extends Model<TripAttributes, TripCreationAttributes>
  implements TripAttributes {
  public id!: number;
  public launchId!: number;
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

  return {
    users: User,
    trips: Trip,
  };
};
