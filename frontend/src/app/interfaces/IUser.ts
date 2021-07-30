export interface IUser {
    _id?: String,
    fullName: String,
    username: String,
    password: String,
    role: String,
    createdBy?: String,
    createdAt?: Date, 
}