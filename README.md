# CertifyFlow - Modern Certificate Management Platform

> Redefining human achievement through scalable, beautiful, and cryptographically secure credentials.

## 🚀 Overview

CertifyFlow is a modern SaaS platform for bulk certificate generation, distribution, and verification. Built with a unique "Bring Your Own Email Service" (BYOES) model, we charge only for certificate generation while users send unlimited emails through their own providers.

**Live Demo:** [certifyflow.com](https://certifyflow.com)  
**Repository:** [github.com/theajmalrazaq/certifyflow-next](https://github.com/theajmalrazaq/certifyflow-next)

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (.ts/.tsx)
- **Routing:** Next.js App Router
- **UI Library:** Custom components with Tailwind CSS
- **UI Components:** shadcn/ui (Button, Card, Dialog, Input, Select, etc.)
- **Icons:** Lucide React
- **State Management:** React Hooks
- **Canvas:** HTML5 Canvas API for certificate editor

### **Backend & Database**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with Google OAuth
- **Real-time:** Supabase Real-time subscriptions
- **Storage:** Supabase Storage for images and templates
- **Row Level Security:** RLS policies for data security

### **Certificate Features**
- **QR Code Generation:** qrcode
- **UUID Generation:** uuid
- **PDF Export:** JSZip for bulk downloads
- **Email Integration:** User's own provider (Resend, SendGrid, AWS SES, Mailgun)

### **Deployment**
- **Hosting:** Vercel
- **API Routes:** Next.js Route Handlers (`app/api/*`)
- **Domain:** Custom domain with SSL
- **Environment:** Production & Preview environments

---

## 💰 Pricing Model

### **Business Model: Pay for Generation, Not Sending**
We charge only for **certificate generation**. Email sending is **completely free** - users connect their own email provider (Resend, SendGrid, AWS SES) for unlimited sending.

### **Pricing Tiers**

#### **Starter - $0/month**
- ✅ 250 certificate generations/year
- ✅ Templates library
- ✅ Certificate & badge editor
- ✅ QR code verification
- ✅ PDF certificate export
- ✅ Social media sharing
- ✅ LinkedIn credentials
- ✅ API & Integrations
- ✅ Unlimited email sending (your provider)
- ✅ Connect Resend, SendGrid, AWS SES, etc.

#### **Professional - $39-$549/month**
Based on certificate volume (250 to 50,000/year):
- **250 certs/year:** $39/mo (annually: $33/mo)
- **1,000 certs/year:** $59/mo (annually: $50/mo)
- **5,000 certs/year:** $99/mo (annually: $84/mo)
- **10,000 certs/year:** $169/mo (annually: $144/mo)
- **50,000 certs/year:** $549/mo (annually: $467/mo)

**Features:**
- ✅ Everything in Starter, plus:
- ✅ Branded email templates
- ✅ Scheduled issuing
- ✅ Expirable credentials
- ✅ Advanced analytics dashboard
- ✅ Premium branding
- ✅ Verified issuer status
- ✅ Priority support
- ✅ Unlimited email sending (your provider)

#### **Advanced - $99-$999/month**
Based on certificate volume (250 to 50,000/year):
- **250 certs/year:** $99/mo (annually: $84/mo)
- **1,000 certs/year:** $159/mo (annually: $135/mo)
- **5,000 certs/year:** $259/mo (annually: $220/mo)
- **10,000 certs/year:** $399/mo (annually: $339/mo)
- **50,000 certs/year:** $999/mo (annually: $849/mo)

**Features:**
- ✅ Everything in Professional, plus:
- ✅ 7 custom users with roles
- ✅ Custom fonts & full white-label
- ✅ Custom domain
- ✅ Credentials Portal
- ✅ Verified issuer status
- ✅ Dedicated account manager
- ✅ Premium customer support
- ✅ Custom Terms, SLA & DPA
- ✅ Security & Compliance Support
- ✅ Multiple workspaces
- ✅ Unlimited email sending (your provider)

#### **Enterprise - Custom Pricing**
- 🎯 Custom credential limit
- 🎯 Custom users and workspaces
- 🎯 Tailored implementation plan
- 🎯 Contact sales team

### **Annual Discount**
- Save **15%** with annual billing
- No setup fees
- Cancel anytime
- No credit card required for free plan

---

## ✨ Core Features

### **1. Bulk Certificate Generation**
- Upload CSV files with unlimited rows
- Process up to 1,000 certificates per batch
- Real-time progress tracking
- Automatic error detection and validation
- Drag-and-drop canvas editor
- Custom templates with backgrounds

### **2. Bring Your Own Email Service (BYOES)**
- Connect any SMTP or API-based email provider
- Supported providers:
  - **Resend** (3,000 free emails/month)
  - **SendGrid** (100 emails/day free forever)
  - **AWS SES** ($0.10 per 1,000 emails)
  - **Mailgun** (5,000 free emails/month for 3 months)
  - **Postmark**
  - **Any SMTP server**
- Use your verified domain for better deliverability
- No platform email limits or costs
- Customizable email templates
- Delivery status tracking via your provider

### **3. QR Code Verification**
- UUID-based certificate identification
- Public verification page (`/verify/:uuid`)
- Tamper-proof validation system
- View tracking and analytics
- Each certificate has unique QR code
- Instant verification by scanning

### **4. Custom Templates**
- Visual canvas editor
- Upload custom backgrounds
- Position text and QR codes anywhere
- Save templates for reuse
- Drag-and-drop field positioning
- Font customization (Advanced plan)

### **5. Real-time Analytics**
- Email open rates and click tracking
- Certificate view statistics
- Geographic distribution data
- Export reports as CSV
- Campaign performance metrics

### **6. Campaign Management**
- Unlimited campaigns (Pro plan)
- Status tracking (draft, sent, completed)
- Duplicate campaigns to save time
- Bulk archive and delete operations
- Campaign history and logs

### **7. Security & Privacy**
- End-to-end data encryption
- Secure file uploads
- Row-level security policies (RLS)
- Regular security audits
- GDPR compliance
- Google OAuth authentication

### **8. API & Integrations**
- RESTful API (Professional plan)
- Webhooks for events
- LinkedIn credentials integration
- Social media sharing
- SMTP/API email integration

---

## 🗄️ Database Schema

### **Tables**

#### **certificates**
```sql
CREATE TABLE certificates (
  certificate_uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_data JSONB NOT NULL, -- {name, email, custom_fields}
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'viewed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  UNIQUE(certificate_uuid)
);

-- RLS Policies
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can only see their own certificates
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Public can verify certificates by UUID
CREATE POLICY "Public can verify certificates"
  ON certificates FOR SELECT
  USING (certificate_uuid IS NOT NULL);
```

#### **campaigns**
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  template_data JSONB, -- Canvas template config
  qr_code_settings JSONB, -- {enabled, size, position}
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and pnpm
- Supabase account
- Email provider account (Resend/SendGrid/AWS SES)

### **Installation**

1. **Clone the repository:**
```bash
git clone https://github.com/theajmalrazaq/certifyflow-next.git
cd certifyflow-next
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Environment Variables:**
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations:**
```sql
-- Run the SQL from supabase_migration.sql in Supabase SQL Editor
```

5. **Start development server:**
```bash
pnpm run dev
```

6. **Build for production:**
```bash
pnpm run build
```

---

## 📂 Project Structure

```
certifyflow-next/
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts          # Next.js API Route for emails
│   ├── dashboard/                # User dashboard routes
│   ├── generate/                 # Certificate editor routes
│   ├── generate-send/            # Generate + Email flow routes
│   ├── verify/[uuid]/            # Public verification page
│   ├── layout.tsx                # Root layout wrapper
│   └── page.tsx                  # Landing page
├── components/
│   ├── Landing/                  # Landing page sections
│   ├── ...                       # Other shared components
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── database.types.ts         # TypeScript types
│   ├── campaignService.ts        # Campaign CRUD operations
│   └── utils.ts                  # Utility functions
├── hooks/
│   └── use-mobile.ts             # Responsive hook
├── public/                       # Static assets
│   ├── demo.csv                  # Sample CSV
│   └── ...                       # Images, icons, etc.
├── components.json               # shadcn/ui config
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── package.json
```

---

## 🎨 Design System

### **Colors**
- **Accent:** #A098FF (Orange)
- **Background:** Dynamic (light/dark mode)
- **Foreground:** Dynamic text color
- **Border:** Subtle borders with opacity
- **Muted:** Secondary text color

### **Typography**
- **Headings:** Serif font (system-ui serif)
- **Body:** Sans-serif (system-ui)
- **Sizes:**
  - Hero: `text-4xl md:text-5xl`
  - Subheading: `text-xl md:text-2xl`
  - Body: `text-sm md:text-base`
  - Small: `text-xs`

### **Components**
- **Cards:** `rounded-[32px]` with borders
- **Buttons:** `rounded-full` with accent color
- **Inputs:** `rounded-lg` with focus rings
- **Modals:** Backdrop blur with glassmorphism

---

## 🔒 Security Features

1. **Row Level Security (RLS):** Database-level access control
2. **Google OAuth:** Secure authentication
3. **UUID Certificates:** Cryptographically secure IDs
4. **HTTPS Only:** Enforced SSL/TLS
5. **Environment Variables:** Secrets in env files
6. **CORS Protection:** API route restrictions
7. **XSS Prevention:** Input sanitization

---

## 🌐 API Routes

### **POST /api/send-email**
Send certificate email via user's provider

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Your Certificate",
  "html": "<html>...</html>",
  "provider": "resend",
  "apiKey": "re_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "xxx"
}
```

---

## 🚢 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
pnpm install -g vercel

# Deploy
vercel --prod
```

### **Environment Variables (Production)**
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Author

**Ajmal Razaq**
- GitHub: [@theajmalrazaq](https://github.com/theajmalrazaq)
- Repository: [certifyflow-next](https://github.com/theajmalrazaq/certifyflow-next)

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting platform
- **shadcn/ui** - UI components
- **Lucide** - Icon library
- **Tailwind CSS** - Styling framework

---

## 📞 Support

- **Email:** support@certifyflow.com
- **Documentation:** [docs.certifyflow.com](https://docs.certifyflow.com)
- **Issues:** [GitHub Issues](https://github.com/theajmalrazaq/certifyflow-next/issues)

---

## 🗺️ Roadmap

### **Q1 2026**
- [ ] Email provider integration UI
- [ ] Bulk CSV upload improvements
- [ ] Template marketplace
- [ ] Mobile app (React Native)

### **Q2 2026**
- [ ] Advanced analytics dashboard
- [ ] Custom domain verification
- [ ] Webhooks API
- [ ] Multi-language support

### **Q3 2026**
- [ ] Blockchain certificate anchoring
- [ ] NFT certificate minting
- [ ] Advanced reporting
- [ ] Team collaboration features

---

## 💡 Business Model Highlights

### **Why "Bring Your Own Email Service"?**

1. **Zero Email Costs for Us:** No email infrastructure to maintain
2. **Better for Users:** They control deliverability and reputation
3. **Unlimited Sending:** No artificial limits on their growth
4. **Enterprise Appeal:** Companies prefer using their own infrastructure
5. **Competitive Advantage:** No other platform offers this flexibility

### **Revenue Model**
- **Freemium:** Free tier converts to paid (250 certs/year)
- **Usage-Based:** Scale pricing with certificate volume
- **B2B Focus:** Target educational institutions and enterprises
- **Self-Service:** Automated onboarding, no sales team needed (bootstrapped)

### **Cost Structure**
- **Hosting:** ~$0 (Vercel free tier, then ~$20/mo)
- **Database:** Supabase free tier, then ~$25/mo
- **Email:** $0 (users pay their provider)
- **Domain:** ~$12/year
- **Total Monthly Cost:** ~$50/mo at scale

### **Target Customers**
1. Educational institutions (universities, training centers)
2. Event organizers (conferences, workshops)
3. HR departments (employee certifications)
4. Online course platforms
5. Professional associations

---

**Built with ❤️ by Ajmal Razaq | Zero Investment, Maximum Impact** 🚀
