const { Op } = require('sequelize');


const getContractById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { Contract, Job} = req.app.get('models');
        const profile = req.profile;

        const contract = await Contract.findOne({
            where: {
                id,
                [Op.or]: [
                    { ContractorId: profile.id },
                    { ClientId: profile.id }
                ],
            },
            include: [Job]
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.json(contract);
    } catch (err) {
        next(err);
    }
};
const getContractsByProfile = async (req, res, next) => {
    try {
        const { Contract, Job } = req.app.get('models');
        const profile = req.profile;

        const contracts = await Contract.findAll({
            where: {
                [Op.or]: [
                    { ContractorId: profile.id },
                    { ClientId: profile.id }
                ],
                status: { [Op.ne]: 'terminated' }
            },
            include: [Job]

        });

        if (!contracts) {
            return res.status(404)
        }

        res.json(contracts);
    } catch (err) {
        next(err);
    }

}

module.exports = {
    getContractById,
    getContractsByProfile
};