import SQL, { DataTypes } from '../node_modules/@types/sequelize';

// export const paginateResults = ({
//   after: cursor,
//   pageSize = 20,
//   results,
//   getCursor = () => null
// }) => {};

interface CommonFields {
  id: SQL.DataTypeInteger;
  createdAt: SQL.DataTypeDate;
  updatedAt: SQL.DataTypeDate;
}

export interface User extends CommonFields {
  email: SQL.DataTypeString;
  token: SQL.DataTypeString;
}

export interface Trip extends CommonFields {
  launchId: SQL.DataTypeInteger;
  userId: User['id'];
}

export interface Store {
  users: SQL.Model<SQL.Instance<User>, User>;
  trips: SQL.Model<SQL.Instance<Trip>, Trip>;
}

export const createStore = (): Store => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite',
    operatorsAliases,
    logging: false,
  });

  const users = db.define<SQL.Instance<User>, User>('user', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    email: SQL.STRING,
    token: SQL.STRING,
  });

  const trips = db.define<SQL.Instance<Trip>, Trip, Trip>('trip', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    launchId: SQL.INTEGER,
    userId: SQL.INTEGER,
  });

  return { users, trips };
};
