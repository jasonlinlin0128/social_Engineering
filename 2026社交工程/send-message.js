// 透過官方帳號（Messaging API）把演練訊息 push 到指定 LINE 群組。
// 祕密不寫死，執行時用環境變數帶入：
//   LINE_TOKEN=你的ChannelAccessToken  GROUP_ID=Cxxxxxxxx  node send-message.js
//
// 先測試：把 GROUP_ID 換成「你自己的 userId（Uxxxx，webhook log 也會出現）」，
//         訊息會 push 到你自己，確認沒問題再改成群組的 groupId 正式發。

const TOKEN = process.env.LINE_TOKEN;
const TO = process.env.GROUP_ID;

if (!TOKEN || !TO) {
  console.error(
    "缺少環境變數。用法：LINE_TOKEN=xxx GROUP_ID=Cxxx node send-message.js",
  );
  process.exit(1);
}

// 演練誘餌文案（與 演練規劃.md 一致）。LINE 會依 LIFF 頁的 OG 標籤自動產生連結預覽。
const text = `各位同仁好，因本堂 AI-first 工作坊的階段性課程/實作已告一段落，為了配合管理部與經企室後續的成果備份與 EIP 知識庫建立，這個臨時的「教學討論群」即將關閉。

後續的進階優化追蹤、工具更新與問題回覆，將全面移轉至公司核可的官方永久專屬社群。

本群組預計於本週五正式停用並解散，請各位同仁現在順手點擊下方連結，移轉至新成立的官方專屬群組，以免漏掉後續的通知：
👉 https://liff.line.me/2008536456-eRYM8pMv

感謝大家的配合！`;

(async () => {
  const r = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ to: TO, messages: [{ type: "text", text }] }),
  });
  console.log("HTTP", r.status, await r.text());
  if (r.status === 200) console.log("✅ 已送出");
  else
    console.log(
      "❌ 送出失敗，檢查 token / groupId / 是否已加入群組 / push 額度",
    );
})();
