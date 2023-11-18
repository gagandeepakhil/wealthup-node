const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const app = express();
app.use(cors())
app.use(bodyParser.json())

const dbURI = "mongodb+srv://gagan:gagan@blog.xdg5ro5.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result =>{ 
    const port = process.env.PORT || 4000;
    app.listen(port)})
  .catch(err => console.log(err));

const Code = mongoose.model('Code', { value: String, used: Boolean, createdAt: Date });

function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = Math.floor(Math.random() * 2) + 5; // Generates a length between 5 and 6
    let code = '';
  
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
  
    return code;
  }
  
router.get('/api/codes', async (req, res) => {
  try {
    const newCode = generateCode(); // Implement your code generation logic here
    const code = new Code({ value: newCode, used: false, createdAt: new Date() });
    await code.save();
    res.json({ code: newCode });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/codes/use', async (req, res) => {
  try {
    const enteredCode = req.body.code;
    const code = await Code.findOne({ value: enteredCode });
    if (!code) {
      return res.json({ error: 'Enter a valid code' });
    }

    if (code.used) {
      return res.json({ error: 'This code has already been used' });
    }

    const currentTime = new Date();
    const expirationTime = new Date(code.createdAt.getTime() + 60 * 1000); // 60 seconds expiry

    if (currentTime > expirationTime) {
      return res.json({ error: 'The code has expired' });
    }

    code.used = true;
    await code.save();
    return res.json({ message: 'Code is correct' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.use('/',router)