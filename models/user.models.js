const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required: true,
        lowercase:true,
        unique:true
    },
    password:{
        type: String,
        required: true
    }
});


//mongoose (pre) middleware to help to hashed password
userSchema.pre('save', async function(next) {
    try {
        
        const salt = await bcrypt.genSalt(10)
        //console.log(this.email, this.password);  // to just check the values
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error)
    }
});


//compare the password..
userSchema.methods.isValidPassword = async function(password){
    try {
       return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error;
    }
}


const User = mongoose.model('user',userSchema);
module.exports = User;


