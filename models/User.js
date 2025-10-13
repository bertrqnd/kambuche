const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true },
password: { type: String, required: true }
});


// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
return await bcrypt.compare(candidatePassword, this.password);
}


module.exports = mongoose.model('User', userSchema);