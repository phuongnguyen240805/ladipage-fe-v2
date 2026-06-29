import { EditorBlock } from "../types";
import { LANDING_ASSETS, LandingTemplatePreset, PRODUCT_ACCENT, PRODUCT_BORDER } from "./shared";

function hasBlock(template: LandingTemplatePreset, type: EditorBlock["type"]) {
  return template.blocks.some((block) => block.type === type);
}

export function conversionSectionsFor(template: LandingTemplatePreset): Omit<EditorBlock, "id">[] {
  if (template.category !== "page") return [];
  if (hasBlock(template, "tea_landing") || hasBlock(template, "smartwatch_landing")) return [];

  const value = `${template.id} ${template.name} ${template.description}`.toLowerCase();
  const accent = PRODUCT_ACCENT;
  const blocks: Omit<EditorBlock, "id">[] = [];
  const pushIfMissing = (type: EditorBlock["type"], block: Omit<EditorBlock, "id">) => {
    if (!hasBlock(template, type) && !blocks.some((item) => item.type === type)) blocks.push(block);
  };

  const menu = (logoText: string, items: { label: string; url: string }[]): Omit<EditorBlock, "id"> => ({
    type: "menu",
    label: "Navigation",
    props: {
      logoText,
      logoUrl: "#",
      items,
      bgColor: "#ffffff",
      textColor: "#0f172a",
    },
  });

  if (value.includes("wedding")) {
    pushIfMissing("menu", menu("Wedding Day", [
      { label: "Lich trinh", url: "#schedule" },
      { label: "Dia diem", url: "#venue" },
      { label: "RSVP", url: "#rsvp" },
    ]));
    pushIfMissing("gallery", {
      type: "gallery",
      label: "Wedding gallery",
      props: {
        images: [LANDING_ASSETS[1].url, "/images/grid-image/image-02.png", "/images/grid-image/image-05.png"],
        columns: 3,
        gap: 12,
        borderRadius: 16,
        aspectRatio: "4/3",
      },
    });
    pushIfMissing("accordion", {
      type: "accordion",
      label: "Thong tin khach moi",
      props: {
        items: [
          { id: "dress", question: "Trang phuc goi y la gi?", answer: "Khach moi co the chon trang phuc lich su, uu tien tone trung tinh." },
          { id: "time", question: "Nen co mat luc nao?", answer: "Nen co mat truoc gio khai tiec 20 phut de don tiep va chup anh." },
        ],
        allowMultiple: false,
        accentColor: accent,
      },
    });
    return blocks;
  }

  if (value.includes("beauty") || value.includes("spa") || value.includes("skincare")) {
    pushIfMissing("menu", menu("Glow Studio", [
      { label: "Lieu trinh", url: "#routine" },
      { label: "San pham", url: "#products" },
      { label: "Tu van", url: "#form" },
    ]));
    pushIfMissing("product_card", {
      type: "product_card",
      label: "Skincare product trio",
      props: {
        title: "Glow Serum",
        description: "Bo san pham cham soc da hang ngay.",
        price: "490.000d",
        oldPrice: "690.000d",
        image: LANDING_ASSETS[0].url,
        badge: "BEST",
        ctaText: "Chon bo nay",
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
        borderRadius: 16,
        columns: 3,
        items: [
          { id: "cleanser", title: "Clean Gel", description: "Lam sach diu nhe.", price: "290.000d", oldPrice: "390.000d", image: LANDING_ASSETS[0].url, badge: "01" },
          { id: "serum", title: "Glow Serum", description: "Cap am va lam sang.", price: "490.000d", oldPrice: "690.000d", image: LANDING_ASSETS[0].url, badge: "02" },
          { id: "cream", title: "Day Cream", description: "Khoa am ban ngay.", price: "360.000d", oldPrice: "460.000d", image: LANDING_ASSETS[0].url, badge: "03" },
        ],
      },
    });
    pushIfMissing("chat_widget", {
      type: "chat_widget",
      label: "Skin consultation",
      props: {
        title: "Can soi routine?",
        greeting: "Chon tinh trang da, doi ngu se goi lai voi goi phu hop.",
        agentName: "Tu van da lieu",
        replyTime: "Phan hoi trong vai phut",
        primaryChannel: "Chat ngay",
        secondaryChannel: "Zalo",
        buttonLabel: "Nhan tu van",
        accentColor: accent,
        bgColor: "#ffffff",
        position: "right",
        showSurvey: true,
      },
    });
    pushIfMissing("accordion", {
      type: "accordion",
      label: "Skincare FAQ",
      props: {
        items: [
          { id: "skin", question: "Da nhay cam co dung duoc khong?", answer: "Co. Nen bat dau voi routine nhe va duoc tu van theo tinh trang da." },
          { id: "result", question: "Bao lau thay thay doi?", answer: "Thong thuong can 2-4 tuan de danh gia do phu hop cua routine." },
        ],
        allowMultiple: false,
        accentColor: accent,
      },
    });
    return blocks;
  }

  if (value.includes("course") || value.includes("webinar") || value.includes("e-learning")) {
    pushIfMissing("menu", menu("Growth Class", [
      { label: "Noi dung", url: "#curriculum" },
      { label: "Lich hoc", url: "#schedule" },
      { label: "Dang ky", url: "#register" },
    ]));
    pushIfMissing("table", {
      type: "table",
      label: "Course schedule",
      props: {
        headers: ["Buoi", "Chu de", "Ket qua"],
        rows: [
          ["01", "Offer va landing page", "Co cau truc trang ban duoc"],
          ["02", "Ads va tracking", "Doc duoc so lieu campaign"],
          ["03", "Automation", "Cham soc lead va hoc vien"],
        ],
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
      },
    });
    pushIfMissing("survey", {
      type: "survey",
      label: "Learner survey",
      props: {
        question: "Ban dang muon cai thien phan nao?",
        options: ["Landing page", "Facebook Ads", "Voucher", "Automation"],
        accentColor: accent,
        submitLabel: "Gui lua chon",
      },
    });
    pushIfMissing("chat_widget", {
      type: "chat_widget",
      label: "Course advisor",
      props: {
        title: "Can lo trinh hoc?",
        greeting: "Chon muc tieu hien tai, co van se gui lich hoc phu hop.",
        agentName: "Co van khoa hoc",
        replyTime: "Phan hoi trong vai phut",
        primaryChannel: "Chat ngay",
        secondaryChannel: "Zalo",
        buttonLabel: "Nhan lo trinh",
        accentColor: accent,
        bgColor: "#ffffff",
        position: "left",
        showSurvey: true,
      },
    });
    return blocks;
  }

  if (value.includes("tea")) {
    pushIfMissing("menu", menu("Pure Leaf", [
      { label: "Blend", url: "#blend" },
      { label: "Brew", url: "#brew" },
      { label: "Dat hang", url: "#order" },
    ]));
    pushIfMissing("product_card", {
      type: "product_card",
      label: "Tea bundles",
      props: {
        title: "Daily Tea Bundle",
        description: "Combo tra thao moc cho routine hang ngay.",
        price: "220.000d",
        oldPrice: "320.000d",
        image: LANDING_ASSETS[2].url,
        badge: "PURE",
        ctaText: "Chon goi",
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
        borderRadius: 16,
        columns: 2,
        items: [
          { id: "morning", title: "Morning Pack", description: "Vi thanh nhe.", price: "220.000d", oldPrice: "320.000d", image: LANDING_ASSETS[2].url, badge: "AM" },
          { id: "evening", title: "Evening Pack", description: "Vi diu cho buoi toi.", price: "240.000d", oldPrice: "340.000d", image: LANDING_ASSETS[2].url, badge: "PM" },
        ],
      },
    });
    pushIfMissing("testimonial", {
      type: "testimonial",
      label: "Tea review",
      props: {
        quote: "Vi tra de uong, dong goi dep va thong tin san pham ro rang.",
        authorName: "Khach hang da xac minh",
        authorRole: "Nguoi mua hang",
        authorAvatar: "",
        rating: 5,
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        showRating: true,
      },
    });
    return blocks;
  }

  if (value.includes("smartwatch")) {
    pushIfMissing("menu", menu("Titan Watch", [
      { label: "Tinh nang", url: "#features" },
      { label: "Thong so", url: "#specs" },
      { label: "Dat hang", url: "#order" },
    ]));
    pushIfMissing("table", {
      type: "table",
      label: "Tech specs",
      props: {
        headers: ["Hang muc", "Gia tri", "Ghi chu"],
        rows: [
          ["Pin", "24h", "Su dung hon hop"],
          ["Ket noi", "LTE + GPS", "Theo doi van dong"],
          ["Than vo", "Titanium", "Nhe va ben"],
        ],
        bgColor: "#ffffff",
        borderColor: PRODUCT_BORDER,
      },
    });
    pushIfMissing("chat_widget", {
      type: "chat_widget",
      label: "Tech advisor",
      props: {
        title: "Can chon phien ban?",
        greeting: "Cho biet nhu cau tap luyen va ket noi, doi ngu se goi y phien ban phu hop.",
        agentName: "Tu van san pham",
        replyTime: "Phan hoi trong vai phut",
        primaryChannel: "Chat ngay",
        secondaryChannel: "Zalo",
        buttonLabel: "Nhan goi y",
        accentColor: accent,
        bgColor: "#ffffff",
        position: "right",
        showSurvey: true,
      },
    });
    return blocks;
  }

  if (value.includes("product grid") || value.includes("flash sale") || value.includes("product launch")) {
    pushIfMissing("menu", menu("Launch Kit", [
      { label: "San pham", url: "#products" },
      { label: "Uu dai", url: "#offer" },
      { label: "Dat hang", url: "#order" },
    ]));
    pushIfMissing("collection_list", {
      type: "collection_list",
      label: "Launch benefits",
      props: {
        items: [
          { id: "stock", title: "Hang co san", desc: "Ngan ton kho va thong tin uu dai ro rang.", icon: "01" },
          { id: "proof", title: "Bang chung", desc: "Hien review, hinh that va cam ket sau mua.", icon: "02" },
          { id: "order", title: "Chot don", desc: "Form ngan va CTA tap trung vao mot hanh dong.", icon: "03" },
        ],
        columns: 3,
        layout: "grid",
        bgColor: accent,
      },
    });
    pushIfMissing("funnel_popup", {
      type: "funnel_popup",
      label: "Launch popup",
      props: {
        title: "Nhan ma uu dai truoc khi roi trang",
        description: "Gui thong tin de nhan ma uu dai va lich tu van san pham.",
        ctaText: "Nhan uu dai",
        ctaUrl: "#form",
        trigger: "exit_intent",
        triggerValue: 60,
        frequency: "session",
        accentColor: accent,
        bgColor: "#ffffff",
        imageUrl: "",
        showBackdrop: true,
      },
    });
    return blocks;
  }

  pushIfMissing("menu", menu("LadiPage", [
    { label: "Loi ich", url: "#benefits" },
    { label: "Dang ky", url: "#form" },
  ]));
  pushIfMissing("chat_widget", {
    type: "chat_widget",
    label: "Support widget",
    props: {
      title: "Can tu van nhanh?",
      greeting: "Chon nhu cau cua ban, doi ngu se goi lai va gui uu dai phu hop.",
      agentName: "Tu van vien",
      replyTime: "Phan hoi trong vai phut",
      primaryChannel: "Chat ngay",
      secondaryChannel: "Zalo",
      buttonLabel: "Bat dau tu van",
      accentColor: accent,
      bgColor: "#ffffff",
      position: "right",
      showSurvey: true,
    },
  });
  return blocks;
}

