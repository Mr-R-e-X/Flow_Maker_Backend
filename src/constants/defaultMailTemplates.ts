const verificationMailBody = (otp: string, name: string): string => {
  return `
        <div style="
        font-family: Arial, sans-serif; 
        text-align: center; 
        color: #333; 
        background-color: #f9f9f9; 
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        max-width: 400px;
        margin: auto;">
        <h2 style="color: #4CAF50;">Verification Code</h2>
        <p style="font-size: 16px;">Hello, ${name}</p>
        <p style="font-size: 18px; color: #555;">
          Use the following OTP to complete your verification:
        </p>
        <div style="
          margin: 20px auto; 
          padding: 10px; 
          border-radius: 5px; 
          background: #f4f4f4; 
          display: inline-block; 
          font-size: 24px; 
          font-weight: bold; 
          color: #4CAF50;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #999;">
          This OTP is valid for the next 10 minutes. Please do not share it with anyone.
        </p>
        <p style="font-size: 14px;">Thank you for choosing us!</p>
      </div>
    `;
};

export { verificationMailBody };
