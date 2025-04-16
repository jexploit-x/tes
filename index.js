require("./engine/settings");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require("path");
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

const {
  convertCRC16,
  generateTransactionId,
  generateExpirationTime,
  elxyzFile,
  generateQRIS,
  createQRIS,
  checkQRISStatus
} = require('./scrape/orkut');

app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(express.urlencoded({ 
  extended: true 
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "scrape")));
app.use(bodyParser.raw({ 
  limit: '50mb', 
  type: '*/*' 
}));

async function cekApikey(key) {
  let list = []
    try {
      list = global.apikey
        return list.includes(key.toLowerCase()) ? true : false
    } catch (err) {
      return false
    }
}


app.get('/api/orkut/createpayment', async (req, res) => {
  const { apiKey, amount, codeqr } = req.query;
  if (!apiKey) return res.status(400).json({
    status: false,
    message: "Parameter apiKey diperlukan"
  });
  const check = global.apikey
  if (!cekApikey(apiKey)) return res.status(400).json({
    status: false,
    message: "apiKey tidak Valid"
  });
  if (!amount) return res.status(400).json({ 
    status: false,
    message: "Parameter amount diperlukan" 
  });
  if (!codeqr) return res.status(400).json({ 
    status: false,
    message: "Parameter codeqr diperlukan" 
  });
  
  try {
    const qrData = await createQRIS(amount, codeqr);
    res.json({ 
      status: true,
      creator: global.creator, 
      result: qrData 
    });        
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: false,
      error: error.message
    });
  }
});

app.get('/api/orkut/cekstatus', async (req, res) => {
  const { apiKey, merchant, keyorkut } = req.query;
  if (!apiKey) return res.status(400).json({
    status: false,
    message: "Parameter apiKey diperlukan"
  });
  const check = global.apikey
  if (!cekApikey(apiKey)) return res.status(400).json({
    status: false,
    message: "apiKey tidak Valid"
  });
  if (!merchant) return res.status(400).json({
    status: false,
    message: "Parameter merchant diperlukan"
  });
  if (!keyorkut) return res.status(400).json({
    status: false,
    message: "Parameter keyorkut diperlukan"
  });
  
  try {
    const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant}/${keyorkut}`;
    const response = await axios.get(apiUrl);
    const result = response.data;
    const latestTransaction = result.data && result.data.length > 0 ? result.data[0] : null;
    
    res.json({
      status: true,
      creator: global.creator,
      result: latestTransaction || { message: "Tidak ada transaksi ditemukan" }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: false,
    message: "Terjadi kesalahan internal server"
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint tidak ditemukan"
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
 

app.get('/api/brat', require('./engine/brat'));
