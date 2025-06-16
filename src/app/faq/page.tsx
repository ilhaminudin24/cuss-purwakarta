import FAQSection from "@/app/components/FAQSection";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Frequently Asked Questions</h2>
        <FAQSection />
      </div>
    </main>
  );
} 