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

// Khởi tạo Database mặc định với toàn bộ tài liệu chính thức của Lái Hộ
const defaultData = {
  config: {
    botActive: true,
    pageName: "Lái Hộ - Tải App & Đặt Tài Xế",
    pageAccessToken: "",
    verifyToken: "my_secret_verify_token_123",
    aiProvider: "gemini", // 'gemini' hoặc 'openai'
    aiApiKey: "",
    aiModel: "gemini-2.5-flash"
  },
  persona: {
    botName: "Linh - Trợ lý Lái Hộ",
    pronoun: "Em - Anh/Chị",
    tone: "Thân thiện, nhiệt tình, chuyên nghiệp, hỗ trợ giải đáp chính xác về dịch vụ lái hộ và đăng ký tài xế",
    fallback: "Dạ vấn đề này hiện nằm ngoài thông tin em được cung cấp. Anh/Chị vui lòng để lại Số điện thoại hoặc liên hệ trực tiếp hotline để nhân viên tư vấn hỗ trợ nhé ạ!"
  },
  documents: [
    {
      id: "doc_laiho_1",
      title: "Quy trình đặt xe & Thông tin chung Laiho",
      content: "- Các bước đặt tài xế lái hộ trên app Laiho:\n  + Nhập Điểm đón/Điểm đi\n  + Chọn dịch vụ Tài xế Ô tô / Tài xế Xe máy / Tài xế đi tỉnh / Xe tải Van điện\n  + Chọn phương thức thanh toán\n  + Nhập mã khuyến mãi (nếu có)\n  + Chọn Đặt xe để hệ thống tìm tài xế gần nhất\n- Tải app tại: https://laiho.vn/",
      active: true,
      updatedAt: "Hôm nay"
    },
    {
      id: "doc_laiho_2",
      title: "Quy định chuyến đi & Giá cước",
      content: "- Thuế VAT áp dụng cho các chuyến đi là 8%.\n- Phí dịch vụ (thu thêm ngoài cước): 10.000 VNĐ đối với xe ô tô và 7.000 VNĐ đối với xe máy.\n- Hệ thống điều chỉnh giảm giá chuyến cho khách đặt để tăng lượng khách.\n- Quy định khi khách đặt không có tài xế nhận: Bộ phận Điều phối sẽ chủ động gọi khách trước, tuyệt đối không để tài xế tự thỏa thuận (deal) giá.\n- Đã bãi bỏ chính sách gán chuyến không ăn chia đối với tài xế.\n- Hệ thống đã đấu nối thêm phương tiện xe tải Van điện lên app Laiho.",
      active: true,
      updatedAt: "Hôm nay"
    },
    {
      id: "doc_laiho_3",
      title: "Yêu cầu hồ sơ & Chiết khấu cho Tài xế",
      content: "- Yêu cầu đăng ký:\n  + GPLX hạng A hoặc B2 trở lên (còn hạn).\n  + Kinh nghiệm lái xe >3 năm.\n  + CMND/CCCD và đã khai báo VNEID cấp 2.\n  + Giấy khám sức khỏe mẫu TT36.\n- Tỷ lệ chiết khấu:\n  + Tài xế ô tô: 75% - 25% (Tài xế nhận 75%).\n  + Tài xế xe máy: 80% - 20% (Tài xế nhận 80%).\n- Ưu đãi đặc biệt 1: Nộp kèm Lý lịch tư pháp hoặc Giấy xác nhận hạnh kiểm tại địa phương ➔ Hưởng ưu đãi chiết khấu xe hơi 12 tháng.\n- Ưu đãi đặc biệt 2: Tài xế giới thiệu khách tải app, khi khách đó đặt chuyến cho chính tài xế đó, tài xế được cộng thêm 5% doanh thu trước thuế và phí.\n- Chi phí ban đầu:\n  + Đồng phục (1 áo sơ mi + 1 áo khoác): Tặng đồng phục 100% khi Bác tài nhận 1 cuốc trên app (thay vì 230.000đ).\n  + Nạp ví tài xế tối thiểu: 200.000 VNĐ.",
      active: true,
      updatedAt: "Hôm nay"
    },
    {
      id: "doc_laiho_4",
      title: "Chính sách Quán đối tác & Chi nhánh",
      content: "- Chính sách Quán đối tác: Tất cả các quán đối tác khi đặt chuyến thành công sẽ được hưởng 5% doanh thu trước thuế và phí.\n- Địa chỉ chi nhánh đăng ký trực tiếp (Thời gian: 8h - 17h từ Thứ 2 đến Thứ 6):\n  + Hà Nội: Lô 7 LK 16 B1.1 Khu Đô Thị Thanh Hà, Xã Bình Minh, TP Hà Nội.\n  + Hồ Chí Minh: 132 Lê Tuấn Mậu, Phường 13, Quận 6, TP.HCM.",
      active: true,
      updatedAt: "Hôm nay"
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

// APIs Quản trị Web
app.get('/api/data', (req, res) => {
  res.json(loadDB());
});

app.post('/api/config', (req, res) => {
  const db = loadDB();
  db.config = { ...db.config, ...req.body };
  saveDB(db);
  res.json({ success: true, config: db.config });
});

app.post('/api/persona', (req, res) => {
  const db = loadDB();
  db.persona = { ...db.persona, ...req.body };
  saveDB(db);
  res.json({ success: true, persona: db.persona });
});

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
      db.documents[index] = { ...db.documents[index], ...doc, updatedAt: new Date().toLocaleDateString('vi-VN') };
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

app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await generateAIResponse(message);
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, reply: "Lỗi AI: " + error.message });
  }
});

// Hàm xử lý AI (Gemini / OpenAI)
async function generateAIResponse(userMessage) {
  const db = loadDB();
  const { config, persona, documents } = db;
  const activeDocs = documents.filter(d => d.active);
  const knowledgeText = activeDocs.map((d, idx) => `--- TÀI LIỆU ${idx + 1}: ${d.title} ---\n${d.content}`).join('\n\n');

  const systemInstruction = `Bạn là nhân viên tư vấn trực Fanpage có tên là "${persona.botName}".
Cách xưng hô: "${persona.pronoun}". Phong cách: ${persona.tone}.

NHIỆM VỤ: Chỉ dùng thông tin trong [TÀI LIỆU CÔNG TY] bên dưới để trả lời chính xác, rõ ràng, ngắn gọn cho khách hàng hoặc tài xế. Không tự bịa đặt giá hay chính sách ngoài tài liệu. Nếu câu hỏi ngoài phạm vi, hãy trả lời: "${persona.fallback}"

[TÀI LIỆU CÔNG TY]:
${knowledgeText}`;

  if (!config.aiApiKey || config.aiApiKey.trim() === "") {
    return "Vui lòng vào tab '1. Kết nối & API Key' trên giao diện quản trị để dán API Key của AI.";
  }

  if (config.aiProvider === 'gemini') {
    const model = config.aiModel || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.aiApiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.3 }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Lỗi gọi Gemini API");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || persona.fallback;
  } else {
    const model = config.aiModel || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.aiApiKey.trim()}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: userMessage }],
        temperature: 0.3
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Lỗi gọi OpenAI API");
    return data.choices?.[0]?.message?.content || persona.fallback;
  }
}

// Webhook Facebook Messenger
app.get('/webhook', (req, res) => {
  const db = loadDB();
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === db.config.verifyToken) {
    console.log('✅ WEBHOOK_VERIFIED: Facebook đã kết nối thành công!');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    res.status(200).send('EVENT_RECEIVED');
    const db = loadDB();
    if (!db.config.botActive) return;

    for (const entry of body.entry) {
      const event = entry.messaging?.[0];
      if (event?.message?.text && !event.message.is_echo) {
        const senderPsid = event.sender.id;
        const text = event.message.text;
        console.log(`📩 Khách (${senderPsid}): ${text}`);

        try {
          const reply = await generateAIResponse(text);
          await sendFacebookMessage(senderPsid, reply, db.config.pageAccessToken);

          // Lưu nhật ký
          const currentDb = loadDB();
          currentDb.logs.unshift({
            time: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
            senderId: senderPsid,
            question: text,
            answer: reply
          });
          currentDb.logs = currentDb.logs.slice(0, 100);
          saveDB(currentDb);
        } catch (e) {
          console.error("❌ Lỗi xử lý tin nhắn:", e.message);
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
});

async function sendFacebookMessage(recipientId, text, token) {
  if (!token) throw new Error("Chưa nhập Page Access Token!");
  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  });
  console.log(`🤖 Đã trả lời khách (${recipientId}) thành công!`);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});