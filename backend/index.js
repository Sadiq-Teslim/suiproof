const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Temporary storage (Auto-deletes after 24h as per PDF)
const upload = multer({ dest: 'uploads/' });

app.post('/api/hash-document', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileBuffer = fs.readFileSync(req.file.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hexHash = hashSum.digest('hex');

    // Section 8.1: Store temporarily (Mock TTL)
    // In a real hackathon, we delete the file immediately after hashing for privacy
    fs.unlinkSync(req.file.path); 

    res.json({ hash: hexHash });
});

app.listen(3001, () => console.log('Backend running on port 3001'));