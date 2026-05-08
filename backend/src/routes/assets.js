const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Asset = require('../models/Asset');
const upload = require('../middleware/upload');

// Helper: determine file category from mimetype
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('video/')) return 'video';
  return 'other';
};

// ─── POST /api/assets/upload ─────────────────────────────────────────────────
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const tags = req.body.tags
        ? req.body.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const asset = new Asset({
        originalName: req.file.originalname,
        storedName: req.file.filename,
        fileType: getFileType(req.file.mimetype),
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        tags,
      });

      await asset.save();

      res.status(201).json({
        message: 'Asset uploaded successfully.',
        asset,
      });
    } catch (error) {
      // Remove the uploaded file if DB save fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to save asset metadata.' });
    }
  });
});

// ─── GET /api/assets ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, fileType, dateFrom, dateTo, sortBy = 'uploadedAt', order = 'desc' } = req.query;

    const query = {};

    // File type filter
    if (fileType && fileType !== 'all') {
      query.fileType = fileType;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.uploadedAt = {};
      if (dateFrom) query.uploadedAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.uploadedAt.$lte = to;
      }
    }

    // Text search on name or tags
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSort = ['uploadedAt', 'originalName', 'size'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'uploadedAt';

    const assets = await Asset.find(query).sort({ [sortField]: sortOrder });

    res.json({ count: assets.length, assets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assets.' });
  }
});

// ─── GET /api/assets/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve asset.' });
  }
});

// ─── GET /api/assets/:id/download ─────────────────────────────────────────────
router.get('/:id/download', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    const filePath = asset.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }

    res.download(filePath, asset.originalName);
  } catch (error) {
    res.status(500).json({ error: 'Download failed.' });
  }
});

// ─── PATCH /api/assets/:id/tags ───────────────────────────────────────────────
router.patch('/:id/tags', async (req, res) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array.' });
    }

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { tags },
      { new: true }
    );

    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tags.' });
  }
});

// ─── DELETE /api/assets/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    // Delete physical file
    if (fs.existsSync(asset.path)) {
      fs.unlinkSync(asset.path);
    }

    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete asset.' });
  }
});

module.exports = router;
