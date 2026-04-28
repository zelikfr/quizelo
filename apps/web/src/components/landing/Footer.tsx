import { getTranslations } from "next-intl/server";
import { QALangToggle } from "@/components/shared/QALangToggle";

const COPYRIGHT_YEAR = new Date().getFullYear();

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-white/[0.08] bg-black/30 px-5 py-4 md:px-14 md:py-6">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
        {/* Mobile: lang toggle + copyright */}
        <div className="flex w-full items-center justify-between md:hidden">
          <QALangToggle />
          <p className="m-0 font-mono text-[9px] tracking-widest2 text-fg-3">
            © {COPYRIGHT_YEAR} QUIZELO
          </p>
        </div>

        {/* Desktop: copyright + LEGAL */}
        <p className="m-0 hidden font-mono text-[10px] tracking-widest2 text-fg-3 md:block">
          © {COPYRIGHT_YEAR} QUIZELO · {t("copy")}
        </p>
        <a className="hidden cursor-pointer font-mono text-[10px] tracking-widest2 text-fg-3 no-underline transition-colors duration-120 hover:text-fg-1 md:block">
          LEGAL
        </a>
      </div>
    </footer>
  );
}
