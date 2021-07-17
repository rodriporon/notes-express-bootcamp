require('dotenv').config()
require('./mongo')

const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const cors = require('cors')
const app = express()
const handleError = require('./handleError')
const notFound = require('./notFound')
const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')

app.use(cors())
app.use(express.json())

Sentry.init({
  dsn: 'https://1fc82e06593a4b28a1820c6d0d8c645c@o912786.ingest.sentry.io/5850127',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

// app.use(logger)

// PATH INICIAL
app.get('/', (request, response) => {
  response.send('<h1>Backend using MongoDB</h1>')
})

app.use('/api/notes', notesRouter)

app.use('/api/users', usersRouter)

// SENTRY
app.use(Sentry.Handlers.errorHandler())

// MIDDLEWARE NOT FOUND
app.use(notFound)

// MIDDLEWARE FOR GENERAL ERRORS
app.use(handleError)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
