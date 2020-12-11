const { assert } = require('chai');

const findUserByEmail  = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput, 'Returns a user with a valid email');
  });
  it('A non-existent email should return undefined', function() {
    const user = findUserByEmail("joe@gmail.com", testUsers)
    const expectedOutput = null;
    assert.strictEqual(expectedOutput, user, 'Returns undefined for an invalid email');
  });
}); 