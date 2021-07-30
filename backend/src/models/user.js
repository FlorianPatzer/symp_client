const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {Schema} = mongoose;

const userSchema = new Schema ({
    fullName: String,
    username: String,
    password: String,
    role: String,
    createdBy: String,
    createdAt: Date,
});

let rounds = 10;

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(rounds));
};

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
} 

function encryptPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(rounds));
};

function comparePassword(password,encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
}

module.exports = mongoose.model('users', userSchema);
module.exports.encryptPassword = encryptPassword;
module.exports.comparePassword = comparePassword;