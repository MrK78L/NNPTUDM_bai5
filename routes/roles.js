var express = require('express');
var router = express.Router();
let roleSchema = require('../schemas/roles');

/* ===== PHẦN READ (CÓ) ===== */

// Lấy tất cả vai trò không bị xoá
// GET /api/v1/roles
router.get('/', async function (req, res, next) {
  try {
    // Tìm tất cả role không bị xoá mềm
    let data = await roleSchema.find({ isDeleted: false });
    
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi lấy danh sách vai trò",
      error: error.message
    })
  }
});

// Lấy vai trò theo ID
// GET /api/v1/roles/:id
router.get('/:id', async function (req, res, next) {
  try {
    let result = await roleSchema.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({
        message: "Vai trò không tồn tại"
      })
    }
  } catch (error) {
    res.status(500).send({
      message: "ID không hợp lệ",
      error: error.message
    })
  }
});

/* ===== PHẦN CREATE (TẠO) ===== */

// Tạo vai trò mới
// POST /api/v1/roles
router.post('/', async function (req, res, next) {
  try {
    // Kiểm tra trường bắt buộc
    if (!req.body.name) {
      return res.status(400).send({
        message: "Vui lòng cung cấp tên vai trò"
      })
    }

    // Kiểm tra name đã tồn tại chưa
    let existingRole = await roleSchema.findOne({ 
      name: req.body.name,
      isDeleted: false 
    });
    if (existingRole) {
      return res.status(400).send({
        message: "Tên vai trò đã tồn tại"
      })
    }

    // Tạo role mới
    let newRole = new roleSchema({
      name: req.body.name,
      description: req.body.description || ""
    });

    await newRole.save();

    res.status(201).send({
      message: "Tạo vai trò thành công",
      data: newRole
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi tạo vai trò",
      error: error.message
    })
  }
});

/* ===== PHẦN UPDATE (CẬP NHẬT) ===== */

// Cập nhật thông tin vai trò
// PUT /api/v1/roles/:id
router.put('/:id', async function (req, res, next) {
  try {
    let result = await roleSchema.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description
      },
      { new: true }
    );

    if (result) {
      res.status(200).send({
        message: "Cập nhật vai trò thành công",
        data: result
      });
    } else {
      res.status(404).send({
        message: "Vai trò không tồn tại"
      })
    }
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi cập nhật vai trò",
      error: error.message
    })
  }
});

/* ===== PHẦN DELETE (XOÁ MỀM) ===== */

// Xoá mềm (soft delete) vai trò
// DELETE /api/v1/roles/:id
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await roleSchema.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (result) {
      res.status(200).send({
        message: "Xoá vai trò thành công",
        data: result
      });
    } else {
      res.status(404).send({
        message: "Vai trò không tồn tại"
      })
    }
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi xoá vai trò",
      error: error.message
    })
  }
});

module.exports = router;
