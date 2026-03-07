export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  previewImage: string;
}

export const emailTemplates: EmailTemplate[];
