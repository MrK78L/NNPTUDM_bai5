let mongoose = require('mongoose');

// Schema cho object Role
let roleSchema = mongoose.Schema(
    {
        // Tên role, unique và bắt buộc
        name: {
            type: String,
            required: true,
            unique: true
        },
        // Mô tả role, mặc định là chuỗi rỗng
        description: {
            type: String,
            default: ""
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

module.exports = mongoose.model('role', roleSchema)
