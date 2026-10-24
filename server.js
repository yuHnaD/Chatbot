// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;
// // const DB_FILE = path.join(__dirname, 'database.json');

// const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
// const DB_FILE = path.join(DATA_DIR, 'database.json');

// app.use(cors());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.static(__dirname));

// // Danh sách các kết nối Realtime (SSE) đang mở từ trình duyệt Admin
// let adminClients = [];

// // Khởi tạo Database mặc định với toàn bộ tài liệu Lái Hộ chính thức
// const defaultData = {
//   config: {
//     botActive: true,
//     pageName: "Lái Hộ - Tải App & Đặt Tài Xế",
//     pageAccessToken: "",
//     verifyToken: "my_secret_verify_token_123",
//     aiProvider: "gemini",
//     aiApiKey: "",
//     aiModel: "gemini-2.5-flash"
//   },
//   persona: {
//     botName: "Linh - Trợ lý Lái Hộ",
//     pronoun: "Em - Anh/Chị",
//     tone: "Thân thiện, nhiệt tình, chuyên nghiệp, khéo léo suy luận từ khóa viết tắt hoặc không dấu của khách",
//     fallback: "Dạ vấn đề này hiện nằm ngoài thông tin em đang nắm giữ. Em đã ghi nhận và chuyển câu hỏi này cho Quản trị viên hỗ trợ giải đáp cho Anh/Chị sớm nhất nhé ạ!"
//   },
//   documents: [
//     {
//       id: "doc_laiho_1",
//       title: "Quy trình đặt xe & Thông tin chung Laiho",
//       content: "- Các bước đặt tài xế lái hộ trên app Laiho:\n  + Nhập Điểm đón/Điểm đi\n  + Chọn dịch vụ Tài xế Ô tô / Tài xế Xe máy / Tài xế đi tỉnh / Xe tải Van điện\n  + Chọn phương thức thanh toán\n  + Nhập mã khuyến mãi (nếu có)\n  + Chọn Đặt xe để hệ thống tìm tài xế gần nhất\n- Tải app tại: https://laiho.vn/",
//       active: true,
//       updatedAt: "Hôm nay"
//     },
//     {
//       id: "doc_laiho_2",
//       title: "Quy định chuyến đi & Giá cước",
//       content: "- Thuế VAT áp dụng cho các chuyến đi là 8%.\n- Phí dịch vụ (thu thêm ngoài cước): 10.000 VNĐ đối với xe ô tô và 7.000 VNĐ đối với xe máy.\n- Hệ thống điều chỉnh giảm giá chuyến cho khách đặt để tăng lượng khách.\n- Quy định khi khách đặt không có tài xế nhận: Bộ phận Điều phối sẽ chủ động gọi khách trước, tuyệt đối không để tài xế tự thỏa thuận (deal) giá.\n- Đã bãi bỏ chính sách gán chuyến không ăn chia đối với tài xế.\n- Hệ thống đã đấu nối thêm phương tiện xe tải Van điện lên app Laiho.",
//       active: true,
//       updatedAt: "Hôm nay"
//     },
//     {
//       id: "doc_laiho_3",
//       title: "Yêu cầu hồ sơ & Chiết khấu cho Tài xế",
//       content: "- Yêu cầu đăng ký:\n  + GPLX hạng A hoặc B2 trở lên (còn hạn).\n  + Kinh nghiệm lái xe >3 năm.\n  + CMND/CCCD và đã khai báo VNEID cấp 2.\n  + Giấy khám sức khỏe mẫu TT36.\n- Tỷ lệ chiết khấu:\n  + Tài xế ô tô: 75% - 25% (Tài xế nhận 75%).\n  + Tài xế xe máy: 80% - 20% (Tài xế nhận 80%).\n- Ưu đãi đặc biệt 1: Nộp kèm Lý lịch tư pháp hoặc Giấy xác nhận hạnh kiểm tại địa phương ➔ Hưởng ưu đãi chiết khấu xe hơi 12 tháng.\n- Ưu đãi đặc biệt 2: Tài xế giới thiệu khách tải app, khi khách đó đặt chuyến cho chính tài xế đó, tài xế được cộng thêm 5% doanh thu trước thuế và phí.\n- Chi phí ban đầu:\n  + Đồng phục (1 áo sơ mi + 1 áo khoác): Tặng đồng phục 100% khi Bác tài nhận 1 cuốc trên app (thay vì 230.000đ).\n  + Nạp ví tài xế tối thiểu: 200.000 VNĐ.",
//       active: true,
//       updatedAt: "Hôm nay"
//     },
//     {
//       id: "doc_laiho_4",
//       title: "Chính sách Quán đối tác & Chi nhánh",
//       content: "- Chính sách Quán đối tác: Tất cả các quán đối tác khi đặt chuyến thành công sẽ được hưởng 5% doanh thu trước thuế và phí.\n- Địa chỉ chi nhánh đăng ký trực tiếp (Thời gian: 8h - 17h từ Thứ 2 đến Thứ 6):\n  + Hà Nội: Lô 7 LK 16 B1.1 Khu Đô Thị Thanh Hà, Xã Bình Minh, TP Hà Nội.\n  + Hồ Chí Minh: 132 Lê Tuấn Mậu, Phường 13, Quận 6, TP.HCM.",
//       active: true,
//       updatedAt: "Hôm nay"
//     }
//   ],
//   conversations: {}
// };

// function loadDB() {
//   if (!fs.existsSync(DB_FILE)) {
//     fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
//   }
//   return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
// }

// function saveDB(data) {
//   fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
// }

// function broadcastToAdmins(eventType, payload) {
//   adminClients.forEach(client => {
//     client.write(`data: ${JSON.stringify({ type: eventType, payload })}\n\n`);
//   });
// }

// // ==========================================
// // API REALTIME STREAM (SSE)
// // ==========================================
// app.get('/api/stream', (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//   res.flushHeaders();

//   adminClients.push(res);
//   req.on('close', () => {
//     adminClients = adminClients.filter(client => client !== res);
//   });
// });

// // ==========================================
// // API QUẢN TRỊ & LIVE CHAT
// // ==========================================
// app.get('/api/data', (req, res) => {
//   res.json(loadDB());
// });

// app.post('/api/config', (req, res) => {
//   const db = loadDB();
//   db.config = { ...db.config, ...req.body };
//   saveDB(db);
//   res.json({ success: true, config: db.config });
// });

// app.post('/api/persona', (req, res) => {
//   const db = loadDB();
//   db.persona = { ...db.persona, ...req.body };
//   saveDB(db);
//   res.json({ success: true, persona: db.persona });
// });

// app.post('/api/documents', (req, res) => {
//   const db = loadDB();
//   const { action, doc, id } = req.body;
//   if (action === 'add') {
//     db.documents.unshift({ id: 'doc_' + Date.now(), title: doc.title, content: doc.content, active: true, updatedAt: new Date().toLocaleDateString('vi-VN') });
//   } else if (action === 'update') {
//     const idx = db.documents.findIndex(d => d.id === doc.id);
//     if (idx !== -1) db.documents[idx] = { ...db.documents[idx], ...doc, updatedAt: new Date().toLocaleDateString('vi-VN') };
//   } else if (action === 'toggle') {
//     const item = db.documents.find(d => d.id === id);
//     if (item) item.active = !item.active;
//   } else if (action === 'delete') {
//     db.documents = db.documents.filter(d => d.id !== id);
//   }
//   saveDB(db);
//   res.json({ success: true, documents: db.documents });
// });

// // Quản trị viên gửi tin nhắn thủ công từ khung chat Admin ra Messenger thật
// app.post('/api/conversations/reply', async (req, res) => {
//   const { senderId, text } = req.body;
//   const db = loadDB();
//   try {
//     await sendFacebookMessage(senderId, text, db.config.pageAccessToken);

//     if (!db.conversations[senderId]) {
//       db.conversations[senderId] = { senderId, userName: `Khách ${senderId.slice(-4)}`, userAvatar: '', messages: [], aiEnabled: true, needsAdmin: false };
//     }

//     const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
//     db.conversations[senderId].messages.push({ sender: 'admin', text, time: timeStr });
//     db.conversations[senderId].lastMessage = `Admin: ${text}`;
//     db.conversations[senderId].updatedAt = Date.now();
//     saveDB(db);

//     broadcastToAdmins('CONVERSATION_UPDATED', { conversation: db.conversations[senderId] });
//     res.json({ success: true, conversation: db.conversations[senderId] });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post('/api/conversations/status', (req, res) => {
//   const { senderId, aiEnabled, needsAdmin, markRead } = req.body;
//   const db = loadDB();
//   if (db.conversations[senderId]) {
//     if (aiEnabled !== undefined) db.conversations[senderId].aiEnabled = aiEnabled;
//     if (needsAdmin !== undefined) db.conversations[senderId].needsAdmin = needsAdmin;
//     saveDB(db);
//     broadcastToAdmins('CONVERSATION_UPDATED', { conversation: db.conversations[senderId] });
//   }
//   res.json({ success: true });
// });

// app.post('/api/test-chat', async (req, res) => {
//   try {
//     const { message } = req.body;
//     const aiResult = await generateAIResponse(message);
//     res.json({ success: true, reply: aiResult.reply, needsAdmin: aiResult.needsAdmin });
//   } catch (error) {
//     res.status(500).json({ success: false, reply: "Lỗi AI: " + error.message, needsAdmin: false });
//   }
// });

// // ==========================================
// // XỬ LÝ TRÍ TUỆ NHÂN TẠO THÔNG MINH
// // ==========================================
// async function generateAIResponse(userMessage) {
//   const db = loadDB();
//   const { config, persona, documents } = db;
//   const activeDocs = documents.filter(d => d.active);
//   const knowledgeText = activeDocs.map((d, idx) => `--- TÀI LIỆU ${idx + 1}: ${d.title} ---\n${d.content}`).join('\n\n');

//   const systemInstruction = `Bạn là trợ lý AI thông minh chuyên tư vấn dịch vụ Lái Hộ của công ty.
// Tên bạn: "${persona.botName}". Xưng hô: "${persona.pronoun}". Phong cách: ${persona.tone}.

// QUY TẮC PHẢN HỒI THÔNG MINH:
// 1. Khách hàng thường nhắn tin bằng tiếng Việt không dấu, viết tắt, hoặc diễn đạt bằng ngôn từ đời thường. Bạn phải CỐ GẮNG HẾT SỨC suy luận ngữ cảnh, quy đổi các từ không dấu/viết tắt (VD: "gia cuoc", "phi ship", "dk tai xe", "chiet khau", "đ/c", "hcm", "hn") về đúng nghĩa nghiệp vụ trong tài liệu để trả lời chuẩn xác.
// 2. Chỉ sử dụng thông tin trong [TÀI LIỆU CÔNG TY] bên dưới để tư vấn. Không tự bịa đặt dữ liệu ngoài tài liệu.
// 3. Nếu sau khi đã cố gắng suy luận ngữ cảnh mà vấn đề hoàn toàn KHÔNG CÓ TRONG TÀI LIỆU, bạn PHẢI trả lời nguyên văn câu dự phòng sau đây: "${persona.fallback}"

// [TÀI LIỆU CÔNG TY]:
// ${knowledgeText}`;

//   if (!config.aiApiKey) return { reply: "Chưa cấu hình API Key trên web quản trị!", needsAdmin: false };

//   if (config.aiProvider === 'gemini') {
//     const model = config.aiModel || 'gemini-2.5-flash';
//     const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.aiApiKey.trim()}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         system_instruction: { parts: [{ text: systemInstruction }] },
//         contents: [{ role: 'user', parts: [{ text: userMessage }] }],
//         generationConfig: { temperature: 0.2 }
//       })
//     });
//     const data = await res.json();
//     const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || persona.fallback;
//     const needsAdmin = replyText.includes(persona.fallback) || replyText.includes("ngoài thông tin");
//     return { reply: replyText, needsAdmin };
//   } else {
//     const model = config.aiModel || 'gpt-4o-mini';
//     const res = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.aiApiKey.trim()}` },
//       body: JSON.stringify({
//         model,
//         messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: userMessage }],
//         temperature: 0.2
//       })
//     });
//     const data = await res.json();
//     const replyText = data.choices?.[0]?.message?.content || persona.fallback;
//     const needsAdmin = replyText.includes(persona.fallback) || replyText.includes("ngoài thông tin");
//     return { reply: replyText, needsAdmin };
//   }
// }

// // ==========================================
// // WEBHOOK FACEBOOK MESSENGER
// // ==========================================
// app.get('/webhook', (req, res) => {
//   const db = loadDB();
//   if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === db.config.verifyToken) {
//     console.log('✅ WEBHOOK_VERIFIED: Facebook đã kết nối thành công!');
//     res.status(200).send(req.query['hub.challenge']);
//   } else {
//     res.sendStatus(403);
//   }
// });

// app.post('/webhook', async (req, res) => {
//   const body = req.body;
//   if (body.object === 'page') {
//     res.status(200).send('EVENT_RECEIVED');
//     const db = loadDB();
//     if (!db.config.botActive) return;

//     for (const entry of body.entry) {
//       const event = entry.messaging?.[0];
//       if (event?.message?.text && !event.message.is_echo) {
//         const senderPsid = event.sender.id;
//         const text = event.message.text;
//         const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');

//         // Khởi tạo thông tin khách mới nếu chưa có
//         if (!db.conversations[senderPsid]) {
//           // GỌI API LẤY TÊN VÀ AVATAR THẬT TỪ FACEBOOK
//           const fbProfile = await getFacebookUserProfile(senderPsid, db.config.pageAccessToken);

//           db.conversations[senderPsid] = {
//             senderId: senderPsid,
//             userName: fbProfile.fullName,
//             userAvatar: fbProfile.avatar,
//             messages: [],
//             aiEnabled: true,
//             needsAdmin: false
//           };
//         }

//         const conv = db.conversations[senderPsid];
//         conv.messages.push({ sender: 'customer', text, time: timeStr });
//         conv.lastMessage = text;
//         conv.updatedAt = Date.now();

//         if (conv.aiEnabled && db.config.botActive) {
//           try {
//             const aiResult = await generateAIResponse(text);
            
//             await sendFacebookMessage(senderPsid, aiResult.reply, db.config.pageAccessToken);

//             conv.messages.push({ sender: 'ai', text: aiResult.reply, time: timeStr, needsAdmin: aiResult.needsAdmin });
//             conv.lastMessage = `AI: ${aiResult.reply}`;

//             if (aiResult.needsAdmin) {
//               conv.needsAdmin = true;
//             }
//           } catch (e) {
//             console.error("Lỗi gọi AI hoặc gửi tin nhắn FB:", e.message);
//           }
//         } else {
//           conv.needsAdmin = true;
//         }

//         saveDB(db);

//         broadcastToAdmins('NEW_CUSTOMER_MESSAGE', {
//           conversation: conv,
//           alertAdmin: conv.needsAdmin
//         });
//       }
//     }
//   } else {
//     res.sendStatus(404);
//   }
// });

// // async function sendFacebookMessage(recipientId, text, token) {
// //   if (!token) throw new Error("Chưa nhập Page Access Token!");
// //   await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token.trim()}`, {
// //     method: 'POST',
// //     headers: { 'Content-Type': 'application/json' },
// //     body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
// //   });
// // }

// async function sendFacebookMessage(recipientId, text, token) {
//   if (!token) {
//     console.error("❌ LỖI GỬI FB: Chưa nhập Page Access Token trên giao diện quản trị!");
//     throw new Error("Chưa nhập Page Access Token!");
//   }

//   const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${token.trim()}`;
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       recipient: { id: recipientId },
//       message: { text: text }
//     })
//   });

//   const data = await response.json();
  
//   if (!response.ok || data.error) {
//     console.error("❌ FACEBOOK API TỪ CHỐI GỬI TIN NHẮN:", JSON.stringify(data.error || data));
//     throw new Error(data.error?.message || "Lỗi gọi Facebook Graph API");
//   }

//   console.log(`🤖 Đã đẩy tin nhắn ra Messenger thành công cho khách (${recipientId})!`);
// }

// // Hàm gọi Facebook Graph API để lấy Tên và Avatar thật của khách hàng
// async function getFacebookUserProfile(senderId, pageAccessToken) {
//   try {
//     const url = `https://graph.facebook.com/v19.0/${senderId}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken.trim()}`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (response.ok && !data.error) {
//       const firstName = data.first_name || '';
//       const lastName = data.last_name || '';
//       const fullName = (firstName + ' ' + lastName).trim() || `Khách ${senderId.slice(-4)}`;
//       const avatar = data.profile_pic || '';
//       return { fullName, avatar };
//     }
//   } catch (e) {
//     console.error("Không lấy được profile Facebook của khách:", e.message);
//   }
//   return { fullName: `Khách ${senderId.slice(-4)}`, avatar: '' };
// }

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
// });

const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

let adminClients = [];

// Khởi tạo kết nối MySQL pool sử dụng biến môi trường tự động từ Railway
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 3306,
  ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : null,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Hàm khởi tạo bảng CSDL và dữ liệu mặc định nếu chưa có
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(50) PRIMARY KEY,
        \`value\` LONGTEXT
      )
    `);

    // Kiểm tra xem đã có config chưa, nếu chưa thì tạo mặc định
    const [rows] = await pool.query('SELECT * FROM settings WHERE \`key\` = ?', ['app_data']);
    if (rows.length === 0) {
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
          tone: "Thân thiện, nhiệt tình, chuyên nghiệp, khéo léo suy luận từ khóa viết tắt hoặc không dấu của khách",
          fallback: "Dạ vấn đề này hiện nằm ngoài thông tin em đang nắm giữ. Em đã ghi nhận và chuyển câu hỏi này cho Quản trị viên hỗ trợ giải đáp cho Anh/Chị sớm nhất nhé ạ!"
        },
        documents: [
          {
            id: "doc_laiho_1",
            title: "Quy trình đặt xe & Thông tin chung Laiho",
            content: "- Các bước đặt tài xế lái hộ trên app Laiho:\n  + Nhập Điểm đón/Điểm đi\n  + Chọn dịch vụ Tài xế Ô tô / Tài xế Xe máy / Tài xế đi tỉnh / Xe tải Van điện\n  + Chọn phương thức thanh toán\n  + Nhập mã khuyến mãi (nếu có)\n  + Chọn Đặt xe để hệ thống tìm tài xế gần nhất\n- Tải app tại: https://laiho.vn/",
            active: true,
            alertAdmin: true,
            updatedAt: "Hôm nay"
          },
          {
            id: "doc_laiho_2",
            title: "Quy định chuyến đi & Giá cước",
            content: "- Thuế VAT áp dụng cho các chuyến đi là 8%.\n- Phí dịch vụ (thu thêm ngoài cước): 10.000 VNĐ đối với xe ô tô và 7.000 VNĐ đối với xe máy.\n- Hệ thống điều chỉnh giảm giá chuyến cho khách đặt để tăng lượng khách.\n- Quy định khi khách đặt không có tài xế nhận: Bộ phận Điều phối sẽ chủ động gọi khách trước, tuyệt đối không để tài xế tự thỏa thuận (deal) giá.\n- Đã bãi bỏ chính sách gán chuyến không ăn chia đối với tài xế.\n- Hệ thống đã đấu nối thêm phương tiện xe tải Van điện lên app Laiho.",
            active: true,
            alertAdmin: true,
            updatedAt: "Hôm nay"
          },
          {
            id: "doc_laiho_3",
            title: "Yêu cầu hồ sơ & Chiết khấu cho Tài xế",
            content: "- Yêu cầu đăng ký:\n  + GPLX hạng A hoặc B2 trở lên (còn hạn).\n  + Kinh nghiệm lái xe >3 năm.\n  + CMND/CCCD và đã khai báo VNEID cấp 2.\n  + Giấy khám sức khỏe mẫu TT36.\n- Tỷ lệ chiết khấu:\n  + Tài xế ô tô: 75% - 25% (Tài xế nhận 75%).\n  + Tài xế xe máy: 80% - 20% (Tài xế nhận 80%).\n- Ưu đãi đặc biệt 1: Nộp kèm Lý lịch tư pháp hoặc Giấy xác nhận hạnh kiểm tại địa phương ➔ Hưởng ưu đãi chiết khấu xe hơi 12 tháng.\n- Ưu đãi đặc biệt 2: Tài xế giới thiệu khách tải app, khi khách đó đặt chuyến cho chính tài xế đó, tài xế được cộng thêm 5% doanh thu trước thuế và phí.\n- Chi phí ban đầu:\n  + Đồng phục (1 áo sơ mi + 1 áo khoác): Tặng đồng phục 100% khi Bác tài nhận 1 cuốc trên app (thay vì 230.000đ).\n  + Nạp ví tài xế tối thiểu: 200.000 VNĐ.",
            active: true,
            alertAdmin: true,
            updatedAt: "Hôm nay"
          },
          {
            id: "doc_laiho_4",
            title: "Chính sách Quán đối tác & Chi nhánh",
            content: "- Chính sách Quán đối tác: Tất cả các quán đối tác khi đặt chuyến thành công sẽ được hưởng 5% doanh thu trước thuế và phí.\n- Địa chỉ chi nhánh đăng ký trực tiếp (Thời gian: 8h - 17h từ Thứ 2 đến Thứ 6):\n  + Hà Nội: Lô 7 LK 16 B1.1 Khu Đô Thị Thanh Hà, Xã Bình Minh, TP Hà Nội.\n  + Hồ Chí Minh: 132 Lê Tuấn Mậu, Phường 13, Quận 6, TP.HCM.",
            active: true,
            alertAdmin: true,
            updatedAt: "Hôm nay"
          }
        ],
        conversations: {}
      };
      await pool.query('INSERT INTO settings (\`key\`, \`value\`) VALUES (?, ?)', ['app_data', JSON.stringify(defaultData)]);
    }
    console.log("✅ Kết nối và khởi tạo MySQL thành công!");
  } catch (err) {
    console.error("❌ Lỗi khởi tạo cơ sở dữ liệu MySQL:", err);
  }
}

initDB();

async function loadDB() {
  try {
    const [rows] = await pool.query('SELECT \`value\` FROM settings WHERE \`key\` = ?', ['app_data']);
    if (rows.length > 0) {
      return JSON.parse(rows[0].value);
    }
  } catch (e) {
    console.error("Lỗi đọc DB từ MySQL:", e);
  }
  return null;
}

async function saveDB(data) {
  try {
    await pool.query('UPDATE settings SET \`value\` = ? WHERE \`key\` = ?', [JSON.stringify(data), 'app_data']);
  } catch (e) {
    console.error("Lỗi lưu DB vào MySQL:", e);
  }
}

function broadcastToAdmins(eventType, payload) {
  adminClients.forEach(client => {
    client.write(`data: ${JSON.stringify({ type: eventType, payload })}\n\n`);
  });
}

// Hàm hỗ trợ lấy thời gian định dạng chuẩn giờ Việt Nam (24h)
function getVietnamTimeString() {
  const now = new Date();
  const timeOptions = { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false };
  const dateOptions = { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' };
  
  const timeStr = now.toLocaleTimeString('vi-VN', timeOptions);
  const dateStr = now.toLocaleDateString('vi-VN', dateOptions);
  
  return `${timeStr} ${dateStr}`;
}

// Hàm kiểm tra tin nhắn khách có phải là yêu cầu đặt chuyến lẻ / đặt tài xế không
function isBookingRequest(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const keywords = [
    'đặt xe', 'dat xe', 'đặt tài', 'dat tai', 'đặt chuyến', 'dat chuyen',
    'cần tài xế', 'can tai xe', 'tìm tài xế', 'tim tai xe', 'đặt tài xế', 'dat tai xe',
    'gọi xe', 'goi xe', 'đi từ', 'di tu', 'đón ở', 'don o', 'đón tại', 'don tai'
  ];
  return keywords.some(kw => lower.includes(kw));
}

// ==========================================
// API REALTIME STREAM (SSE)
// ==========================================
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  adminClients.push(res);
  req.on('close', () => {
    adminClients = adminClients.filter(client => client !== res);
  });
});

// ==========================================
// API QUẢN TRỊ & LIVE CHAT
// ==========================================
app.get('/api/data', async (req, res) => {
  const db = await loadDB();
  res.json(db);
});

app.post('/api/config', async (req, res) => {
  const db = await loadDB();
  db.config = { ...db.config, ...req.body };
  await saveDB(db);
  res.json({ success: true, config: db.config });
});

app.post('/api/persona', async (req, res) => {
  const db = await loadDB();
  db.persona = { ...db.persona, ...req.body };
  await saveDB(db);
  res.json({ success: true, persona: db.persona });
});

app.post('/api/documents', async (req, res) => {
  const db = await loadDB();
  const { action, doc, id } = req.body;
  if (action === 'add') {
    db.documents.unshift({ id: 'doc_' + Date.now(), title: doc.title, content: doc.content, active: true, alertAdmin: !!doc.alertAdmin, updatedAt: new Date().toLocaleDateString('vi-VN') });
  } else if (action === 'update') {
    const idx = db.documents.findIndex(d => d.id === doc.id);
    if (idx !== -1) db.documents[idx] = { ...db.documents[idx], ...doc, updatedAt: new Date().toLocaleDateString('vi-VN') };
  } else if (action === 'toggle') {
    const item = db.documents.find(d => d.id === id);
    if (item) item.active = !item.active;
  } else if (action === 'toggleAlert') { 
    const item = db.documents.find(d => d.id === id);
    if (item) item.alertAdmin = !item.alertAdmin;
  } else if (action === 'delete') {
    db.documents = db.documents.filter(d => d.id !== id);
  }
  await saveDB(db);
  res.json({ success: true, documents: db.documents });
});

app.post('/api/conversations/reply', async (req, res) => {
  const { senderId, text } = req.body;
  const db = await loadDB();
  try {
    await sendFacebookMessage(senderId, text, db.config.pageAccessToken);

    if (!db.conversations[senderId]) {
      db.conversations[senderId] = { senderId, userName: `Khách ${senderId.slice(-4)}`, userAvatar: '', messages: [], aiEnabled: true, needsAdmin: false };
    }

    // const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    const timeStr = getVietnamTimeString();
    db.conversations[senderId].messages.push({ sender: 'admin', text, time: timeStr });
    db.conversations[senderId].lastMessage = `Admin: ${text}`;
    db.conversations[senderId].updatedAt = Date.now();
    await saveDB(db);

    broadcastToAdmins('CONVERSATION_UPDATED', { conversation: db.conversations[senderId] });
    res.json({ success: true, conversation: db.conversations[senderId] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/conversations/status', async (req, res) => {
  const { senderId, aiEnabled, needsAdmin, markRead } = req.body;
  const db = await loadDB();
  if (db.conversations[senderId]) {
    if (aiEnabled !== undefined) db.conversations[senderId].aiEnabled = aiEnabled;
    if (needsAdmin !== undefined) db.conversations[senderId].needsAdmin = needsAdmin;
    await saveDB(db);
    broadcastToAdmins('CONVERSATION_UPDATED', { conversation: db.conversations[senderId] });
  }
  res.json({ success: true });
});

app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    const aiResult = await generateAIResponse(message);
    res.json({ success: true, reply: aiResult.reply, needsAdmin: aiResult.needsAdmin });
  } catch (error) {
    res.status(500).json({ success: false, reply: "Lỗi AI: " + error.message, needsAdmin: false });
  }
});

// ==========================================
// XỬ LÝ TRÍ TUỆ NHÂN TẠO THÔNG MINH
// ==========================================
// async function generateAIResponse(userMessage) {
//   const db = await loadDB();
//   const { config, persona, documents } = db;
//   const activeDocs = documents.filter(d => d.active);
//   const alertDocTitles = activeDocs.filter(d => d.alertAdmin).map(d => d.title);
//   const knowledgeText = activeDocs.map((d, idx) => `--- TÀI LIỆU ${idx + 1}: ${d.title} ---\n${d.content}`).join('\n\n');
  
//   const systemInstruction = `Bạn là trợ lý AI thông minh chuyên tư vấn dịch vụ Lái Hộ của công ty.
// Tên bạn: "${persona.botName}". Xưng hô: "${persona.pronoun}". Phong cách: ${persona.tone}.

// QUY TẮC PHẢN HỒI THÔNG MINH:
// 1. Khách hàng thường nhắn tin bằng tiếng Việt không dấu, viết tắt, hoặc diễn đạt bằng ngôn từ đời thường. Bạn phải CỐ GẮNG HẾT SỨC suy luận ngữ cảnh, quy đổi các từ không dấu/viết tắt về đúng nghĩa nghiệp vụ trong tài liệu để trả lời chuẩn xác.
// 2. Chỉ sử dụng thông tin trong [TÀI LIỆU CÔNG TY] bên dưới để tư vấn. Không tự bịa đặt dữ liệu ngoài tài liệu.
// 3. Nếu sau khi đã cố gắng suy luận ngữ cảnh mà vấn đề hoàn toàn KHÔNG CÓ TRONG TÀI LIỆU, bạn PHẢI trả lời nguyên văn câu dự phòng sau đây: "${persona.fallback}"

// [TÀI LIỆU CÔNG TY]:
// ${knowledgeText}`;

//   if (!config.aiApiKey) return { reply: "Chưa cấu hình API Key trên web quản trị!", needsAdmin: false };

//   if (config.aiProvider === 'gemini') {
//     const model = config.aiModel || 'gemini-2.5-flash';
//     const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.aiApiKey.trim()}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         system_instruction: { parts: [{ text: systemInstruction }] },
//         contents: [{ role: 'user', parts: [{ text: userMessage }] }],
//         generationConfig: { temperature: 0.2 }
//       })
//     });
//     const data = await res.json();
//     const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || persona.fallback;
//     const matchedAlertDoc = activeDocs.find(d => d.alertAdmin && (
//       replyText.toLowerCase().includes(d.title.toLowerCase()) || 
//       userMessage.toLowerCase().includes(d.title.toLowerCase())
//     ));
//     const isBooking = isBookingRequest(userMessage);
//     const needsAdmin = matchedAlertDoc || isBooking || replyText.includes(persona.fallback) || replyText.includes("ngoài thông tin");
//     return { reply: replyText, needsAdmin, alertReason: matchedAlertDoc ? matchedAlertDoc.title : null};
//   } else {
//     const model = config.aiModel || 'gpt-4o-mini';
//     const res = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.aiApiKey.trim()}` },
//       body: JSON.stringify({
//         model,
//         messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: userMessage }],
//         temperature: 0.2
//       })
//     });
//     const data = await res.json();
//     const replyText = data.choices?.[0]?.message?.content || persona.fallback;
//     const needsAdmin = replyText.includes(persona.fallback) || replyText.includes("ngoài thông tin");
//     return { reply: replyText, needsAdmin };
//   }
// }  

async function generateAIResponse(userMessage, conversationHistory = []) {
  const db = await loadDB();
  const { config, persona, documents } = db;
  const activeDocs = documents.filter(d => d.active);
  const knowledgeText = activeDocs.map((d, idx) => `--- TÀI LIỆU ${idx + 1}: ${d.title} ---\n${d.content}`).join('\n\n');

  const systemInstruction = `Bạn là trợ lý AI thông minh chuyên tư vấn dịch vụ Lái Hộ của công ty. Tên bạn: "${persona.botName}". Xưng hô: "${persona.pronoun}". Phong cách: ${persona.tone}.
QUY TẮC:
1. Dựa vào LỊCH SỬ TRÒ CHUYỆN bên dưới để nhớ ngữ cảnh khách đang trao đổi.
2. Chỉ dùng thông tin trong [TÀI LIỆU CÔNG TY]. Không tự bịa đặt.
3. Nếu ngoài tài liệu, trả lời: "${persona.fallback}"

[TÀI LIỆU CÔNG TY]:
${knowledgeText}`;

  if (!config.aiApiKey) return { reply: "Chưa cấu hình API Key trên web quản trị!", needsAdmin: false };

  const recentHistory = conversationHistory.slice(-10);

  if (config.aiProvider === 'gemini') {
    const model = config.aiModel || 'gemini-2.5-flash';
    const contents = [
      ...recentHistory.map(m => ({ role: m.sender === 'customer' ? 'user' : 'model', parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.aiApiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system_instruction: { parts: [{ text: systemInstruction }] }, contents, generationConfig: { temperature: 0.2 } })
    });
    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || persona.fallback;
    const isBooking = isBookingRequest(userMessage);
    const needsAdmin = isBooking || replyText.includes(persona.fallback) || replyText.includes("ngoài thông tin");
    return { reply: replyText, needsAdmin, isBooking };
  } else {
    const model = config.aiModel || 'gpt-4o-mini';
    const messages = [
      { role: 'system', content: systemInstruction },
      ...recentHistory.map(m => ({ role: m.sender === 'customer' ? 'user' : 'assistant', content: m.text })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.aiApiKey.trim()}` },
      body: JSON.stringify({ model, messages, temperature: 0.2 })
    });
    const data = await res.json();
    const replyText = data.choices?.[0]?.message?.content || persona.fallback;
    const isBooking = isBookingRequest(userMessage);
    const needsAdmin = isBooking || replyText.includes(persona.fallback) || replyText.includes("ngoài thông tin");
    return { reply: replyText, needsAdmin, isBooking };
  }
}

// ==========================================
// WEBHOOK FACEBOOK MESSENGER
// ==========================================
app.get('/webhook', async (req, res) => {
  const db = await loadDB();
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
    const db = await loadDB();
    if (!db.config.botActive) return;

    for (const entry of body.entry) {
      const event = entry.messaging?.[0];
      if (event?.message?.text && !event.message.is_echo) {
        const senderPsid = event.sender.id;
        const text = event.message.text;
        // const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
        const timeStr = getVietnamTimeString();

        if (!db.conversations[senderPsid]) {
          const fbProfile = await getFacebookUserProfile(senderPsid, db.config.pageAccessToken);
          db.conversations[senderPsid] = {
            senderId: senderPsid,
            userName: fbProfile.fullName,
            userAvatar: fbProfile.avatar,
            messages: [],
            aiEnabled: true,
            needsAdmin: false
          };
        }

        const conv = db.conversations[senderPsid];
        conv.messages.push({ sender: 'customer', text, time: timeStr });
        conv.lastMessage = text;
        conv.updatedAt = Date.now();

        // if (conv.aiEnabled && db.config.botActive) {
        //   try {
        //     const aiResult = await generateAIResponse(text);
        //     await sendFacebookMessage(senderPsid, aiResult.reply, db.config.pageAccessToken);

        //     conv.messages.push({ sender: 'ai', text: aiResult.reply, time: timeStr, needsAdmin: aiResult.needsAdmin });
        //     conv.lastMessage = `AI: ${aiResult.reply}`;

        //     if (aiResult.needsAdmin) {
        //       conv.needsAdmin = true;
        //     }
        //   } catch (e) {
        //     console.error("Lỗi gọi AI hoặc gửi tin nhắn FB:", e.message);
        //   }
        // } else {
        //   conv.needsAdmin = true;
        // }

        if (conv.aiEnabled && db.config.botActive) {
          try {
            // 1. Lưu lại lịch sử cũ trước khi thêm tin nhắn mới của khách
            const historyBeforeNewMessage = [...conv.messages];

            // 2. CHỈ PUSH TIN NHẮN KHÁCH 1 LẦN DUY NHẤT Ở ĐÂY
            conv.messages.push({ sender: 'customer', text, time: timeStr });
            conv.lastMessage = text;
            conv.updatedAt = Date.now();

            // 3. Gọi AI xử lý và truyền lịch sử vào
            const aiResult = await generateAIResponse(text, historyBeforeNewMessage);

            await sendFacebookMessage(senderPsid, aiResult.reply, db.config.pageAccessToken);

            // 4. Push câu trả lời của AI vào mảng
            conv.messages.push({ sender: 'ai', text: aiResult.reply, time: timeStr, needsAdmin: aiResult.needsAdmin });
            conv.lastMessage = `AI: ${aiResult.reply}`;

            if (aiResult.needsAdmin) {
              conv.needsAdmin = true;
            }
          } catch (e) {
            console.error("Lỗi:", e.message);
          }
        }

        await saveDB(db);

        broadcastToAdmins('NEW_CUSTOMER_MESSAGE', {
          conversation: conv,
          alertAdmin: conv.needsAdmin,
          isBooking: isBookingRequest(text)
        });
      }
    }
  } else {
    res.sendStatus(404);
  }
});

async function sendFacebookMessage(recipientId, text, token) {
  if (!token) throw new Error("Chưa nhập Page Access Token!");
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${token.trim()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text: text } })
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Lỗi gọi Facebook Graph API");
  }
}

async function getFacebookUserProfile(senderId, pageAccessToken) {
  try {
    const url = `https://graph.facebook.com/v19.0/${senderId}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken.trim()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok && !data.error) {
      const fullName = (data.first_name + ' ' + data.last_name).trim() || `Khách ${senderId.slice(-4)}`;
      const avatar = data.profile_pic || '';
      return { fullName, avatar };
    }
  } catch (e) {}
  return { fullName: `Khách ${senderId.slice(-4)}`, avatar: '' };
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
