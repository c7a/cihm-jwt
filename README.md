# cihm-jwt

cihm-jwt is Koa.js middleware for handling C7A2-format JWTs.

## Use

Simply include the middleware in your app as follows:

    const koa = require('koa');
    const jwt = require('cihm-jwt');

    const secrets = { "issuer": "secret_key" };

    const app = new Koa();
    app.use(jwt(secrets));

    ...

    app.listen(3000)

The middleware sets `ctx.state.jwtData` to the JWT's payload.

## Mandatory payload claims

### `iss`

C7A2-format JWTs expect the `iss` claim to be set to the key used to look up the signature secret in the application config.
