
const { Op, Transaction } = require('sequelize');
const {sequelize} = require("../models");

const getUnpaidJobs = async (req, res, next) => {
    try {
        const { Job, Contract, Profile } = req.app.get('models');
        const profile = req.profile;

        const jobs = await Job.findAll({
            include: [
                {
                    model: Contract,
                    required: true,
                    include: [
                        {
                            model: Profile,
                            as: 'Contractor',
                            attributes: ['id', 'firstName', 'lastName']
                        },
                        {
                            model: Profile,
                            as: 'Client',
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ],
                    where: {
                        status: {
                            [Op.in]: ['new', 'in_progress']
                        },
                        [Op.or]: [
                            { ContractorId: profile.id },
                            { ClientId: profile.id }
                        ],
                    }
                }
            ],
            where: { paid: false }
        });

        return res.status(200).json(jobs);
    } catch (err) {
        return next(err);
    }
};

const payForJob = async (req, res, next) => {
    const { job_id } = req.params;
    const { Profile, Job, Contract } = req.app.get('models');
    const profile = req.profile;

    const t = await sequelize.transaction();

    try {
        const job = await Job.findOne({
            where: { id: job_id },
            include: {
                model: Contract,
                as: 'Contract',
                include: [
                    { model: Profile, as: 'Client' },
                    { model: Profile, as: 'Contractor' },
                ],
            },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!job) {
            await t.rollback();
            return res.status(404).json({ error: 'Job not found.' });
        }

        if (job.paid) {
            await t.rollback();
            return res.status(400).json({ error: 'Job is already paid.' });
        }

        const client = job.Contract.Client;
        const contractor = job.Contract.Contractor;

        if (!client || !contractor) {
            await t.rollback();
            return res.status(404).json({ error: 'Client or Contractor not found.' });
        }

        if (client.balance < job.price) {
            await t.rollback();
            return res.status(400).json({ error: 'Insufficient balance.' });
        }

        client.balance -= job.price;
        contractor.balance += job.price;

        job.paid = true;
        job.paymentDate = new Date();

        await Promise.all([
            client.save({ transaction: t }),
            contractor.save({ transaction: t }),
            job.save({ transaction: t })
        ]);

        await t.commit();

        return res.status(200).json(job);
    } catch (err) {
        await t.rollback();
        return next(err);
    }
};




module.exports = {
    getUnpaidJobs,
    payForJob
}