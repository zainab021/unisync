const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email skipped — no credentials] To: ${to} | Subject: ${subject}`);
    return;
  }
  // If sending to fake/university email, redirect to real admin email
  if (!to || to.includes("@university.edu")) {
    to = process.env.EMAIL_USER;
  }
  try {
    await transporter.sendMail({
      from: `"UniSync University" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email sent] To: ${to} | ${subject}`);
  } catch (err) {
    console.error(`[Email failed] ${err.message}`);
  }
}

// ── Email Templates ──────────────────────────────────────────────────

function dropRequestSubmitted({ studentName, courseName, adminEmail }) {
  return sendEmail({
    to: adminEmail,
    subject: `Drop Request — ${courseName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#F59E0B">UniSync — Drop Request</h2>
        <p>A student has submitted a course drop request.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#666">Student:</td><td style="padding:8px"><b>${studentName}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Course:</td><td style="padding:8px"><b>${courseName}</b></td></tr>
        </table>
        <p>Please login to the admin portal to approve or reject this request.</p>
        <a href="http://localhost:5173/admin/enrollment" style="background:#F59E0B;color:#000;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px">Review Request</a>
      </div>
    `,
  });
}

function dropRequestReviewed({ studentEmail, studentName, courseName, status, reason }) {
  const approved = status === "Approved";
  return sendEmail({
    to: studentEmail,
    subject: `Course Drop ${status} — ${courseName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:${approved ? "#10B981" : "#EF4444"}">UniSync — Drop Request ${status}</h2>
        <p>Dear ${studentName},</p>
        <p>Your drop request for <b>${courseName}</b> has been <b>${status.toLowerCase()}</b>.</p>
        ${!approved && reason ? `<p style="color:#666">Reason: ${reason}</p>` : ""}
        ${approved ? "<p>You have been successfully unenrolled from this course.</p>" : "<p>You remain enrolled in this course.</p>"}
        <a href="http://localhost:5173/student/courses" style="background:#F59E0B;color:#000;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px">View Courses</a>
      </div>
    `,
  });
}

function roomRequestReviewed({ teacherEmail, teacherName, room, date, slot, status }) {
  const approved = status === "Approved";
  return sendEmail({
    to: teacherEmail,
    subject: `Room Request ${status} — ${room}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:${approved ? "#10B981" : "#EF4444"}">UniSync — Room Request ${status}</h2>
        <p>Dear ${teacherName},</p>
        <p>Your room booking request has been <b>${status.toLowerCase()}</b>.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#666">Room:</td><td style="padding:8px"><b>${room}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Date:</td><td style="padding:8px"><b>${date}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Slot:</td><td style="padding:8px"><b>${slot}</b></td></tr>
        </table>
      </div>
    `,
  });
}

function leaveRequestReviewed({ teacherEmail, teacherName, type, fromDate, toDate, status }) {
  const approved = status === "Approved";
  return sendEmail({
    to: teacherEmail,
    subject: `Leave Request ${status} — ${type}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:${approved ? "#10B981" : "#EF4444"}">UniSync — Leave Request ${status}</h2>
        <p>Dear ${teacherName},</p>
        <p>Your <b>${type}</b> request (${fromDate} to ${toDate}) has been <b>${status.toLowerCase()}</b>.</p>
      </div>
    `,
  });
}

function newNotice({ recipientEmails, title, body, category }) {
  return sendEmail({
    to: recipientEmails.join(","),
    subject: `New Notice: ${title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#F59E0B">UniSync — New Notice</h2>
        <span style="background:#1E3A5F;color:#7DD3FC;padding:3px 10px;border-radius:20px;font-size:12px">${category}</span>
        <h3>${title}</h3>
        <p>${body}</p>
        <a href="http://localhost:5173" style="background:#F59E0B;color:#000;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px">View Portal</a>
      </div>
    `,
  });
}

function feeReminder({ studentEmail, studentName, amount, dueDate, semester }) {
  return sendEmail({
    to: studentEmail,
    subject: `Fee Reminder — ${semester}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#F59E0B">UniSync — Fee Payment Reminder</h2>
        <p>Dear ${studentName},</p>
        <p>This is a reminder that your semester fee is due soon.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#666">Semester:</td><td style="padding:8px"><b>${semester}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Amount:</td><td style="padding:8px"><b>PKR ${Number(amount).toLocaleString()}</b></td></tr>
          <tr><td style="padding:8px;color:#666">Due Date:</td><td style="padding:8px"><b style="color:#EF4444">${dueDate}</b></td></tr>
        </table>
        <a href="http://localhost:5173/student/fees" style="background:#F59E0B;color:#000;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px">View Fees</a>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  dropRequestSubmitted,
  dropRequestReviewed,
  roomRequestReviewed,
  leaveRequestReviewed,
  newNotice,
  feeReminder,
};
