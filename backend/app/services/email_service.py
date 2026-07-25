"""
Mbamager Email Service

Handles sending transactional emails like Password Reset OTP codes using SMTP.
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

from app.core.config import settings

logger = logging.getLogger("app.services.email_service")

class EmailService:
    """
    Service responsible for constructing and sending HTML/text transactional emails.
    """

    def __init__(self) -> None:
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM or "noreply@mbamager.com"

    def get_password_reset_template(self, otp_code: str) -> str:
        """
        Returns a beautifully styled HTML template for the Mbamager OTP reset email.
        Features a elegant premium gold and white theme.
        """
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mbamager Password Reset Code</title>
            <style>
                body {{
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #fcfbf7;
                    color: #0f172a;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }}
                .wrapper {{
                    width: 100%;
                    background-color: #fcfbf7;
                    padding: 40px 20px;
                    box-sizing: border-box;
                }}
                .container {{
                    max-width: 500px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 24px;
                    border: 1px solid #f1f0e8;
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.05);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    padding: 40px 30px;
                    text-align: center;
                    border-bottom: 3px solid #d4af37;
                }}
                .logo-icon {{
                    font-size: 32px;
                    margin-bottom: 10px;
                }}
                .header h1 {{
                    color: #ffffff;
                    margin: 0;
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                }}
                .header p {{
                    color: #d4af37;
                    margin: 5px 0 0 0;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 700;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .content h2 {{
                    font-size: 18px;
                    font-weight: 700;
                    margin-top: 0;
                    margin-bottom: 16px;
                    color: #1e293b;
                }}
                .content p {{
                    font-size: 14px;
                    line-height: 1.6;
                    color: #475569;
                    margin-bottom: 30px;
                }}
                .otp-box {{
                    background-color: #faf9f2;
                    border: 2px dashed #d4af37;
                    border-radius: 16px;
                    padding: 20px;
                    margin: 20px auto;
                    max-width: 260px;
                }}
                .otp-code {{
                    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
                    font-size: 36px;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                    color: #0f172a;
                    margin: 0;
                    text-align: center;
                }}
                .footer {{
                    background-color: #f8fafc;
                    padding: 24px 30px;
                    text-align: center;
                    border-top: 1px solid #f1f0e8;
                }}
                .footer p {{
                    font-size: 11px;
                    color: #94a3b8;
                    margin: 0;
                    line-height: 1.5;
                }}
                .footer a {{
                    color: #d4af37;
                    text-decoration: none;
                    font-weight: 600;
                }}
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <div class="logo-icon">🪙</div>
                        <h1>Mbamager</h1>
                        <p>Premium Financial OS</p>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>We received a request to recover your Mbamager account. Use the secure 6-digit verification code below to authorize your password update. This code will expire in 10 minutes.</p>
                        
                        <div class="otp-box">
                            <h3 class="otp-code">{otp_code}</h3>
                        </div>
                        
                        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Mbamager. All rights reserved.<br>Premium Security & Encryption End-to-End.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

    async def send_password_reset_email(self, to_email: str, otp_code: str) -> bool:
        """
        Sends an OTP code by email using the gold-themed template.
        """
        subject = "Mbamager Password Reset Code"
        html_content = self.get_password_reset_template(otp_code)
        text_content = f"Your Mbamager Password Reset Code is: {otp_code}. This code expires in 10 minutes."

        # Setup MIME message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.from_email
        msg["To"] = to_email

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # If SMTP username/password are not set, log the OTP safely for local development/preview
        if not self.user or not self.password:
            logger.info("=========================================================")
            logger.info("EMAIL SERVICE (DEVELOPMENT MODE) - SMTP NOT CONFIGURED")
            logger.info(f"TO: {to_email}")
            logger.info(f"SUBJECT: {subject}")
            logger.info(f"OTP CODE: {otp_code}")
            logger.info("=========================================================")
            return True

        try:
            # Connect and send via SMTP
            logger.info(f"Connecting to SMTP server {self.host}:{self.port}...")
            server = smtplib.SMTP(self.host, self.port)
            server.ehlo()
            server.starttls() # Secure connection
            server.ehlo()
            server.login(self.user, self.password)
            server.sendmail(self.from_email, to_email, msg.as_string())
            server.close()
            logger.info(f"Successfully sent password reset email to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email via SMTP: {str(e)}")
            # Fallback: always log so the operator can inspect during any development/staging failure
            logger.info(f"[FALLBACK LOG] OTP for {to_email} is {otp_code}")
            return False
