export const getApprovalEmailTemplate = ({ name, token, loginUrl }) => ({
  subject: 'Your IT Support Access is Approved',
  text: `Hi ${name},\n\nYour IT support access has been approved. You can now log in at ${loginUrl}.\n\nToken: ${token}\n\nThis token is valid for 7 days.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">IT Support Access Approved</h2>
      <p>Hi ${name},</p>
      <p>Your IT support access has been approved. You can now log in and start helping users.</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;"><strong>Your Login Token:</strong></p>
        <p style="margin: 10px 0; color: #374151; font-family: monospace;">${token}</p>
        <p style="margin: 0; font-size: 0.9em; color: #6b7280;">This token is valid for 7 days</p>
      </div>

      <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Login Now
      </a>

      <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
        If you didn't request this access, please contact your administrator.
      </p>
    </div>
  `
});

export const getPendingApprovalEmailTemplate = ({ staffName, staffEmail, adminDashboardUrl }) => ({
  subject: 'New IT Staff Registration Requires Approval',
  text: `New IT Support registration requires your approval:\nName: ${staffName}\nEmail: ${staffEmail}\n\nApprove at: ${adminDashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New IT Staff Registration</h2>
      <p>A new IT support staff member requires your approval:</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Name:</strong> ${staffName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${staffEmail}</p>
      </div>

      <a href="${adminDashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Open Admin Dashboard
      </a>

      <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
        You can approve or deny this request from your admin dashboard.
      </p>
    </div>
  `
});

export const getStaffMessageTemplate = ({ from, message }) => ({
  subject: 'Message from IT Admin',
  text: `Message from ${from}:\n\n${message}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Message from IT Admin</h2>
      <p>You received a message from <strong>${from}</strong>:</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 5px; white-space: pre-wrap;">
        ${message}
      </div>

      <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
        This is a direct message from your IT administrator.
      </p>
    </div>
  `
});

export const getTicketAssignedTemplate = ({ ticketId, title, description, priority, requesterName, dashboardUrl }) => ({
  subject: `New Ticket Assigned: ${title}`,
  text: `A new ticket has been assigned to you:\n\nTicket ID: ${ticketId}\nTitle: ${title}\nPriority: ${priority}\nRequester: ${requesterName}\n\nDescription:\n${description}\n\nView ticket at: ${dashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Ticket Assigned</h2>
      <p>A new support ticket has been assigned to you:</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
        <p style="margin: 5px 0;"><strong>Priority:</strong> 
          <span style="color: ${
            priority === 'high' ? '#dc2626' : 
            priority === 'medium' ? '#d97706' : 
            '#059669'
          };">${priority.toUpperCase()}</span>
        </p>
        <p style="margin: 5px 0;"><strong>Requester:</strong> ${requesterName}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;"><strong>Description:</strong></p>
        <p style="margin: 5px 0; white-space: pre-wrap;">${description}</p>
      </div>

      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        View Ticket in Dashboard
      </a>

      <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
        Please review and start working on this ticket as soon as possible.
      </p>
    </div>
  `
});