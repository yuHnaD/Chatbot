const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Khởi tạo Database mặc định nếu chưa có file database.json
const defaultData = {
  config: {
    botActive: true,
    pageName: "Fanpage Công Ty",
    pageAccessToken: "",
    verifyToken: "my_secret_verify_token_123",
    aiProvider: "gemini", // 'gemini' hoặc 'openai'
    aiApiKey: "",
    aiModel: "gemini-2.5-flash" // hoặc 'gpt-4o-mini'
  },
  persona: {
    botName: "Linh - Trợ lý AI",
    pronoun: "Em - Anh/Chị",
    tone: "Thân thiện, nhiệt tình, chuyên nghiệp, dùng biểu tượng cảm xúc vừa phải",
    fallback: "Dạ vấn đề này hiện nằm ngoài thông tin em được cung cấp. Anh/Chị vui lòng để lại Số điện thoại hoặc chờ ít phút để nhân viên tư vấn bên em hỗ trợ trực tiếp nhé ạ!"
  },
  documents: [
    {
      id: "doc_1",
      title: "Bảng giá & Sản phẩm mẫu",
      content: "Gói Cơ Bản: 199.000đ/tháng. Gói Chuyên Nghiệp: 499.000đ/tháng (Tặng kèm tên miền). Bảo hành hỗ trợ kỹ thuật 1 đổi 1 trong 30 ngày.",
      active: true,
      updatedAt: new Date().toLocaleDateString('vi-VN')
    },
    {
      id: "doc_2",
      title: "Chính sách giao hàng & Thanh toán",
      content: "Miễn phí giao hàng toàn quốc cho đơn từ 300.000đ. Nội thành giao trong 24h, ngoại thành 2-3 ngày. Hỗ trợ thanh toán COD nhận hàng trả tiền hoặc chuyển khoản.",
      active: true,
      updatedAt: new Date().toLocaleDateString('vi-VN')
    }
  ],
  logs: []
};

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ==========================================
// 1. API QUẢN TRỊ DÀNH CHO GIAO DIỆN WEB
// ==========================================

// Lấy toàn bộ dữ liệu lên Web
app.get('/api/data', (req, res) => {
  const db = loadDB();
  res.json(db);
});

// Lưu cấu hình Kết nối & API Key từ Web
app.post('/api/config', (req, res) => {
  const db = loadDB();
  db.config = { ...db.config, ...req.body };
  saveDB(db);
  res.json({ success: true, message: "Đã lưu cấu hình kết nối!", config: db.config });
});

// Lưu cấu hình Nhân cách AI từ Web
app.post('/api/persona', (req, res) => {
  const db = loadDB();
  db.persona = { ...db.persona, ...req.body };
  saveDB(db);
  res.json({ success: true, message: "Đã lưu cấu hình nhân cách AI!", persona: db.persona });
});

// Thêm / Sửa / Xóa / Bật tắt Tài liệu huấn luyện
app.post('/api/documents', (req, res) => {
  const db = loadDB();
  const { action, doc, id } = req.body;

  if (action === 'add') {
    const newDoc = {
      id: 'doc_' + Date.now(),
      title: doc.title,
      content: doc.content,
      active: true,
      updatedAt: new Date().toLocaleDateString('vi-VN')
    };
    db.documents.unshift(newDoc);
  } else if (action === 'update') {
    const index = db.documents.findIndex(d => d.id === doc.id);
    if (index !== -1) {
      db.documents[index] = {
        ...db.documents[index],
        title: doc.title,
        content: doc.content,
        active: doc.active,
        updatedAt: new Date().toLocaleDateString('vi-VN')
      };
    }
  } else if (action === 'toggle') {
    const item = db.documents.find(d => d.id === id);
    if (item) item.active = !item.active;
  } else if (action === 'delete') {
    db.documents = db.documents.filter(d => d.id !== id);
  }

  saveDB(db);
  res.json({ success: true, documents: db.documents });
});

// API Chat thử nghiệm trực tiếp trên Web (dùng chung bộ não AI với Messenger thật)
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await generateAIResponse(message);
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, reply: "Lỗi gọi AI: " + error.message });
  }
});

// ==========================================
// 2. HÀM XỬ LÝ TRÍ TUỆ NHÂN TẠO (GEMINI / OPENAI)
// ==========================================

async function generateAIResponse(userMessage) {
  const db = loadDB();
  const { config, persona, documents } = db;

  // Gom toàn bộ tài liệu đang được BẬT (active: true)
  const activeDocs = documents.filter(d => d.active);
  const knowledgeText = activeDocs.length > 0
    ? activeDocs.map((d, idx) => `--- TÀI LIỆU ${idx + 1}: ${d.title} ---\n${d.content}`).join('\n\n')
    : "Chưa có tài liệu nào được kích hoạt.";

  const systemInstruction = `Bạn là nhân viên tư vấn trực Fanpage có tên là "${persona.botName}".
Cách xưng hô bắt buộc: "${persona.pronoun}".
Phong cách giao tiếp: ${persona.tone}.

NHIỆM VỤ CỦA BẠN:
Chỉ sử dụng thông tin trong phần [TÀI LIỆU CÔNG TY] bên dưới để trả lời câu hỏi của khách hàng một cách chính xác, tự nhiên và ngắn gọn.
Tuyệt đối KHÔNG tự bịa đặt giá cả, chính sách hoặc thông tin không có trong tài liệu.
Nếu khách hỏi vấn đề hoàn toàn không có trong tài liệu (trừ các câu chào hỏi xã giao cơ bản), hãy trả lời theo đúng ý sau: "${persona.fallback}"

[TÀI LIỆU CÔNG TY]:
${knowledgeText}`;

  if (!config.aiApiKey || config.aiApiKey.trim() === "") {
    return `[Chế độ chưa gắn API Key] Mình đã đọc ${activeDocs.length} tài liệu của công ty. Bạn hãy vào tab "1. Kết nối & API Key" trên web để dán mã Gemini/OpenAI API Key giúp AI trả lời thông minh nhé!`;
  }

  // Nếu chọn Google Gemini
  if (config.aiProvider === 'gemini') {
    const modelName = config.aiModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.aiApiKey.trim()}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.3 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Lỗi kết nối Gemini API");
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || persona.fallback;
  } 
  // Nếu chọn OpenAI (ChatGPT)
  else {
    const modelName = config.aiModel || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey.trim()}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Lỗi kết nối OpenAI API");
    }
    return data.choices?.[0]?.message?.content || persona.fallback;
  }
}

// ==========================================
// 3. FACEBOOK MESSENGER WEBHOOK (CHẠY THẬT)
// ==========================================

// Bước 3.1: Facebook xác thực Webhook (GET)
app.get('/webhook', (req, res) => {
  const db = loadDB();
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === db.config.verifyToken) {
      console.log('✅ WEBHOOK_VERIFIED: Facebook đã kết nối thành công!');
      res.status(200).send(challenge);
    } else {
      console.warn('❌ Sai Verify Token từ Facebook!');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Bước 3.2: Nhận tin nhắn của khách từ Facebook gửi về (POST)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    // Phản hồi 200 OK ngay cho Facebook để tránh lỗi timeout
    res.status(200).send('EVENT_RECEIVED');

    const db = loadDB();
    // Nếu trên Web đang gạt tắt Bot thì không tự động trả lời
    if (!db.config.botActive) {
      console.log('⏸️ Bot đang ở chế độ TẠM DỪNG trên giao diện Web.');
      return;
    }

    for (const entry of body.entry) {
      const webhookEvent = entry.messaging && entry.messaging[0];
      if (!webhookEvent) continue;

      const senderPsid = webhookEvent.sender.id;

      // Chỉ xử lý khi khách gửi tin nhắn văn bản (bỏ qua tin nhắn echo của chính page)
      if (webhookEvent.message && webhookEvent.message.text && !webhookEvent.message.is_echo) {
        const customerText = webhookEvent.message.text;
        console.log(`📩 Khách (${senderPsid}): ${customerText}`);

        try {
          // 1. Gọi AI tạo câu trả lời dựa trên tài liệu
          const aiReply = await generateAIResponse(customerText);

          // 2. Bắn tin nhắn trả lời về lại Facebook Messenger của khách
          await sendFacebookMessage(senderPsid, aiReply, db.config.pageAccessToken);

          // 3. Lưu vào nhật ký hoạt động để bạn xem trực tiếp trên Web
          const updatedDb = loadDB();
          updatedDb.logs.unshift({
            time: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
            senderId: senderPsid,
            question: customerText,
            answer: aiReply
          });
          updatedDb.logs = updatedDb.logs.slice(0, 50); // Giữ 50 tin gần nhất
          saveDB(updatedDb);

        } catch (err) {
          console.error('❌ Lỗi xử lý tin nhắn:', err.message);
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
});

// Hàm gọi Graph API của Facebook để gửi tin nhắn cho khách
async function sendFacebookMessage(senderPsid, responseText, pageAccessToken) {
  if (!pageAccessToken) {
    throw new Error("Chưa nhập Page Access Token trên giao diện Web!");
  }

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken.trim()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: senderPsid },
      message: { text: responseText }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Lỗi gửi tin nhắn qua Facebook Graph API");
  }
  console.log(`🤖 Đã trả lời khách (${senderPsid}) thành công!`);
}

// Khởi động trang chủ mở giao diện Web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Messenger Hub đã chạy tại: http://localhost:${PORT}`);
  console.log(`🔗 Đường dẫn Webhook cho Facebook: /webhook`);
  console.log(`====================================================`);
});