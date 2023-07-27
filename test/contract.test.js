const express = require('express');
const chai = require('chai');
const request = require('supertest');
const expect = chai.expect;

const app = require('../src/app');

describe('Handle contracts', () => {
    it('Should receive contract for a profile', async () => {
        const response = await request(app)
            .get('/contracts/1')
            .set('profile_id', '1')
            .send()
            .expect(200)

        expect(response.body.id).to.be.eql(1);
        expect(response.body.ClientId).to.be.eql(1);
    })

    it('Should return 404 if contract does not exist', async () => {
        const response = await request(app)
            .get('/contracts/99999')
            .set('profile_id', '1')
            .send()
            .expect(404)
    })

    it('Should return contracts for a profile', async () => {
        const response = await request(app)
            .get('/contracts')
            .set('profile_id', '1') 
            .send()
            .expect(200)

        expect(response.body).to.be.an('array');
    })
})
