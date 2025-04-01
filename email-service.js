export async function sendEmail(to, subject, body) {
    try {
        const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                body
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Email sending failed:", error);
        return { success: false, error };
    }
}