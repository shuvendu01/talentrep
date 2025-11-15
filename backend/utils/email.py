import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

logger = logging.getLogger(__name__)

# Email configuration from environment variables
EMAIL_HOST = "smtpout.secureserver.net"
EMAIL_PORT = 465
EMAIL_USERNAME = "contact@bisgensolutions.com"
EMAIL_PASSWORD = "SuperF1sh123#"
EMAIL_FROM = "contact@bisgensolutions.com"

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using GoDaddy SMTP
    """
    try:
        # Create message
        message = MIMEMultipart('alternative')
        message['From'] = EMAIL_FROM
        message['To'] = to_email
        message['Subject'] = subject

        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)

        # Connect to SMTP server
        with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT) as server:
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(message)

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_magic_link_email(to_email: str, magic_link: str) -> bool:
    """
    Send magic link authentication email
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 30px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
            }}
            .content {{
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                margin-bottom: 20px;
            }}
            .button {{
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
            .warning {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px;
                margin-top: 20px;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎯 TalentHub</div>
            </div>
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Your Magic Login Link</h2>
                <p>Hi there,</p>
                <p>Click the button below to securely log in to your TalentHub account. This link will only work once and does not expire unless you request a new one.</p>
                <div style="text-align: center;">
                    <a href="{magic_link}" class="button">Login to TalentHub</a>
                </div>
                <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
                <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                    {magic_link}
                </p>
                <div class="warning">
                    <strong>⚠️ Important:</strong> If you request a new magic link, this one will no longer work. We'll notify you on screen when that happens.
                </div>
            </div>
            <div class="footer">
                <p>If you didn't request this login link, you can safely ignore this email.</p>
                <p>&copy; 2025 TalentHub. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, "Your TalentHub Magic Login Link", html_content)
