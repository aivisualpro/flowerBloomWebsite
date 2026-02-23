import React from "react";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTop";
import Accordion from "../components/Accordion";

const faqs = [
  { q: "Flower Bloom Data Privacy and Cookie Policy", a: "This policy explains how Flower Bloom collects, uses, and protects your personal information, along with our use of cookies and related technologies." },
  { q: "Purpose of this privacy policy", a: "The purpose of this policy is to inform users how we collect, use, store, and safeguard personal data in compliance with data protection laws." },
  { q: "The data we collect about you", a: "We collect information such as your name, email, address, phone number, payment details, and browsing activity to provide and improve our services." },
  { q: "How is your personal data collected?", a: "Data is collected directly from you during registration, order placement, or communication, and automatically via cookies and analytics tools." },
  { q: "Personal Contact Information", a: "Your contact details are used to confirm orders, deliver products, and communicate service updates or offers." },
  { q: "Can I have multiple addresses into my account?", a: "Yes, you can save multiple addresses to simplify your future orders and deliveries." },
  { q: "How We Use Your Information", a: "We use your data to process orders, personalize recommendations, improve customer experience, and send relevant updates or promotions." },
  { q: "Your Email Address", a: "Your email address is used for order confirmations, account access, promotional communication, and customer support." },
  { q: "Order Placement Information", a: "We record order details such as product selection, delivery address, and payment confirmation for processing and reference." },
  { q: "Artificial Intelligence and Machine Learning", a: "We may use AI and ML algorithms to improve product recommendations, fraud detection, and overall customer experience." },
  { q: "Transfer of Personal Data", a: "We do not sell your data. Limited sharing may occur with service providers such as payment gateways and delivery partners, under strict confidentiality." },
  { q: "Protection of Your Personal Information", a: "We use SSL encryption, secure servers, and restricted access policies to protect your data from unauthorized access or misuse." },
  { q: "How long is your information stored?", a: "Your data is retained as long as needed to provide services, comply with legal obligations, or until you request deletion." },
  { q: "Cookie Policy", a: "We use cookies to enhance website performance, track user behavior, and personalize content. You can manage cookie preferences in your browser." },
  { q: "Advertisements", a: "Targeted advertisements may be shown based on your browsing data. You can opt out of personalized ads anytime." },
  { q: "Marketing", a: "With your consent, we may send you newsletters, special offers, or updates about new products and campaigns." },
  { q: "Discovering and Sharing Special Occasions", a: "We may use your data to suggest occasion-based products and help you plan timely gifts and surprises." },
  { q: "Account Deletion, Data Deletion and Rights", a: "You can request to delete your account and data at any time by contacting our support team. We comply with applicable data protection regulations." },
  { q: "Data Security", a: "We implement multi-layer security measures including firewalls, encryption, and monitoring systems to safeguard user data." },
  { q: "Changes to Policy", a: "We may update this Privacy Policy periodically. Updates will be posted on our website, and significant changes will be communicated directly to users." },
];

const PrivacyPolicyPage = () => {
  return (
    <>
      <header id="header">
        <Topbar />
        <Navbar />
      </header>

      <main id="main">
        <Accordion title="Privacy Policy" faqs={faqs}/>
      </main>

      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default PrivacyPolicyPage;
