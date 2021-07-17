const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')

// GET ALL
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

// GET BY ID
notesRouter.get('/:id', async (request, response, next) => {
  try {
    const { id } = request.params

    const note = await Note.findById(id)
    if (note) {
      response.status(200).json(note)
    } else {
      response.status(404).json({
        note: 'not found'
      })
    }
  } catch (error) {
    next(error)
  }
  /* Note.findById(id).then(note => {
    if (note) {
      return response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(err => {
    next(err)
  }) */
})

// DELETE BY ID
notesRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params

  await Note.findByIdAndDelete(id)
  response.status(204).end()
})

// UPDATE BY ID
notesRouter.put('/:id', async (request, response, next) => {
  try {
    const { id } = request.params
    const note = request.body

    const newNoteInfo = {
      content: note.content,
      important: note.important
    }

    const putNote = await Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    response.status(200).json(putNote)
  } catch (error) {
    next(error)
  }

/*   Note.findByIdAndUpdate(id, newNoteInfo, { new: true }).then(result => {
    response.json(result)
  }).catch(err => {
    next(err)
  }) */
})

// POST
notesRouter.post('/', async (request, response, next) => {
  const {
    content,
    important = false,
    userId
  } = request.body

  const user = await User.findById(userId)
  console.log(user.username)
  if (!content) {
    return response.status(400).json({
      error: 'content is missing'
    })
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id
  })

  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    response.json(savedNote)
  } catch (error) {
    next(error)
  }

  /*   newNote.save().then(savedNote => {
    response.json(savedNote)
  }).catch(err => {
    next(err)
  }) */
})

module.exports = notesRouter
