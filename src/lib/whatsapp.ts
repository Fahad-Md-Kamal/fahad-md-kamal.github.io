// Builds a wa.me link that opens WhatsApp with a message already typed into the chat.
// The phone number must be in international format; wa.me wants digits only (no "+", spaces or dashes).
export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function whatsappGreeting(fullName: string): string {
  const firstName = fullName.split(' ')[0]
  return `Hi ${firstName}, I found your portfolio and would like to talk about a project.`
}
