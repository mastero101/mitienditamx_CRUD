const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const Item = sequelize.define('items', {
    availableItems: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    defaultImageURL: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    defaultName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    }, {
    timestamps: false,
    });

const User = sequelize.define('users', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    adresses: {
        type: DataTypes.STRING(1000),
        allowNull: true,
    },
    }, {
    timestamps: false,
    });

module.exports = { sequelize, Item, User };