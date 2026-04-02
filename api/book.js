import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const booking = req.body;

  try {
    // إرسال إيميل داخلي
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🎨 New Workshop Booking",
      text: `
New Booking 🔥
Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Workshop: ${booking.workshop}
Seats: ${booking.seats}
Notes: ${booking.notes}
      `,
    });

    // إرسال تأكيد للعميل
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: "Booking Confirmation",
      text: `
Hello ${booking.name},

Your booking is confirmed 🎉
Workshop: ${booking.workshop}
Seats: ${booking.seats}

Thanks ❤️
      `,
    });

    // إرسال البيانات لـ Google Sheet
    const sheetResponse = await fetch(process.env.GOOGLE_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });

    if (!sheetResponse.ok) {
      console.error("Google Sheet WebApp error", await sheetResponse.text());
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}