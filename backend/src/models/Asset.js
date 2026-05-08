const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['image', 'pdf', 'video', 'other'],
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for search
assetSchema.index({ originalName: 'text', tags: 'text' });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
