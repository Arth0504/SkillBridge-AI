import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      enum: ['Company', 'Candidate', 'Admin'],
      required: true,
    },
    category: {
      type: String,
      enum: ['Company Document', 'Candidate Resume', 'Offer Letter', 'Certificate', 'Other'],
      default: 'Company Document',
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    version: { type: Number, default: 1 },
    versionHistory: [
      {
        version: Number,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
