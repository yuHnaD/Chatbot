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

// Danh sách các kết nối Realtime (SSE) đang mở trên trình duyệt Admin
let sseClients = [];

function broadcastRealtime(eventType, payload) {
  const dataString = `data: ${JSON.stringify({ type: eventType, payload })}\n\n`;
  sseClients.forEach(client => client.res.write(dataString));
}

// Khởi tạo Database mặc định với toàn bộ tài liệu chính thức của Lái Hộ
const defaultData = {
  config: {
    botActive: true,
    pageName: "Lái Hộ - Tải App & Đặt Tài Xế",
    pageAccessToken: "",
    verifyToken: "my_secret_verify_token_123",
    aiProvider: "gemini",
    aiApiKey: "",
    aiModel: "gemini-2.5-flash"
  },
  persona: {
    botName: "Linh - Trợ lý Lái Hộ",
    pronoun: "Em - Anh/Chị",
    tone: "Thân thiện, nhiệt tình, chuyên nghiệp, hỗ trợ giải đáp chính xác về dịch vụ lái hộ và đăng ký tài xế",
    fallback: "Dạ vấn đề này hiện nằm ngoài thông tin tự động của em. Em đã chuyển tin nhắn cho Quản trị viên Lái Hộ, Anh/Chị vui lòng chờ ít phút hoặc để lại SĐT để nhân viên hỗ trợ trực tiếp ngay nhé ạ!"
  },
  documents: [
    {
      id: "doc_laiho_1",
      title: "Quy trình đặt xe & Thông tin chung Laiho",
      content: "[Câu hỏi thường gặp: Đặt xe thế nào? Tải app ở đâu?]\nCÁC BƯỚC ĐẶT TÀI XẾ LÁI HỘ TRÊN APP LAIHO:\n- Nhập Điểm đón/Điểm đi\n- Chọn dịch vụ Tài xế Ô tô/Tài xế Xe máy/Tài xế đi tỉnh/Xe tải Van điện\n- Chọn phương thức thanh toán\n- Nhập mã khuyến mãi (nếu có)\n- Chọn Đặt xe để Lái hộ tìm tài xế gần nhất cho bạn\n- Tải app tại: https://laiho.vn/",
      active: true,
      updatedAt: "Hôm nay"
    },
    {
      id: "doc_laiho_2",
      title: "Quy định chuyến đi & Giá cước",
      content: "[Câu hỏi thường gặp: Giá cước tính thế nào? Hủy xe có bị phạt không? Quy định chuyến đi ra sao? Thuế VAT bao nhiêu? Phí dịch vụ bao nhiêu?]\nQUY ĐỊNH CHUYẾN ĐI & GIÁ CƯỚC:\n- Thuế VAT áp dụng cho các chuyến đi là 8%.\n- Phí dịch vụ (thu thêm ngoài cước): 10.000 VNĐ đối với xe ô tô và 7.000 VNĐ đối với xe máy.\n- Hệ thống điều chỉnh giảm giá chuyến cho khách đặt để tăng lượng khách.\n- Quy định khi khách đặt không có tài xế nhận: Bộ phận Điều phối sẽ chủ động gọi khách trước, tuyệt đối không để tài xế tự thỏa thuận (deal) giá với khách.\n- Đã bãi bỏ chính sách gán chuyến không ăn chia đối với tài xế.\n- Hệ thống đã đấu nối thêm phương tiện xe tải Van điện lên app Laiho.\n- Hiện tại chỉ hỗ trợ đăng ký trực tiếp tại chi nhánh HCM và HN.",
      active: true,
      updatedAt: "Hôm nay"
    },
    {
      id: "doc_laiho_3",
      title: "Yêu cầu hồ sơ & Chiết khấu cho Tài xế",
      content: "[Câu hỏi thường gặp: Cần hồ sơ gì để đăng ký chạy Laiho? Làm tài xế Laiho yêu cầu gì? Ưu đãi tài xế mới? Chiết khấu bao nhiêu? Đăng ký mất bao nhiêu tiền? Tiền đồng phục? Nạp ví bao nhiêu?]\nYÊU CẦU HỒ SƠ & ƯU ĐÃI TÀI XẾ:\n- GPLX hạng A hoặc B2 trở lên (còn hạn).\n- Kinh nghiệm lái xe >3 năm.\n- CMND/CCCD và đã khai báo VNEID cấp 2.\n- Giấy khám sức khỏe mẫu TT36.\n- Tỷ lệ chiết khấu: Tài xế ô tô là 75-25 (Tài xế nhận 75%), Tài xế xe máy là 80-20 (Tài xế nhận 80%).\n- Đặc biệt 1: Nộp kèm Lý lịch tư pháp hoặc Giấy xác nhận hạnh kiểm tại địa phương ➔ Hưởng ưu đãi chiết khấu xe hơi 12 tháng.\n- Đặc biệt 2: Tài xế giới thiệu khách tải app, khi khách đó đặt chuyến cho chính tài xế đó, tài xế sẽ được cộng thêm 5% doanh thu trước thuế và phí.\nCHI PHÍ BAN ĐẦU KHI NHẬN VIỆC:\n- Chi phí đồng phục (gồm 1 áo sơ mi và 1 áo khoác ngoài): Tặng đồng phục 100% khi Bác tài nhận 1 cuốc trên app Laiho (thay vì 230.000đ như trước đây).\n- Nạp ví tài xế tối thiểu: 200.000đ.",
      active: true,
      updatedAt: "Hôm nay"
    },
    {
      id: "doc_laiho_4",
      title: "Chính sách Quán đối tác & Địa chỉ Chi nhánh",
      content: "[Câu hỏi thường gặp: Quán đối tác được hưởng quyền lợi gì? Hợp tác quán nhậu chiết khấu bao nhiêu? Địa chỉ văn phòng Laiho ở đâu? Địa chỉ Laiho Hà Nội, HCM? Thời gian làm việc?]\nCHÍNH SÁCH QUÁN ĐỐI TÁC:\n- Tất cả các quán đối tác khi đặt chuyến thành công sẽ được hưởng 5% doanh thu trước thuế và phí.\nĐỊA CHỈ CHI NHÁNH ĐĂNG KÝ TRỰC TIẾP:\n- Hà Nội: Lô 7 LK 16 B1.1 Khu Đô Thị Thanh Hà, Xã Bình Minh, TP Hà Nội.\n- Hồ Chí Minh: 132 Lê Tuấn Mậu, Phường 13, Quận 6, Thành phố Hồ Chí Minh.\nTHỜI GIAN HOẠT ĐỘNG:\n- Từ 8h - 17h từ thứ 2 - thứ 6.",
      active: true,
      updatedAt: "Hôm nay"
    }
  ],
  conversations: {} // Lưu lịch sử hội thoại theo từng khách hàng (senderPsid)
};

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    }
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!db.conversations) db.conversations = {};
    return db;
  } catch (e) {
    return defaultData;
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error("Lỗi ghi database:", e);
  }
}

// ==========================================
// 1. KẾT NỐI REALTIME (SERVER-SENT EVENTS)
// ==========================================
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  sseClients.push({ id: clientId, res });

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// ==========================================
// 2. API QUẢN TRỊ & HỘP THƯ MESSENGER
// ==========================================
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
    db.documents.unshift({
      id: 'doc_' + Date.now(),
      title: doc.title,
      content: doc.content,
      active: true,
      updatedAt: new Date().toLocaleDateString('vi-VN')
    });
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

// Admin gửi tin nhắn trực tiếp cho khách từ giao diện Web
app.post('/api/conversations/reply', async (req, res) => {
  try {
    const { senderId, text } = req.body;
    const db = loadDB();
    const conv = db.conversations[senderId];
    if (!conv) return res.status(404).json({ success: false, error: "Không tìm thấy hội thoại" });

    // Nếu không phải khách giả lập (test_...) thì bắn tin nhắn thật lên Facebook
    if (!senderId.startsWith('test_')) {
      await sendFacebookMessage(senderId, text, db.config.pageAccessToken);
    }

    const msgObj = {
      id: 'msg_' + Date.now(),
      sender: 'admin',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
    };

    conv.messages.push(msgObj);
    conv.lastMessage = "Bạn: " + text;
    conv.updatedAt = Date.now();
    conv.needsAdmin = false; // Đã được Admin xử lý
    conv.unread = 0;

    saveDB(db);
    broadcastRealtime('CONVERSATION_UPDATED', { conversation: conv });

    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bật / Tắt AI riêng cho từng khách hoặc Đánh dấu đã xử lý xong
app.post('/api/conversations/status', (req, res) => {
  const { senderId, aiEnabled, needsAdmin, markRead } = req.body;
  const db = loadDB();
  const conv = db.conversations[senderId];
  if (!conv) return res.status(404).json({ success: false });

  if (typeof aiEnabled === 'boolean') conv.aiEnabled = aiEnabled;
  if (typeof needsAdmin === 'boolean') conv.needsAdmin = needsAdmin;
  if (markRead) conv.unread = 0;

  saveDB(db);
  broadcastRealtime('CONVERSATION_UPDATED', { conversation: conv });
  res.json({ success: true, conversation: conv });
});

// Chat thử nghiệm (Cũng đẩy thẳng vào Hộp thư Live Chat để bạn test tính năng báo Admin)
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    const db = loadDB();
    const senderId = 'test_customer';

    if (!db.conversations[senderId]) {
      db.conversations[senderId] = {
        senderId,
        userName: "Khách Test Giả Lập",
        userAvatar: "",
        aiEnabled: true,
        needsAdmin: false,
        unread: 0,
        updatedAt: Date.now(),
        lastMessage: message,
        messages: []
      };
    }

    const conv = db.conversations[senderId];
    conv.messages.push({
      id: 'msg_' + Date.now(),
      sender: 'customer',
      text: message,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });
    conv.lastMessage = message;
    conv.updatedAt = Date.now();

    if (!conv.aiEnabled) {
      conv.needsAdmin = true;
      saveDB(db);
      broadcastRealtime('CONVERSATION_UPDATED', { conversation: conv });
      return res.json({
        success: true,
        needsAdmin: true,
        reply: "[AI đang tạm dừng cho khách này - Chờ Quản trị viên trả lời trong tab Hộp thư Live Chat]"
      });
    }

    const aiResult = await generateAIResponse(message, conv.messages);

    conv.messages.push({
      id: 'msg_' + (Date.now() + 1),
      sender: 'ai',
      text: aiResult.reply,
      needsAdmin: aiResult.needsAdmin,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });
    conv.lastMessage = "AI: " + aiResult.reply;
    conv.updatedAt = Date.now();

    if (aiResult.needsAdmin) {
      conv.needsAdmin = true;
      conv.aiEnabled = false; // Tự động ngắt AI để Admin vào trả lời
    }

    saveDB(db);
    broadcastRealtime('CONVERSATION_UPDATED', { conversation: conv, alertAdmin: aiResult.needsAdmin });

    res.json({ success: true, reply: aiResult.reply, needsAdmin: aiResult.needsAdmin });
  } catch (error) {
    res.status(500).json({ success: false, reply: "Lỗi AI: " + error.message });
  }
});

// ==========================================
// 3. HÀM XỬ LÝ AI & PHÁT HIỆN CÂU HỎI NGOÀI TÀI LIỆU
// ==========================================
async function generateAIResponse(userMessage, chatHistory = []) {
  const db = loadDB();
  const { config, persona, documents } = db;
  const activeDocs = documents.filter(d => d.active);
  const knowledgeText = activeDocs.map((d, idx) => `--- TÀI LIỆU ${idx + 1}: ${d.title} ---\n${d.content}`).join('\n\n');

  // Lấy 6 tin nhắn gần nhất để AI hiểu ngữ cảnh cuộc trò chuyện
  const recentContext = chatHistory.slice(-6).map(m => {
    const roleName = m.sender === 'customer' ? 'Khách hàng' : 'Nhân viên Lái Hộ';
    return `${roleName}: ${m.text}`;
  }).join('\n');

  const systemInstruction = `Bạn là nhân viên tư vấn trực Fanpage có tên là "${persona.botName}".
Cách xưng hô: "${persona.pronoun}". Phong cách: ${persona.tone}.

NHIỆM VỤ QUAN TRỌNG:
1. Chỉ sử dụng thông tin trong [TÀI LIỆU CÔNG TY] bên dưới để trả lời chính xác, rõ ràng, ngắn gọn cho khách hàng hoặc tài xế. Tuyệt đối KHÔNG tự bịa đặt giá cước hay chính sách ngoài tài liệu (vẫn được phép chào hỏi xã giao, cảm ơn, hoặc hỏi lại nhu cầu nếu khách chỉ mới chào).
2. QUY TẮC CHUYỂN GIAO QUẢN TRỊ VIÊN (BẮT BUỘC): Nếu khách hàng hỏi một vấn đề cụ thể KHÔNG CÓ trong [TÀI LIỆU CÔNG TY], hoặc khiếu nại sự cố chuyến đi, hoặc yêu cầu gặp nhân viên/quản trị viên/người thật, bạn BẮT BUỘC phải viết chính xác cụm từ "[NEED_ADMIN]" ở đầu câu trả lời, sau đó nối tiếp bằng câu thông báo: "${persona.fallback}"

[TÀI LIỆU CÔNG TY]:
${knowledgeText}

[LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY]:
${recentContext}`;

  if (!config.aiApiKey || config.aiApiKey.trim() === "") {
    return {
      reply: "Vui lòng vào tab '1. Kết nối & API Key' để dán mã API Key của AI.",
      needsAdmin: true
    };
  }

  let rawReply = "";

  if (config.aiProvider === 'gemini') {
    const model = config.aiModel || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.aiApiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.2 }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Lỗi gọi Gemini API");
    rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text || `[NEED_ADMIN] ${persona.fallback}`;
  } else {
    const model = config.aiModel || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.aiApiKey.trim()}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: userMessage }],
        temperature: 0.2
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Lỗi gọi OpenAI API");
    rawReply = data.choices?.[0]?.message?.content || `[NEED_ADMIN] ${persona.fallback}`;
  }

  // Kiểm tra xem AI có gắn cờ [NEED_ADMIN] không
  const needsAdmin = rawReply.includes('[NEED_ADMIN]');
  const cleanReply = rawReply.replace(/\[NEED_ADMIN\]/g, '').trim();

  return { reply: cleanReply, needsAdmin };
}

// Lấy Tên và Avatar thật của khách từ Facebook Graph API
async function fetchFacebookUserProfile(psid, pageAccessToken) {
  if (!pageAccessToken) return { name: `Khách #${psid.slice(-4)}`, avatar: "" };
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${psid}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken.trim()}`);
    if (res.ok) {
      const data = await res.json();
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      return {
        name: fullName || `Khách #${psid.slice(-4)}`,
        avatar: data.profile_pic || ""
      };
    }
  } catch (e) {
    // Bỏ qua nếu Facebook giới hạn quyền lấy profile_pic
  }
  return { name: `Khách hàng #${psid.slice(-4)}`, avatar: "" };
}

// ==========================================
// 4. FACEBOOK MESSENGER WEBHOOK (CHẠY THẬT)
// ==========================================
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

    for (const entry of body.entry) {
      const event = entry.messaging?.[0];
      if (event?.message?.text && !event.message.is_echo) {
        const senderPsid = event.sender.id;
        const customerText = event.message.text;
        const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');

        console.log(`📩 Khách (${senderPsid}): ${customerText}`);

        let db = loadDB();

        // Nếu là khách mới lần đầu nhắn tin, tạo cuộc hội thoại mới
        if (!db.conversations[senderPsid]) {
          const profile = await fetchFacebookUserProfile(senderPsid, db.config.pageAccessToken);
          db.conversations[senderPsid] = {
            senderId: senderPsid,
            userName: profile.name,
            userAvatar: profile.avatar,
            aiEnabled: true,
            needsAdmin: false,
            unread: 0,
            updatedAt: Date.now(),
            lastMessage: customerText,
            messages: []
          };
        }

        const conv = db.conversations[senderPsid];
        conv.messages.push({
          id: 'msg_' + Date.now(),
          sender: 'customer',
          text: customerText,
          time: timeNow
        });
        conv.lastMessage = customerText;
        conv.updatedAt = Date.now();
        conv.unread = (conv.unread || 0) + 1;

        saveDB(db);
        // Đẩy tin nhắn của khách lên màn hình Web của Admin ngay lập tức (Realtime)
        broadcastRealtime('NEW_CUSTOMER_MESSAGE', { conversation: conv });

        // Kiểm tra nếu Bot toàn cục đang tắt HOẶC khách này đang ở chế độ chờ Admin hỗ trợ
        if (!db.config.botActive || !conv.aiEnabled) {
          conv.needsAdmin = true;
          saveDB(db);
          broadcastRealtime('CONVERSATION_UPDATED', { conversation: conv, alertAdmin: true });
          continue;
        }

        // Gọi AI trả lời
        try {
          const aiResult = await generateAIResponse(customerText, conv.messages);
          await sendFacebookMessage(senderPsid, aiResult.reply, db.config.pageAccessToken);

          db = loadDB();
          const currentConv = db.conversations[senderPsid];
          currentConv.messages.push({
            id: 'msg_' + (Date.now() + 1),
            sender: 'ai',
            text: aiResult.reply,
            needsAdmin: aiResult.needsAdmin,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN')
          });
          currentConv.lastMessage = "AI: " + aiResult.reply;
          currentConv.updatedAt = Date.now();

          // Nếu AI không trả lời được -> Bật cờ báo động đỏ cho Admin & Tạm dừng AI của khách này
          if (aiResult.needsAdmin) {
            currentConv.needsAdmin = true;
            currentConv.aiEnabled = false;
            console.log(`⚠️ CẢNH BÁO: Khách (${senderPsid}) cần Quản trị viên hỗ trợ trực tiếp!`);
          }

          saveDB(db);
          broadcastRealtime('CONVERSATION_UPDATED', {
            conversation: currentConv,
            alertAdmin: aiResult.needsAdmin
          });

        } catch (e) {
          console.error("❌ Lỗi xử lý tin nhắn:", e.message);
          db = loadDB();
          if (db.conversations[senderPsid]) {
            db.conversations[senderPsid].needsAdmin = true;
            saveDB(db);
            broadcastRealtime('CONVERSATION_UPDATED', { conversation: db.conversations[senderPsid], alertAdmin: true });
          }
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
});

async function sendFacebookMessage(recipientId, text, token) {
  if (!token) throw new Error("Chưa nhập Page Access Token!");
  const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Lỗi gửi tin nhắn Facebook");
  console.log(`🤖 Đã gửi tin nhắn tới (${recipientId}) thành công!`);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server Lái Hộ AI Hub đang chạy tại cổng ${PORT}`);
});