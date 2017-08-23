const Koa = require('koa');
const http = require('http');
const request = require('supertest');
const nJwt = require('njwt');

const secrets = { "1": "fnorp", "2": "blarg" };

let jwts = {
  full: nJwt.create({ iss: 1 }, secrets[1]),
  withParam: nJwt.create({ iss: 1, param: 'foo' }, secrets[1]),
  otherKey: nJwt.create({ iss: 1 }, secrets[2])
};

jwts.expired = nJwt.create({}, secrets[1]);
jwts.expired.setExpiration(new Date('2017-01-01'));

const jwt = require('..');

const app = new Koa();

app.use(jwt(secrets));

// let's assume for testing purposes that credentialed requests get 200
app.use(ctx => { ctx.status = 200; });

it('throws 401 when lacking credentials', () => {
  return request(http.createServer(app.callback()))
    .get('/foo')
    .expect(401);
});

it('validates full credentials', () => {
  return request(http.createServer(app.callback()))
    .get('/foo')
    .set('Authorization', `C7A2 ${jwts.full.compact()}`)
    .expect(200);
});

it('validates full credentials using query string parameter', () => {
  return request(http.createServer(app.callback()))
    .get(`/foo?token=${jwts.full.compact()}`)
    .expect(200);
});

it('validates full credentials using cookie', () => {
  return request(http.createServer(app.callback()))
    .get('/foo')
    .set('Cookie', `c7a2_token=${jwts.full.compact()}`)
    .expect(200);
});

it('rejects JWTs from incorrect issuers', () => {
  return request(http.createServer(app.callback()))
    .get('/foo')
    .set('Authorization', `C7A2 ${jwts.otherKey.compact()}`)
    .expect(401);
});

it('throws 401 when JWT is expired', () => {
  return request(http.createServer(app.callback()))
    .get('/foo')
    .set('Authorization', `C7A2 ${jwts.expired.compact()}`)
    .expect(401);
});
