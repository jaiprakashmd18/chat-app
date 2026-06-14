const AIConversation = require('../models/AIConversation');

const SYSTEM_PROMPT = `You are MeAI, a helpful AI assistant built into MeCHAT, a modern chat platform. You help users with:
- Answering questions on any topic
- Smart reply suggestions
- Message translation
- Conversation summarization
- Study assistance
- Content generation
- Personal assistance

Be concise, friendly, and helpful. If you don't know something, say so. Always respond in the same language the user writes in.`;

const callAI = async (messages) => {
  if (!process.env.OPENAI_API_KEY) {
    const userMsg = messages[messages.length - 1].content.toLowerCase();
    if (userMsg.includes('hello') || userMsg.includes('hi')) {
      return "Hello! I'm MeAI, your AI assistant. How can I help you today?";
    }
    if (userMsg.includes('translate')) {
      return "I'd be happy to help with translation! Please provide the text you want to translate and the target language.";
    }
    if (userMsg.includes('summarize')) {
      return "Sure! Please share the conversation or text you'd like me to summarize.";
    }
    return "I'm MeAI, your intelligent assistant! I can help you with questions, translations, summaries, and more. What would you like to know?";
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error('AI service error');
  const data = await response.json();
  return data.choices[0].message.content;
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await AIConversation.find({ user: req.user.id, isActive: true })
      .select('title updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const conversation = await AIConversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required' });

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, user: req.user.id });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        user: req.user.id,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    conversation.messages.push({ role: 'user', content: message });

    const contextMessages = conversation.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await callAI(contextMessages);

    conversation.messages.push({ role: 'assistant', content: aiResponse });
    await conversation.save();

    res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId: conversation._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    await AIConversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.smartReply = async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) return res.status(400).json({ success: false, message: 'Context required' });

    const prompt = `Given this conversation context, suggest 3 brief, natural reply options. Format as JSON array of strings only.\n\nContext: ${context}`;
    const response = await callAI([{ role: 'user', content: prompt }]);

    let suggestions;
    try {
      suggestions = JSON.parse(response);
    } catch {
      suggestions = ["Sure!", "Sounds good!", "Let me think about it"];
    }

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
