const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) return reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
};

const comparePassword = (password, hashed) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashed, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = { hashPassword, comparePassword };