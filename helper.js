function findUserByEmail(email, database) {
    for (let user in database) {
      if (email === database[user].email) {
        return database[user];
      }
    }
    return null;
  };

  function generateRandomString() {
    return Math.random().toString(36).substring(2,8);
  };


  const urlsForUser = (user, database) => {
    let filteredUrls = {};
    for (let url in database) {
      if (database[url].userID === user) {
        filteredUrls[url] = { longURL: database[url].longURL, userID: user }
      }
    }
    return filteredUrls;
  };

module.exports = { findUserByEmail, urlsForUser, generateRandomString } 