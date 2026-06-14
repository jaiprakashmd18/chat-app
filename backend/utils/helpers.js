const crypto = require('crypto');

const generateInviteCode = () => crypto.randomBytes(6).toString('hex');

const generateToken = () => crypto.randomBytes(32).toString('hex');

const paginate = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '');
};

const getSocketRoom = (type, id) => `${type}:${id}`;

module.exports = { generateInviteCode, generateToken, paginate, formatFileSize, sanitizeInput, getSocketRoom };
