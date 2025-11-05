import mongoose, { Schema, model, models } from 'mongoose';

const VolunteerApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  applicantPhone: String,
  coverLetter: String,
  resumeUrl: String,
  portfolioUrl: String,
  linkedInUrl: String,
  additionalInfo: String,
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected'],
    default: 'pending' 
  },
  reviewNotes: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  interviewDate: Date,
  interviewNotes: String,
  applicationData: {
    type: Map,
    of: Schema.Types.Mixed
  },
  termsAccepted: { type: Boolean, default: false },
  privacyAccepted: { type: Boolean, default: false },
  recaptchaToken: String,
  ipAddress: String,
  userAgent: String
}, { 
  timestamps: true,
  indexes: [
    { jobId: 1 },
    { applicantEmail: 1 },
    { status: 1 },
    { createdAt: -1 }
  ]
});

export default models.VolunteerApplication || model('VolunteerApplication', VolunteerApplicationSchema);

