require('dotenv').config()
require('./mongo')

const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

const cors = require('cors')

const app = express()

const Note = require('./models/Note')
const handleError = require('./handleError')
const notFound = require('./notFound')

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

// GET ALL
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// GET BY ID
app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findById(id).then(note => {
    if (note) {
      return response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(err => {
    next(err)
  })
})

// DELETE BY ID
app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findByIdAndRemove(id).then(result => {
    response.status(204).end()
  }).catch(err => {
    next(err)
  })
})

// UPDATE BY ID
app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true }).then(result => {
    response.json(result)
  }).catch(err => {
    next(err)
  })
})

// POST
app.post('/api/notes', (request, response, next) => {
  const note = request.body
  console.log(note)
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false
  })

  newNote.save().then(savedNote => {
    response.json(savedNote)
  }).catch(err => {
    next(err)
  })
})

// SENTRY
app.use(Sentry.Handlers.errorHandler())

// MIDDLEWARE NOT FOUND
app.use(notFound)

// MIDDLEWARE FOR GENERAL ERRORS
app.use(handleError)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
