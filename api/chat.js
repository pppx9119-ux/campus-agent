export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: '仅支持 POST' });
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return res.status(500).json({ error: '服务器未配置 DEEPSEEK_API_KEY' });

  const { prompt, json } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 6000) {
    return res.status(400).json({ error: '输入为空或过长（上限6000字）' });
  }
  try {
    const body = {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    };
    if (json) body.response_format = { type: 'json_object' };
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || 'AI 服务出错' });
    res.status(200).json({ text: (d.choices && d.choices[0] && d.choices[0].message.content) || '' });
  } catch (e) {
    res.status(500).json({ error: '调用 AI 失败，请稍后重试' });
  }
}
