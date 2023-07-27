const Sequelize = require('sequelize');
const ProfileModel = require('./profile.model');
const ContractModel = require('./contract.model');
const JobModel = require('./job.model');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3'
});

const Profile = ProfileModel(sequelize, Sequelize);
const Contract = ContractModel(sequelize, Sequelize);
const Job = JobModel(sequelize, Sequelize);

// Relations can be defined here
Profile.hasMany(Contract, {as :'Contractor', foreignKey:'ContractorId'});
Contract.belongsTo(Profile, {as: 'Contractor'});
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'});
Contract.belongsTo(Profile, {as: 'Client'});
Contract.hasMany(Job);
Job.belongsTo(Contract);



module.exports = {
    sequelize,
    Profile,
    Contract,
    Job
};