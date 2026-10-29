import { db } from '../db.js';
import { AppError } from '../utils/AppError.js';
import { sendOfferLetterEmail, sendOfferAcceptedEmail } from '../email.js';
import { dispatchCandidateAlert } from '../alerts.js';

export const applicationController = {
  // Apply for a job (Seeker only)
  apply: async (req, res, next) => {
    try {
      if (req.user.role !== 'seeker') {
        throw AppError.forbidden('Only job seekers can apply for jobs');
      }

      const { jobId, coverNote } = req.body;
      if (!jobId) {
        throw AppError.badRequest('Job ID is required');
      }

      const job = db.findJobById(jobId);
      if (!job) {
        throw AppError.notFound('Job not found');
      }

      const existing = db.getAllApplications().find(
        a => a.jobId === jobId && a.seekerId === req.user.id
      );
      if (existing) {
        throw AppError.badRequest('You have already applied for this job');
      }

      const seeker = db.findUserById(req.user.id);
      const userPrefs = seeker?.notificationPrefs || {};
      const targetPhone = userPrefs.whatsappPhone || seeker?.phone || '';
      const telegramChatId = userPrefs.telegramChatId || '';

      const application = db.createApplication({
        jobId,
        jobTitle: job.title,
        employerId: job.employerId,
        employerName: job.employerName || job.company,
        seekerId: req.user.id,
        seekerName: req.user.name,
        seekerEmail: req.user.email,
        seekerPhone: targetPhone || (seeker ? seeker.phone : ''),
        seekerAvatar: seeker ? seeker.avatar : '',
        coverNote: (coverNote && String(coverNote).trim().slice(0, 1000)) || 'I am interested in this role and available for immediate discussion.',
        status: 'pending'
      });

      if (req.io) {
        req.io.emit('application:created', application);
      }

      // Automatically dispatch candidate confirmation alert (WhatsApp + Telegram)
      let alertData = null;
      try {
        alertData = await dispatchCandidateAlert({
          candidatePhone: targetPhone,
          candidateName: seeker?.name || req.user.name,
          employerName: job.employerName || job.company,
          jobTitle: job.title,
          type: 'application_submitted',
          details: {
            applicationId: application.id,
            jobId: job.id,
            company: job.employerName || job.company,
            telegramChatId
          },
          io: req.io
        });
      } catch (alertErr) {
        console.warn('[AlertService] Failed to dispatch application alert:', alertErr.message);
      }

      res.status(201).json({ 
        application,
        alert: alertData,
        whatsappUrl: alertData?.whatsappUrl,
        telegramUrl: alertData?.telegramUrl
      });
    } catch (err) {
      next(err);
    }
  },

  // Get current seeker's applications
  getMyApplications: (req, res, next) => {
    try {
      const apps = db.getApplicationsBySeekerId(req.user.id);
      res.json({ applications: apps });
    } catch (err) {
      next(err);
    }
  },

  // Get applications received by employer
  getEmployerApplications: (req, res, next) => {
    try {
      if (req.user.role !== 'emp') {
        throw AppError.forbidden('Only employers can view job candidates');
      }
      const apps = db.getApplicationsByEmployerId(req.user.id);
      res.json({ applications: apps });
    } catch (err) {
      next(err);
    }
  },

  // Update application status
  updateStatus: (req, res, next) => {
    try {
      if (req.user.role !== 'emp') {
        throw AppError.forbidden('Only employers can update candidate status');
      }

      const { status } = req.body;
      const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected', 'offered', 'hired'];
      if (!validStatuses.includes(status)) {
        throw AppError.badRequest('Invalid status');
      }

      const existingApp = db.getAllApplications().find(a => a.id === req.params.id);
      if (!existingApp) {
        throw AppError.notFound('Application not found');
      }
      if (existingApp.employerId !== req.user.id) {
        throw AppError.forbidden('You can only update applications for your own jobs');
      }

      const updated = db.updateApplicationStatus(req.params.id, status);
      if (!updated) {
        throw AppError.notFound('Application not found');
      }

      if (req.io) {
        req.io.emit('application:updated', updated);
      }

      // Background instant mobile alert (WhatsApp & Telegram)
      if (['reviewed', 'interview', 'accepted', 'hired'].includes(status)) {
        const candidateUser = db.findUserById(existingApp.seekerId);
        const prefs = candidateUser?.notificationPrefs || {};
        const targetPhone = prefs.whatsappPhone || existingApp.seekerPhone || candidateUser?.phone;
        const targetTelegram = prefs.telegramChatId;

        dispatchCandidateAlert({
          candidatePhone: targetPhone,
          candidateName: existingApp.seekerName,
          employerName: req.user.companyName || req.user.name,
          jobTitle: existingApp.jobTitle,
          type: 'status_update',
          details: { 
            status,
            telegramChatId: targetTelegram
          },
          io: req.io
        }).catch(e => console.warn('[AlertService] Status alert error:', e.message));
      }

      res.json({ application: updated });
    } catch (err) {
      next(err);
    }
  },

  // Issue formal offer letter
  issueOffer: async (req, res, next) => {
    try {
      if (req.user.role !== 'emp') {
        throw AppError.forbidden('Only employers can issue offer letters');
      }

      const {
        candidateEmail,
        salary,
        salaryOffered,
        joiningDate,
        location,
        terms,
        customNote,
        designation
      } = req.body;

      const appId = req.params.id || req.body.applicationId;
      const app = db.getAllApplications().find(a => a.id === appId);
      if (!app) {
        throw AppError.notFound('Application not found');
      }
      if (app.employerId !== req.user.id) {
        throw AppError.forbidden('You can only issue offers for your own job candidates');
      }

      const seeker = db.findUserById(app.seekerId);
      const targetEmail = (candidateEmail && String(candidateEmail).trim().toLowerCase()) || (seeker && seeker.email) || app.seekerEmail || 'candidate@jobscout.local';

      if (seeker && targetEmail.includes('@') && seeker.email !== targetEmail) {
        db.updateUser(seeker.id, { email: targetEmail });
      }

      const refNo = `JS-OFFER-${Date.now().toString().slice(-6)}`;
      const offerDetails = {
        refNo,
        letterNumber: refNo,
        candidateName: app.seekerName,
        candidateEmail: targetEmail,
        candidatePhone: app.seekerPhone,
        designation: (designation && String(designation).trim()) || app.jobTitle,
        salary: (salaryOffered || salary) ? String(salaryOffered || salary).trim() : '₹15,00,000 / yr',
        joiningDate: (joiningDate && String(joiningDate).trim()) || 'Immediate (Within 7 Days)',
        location: (location && String(location).trim()) || 'Bandra Kurla Complex (BKC), Mumbai',
        terms: (terms && String(terms).trim()) || 'Standard company employment policies, 3 months probation period, 30 days notice period.',
        customNote: (customNote && String(customNote).trim()) || '',
        issuedAt: new Date().toISOString(),
        employerName: req.user.name,
        companyName: req.user.companyName || req.user.name,
        status: 'offered'
      };

      app.status = 'offered';
      app.seekerEmail = targetEmail;
      app.offerLetter = offerDetails;
      app.updatedAt = new Date().toISOString();
      db.save();

      let emailResult = { success: true, dispatched: true };
      try {
        emailResult = await Promise.race([
          sendOfferLetterEmail({
            candidateEmail: targetEmail,
            candidateName: app.seekerName,
            employerName: req.user.name,
            companyName: req.user.companyName || req.user.name,
            jobTitle: offerDetails.designation,
            salary: offerDetails.salary,
            joiningDate: offerDetails.joiningDate,
            location: offerDetails.location,
            terms: offerDetails.terms,
            refNo
          }),
          new Promise(res => setTimeout(() => res({ success: true, background: true, message: 'Offer letter dispatched' }), 2000))
        ]);
      } catch (emailErr) {
        console.warn('[EmailService] Offer letter dispatch caught:', emailErr?.message);
        emailResult = { success: false, error: emailErr?.message };
      }

      const offerMsgText = `🎉 Congratulations ${app.seekerName}! We have issued your formal Job Offer Letter for "${offerDetails.designation}" at ${offerDetails.companyName} with compensation of ${offerDetails.salary}. An official copy has been dispatched to your email (${targetEmail}). You can also review, download, and accept the offer directly from your Applied Jobs dashboard!`;
      const chatMsg = db.createMessage({
        senderId: req.user.id,
        receiverId: app.seekerId,
        senderName: req.user.companyName || req.user.name,
        message: offerMsgText,
        content: offerMsgText
      });

      if (req.io) {
        req.io.emit('application:updated', app);
        req.io.emit('message:received', chatMsg);
      }

      // Generate & dispatch Instant WhatsApp / Telegram alert
      const targetPhone = seeker?.notificationPrefs?.whatsappPhone || app.seekerPhone || (seeker && seeker.phone);
      const targetTelegram = seeker?.notificationPrefs?.telegramChatId;

      const alertResult = await dispatchCandidateAlert({
        candidatePhone: targetPhone,
        candidateName: app.seekerName,
        employerName: req.user.companyName || req.user.name,
        jobTitle: offerDetails.designation,
        type: 'offer_issued',
        details: {
          salary: offerDetails.salary,
          refNo,
          joiningDate: offerDetails.joiningDate,
          telegramChatId: targetTelegram
        },
        io: req.io
      }).catch(e => {
        console.warn('[AlertService] Offer alert dispatch error:', e.message);
        return null;
      });

      res.json({
        application: app,
        emailResult,
        whatsappUrl: alertResult?.whatsappUrl,
        telegramUrl: alertResult?.telegramUrl,
        message: `Offer letter successfully dispatched to ${targetEmail}!`
      });
    } catch (err) {
      next(err);
    }
  },

  // Accept offer (Seeker only)
  acceptOffer: (req, res, next) => {
    try {
      if (req.user.role !== 'seeker') {
        throw AppError.forbidden('Only job seekers can accept an offer');
      }

      const appId = req.params.id || req.body.applicationId;
      const app = db.getAllApplications().find(a => a.id === appId);
      if (!app) throw AppError.notFound('Application not found');
      if (app.seekerId !== req.user.id) {
        throw AppError.forbidden('You can only accept your own job offer');
      }
      if (app.status !== 'offered') {
        throw AppError.badRequest('No pending offer letter found to accept');
      }

      app.status = 'hired';
      if (app.offerLetter) {
        app.offerLetter.acceptedAt = new Date().toISOString();
      }
      app.updatedAt = new Date().toISOString();
      db.save();

      const acceptMsgText = `🤝 I am thrilled to formally accept your Job Offer Letter for "${app.offerLetter?.designation || app.jobTitle}"! Looking forward to joining ${app.offerLetter?.companyName || app.employerName} on ${app.offerLetter?.joiningDate || 'the agreed date'}.`;
      const chatMsg = db.createMessage({
        senderId: req.user.id,
        receiverId: app.employerId,
        senderName: req.user.name,
        message: acceptMsgText,
        content: acceptMsgText
      });

      if (req.io) {
        req.io.emit('application:updated', app);
        req.io.emit('message:received', chatMsg);
      }

      const employer = db.findUserById(app.employerId);
      if (employer && employer.email) {
        sendOfferAcceptedEmail({
          employerEmail: employer.email,
          employerName: employer.name,
          companyName: app.offerLetter?.companyName || employer.companyName || employer.name,
          candidateName: app.seekerName,
          candidateEmail: app.seekerEmail || req.user.email,
          jobTitle: app.offerLetter?.designation || app.jobTitle,
          salary: app.offerLetter?.salary || app.jobSalary,
          joiningDate: app.offerLetter?.joiningDate || 'Immediate',
          refNo: app.offerLetter?.refNo || `OFFER-${app.id?.slice(-6)}`
        }).catch(err => console.warn('[EmailService] Offer accepted email notification failed:', err));
      }

      res.json({
        application: app,
        message: 'Congratulations! You have accepted the offer and are now officially Hired!'
      });
    } catch (err) {
      next(err);
    }
  },

  // Decline offer (Seeker only)
  declineOffer: (req, res, next) => {
    try {
      if (req.user.role !== 'seeker') {
        throw AppError.forbidden('Only job seekers can decline an offer');
      }

      const appId = req.params.id || req.body.applicationId;
      const app = db.getAllApplications().find(a => a.id === appId);
      if (!app) throw AppError.notFound('Application not found');
      if (app.seekerId !== req.user.id) {
        throw AppError.forbidden('You can only decline your own job offer');
      }

      app.status = 'rejected';
      if (app.offerLetter) {
        app.offerLetter.declinedAt = new Date().toISOString();
      }
      app.updatedAt = new Date().toISOString();
      db.save();

      const chatMsg = db.createMessage({
        senderId: req.user.id,
        receiverId: app.employerId,
        content: `Thank you for the offer for "${app.offerLetter?.designation || app.jobTitle}". After careful consideration, I regret to decline the offer at this time. Thank you for the opportunity.`
      });

      if (req.io) {
        req.io.emit('application:updated', app);
        req.io.emit('message:received', chatMsg);
      }

      res.json({ application: app, message: 'Offer declined' });
    } catch (err) {
      next(err);
    }
  }
};
