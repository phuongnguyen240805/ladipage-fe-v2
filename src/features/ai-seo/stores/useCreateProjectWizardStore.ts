import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CreateProjectWizardState {
  currentStep: number;
  isSubmitting: boolean;
  createdSeoProjectId: string;

  // Step 1: Select Website
  websiteUrl: string;
  projectName: string;
  countryCode: string;
  languageCode: string;
  crawlBudget: number;
  userAgent: string;
  crawlConcurrency: number;
  respectRobotsTxt: boolean;
  urlExclusionRules: string[];

  // Step 2: Setting Up (Business Info & Knowledge Graph)
  businessName: string;
  businessDescription: string;
  industry: string;
  audience: string;
  location: string;
  language: string;
  phone: string;
  email: string;
  address: string;
  serviceAreas: string[];
  socialProfiles: string[];
  gscProperty: string;
  gbpLocation: string;

  // Step 3: Install AI SEO
  installationType: 'wordpress' | 'cloudflare' | 'custom_script';
  installationStatus: 'not_installed' | 'checking' | 'installed' | 'failed';

  // Actions
  setStep: (step: number) => void;
  setSubmitting: (submitting: boolean) => void;
  updateFields: (fields: Partial<Omit<CreateProjectWizardState, 'setStep' | 'setSubmitting' | 'updateFields' | 'resetWizard'>>) => void;
  resetWizard: () => void;
}

export const useCreateProjectWizardStore = create<CreateProjectWizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      isSubmitting: false,
      createdSeoProjectId: "",

      // Step 1 Defaults
      websiteUrl: "",
      projectName: "",
      countryCode: "VN",
      languageCode: "vi",
      crawlBudget: 100,
      userAgent: "AI-SEO-Bot",
      crawlConcurrency: 2,
      respectRobotsTxt: true,
      urlExclusionRules: [],

      // Step 2 Defaults
      businessName: "",
      businessDescription: "",
      industry: "",
      audience: "",
      location: "",
      language: "vi",
      phone: "",
      email: "",
      address: "",
      serviceAreas: [],
      socialProfiles: [],
      gscProperty: "",
      gbpLocation: "",

      // Step 3 Defaults
      installationType: "custom_script",
      installationStatus: "not_installed",

      setStep: (step) => set({ currentStep: step }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      updateFields: (fields) => set((state) => ({ ...state, ...fields })),
      resetWizard: () =>
        set({
          currentStep: 1,
          isSubmitting: false,
          createdSeoProjectId: "",
          websiteUrl: "",
          projectName: "",
          countryCode: "VN",
          languageCode: "vi",
          crawlBudget: 100,
          userAgent: "AI-SEO-Bot",
          crawlConcurrency: 2,
          respectRobotsTxt: true,
          urlExclusionRules: [],
          businessName: "",
          businessDescription: "",
          industry: "",
          audience: "",
          location: "",
          language: "vi",
          phone: "",
          email: "",
          address: "",
          serviceAreas: [],
          socialProfiles: [],
          gscProperty: "",
          gbpLocation: "",
          installationType: "custom_script",
          installationStatus: "not_installed",
        }),
    }),
    {
      name: "ai-seo-project-wizard-store-v2",
    }
  )
);
