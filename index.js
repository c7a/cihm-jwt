const unless = require('koa-unless');
const nJwt = require('njwt');

module.exports = (secrets) => {
  const middleware = async function jwt(ctx, next) {
    let token = ctx.query['token'] ||
      ctx.cookies.get('c7a2_token') ||
      ((ctx.headers.authorization || '').match(/^C7A2 (.+)$/i) || [])[1] ||
      null;

    if (!token) {
      ctx.throw(401, `Access requires a signed JWT in the Authorization header, in the form

Authorization: C7A2 $jwt

Alternatively, the JWT can be provided in the query string

?token=$token

or be set in a cookie, with key c7a2_token`);
    }

    let validatedIssuer, jwtData;
    for (issuer of Object.keys(secrets)) {
      try {
        jwtData = nJwt.verify(token, secrets[issuer]).body;
        validatedIssuer = issuer;
        break;
      } catch (err) {
      }
    }

    if (!jwtData) {
      ctx.throw(401, 'Could not verify JWT');
    }

    if (jwtData.iss != validatedIssuer) {
      ctx.throw(401, `Validated issuer ${validatedIssuer} does not match JWT 'iss' claim`);
    }

    ctx.state.jwtData = jwtData;

    return next();
  };

  middleware.unless = unless;
  return middleware;
};
