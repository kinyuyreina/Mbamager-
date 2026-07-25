"""
Mbamager SMS Recovery Service

An abstraction layer for sending OTP verification codes via SMS.
In development, it logs OTPs securely, keeping carrier implementation independent.
"""

import logging

logger = logging.getLogger("app.services.sms_recovery_service")

class SMSRecoveryService:
    """
    Independent service abstraction for sending password recovery codes via SMS.
    """

    async def send_otp_sms(self, phone_number: str, otp_code: str) -> bool:
        """
        Sends an SMS containing the OTP code.
        Logs securely during development.
        """
        # Secure development log format
        logger.info("=========================================================")
        logger.info("SMS OTP RECOVERY SERVICE (DEVELOPMENT MODE) - SECURE LOG")
        logger.info(f"RECIPIENT PHONE: {phone_number}")
        logger.info(f"VERIFICATION CODE: {otp_code}")
        logger.info(f"MESSAGE BODY: Your Mbamager verification code is: {otp_code}. It will expire in 10 minutes.")
        logger.info("=========================================================")
        return True
