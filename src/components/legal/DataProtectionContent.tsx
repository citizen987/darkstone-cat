import LegalPageContent from "./LegalPageContent";

const SECTIONS = [
  {
    titleKey: "user_info_title",
    paragraphs: ["user_info_p1", "user_info_p2", "user_info_p3"],
  },
  {
    titleKey: "contact_title",
    paragraphs: ["contact_name", "contact_email"],
  },
  {
    titleKey: "principles_title",
    paragraphs: [
      "principles_intro",
      "principles_legality",
      "principles_minimization",
      "principles_purpose",
      "principles_security",
      "principles_access",
      "principles_retention",
      "principles_marketing",
    ],
  },
  {
    titleKey: "data_collection_title",
    paragraphs: ["data_collection_p1", "data_collection_p2"],
  },
  {
    titleKey: "legitimacy_title",
    paragraphs: ["legitimacy_p1", "legitimacy_consent", "legitimacy_legal"],
  },
  {
    titleKey: "data_sharing_title",
    paragraphs: ["data_sharing_text"],
  },
  {
    titleKey: "rights_title",
    paragraphs: [
      "rights_intro",
      "rights_access",
      "rights_rectification",
      "rights_erasure",
      "rights_restriction",
      "rights_portability",
      "rights_objection",
      "rights_withdrawal",
      "rights_exercise",
      "rights_complaint",
    ],
  },
  {
    titleKey: "legal_info_title",
    paragraphs: ["legal_info_p1", "legal_info_p2"],
  },
] as const;

export default function DataProtectionContent() {
  return (
    <LegalPageContent
      namespace="data_protection"
      titleKey="title"
      introKey="last_updated"
      sections={SECTIONS}
    />
  );
}
