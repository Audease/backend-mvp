export interface Mail {
  to: string;
  subject: string;
}

export interface PdfMail extends Mail {
  content: string;
  filename: string;
}
