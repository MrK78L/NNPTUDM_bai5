let mongoose = require('mongoose');

// Schema cho object User
let userSchema = mongoose.Schema(
    {
        // Tên người dùng, unique và bắt buộc
        username: {
            type: String,
            required: true,
            unique: true
        },
        // Mật khẩu, bắt buộc
        password: {
            type: String,
            required: true
        },
        // Email, unique và bắt buộc
        email: {
            type: String,
            required: true,
            unique: true
        },
        // Tên đầy đủ, mặc định là chuỗi rỗng
        fullName: {
            type: String,
            default: ""
        },
        // URL avatar, mặc định là ảnh mặc định
        avatarUrl: {
            type: String,
            default: "https://i.sstatic.net/l60Hf.png"
        },
        // Trạng thái tài khoản (kích hoạt/vô hiệu hóa), mặc định là false
        status: {
            type: Boolean,
            default: false
        },
        // Tham chiếu đến Role
        role: {
            type: mongoose.Types.ObjectId,
            ref: 'role',
            required: true
        },
        // Số lần đăng nhập, mặc định là 0, tối thiểu là 0
        loginCount: {
            type: Number,
            default: 0,
            min: 0
        },
        // Trạng thái xoá mềm
        isDeleted: {
            type: Boolean,
            default: false
        }
    }, {
    // Tự động thêm createdAt và updatedAt
    timestamps: true
})

module.exports = mongoose.model('user', userSchema)
