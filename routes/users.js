const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 4;

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});

router.post('/', [
    body('name').isLength({ min: 3 }).withMessage('El nombre es demasiado corto'),
    body('email').isEmail().withMessage('El correo electrónico no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ], async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {    
      const users = await User.find();
      return res.render('index', { errors: errors.array(), users });
    }
  
    // Encripta la contraseña antes de guardarla en la base de datos
    const password = req.body.password;
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).send('Error al crear el usuario.');
      }
  
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });
  
      await newUser.save();
      res.redirect('/');
    });
  });

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;