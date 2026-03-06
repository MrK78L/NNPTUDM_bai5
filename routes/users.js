var express = require('express');
var router = express.Router();
let userSchema = require('../schemas/users');

/* ===== PHẦN READ (CÓ) ===== */

// Lấy tất cả người dùng không bị xoá
// GET /api/v1/users
router.get('/', async function (req, res, next) {
  try {
    // Tìm tất cả user không bị xoá mềm, populate tên role
    let data = await userSchema.find({ isDeleted: false }).populate({ 
      path: 'role',
      select: 'name description' 
    });
    
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message
    })
  }
});

// Lấy người dùng theo ID
// GET /api/v1/users/:id
router.get('/:id', async function (req, res, next) {
  try {
    let result = await userSchema.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate({
      path: 'role',
      select: 'name description'
    });
    
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({
        message: "Người dùng không tồn tại"
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

// Tạo người dùng mới
// POST /api/v1/users
router.post('/', async function (req, res, next) {
  try {
    // Kiểm tra trường bắt buộc
    if (!req.body.username || !req.body.password || !req.body.email || !req.body.role) {
      return res.status(400).send({
        message: "Vui lòng cung cấp đầy đủ: username, password, email, role"
      })
    }

    // Kiểm tra username đã tồn tại chưa
    let existingUsername = await userSchema.findOne({ 
      username: req.body.username,
      isDeleted: false 
    });
    if (existingUsername) {
      return res.status(400).send({
        message: "Username đã tồn tại"
      })
    }

    // Kiểm tra email đã tồn tại chưa
    let existingEmail = await userSchema.findOne({ 
      email: req.body.email,
      isDeleted: false 
    });
    if (existingEmail) {
      return res.status(400).send({
        message: "Email đã tồn tại"
      })
    }

    // Tạo user mới
    let newUser = new userSchema({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName || "",
      avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
      status: false,
      role: req.body.role,
      loginCount: 0
    });

    await newUser.save();
    // Populate role trước khi trả về
    await newUser.populate({
      path: 'role',
      select: 'name description'
    });

    res.status(201).send({
      message: "Tạo người dùng thành công",
      data: newUser
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi tạo người dùng",
      error: error.message
    })
  }
});

/* ===== PHẦN UPDATE (CẬP NHẬT) ===== */

// Cập nhật thông tin người dùng
// PUT /api/v1/users/:id
router.put('/:id', async function (req, res, next) {
  try {
    // Không được phép cập nhật username, email, password trực tiếp từ endpoint này
    // (nên tạo endpoint riêng cho mục đích đó nếu cần)
    
    let result = await userSchema.findByIdAndUpdate(
      req.params.id,
      {
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        role: req.body.role
      },
      { new: true }
    ).populate({
      path: 'role',
      select: 'name description'
    });

    if (result) {
      res.status(200).send({
        message: "Cập nhật thông tin thành công",
        data: result
      });
    } else {
      res.status(404).send({
        message: "Người dùng không tồn tại"
      })
    }
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi cập nhật thông tin",
      error: error.message
    })
  }
});

/* ===== PHẦN DELETE (XOÁ MỀM) ===== */

// Xoá mềm (soft delete) người dùng
// DELETE /api/v1/users/:id
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await userSchema.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    ).populate({
      path: 'role',
      select: 'name description'
    });

    if (result) {
      res.status(200).send({
        message: "Xoá người dùng thành công",
        data: result
      });
    } else {
      res.status(404).send({
        message: "Người dùng không tồn tại"
      })
    }
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi xoá người dùng",
      error: error.message
    })
  }
});

/* ===== PHẦN ENABLE/DISABLE ===== */

// Kích hoạt tài khoản
// POST /api/v1/users/enable
// Body: { email, username }
router.post('/enable', async function (req, res, next) {
  try {
    // Kiểm tra trường bắt buộc
    if (!req.body.email || !req.body.username) {
      return res.status(400).send({
        message: "Vui lòng cung cấp email và username"
      })
    }

    // Tìm user với email và username khớp
    let user = await userSchema.findOne({
      email: req.body.email,
      username: req.body.username,
      isDeleted: false
    });

    if (!user) {
      return res.status(404).send({
        message: "Email hoặc username không đúng"
      })
    }

    // Cập nhật status thành true
    user.status = true;
    await user.save();

    await user.populate({
      path: 'role',
      select: 'name description'
    });

    res.status(200).send({
      message: "Kích hoạt tài khoản thành công",
      data: user
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi kích hoạt tài khoản",
      error: error.message
    })
  }
});

// Vô hiệu hóa tài khoản
// POST /api/v1/users/disable
// Body: { email, username }
router.post('/disable', async function (req, res, next) {
  try {
    // Kiểm tra trường bắt buộc
    if (!req.body.email || !req.body.username) {
      return res.status(400).send({
        message: "Vui lòng cung cấp email và username"
      })
    }

    // Tìm user với email và username khớp
    let user = await userSchema.findOne({
      email: req.body.email,
      username: req.body.username,
      isDeleted: false
    });

    if (!user) {
      return res.status(404).send({
        message: "Email hoặc username không đúng"
      })
    }

    // Cập nhật status thành false
    user.status = false;
    await user.save();

    await user.populate({
      path: 'role',
      select: 'name description'
    });

    res.status(200).send({
      message: "Vô hiệu hóa tài khoản thành công",
      data: user
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi khi vô hiệu hóa tài khoản",
      error: error.message
    })
  }
});

module.exports = router;
