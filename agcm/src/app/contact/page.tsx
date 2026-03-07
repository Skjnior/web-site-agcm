import { ContactForm, ContactHero, ContactInfo } from '@/components/contact';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <Footer />
    </>
  );
}
