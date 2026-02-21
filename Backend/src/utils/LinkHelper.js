const crypto = require('crypto');

exports.generateShareableToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

exports.extractYoutubeId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
};

exports.constructShareLink = (token) => {
  return `${process.env.FRONTEND_URL}/shared/v/${token}`;
};