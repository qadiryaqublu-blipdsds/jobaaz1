export interface CardPaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  saveCard?: boolean;
}

export interface PaymentProcessingResult {
  success: boolean;
  transactionId: string;
  message: string;
  cardLast4?: string;
  paymentMethod?: string;
}

// Helper: Format and validate card (cleanly groups into 4 digits, maximum 16 digits)
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : digits;
}

export function detectCardBrand(number: string): 'Visa' | 'Mastercard' | 'Birbank' | 'Leobank' | 'Kart' {
  const clean = number.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) {
    return 'Mastercard';
  }
  return 'Kart';
}

/**
 * Process Mock Card Payment with realistic 1.5s simulated gateway processing
 */
export async function processCardPayment(
  details: CardPaymentDetails,
  amount: number,
  currency: string = 'AZN'
): Promise<PaymentProcessingResult> {
  // Simulate network request to payment gateway
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const cleanNumber = details.cardNumber.replace(/\s+/g, '');
  
  if (cleanNumber.length < 15 || cleanNumber.length > 19) {
    return {
      success: false,
      transactionId: `err-${Date.now()}`,
      message: 'Kart nömrəsi yanlışdır. Zəhmət olmasa 16 rəqəmli kart nömrənizi daxil edin.',
    };
  }

  if (!details.cardHolder || details.cardHolder.trim().length < 3) {
    return {
      success: false,
      transactionId: `err-${Date.now()}`,
      message: 'Kart üzərindəki ad və soyadı tam daxil edin.',
    };
  }

  if (!details.cvv || details.cvv.length < 3) {
    return {
      success: false,
      transactionId: `err-${Date.now()}`,
      message: 'CVV/CVC təhlükəsizlik kodu 3 rəqəm olmalıdır.',
    };
  }

  const last4 = cleanNumber.slice(-4);
  const brand = detectCardBrand(cleanNumber);

  return {
    success: true,
    transactionId: `tx-bank-${Date.now()}`,
    message: `Ödəniş uğurla tamamlandı! ${amount} ${currency} məbləğ hesabınızdan silindi.`,
    cardLast4: last4,
    paymentMethod: `${brand} (•••• ${last4})`,
  };
}
