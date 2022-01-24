const crypto = require('crypto');

function getRandomValues (arr) {
  const bytes = crypto.randomBytes(arr.length);

  for (let i = 0; i < arr.length; i++) {
    arr[i] = bytes[i];
  }

  return arr;
}

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues
  }
});
