const bcrypt = require('bcrypt');

const generateSalt = (rounds) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(rounds, (err, salt) => {
      if (err) {
        reject(err);
      } else {
        resolve(salt);
      }
    });
  });
};

const hashWithSalt = (password, salt) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

const hashPassword = async (password) => {
  try {
    const salt = await generateSalt(12);
    return await hashWithSalt(password, salt);
  } catch (err) {
    throw err;
  }
};

const comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

module.exports = { hashPassword, comparePassword, generateSalt, hashWithSalt };