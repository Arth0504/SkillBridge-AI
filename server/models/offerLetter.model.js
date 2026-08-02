import mongoose from 'mongoose';

const offerLetterSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    salary: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    hrSignatureName: { type: String, default: 'HR Manager' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'declined', 'expired'],
      default: 'sent',
    },
    validUntil: { type: Date },
    pdfUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const OfferLetter = mongoose.model('OfferLetter', offerLetterSchema);
