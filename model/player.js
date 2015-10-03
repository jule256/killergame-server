var mongoose = require('mongoose');

var playerSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    score: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    password: String
});

playerSchema.virtual('passwordx').set(function (password) {
    this.password = 'md5(' + password + ')';
});
/**/

mongoose.model('Player', playerSchema);