import Image from "next/image";
import { landingData } from "@/data/landing-data";
import { FaqAccordion } from "./FaqAccordion";
import { LandingHeader } from "./LandingHeader";

function SectionIntro({ title, text, tone = "light" }: { title: string; text?: string; tone?: "light" | "dark" }) {
  return (
    <div className="max-w-3xl">
      <h2 className={`text-3xl font-black leading-tight tracking-normal sm:text-4xl ${tone === "dark" ? "text-white" : "text-zinc-950"}`}>{title}</h2>
      {text ? <p className={`mt-4 text-[15px] leading-7 ${tone === "dark" ? "text-zinc-300" : "text-zinc-600"}`}>{text}</p> : null}
    </div>
  );
}

function PrimaryButton({ href = "#final-cta", children }: { href?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-6 text-[13px] font-bold text-white transition hover:bg-zinc-800 active:translate-y-px"
    >
      {children}
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-[13px] font-bold text-zinc-900 transition hover:border-zinc-950 active:translate-y-px"
    >
      {children}
    </a>
  );
}

function HeroSection() {
  const { hero, product, stats } = landingData;

  return (
    <section id="top" className="bg-[#f7f8f8]">
      <div className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="landing-reveal">
          <p className="text-[13px] font-semibold text-zinc-500">{hero.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-normal text-zinc-950 sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-7 text-zinc-600">{hero.subtext}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton>{product.primaryCta}</PrimaryButton>
            <SecondaryButton href="#showcase">{product.secondaryCta}</SecondaryButton>
          </div>
        </div>

        <div className="landing-reveal landing-reveal-delay relative">
          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-3 shadow-[0_24px_80px_rgba(24,24,27,.12)]">
            <Image
              src={hero.image}
              alt="Giao diện tư vấn và quản lý lead"
              width={1600}
              height={1000}
              priority
              className="aspect-[16/10] rounded-[24px] object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-zinc-200 bg-white p-4">
                <div className="text-xl font-black text-zinc-950">{stat.value}</div>
                <div className="mt-1 text-[12px] leading-5 text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PainPointsSection() {
  return (
    <section id="pain" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Khách không mua vì trang chưa trả lời đúng điều họ lo." />
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[32px] bg-zinc-950 p-7 text-white sm:p-10">
            <p className="max-w-2xl text-2xl font-black leading-tight sm:text-3xl">
              Traffic không thiếu. Vấn đề là khách chưa đủ hiểu, đủ tin và đủ lý do để để lại thông tin.
            </p>
          </div>
          <div className="grid gap-3">
            {landingData.painPoints.map((item) => (
              <div key={item} className="rounded-3xl border border-zinc-200 bg-[#f7f8f8] p-5 text-[15px] font-semibold leading-7 text-zinc-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const { solution } = landingData;

  return (
    <section id="solution" className="bg-[#f7f8f8] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <SectionIntro title={solution.title} text={solution.body} />
        <div className="grid gap-4">
          {solution.bullets.map((item, index) => (
            <div key={item} className="flex items-center gap-5 rounded-[28px] border border-zinc-200 bg-white p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-[13px] font-black text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] font-bold text-zinc-900">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Lợi ích rõ theo việc khách cần quyết định." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {landingData.benefits.map((item) => (
            <article key={item.title} className="rounded-[28px] border border-zinc-200 p-6">
              <h3 className="text-[16px] font-black text-zinc-950">{item.title}</h3>
              <p className="mt-3 text-[14px] leading-7 text-zinc-600">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FabeSection() {
  return (
    <section className="bg-zinc-950 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Tính năng không đứng một mình. Mỗi tính năng phải bán được lợi ích." tone="dark" />
        <div className="mt-10 overflow-hidden rounded-[28px] border border-white/15">
          <div className="hidden grid-cols-4 bg-white/8 px-5 py-4 text-[12px] font-bold text-zinc-300 lg:grid">
            <span>Feature</span>
            <span>Advantage</span>
            <span>Benefit</span>
            <span>Evidence</span>
          </div>
          {landingData.fabe.map((row) => (
            <div key={row.feature} className="grid gap-4 border-t border-white/10 p-5 text-[14px] leading-7 lg:grid-cols-4">
              <strong className="text-white">{row.feature}</strong>
              <span className="text-zinc-300">{row.advantage}</span>
              <span className="text-zinc-300">{row.benefit}</span>
              <span className="text-zinc-300">{row.evidence}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Từ offer đến lead trong bốn bước gọn." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {landingData.steps.map((step, index) => (
            <article key={step.title} className="grid grid-cols-[56px_1fr] gap-5 rounded-[30px] border border-zinc-200 bg-white p-6">
              <span className="text-3xl font-black text-zinc-300">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-[17px] font-black text-zinc-950">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-7 text-zinc-600">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  const { showcase } = landingData;

  return (
    <section id="showcase" className="bg-[#f7f8f8] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
        <div>
          <SectionIntro title={showcase.title} text={showcase.body} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {showcase.items.map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] font-bold text-zinc-800">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[34px] border border-zinc-200 bg-white p-4 shadow-[0_24px_80px_rgba(24,24,27,.10)]">
          <Image src={showcase.image} alt="Sản phẩm trong khối showcase" width={900} height={900} className="aspect-square rounded-[26px] object-cover" />
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Bằng chứng xã hội ngắn, đủ thật để tăng niềm tin." />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {landingData.testimonials.map((item) => (
            <figure key={item.name} className="rounded-[28px] border border-zinc-200 bg-[#f7f8f8] p-6">
              <blockquote className="text-[15px] font-medium leading-7 text-zinc-800">{item.quote}</blockquote>
              <figcaption className="mt-6 border-t border-zinc-200 pt-4">
                <strong className="block text-[14px] text-zinc-950">{item.name}</strong>
                <span className="mt-1 block text-[13px] text-zinc-500">{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="bg-zinc-950 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {landingData.stats.map((stat) => (
          <div key={stat.label} className="rounded-[28px] border border-white/15 p-7">
            <div className="text-4xl font-black">{stat.value}</div>
            <div className="mt-2 text-[14px] text-zinc-300">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OfferSection() {
  const { offer, product } = landingData;

  return (
    <section className="bg-[#f7f8f8] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[36px] bg-white p-6 shadow-[0_24px_80px_rgba(24,24,27,.08)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="rounded-full bg-zinc-100 px-4 py-2 text-[12px] font-bold text-zinc-700">{offer.badge}</span>
            <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-zinc-950 sm:text-4xl">{offer.title}</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-600">{offer.text}</p>
          </div>
          <PrimaryButton>{product.primaryCta}</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Chọn gói theo tốc độ và số lượng chiến dịch." />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {landingData.pricing.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[30px] border p-6 ${plan.highlighted ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950"}`}
            >
              <h3 className="text-xl font-black">{plan.name}</h3>
              <div className="mt-5 text-3xl font-black">{plan.price}</div>
              <p className={`mt-3 text-[14px] leading-7 ${plan.highlighted ? "text-zinc-300" : "text-zinc-600"}`}>{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className={`text-[13px] font-medium ${plan.highlighted ? "text-zinc-200" : "text-zinc-700"}`}>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#final-cta"
                className={`mt-7 inline-flex w-full justify-center rounded-full px-5 py-3 text-[13px] font-bold transition ${
                  plan.highlighted ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-zinc-950 text-white hover:bg-zinc-800"
                }`}
              >
                Chọn gói
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuaranteeSection() {
  const { guarantee } = landingData;

  return (
    <section className="bg-[#f7f8f8] py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-zinc-200 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-black leading-tight text-zinc-950 sm:text-4xl">{guarantee.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-zinc-600">{guarantee.text}</p>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <SectionIntro title="Câu hỏi trước khi mua." text="FAQ tập trung vào các phản đối thường gặp: ảnh, CTA, ngân sách và chất lượng lead." />
        <FaqAccordion />
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const { product } = landingData;

  return (
    <section id="final-cta" className="bg-zinc-950 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-black leading-tight sm:text-5xl">Sẵn sàng biến trang bán hàng thành kênh tạo lead thật?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-zinc-300">
          Gửi sản phẩm và mục tiêu chiến dịch. Chúng tôi sẽ đề xuất cấu trúc landing page phù hợp nhất.
        </p>
        <div className="mt-8">
          <a className="inline-flex min-h-12 items-center rounded-full bg-white px-7 text-[13px] font-bold text-zinc-950 transition hover:bg-zinc-100" href="mailto:sales@example.com">
            {product.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const { product, footerLinks } = landingData;

  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 text-[13px] text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>{product.name}. Xây landing page bán hàng rõ ràng hơn.</p>
        <div className="flex flex-wrap gap-5">
          {footerLinks.map((item) => (
            <a key={item} href="#top" className="hover:text-zinc-950">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function SalesLandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <LandingHeader />
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <BenefitsSection />
      <FabeSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <SocialProofSection />
      <StatsSection />
      <OfferSection />
      <PricingSection />
      <GuaranteeSection />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}
