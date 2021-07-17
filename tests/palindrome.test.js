const { palindrome } = require('../utils/for_testing')

test('palindrome', () => {
  const result = palindrome('rodri')

  expect(result).toBe('irdor')
})
