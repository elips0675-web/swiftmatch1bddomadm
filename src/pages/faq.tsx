import { AppHeader } from "@/components/layout/app-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/context/language-context";
import { HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  { id: 'q1', question: 'faq.q1.question', answer: 'faq.q1.answer' },
  { id: 'q2', question: 'faq.q2.question', answer: 'faq.q2.answer' },
  { id: 'q3', question: 'faq.q3.question', answer: 'faq.q3.answer' },
  { id: 'q4', question: 'faq.q4.question', answer: 'faq.q4.answer' },
  { id: 'q5', question: 'faq.q5.question', answer: 'faq.q5.answer' },
  { id: 'q9', question: 'faq.q9.question', answer: 'faq.q9.answer' },
  { id: 'q10', question: 'faq.q10.question', answer: 'faq.q10.answer' },
  { id: 'q6', question: 'faq.q6.question', answer: 'faq.q6.answer' },
  { id: 'q7', question: 'faq.q7.question', answer: 'faq.q7.answer' },
  { id: 'q8', question: 'faq.q8.question', answer: 'faq.q8.answer' },
];

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-svh bg-white">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black font-headline tracking-tighter text-foreground">
            {t('faq.page_title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            {t('faq.description')}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="bg-[#f8f9fb] rounded-2xl border-0 px-5 data-[state=open]:shadow-sm data-[state=open]:border-border/50 transition-all">
              <AccordionTrigger className="text-left font-bold text-sm hover:no-underline py-4">
                {t(item.question)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed pb-5 pt-0">
                {t(item.answer)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
