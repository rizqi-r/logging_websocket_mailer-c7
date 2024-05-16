const Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENV,
    tracesSampleRate: 1.0,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: require("express").Router() })
    ]
});

module.exports = Sentry;
