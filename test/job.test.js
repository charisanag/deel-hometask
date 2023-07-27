const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../src/app'); 

describe('Handle jobs', () => {
    describe('GET /jobs/unpaid', () => {
        it('Should retrieve unpaid jobs for a profile', async () => {
            const response = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '6') 
                .expect(200);

            const jobs = response.body;

            chai.expect(jobs).to.be.an('array');

            jobs.forEach(job => {
                chai.expect(job).to.have.property('paid', false);
            });
        });
    });

    describe('POST /jobs/:job_id/pay', () => {
        it('Should pay for a job', async () => {
            const response = await request(app)
                .post('/jobs/1/pay')
                .set('profile_id', '6')
                .send()
                .expect(200);

        });

        it('Should return 404 if job does not exist', async () => {
            await request(app)
                .post('/jobs/99999/pay')
                .set('profile_id', '6')
                .send()
                .expect(404);
        });
    });

    describe('Handle concurrent job payments', () => {
        it('Should handle concurrent payments correctly', async () => {
            const job_id = '2';
            const profile_id = '6';

            await Promise.all([
                request(app)
                    .post(`/jobs/${job_id}/pay`)
                    .set('profile_id', profile_id)
                    .send()
                    .expect(200),

                request(app)
                    .post(`/jobs/${job_id}/pay`)
                    .set('profile_id', profile_id)
                    .send()
                    .expect(500)
            ]);
        });
    });
});
