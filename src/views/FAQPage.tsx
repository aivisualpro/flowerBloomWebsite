import React from "react";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTop";
import Accordion from "../components/Accordion";

const faqs = [
  { q: "What is Flower Bloom", a: "Flower Bloom is your go-to destination for curated gifts, sweets, and celebration bundles designed for every occasion." },
  { q: "What does Flower Bloom do?", a: "We help you discover, customize, and deliver thoughtful gifts—bundles, balloons, cakes, flowers, and more—right to your loved ones." },
  { q: "Do you have Debit Card / Credit Cards services?", a: "Yes. We support major debit/credit cards and secure online payments." },
  { q: "Can I place an order without creating an account", a: "You can browse freely, but an account helps track orders, save addresses, and speed up checkout." },
  { q: "If I placed an order, how long does it take to receive the order?", a: "Delivery times depend on location and product type. Most standard orders arrive within 1–3 business days." },
  { q: "Can I have multiple addresses into my account?", a: "Yes, you can store multiple addresses and choose at checkout." },
  { q: "Can I do one order with different dates?", a: "Yes—create separate deliveries in a single cart by choosing different dates per item where supported." },
  { q: "Can I track my orders?", a: "Absolutely. You’ll see live status updates in your account’s Orders section." },
  { q: "What is Celebrity Arrangements?", a: "Exclusive themed gift setups inspired by celebrity styles and trends." },
  { q: "What is Bundles?", a: "Curated sets (e.g., cake + flowers + balloons) at a better price than buying individually." },
  { q: "Can I order Cakes and balloons only?", a: "Yes, individual items are available—mix & match as you like." },
  { q: "I forgot to add an item to my order, what do I do?", a: "Contact support ASAP. If the order hasn’t been prepared, we’ll help add it." },
  { q: "How long does the online payment refund process take?", a: "Refunds typically take 5–7 business days depending on your bank." },
  { q: "How can I contact Flower Bloom?", a: "Email support@flowerbloom.com or use the Contact page chat." },
];

const FAQPage = () => {
  return (
    <>
      <header id="header">
        <Topbar />
        <Navbar />
      </header>

      <main id="main">
        <Accordion title="FAQ’s" faqs={faqs} />
      </main>

      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default FAQPage;
