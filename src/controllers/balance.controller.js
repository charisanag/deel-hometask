
const {sequelize} = require("../models");
const depositToClient = async (req, res, next) => {
    const { userId } = req.params;
    const { amount } = req.body;
    const { Profile, Job, Contract } = req.app.get('models');

    const t = await sequelize.transaction();

    try {
        const client = await Profile.findOne({
            where: { id: userId, type: 'client' },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!client) {
            await t.rollback();
            return res.status(404).json({ error: 'Client not found.' });
        }

        const totalJobsToPay = await Job.sum('price', {
            include: [
                {
                    model: Contract,
                    required: true,
                    where: { ClientId: client.id }
                }
            ],
            where: { paid: false },
            transaction: t
        });

        const maxDepositAmount = totalJobsToPay * 0.25;

        if (amount > maxDepositAmount) {
            await t.rollback();
            return res.status(400).json({ error: `You can't deposit more than 25% of your total jobs to pay. Maximum deposit amount is ${maxDepositAmount}` });
        }

        client.balance += amount;
        await client.save({ transaction: t });

        await t.commit();

        return res.status(200).json({ balance: client.balance, totalJobsToPay });
    } catch (err) {
        await t.rollback();
        return next(err);
    }
};




module.exports = {
    depositToClient
}