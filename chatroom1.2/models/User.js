let mongoose = require('mongoose');
let Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/chatroom');
let userSchema = new Schema({
  nickname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  }
});
module.exports = mongoose.model('User', userSchema);
