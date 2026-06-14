const Group = require('../models/Group');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { generateInviteCode } = require('../utils/helpers');
const { cloudinary } = require('../config/cloudinary');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPublic, memberIds = [] } = req.body;

    const chat = await Chat.create({ type: 'group', participants: [req.user.id, ...memberIds] });

    const group = await Group.create({
      name,
      description,
      isPublic,
      chat: chat._id,
      inviteCode: generateInviteCode(),
      members: [
        { user: req.user.id, role: 'owner' },
        ...memberIds.map(id => ({ user: id, role: 'member' })),
      ],
    });

    chat.group = group._id;
    await chat.save();

    await Message.create({ chat: chat._id, sender: req.user.id, content: `${req.user.displayName} created the group`, type: 'system', systemType: 'group_created' });

    await group.populate('members.user', 'username displayName avatar status');
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'username displayName avatar status statusMessage lastSeen')
      .populate('chat');

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const isMember = group.members.some(m => m.user._id.toString() === req.user.id);
    if (!isMember && !group.isPublic) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    res.status(200).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const member = group.members.find(m => m.user.toString() === req.user.id);
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const allowedFields = ['name', 'description', 'isPublic', 'rules', 'settings'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) group[field] = req.body[field];
    });

    await group.save();
    res.status(200).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const requestingMember = group.members.find(m => m.user.toString() === req.user.id);
    if (!requestingMember || (group.settings.onlyAdminsCanAddMembers && !['owner', 'admin'].includes(requestingMember.role))) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    const isAlreadyMember = group.members.some(m => m.user.toString() === userId);
    if (isAlreadyMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    group.members.push({ user: userId, role: 'member' });
    await group.save();

    await Chat.findByIdAndUpdate(group.chat, { $addToSet: { participants: userId } });

    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: 'group_invite',
      title: 'Added to Group',
      body: `${req.user.displayName} added you to ${group.name}`,
      data: { groupId: group._id },
    });

    res.status(200).json({ success: true, message: 'Member added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const requestingMember = group.members.find(m => m.user.toString() === req.user.id);
    const targetMember = group.members.find(m => m.user.toString() === userId);

    if (!requestingMember || !targetMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const roleHierarchy = { owner: 3, admin: 2, moderator: 1, member: 0 };
    if (roleHierarchy[requestingMember.role] <= roleHierarchy[targetMember.role] && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    group.members = group.members.filter(m => m.user.toString() !== userId);
    await group.save();
    await Chat.findByIdAndUpdate(group.chat, { $pull: { participants: userId } });

    res.status(200).json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const member = group.members.find(m => m.user.toString() === req.user.id);
    if (!member) return res.status(400).json({ success: false, message: 'Not a member' });

    if (member.role === 'owner' && group.members.length > 1) {
      return res.status(400).json({ success: false, message: 'Transfer ownership before leaving' });
    }

    group.members = group.members.filter(m => m.user.toString() !== req.user.id);
    if (group.members.length === 0) {
      group.isActive = false;
    }
    await group.save();
    await Chat.findByIdAndUpdate(group.chat, { $pull: { participants: req.user.id } });

    res.status(200).json({ success: true, message: 'Left group' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const validRoles = ['admin', 'moderator', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const requester = group.members.find(m => m.user.toString() === req.user.id);
    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only owner can change roles' });
    }

    const targetMember = group.members.find(m => m.user.toString() === userId);
    if (!targetMember) return res.status(404).json({ success: false, message: 'Member not found' });

    targetMember.role = role;
    await group.save();

    res.status(200).json({ success: true, message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInviteLink = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const member = group.members.find(m => m.user.toString() === req.user.id);
    if (!member) return res.status(403).json({ success: false, message: 'Not a member' });

    res.status(200).json({ success: true, inviteCode: group.inviteCode, inviteLink: `${process.env.CLIENT_URL}/join/group/${group.inviteCode}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.joinByInvite = async (req, res) => {
  try {
    const group = await Group.findOne({ inviteCode: req.params.code, isActive: true });
    if (!group) return res.status(404).json({ success: false, message: 'Invalid invite link' });

    const isMember = group.members.some(m => m.user.toString() === req.user.id);
    if (isMember) return res.status(400).json({ success: false, message: 'Already a member' });

    if (group.bannedUsers.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are banned from this group' });
    }

    group.members.push({ user: req.user.id, role: 'member' });
    await group.save();
    await Chat.findByIdAndUpdate(group.chat, { $addToSet: { participants: req.user.id } });

    res.status(200).json({ success: true, group: { _id: group._id, name: group.name, chat: group.chat } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
