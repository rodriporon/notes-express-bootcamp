
const moongose = require('mongoose')
const Note = require('../models/Note')
const { server } = require('../index')

const { api, initialNotes, getAllContentFromNotes } = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany({})

  for (const note of initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})

test('notes are returned as JSON', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await api.get('/api/notes')
  expect(response.body).toHaveLength(initialNotes.length)
})

test('a note can be deleted', async () => {
  const { response } = await getAllContentFromNotes()
  const { body: notes } = response

  const noteToDelete = notes[0]

  await api.delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})
