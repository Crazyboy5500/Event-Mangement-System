import mongoose from 'mongoose';
const {Schema} = mongoose;

const UserSchema = new Schema({
  name: String,
  email: {type:String, unique:true},
  password: String,
  role: {type: String, default: 'user', enum: ['user', 'admin']}
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;